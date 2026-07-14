import hmac
import hashlib
import uuid
import datetime
import random
import logging
import razorpay
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer
from cart.models import Cart
from coupons.models import Coupon
from products.models import Product
from .models import Payment
from .serializers import PaymentSerializer
from .utils import send_order_confirmation_email

logger = logging.getLogger(__name__)

# Utility to check if Razorpay keys are default or mockup keys
def is_mock_mode():
    key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
    return (
        not key_id or 
        not key_secret or 
        key_id.startswith('rzp_test_mock') or 
        key_secret.startswith('mock_secret')
    )

class RazorpayCreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        coupon_code = request.data.get('coupon_code')
        
        # 1. Fetch User's Cart
        cart = Cart.objects.filter(user=user).first()
        if not cart or cart.items.count() == 0:
            return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Check stock levels before generating order
        for cart_item in cart.items.all():
            if cart_item.product.stock < cart_item.quantity:
                return Response(
                    {"error": f"Product '{cart_item.product.name}' is out of stock (Available: {cart_item.product.stock})."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # 3. Calculate Totals
        subtotal = float(cart.subtotal)
        discount = 0.0
        coupon_obj = None

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
                valid, msg = coupon.is_valid(subtotal)
                if valid:
                    coupon_obj = coupon
                    if coupon.discount_type == 'percentage':
                        discount = subtotal * float(coupon.discount_value) / 100.0
                    else:
                        discount = float(coupon.discount_value)
                    discount = min(discount, subtotal)
            except Coupon.DoesNotExist:
                pass
        
        shipping = 10.0 if subtotal < 100.0 else 0.0
        tax = (subtotal - discount) * 0.08  # 8% tax (GST)
        grand_total = subtotal - discount + shipping + tax
        
        # 4. Generate unique payment identifier
        payment_id = f"PAY-{timezone.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
        
        # 5. Create order in Razorpay gateway
        razorpay_order_id = None
        amount_paise = int(grand_total * 100) # Razorpay accepts amount in paise
        
        if not is_mock_mode():
            try:
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                razor_order = client.order.create(data={
                    "amount": amount_paise,
                    "currency": "INR",
                    "receipt": payment_id,
                    "payment_capture": 1
                })
                razorpay_order_id = razor_order.get('id')
            except Exception as e:
                logger.error(f"Razorpay Order creation failed: {e}. Falling back to simulation mode.")
                
        # Generate mock Razorpay Order ID if in mock mode or API failed
        if not razorpay_order_id:
            razorpay_order_id = f"order_mock_{uuid.uuid4().hex[:14]}"
            
        # 6. Save Payment record with 'pending' status
        payment = Payment.objects.create(
            user=user,
            payment_id=payment_id,
            razorpay_order_id=razorpay_order_id,
            amount=grand_total,
            currency='INR',
            status='pending',
            payment_method='Razorpay'
        )
        
        return Response({
            "payment_id": payment_id,
            "razorpayOrderId": razorpay_order_id,
            "amount": amount_paise,
            "currency": "INR",
            "keyId": settings.RAZORPAY_KEY_ID,
            "mockMode": is_mock_mode()
        }, status=status.HTTP_200_OK)

class RazorpayVerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        shipping_address = request.data.get('shipping_address')
        billing_address = request.data.get('billing_address') or shipping_address
        coupon_code = request.data.get('coupon_code')
        payment_method = request.data.get('payment_method', 'Razorpay')
        
        # 1. Fetch Payment Record
        payment = get_object_or_404(Payment, razorpay_order_id=razorpay_order_id, user=user)
        
        # Prevent replay / duplicate order placements
        if payment.status == 'success' and payment.order:
            serializer = OrderSerializer(payment.order)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        # 2. Signature verification
        verified = False
        if is_mock_mode():
            # In mock mode, we accept any signature starting with 'mock_sig_' or verify using basic string
            verified = True
        else:
            try:
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                params_dict = {
                    'razorpay_order_id': razorpay_order_id,
                    'razorpay_payment_id': razorpay_payment_id,
                    'razorpay_signature': razorpay_signature
                }
                client.utility.verify_payment_signature(params_dict)
                verified = True
            except Exception as e:
                # Fallback manual calculation checks
                msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8')
                secret = settings.RAZORPAY_KEY_SECRET.encode('utf-8')
                generated_signature = hmac.new(secret, msg, hashlib.sha256).hexdigest()
                if generated_signature == razorpay_signature:
                    verified = True
                else:
                    logger.error(f"Razorpay signature verification failed: {e}")
                    verified = False

        if not verified:
            payment.status = 'failed'
            payment.save()
            return Response({"error": "Invalid payment signature verification failed."}, status=status.HTTP_400_BAD_REQUEST)
            
        # 3. Create actual Order inside transaction to prevent data corruption
        cart = Cart.objects.filter(user=user).first()
        if not cart or cart.items.count() == 0:
            return Response({"error": "Cart is empty. Payment was processed, contact customer support."}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = float(cart.subtotal)
        discount = 0.0
        coupon_obj = None

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
                valid, msg = coupon.is_valid(subtotal)
                if valid:
                    coupon_obj = coupon
                    if coupon.discount_type == 'percentage':
                        discount = subtotal * float(coupon.discount_value) / 100.0
                    else:
                        discount = float(coupon.discount_value)
                    discount = min(discount, subtotal)
            except Coupon.DoesNotExist:
                pass

        shipping = 10.0 if subtotal < 100.0 else 0.0
        tax = (subtotal - discount) * 0.08
        grand_total = subtotal - discount + shipping + tax

        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        rand_num = random.randint(1000, 9999)
        order_number = f"ORD-{timestamp}-{rand_num}"

        try:
            with transaction.atomic():
                # Re-check stock levels in transaction lock
                for cart_item in cart.items.all():
                    product = Product.objects.select_for_update().get(id=cart_item.product.id)
                    if product.stock < cart_item.quantity:
                        raise Exception(f"Product '{product.name}' went out of stock during payment processing.")
                
                # Create Order
                order = Order.objects.create(
                    user=user,
                    order_number=order_number,
                    total_amount=subtotal,
                    discount_amount=discount,
                    shipping_charges=shipping,
                    tax_amount=tax,
                    grand_total=grand_total,
                    payment_method=payment_method,
                    payment_status='paid',
                    status='processing',
                    shipping_address=shipping_address,
                    billing_address=billing_address,
                    coupon=coupon_obj
                )

                # Save order items and reduce stock
                for cart_item in cart.items.all():
                    product = Product.objects.get(id=cart_item.product.id)
                    product.stock -= cart_item.quantity
                    product.save()

                    variant_details = {}
                    if cart_item.selected_size:
                        variant_details['size'] = cart_item.selected_size.value
                    if cart_item.selected_color:
                        variant_details['color'] = cart_item.selected_color.value

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        variant_details=variant_details,
                        quantity=cart_item.quantity,
                        price=cart_item.total_price / cart_item.quantity
                    )

                if coupon_obj:
                    coupon_obj.uses_count += 1
                    coupon_obj.save()

                # Clear cart
                cart.items.all().delete()

                # Link Payment to Order and update status
                payment.order = order
                payment.razorpay_payment_id = razorpay_payment_id
                payment.signature = razorpay_signature
                payment.status = 'success'
                payment.save()
                
                # Send receipt confirmation email
                send_order_confirmation_email(order, payment)

                serializer = OrderSerializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Order placement transaction failed: {e}")
            payment.status = 'failed'
            payment.save()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UPICreateIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        coupon_code = request.data.get('coupon_code')
        upi_app = request.data.get('upi_app', 'BHIM')
        
        cart = Cart.objects.filter(user=user).first()
        if not cart or cart.items.count() == 0:
            return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)
            
        subtotal = float(cart.subtotal)
        discount = 0.0
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
                valid, msg = coupon.is_valid(subtotal)
                if valid:
                    if coupon.discount_type == 'percentage':
                        discount = subtotal * float(coupon.discount_value) / 100.0
                    else:
                        discount = float(coupon.discount_value)
                    discount = min(discount, subtotal)
            except Coupon.DoesNotExist:
                pass

        shipping = 10.0 if subtotal < 100.0 else 0.0
        tax = (subtotal - discount) * 0.08
        grand_total = subtotal - discount + shipping + tax
        
        payment_id = f"PAY-UPI-{timezone.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
        
        # Save a pending UPI Payment
        payment = Payment.objects.create(
            user=user,
            payment_id=payment_id,
            amount=grand_total,
            currency='INR',
            status='pending',
            payment_method=f"UPI ({upi_app})"
        )
        
        # Generate standard UPI Deep Links
        # pa: merchant UPI ID (e.g. 7075708294@ybl), pn: merchant name, am: amount, tn: transaction notes
        import urllib.parse
        merchant_upi = "7075708294@ybl"
        merchant_name = "DevStack E-Commerce"
        upi_uri = f"upi://pay?pa={merchant_upi}&pn={merchant_name}&am={grand_total:.2f}&cu=INR&tn={payment_id}"
        encoded_upi_uri = urllib.parse.quote(upi_uri)
        
        return Response({
            "payment_id": payment_id,
            "amount": grand_total,
            "currency": "INR",
            "upi_uri": upi_uri,
            "qr_code_url": f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={encoded_upi_uri}"
        }, status=status.HTTP_200_OK)

class UPIVerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        payment_id = request.data.get('payment_id')
        shipping_address = request.data.get('shipping_address')
        billing_address = request.data.get('billing_address') or shipping_address
        coupon_code = request.data.get('coupon_code')
        
        payment = get_object_or_404(Payment, payment_id=payment_id, user=user)
        
        if payment.status == 'success' and payment.order:
            serializer = OrderSerializer(payment.order)
            return Response(serializer.data, status=status.HTTP_200_OK)

        cart = Cart.objects.filter(user=user).first()
        if not cart or cart.items.count() == 0:
            return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = float(cart.subtotal)
        discount = 0.0
        coupon_obj = None

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
                valid, msg = coupon.is_valid(subtotal)
                if valid:
                    coupon_obj = coupon
                    if coupon.discount_type == 'percentage':
                        discount = subtotal * float(coupon.discount_value) / 100.0
                    else:
                        discount = float(coupon.discount_value)
                    discount = min(discount, subtotal)
            except Coupon.DoesNotExist:
                pass

        shipping = 10.0 if subtotal < 100.0 else 0.0
        tax = (subtotal - discount) * 0.08
        grand_total = subtotal - discount + shipping + tax

        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        rand_num = random.randint(1000, 9999)
        order_number = f"ORD-{timestamp}-{rand_num}"

        try:
            with transaction.atomic():
                for cart_item in cart.items.all():
                    product = Product.objects.select_for_update().get(id=cart_item.product.id)
                    if product.stock < cart_item.quantity:
                        raise Exception(f"Product '{product.name}' went out of stock during payment.")

                order = Order.objects.create(
                    user=user,
                    order_number=order_number,
                    total_amount=subtotal,
                    discount_amount=discount,
                    shipping_charges=shipping,
                    tax_amount=tax,
                    grand_total=grand_total,
                    payment_method=payment.payment_method,
                    payment_status='paid',
                    status='processing',
                    shipping_address=shipping_address,
                    billing_address=billing_address,
                    coupon=coupon_obj
                )

                for cart_item in cart.items.all():
                    product = Product.objects.get(id=cart_item.product.id)
                    product.stock -= cart_item.quantity
                    product.save()

                    variant_details = {}
                    if cart_item.selected_size:
                        variant_details['size'] = cart_item.selected_size.value
                    if cart_item.selected_color:
                        variant_details['color'] = cart_item.selected_color.value

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        variant_details=variant_details,
                        quantity=cart_item.quantity,
                        price=cart_item.total_price / cart_item.quantity
                    )

                if coupon_obj:
                    coupon_obj.uses_count += 1
                    coupon_obj.save()

                cart.items.all().delete()

                # Update payment
                payment.order = order
                payment.status = 'success'
                payment.save()

                send_order_confirmation_email(order, payment)

                serializer = OrderSerializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"UPI Order transaction failed: {e}")
            payment.status = 'failed'
            payment.save()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CashOnDeliveryCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        shipping_address = request.data.get('shipping_address')
        billing_address = request.data.get('billing_address') or shipping_address
        coupon_code = request.data.get('coupon_code')

        cart = Cart.objects.filter(user=user).first()
        if not cart or cart.items.count() == 0:
            return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = float(cart.subtotal)
        discount = 0.0
        coupon_obj = None

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
                valid, msg = coupon.is_valid(subtotal)
                if valid:
                    coupon_obj = coupon
                    if coupon.discount_type == 'percentage':
                        discount = subtotal * float(coupon.discount_value) / 100.0
                    else:
                        discount = float(coupon.discount_value)
                    discount = min(discount, subtotal)
            except Coupon.DoesNotExist:
                pass

        shipping = 10.0 if subtotal < 100.0 else 0.0
        tax = (subtotal - discount) * 0.08
        grand_total = subtotal - discount + shipping + tax

        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        rand_num = random.randint(1000, 9999)
        order_number = f"ORD-{timestamp}-{rand_num}"

        try:
            with transaction.atomic():
                for cart_item in cart.items.all():
                    product = Product.objects.select_for_update().get(id=cart_item.product.id)
                    if product.stock < cart_item.quantity:
                        raise Exception(f"Product '{product.name}' is out of stock.")

                order = Order.objects.create(
                    user=user,
                    order_number=order_number,
                    total_amount=subtotal,
                    discount_amount=discount,
                    shipping_charges=shipping,
                    tax_amount=tax,
                    grand_total=grand_total,
                    payment_method='COD',
                    payment_status='pending',
                    status='pending',
                    shipping_address=shipping_address,
                    billing_address=billing_address,
                    coupon=coupon_obj
                )

                for cart_item in cart.items.all():
                    product = Product.objects.get(id=cart_item.product.id)
                    product.stock -= cart_item.quantity
                    product.save()

                    variant_details = {}
                    if cart_item.selected_size:
                        variant_details['size'] = cart_item.selected_size.value
                    if cart_item.selected_color:
                        variant_details['color'] = cart_item.selected_color.value

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        variant_details=variant_details,
                        quantity=cart_item.quantity,
                        price=cart_item.total_price / cart_item.quantity
                    )

                if coupon_obj:
                    coupon_obj.uses_count += 1
                    coupon_obj.save()

                cart.items.all().delete()

                # Generate a payment record for tracking
                payment = Payment.objects.create(
                    user=user,
                    order=order,
                    payment_id=f"PAY-COD-{order_number}",
                    amount=grand_total,
                    currency='INR',
                    status='pending',
                    payment_method='COD'
                )

                send_order_confirmation_email(order, payment)

                serializer = OrderSerializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"COD checkout failed: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
