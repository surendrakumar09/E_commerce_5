import datetime
import random
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import Cart
from coupons.models import Coupon
from products.models import Product

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create', 'cancel', 'request_refund']:
            return [permissions.IsAuthenticated()]
        # Admin can update orders (e.g. status)
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.profile.role == 'admin':
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    def create(self, request):
        user = request.user
        data = request.data
        
        shipping_address = data.get('shipping_address')
        billing_address = data.get('billing_address') or shipping_address
        payment_method = data.get('payment_method', 'COD')
        coupon_code = data.get('coupon_code')

        # Retrieve user's cart
        cart = Cart.objects.filter(user=user).first()
        if not cart or cart.items.count() == 0:
            return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = float(cart.subtotal)
        discount = 0.0
        coupon_obj = None

        # Validate Coupon
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

        # Calculate totals
        shipping = 10.0 if subtotal < 100.0 else 0.0  # free shipping over 100
        tax = (subtotal - discount) * 0.08  # 8% sales tax
        grand_total = subtotal - discount + shipping + tax

        # Generate unique order number
        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        rand_num = random.randint(1000, 9999)
        order_number = f"ORD-{timestamp}-{rand_num}"

        # Place everything in a transaction to guarantee atomic execution
        try:
            with transaction.atomic():
                order = Order.objects.create(
                    user=user,
                    order_number=order_number,
                    total_amount=subtotal,
                    discount_amount=discount,
                    shipping_charges=shipping,
                    tax_amount=tax,
                    grand_total=grand_total,
                    payment_method=payment_method,
                    payment_status='paid' if payment_method in ['Stripe', 'Razorpay'] else 'pending',
                    shipping_address=shipping_address,
                    billing_address=billing_address,
                    coupon=coupon_obj
                )

                # Create Order Items and decrease product stock
                for cart_item in cart.items.all():
                    product = cart_item.product
                    if product.stock < cart_item.quantity:
                        raise Exception(f"Product {product.name} is out of stock.")
                    
                    product.stock -= cart_item.quantity
                    product.save()

                    # Save variants context in order item snapshot
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
                        price=cart_item.total_price / cart_item.quantity  # Base variant price
                    )

                # Update Coupon use count
                if coupon_obj:
                    coupon_obj.uses_count += 1
                    coupon_obj.save()

                # Clear Cart
                cart.items.all().delete()

                # Return response
                serializer = OrderSerializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.user != request.user:
            return Response({"error": "You do not own this order."}, status=status.HTTP_403_FORBIDDEN)
        if order.status not in ['pending', 'processing']:
            return Response({"error": f"This order cannot be cancelled because it is currently {order.status}."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                order.status = 'cancelled'
                order.save()
                
                # Restore items stock
                for item in order.items.all():
                    if item.product:
                        item.product.stock += item.quantity
                        item.product.save()

            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def request_refund(self, request, pk=None):
        order = self.get_object()
        if order.user != request.user:
            return Response({"error": "You do not own this order."}, status=status.HTTP_403_FORBIDDEN)
        if order.payment_status != 'paid':
            return Response({"error": "Only paid orders can be refunded."}, status=status.HTTP_400_BAD_REQUEST)
        if order.status == 'cancelled':
            return Response({"error": "This order is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                order.status = 'cancelled'
                order.payment_status = 'failed'  # Mark payment status failed/refunded
                order.save()

                # Update associated Payments to refunded
                order.payments.filter(status='success').update(status='refunded')

                # Restore items stock
                for item in order.items.all():
                    if item.product:
                        item.product.stock += item.quantity
                        item.product.save()

            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
