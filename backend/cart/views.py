from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Wishlist
from .serializers import CartSerializer, CartItemSerializer, WishlistSerializer
from products.models import Product, ProductVariant

class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def _get_cart(self, request):
        user = request.user
        session_id = request.headers.get('Cart-Session-Id') or request.query_params.get('session_id')
        
        if user.is_authenticated:
            # If authenticated, try getting cart by user
            cart, created = Cart.objects.get_or_create(user=user)
            # If session_id is also sent, merge guest cart into user cart
            if session_id:
                guest_carts = Cart.objects.filter(session_id=session_id)
                for guest_cart in guest_carts:
                    for item in guest_cart.items.all():
                        # check if item already exists in user cart
                        existing_item = CartItem.objects.filter(
                            cart=cart, 
                            product=item.product,
                            selected_size=item.selected_size,
                            selected_color=item.selected_color
                        ).first()
                        if existing_item:
                            existing_item.quantity += item.quantity
                            existing_item.save()
                        else:
                            item.cart = cart
                            item.save()
                    guest_cart.delete()
            return cart
        else:
            if not session_id:
                # Fallback session key
                session_id = request.session.session_key
                if not session_id:
                    request.session.create()
                    session_id = request.session.session_key
            cart, created = Cart.objects.get_or_create(session_id=session_id)
            return cart

    def list(self, request):
        cart = self._get_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='add')
    def add_item(self, request):
        cart = self._get_cart(request)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        size_id = request.data.get('size_id')
        color_id = request.data.get('color_id')

        product = get_object_or_404(Product, id=product_id)
        selected_size = ProductVariant.objects.filter(id=size_id).first() if size_id else None
        selected_color = ProductVariant.objects.filter(id=color_id).first() if color_id else None

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            selected_size=selected_size,
            selected_color=selected_color,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='update-quantity')
    def update_quantity(self, request):
        cart = self._get_cart(request)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity'))

        if quantity <= 0:
            CartItem.objects.filter(id=item_id, cart=cart).delete()
        else:
            CartItem.objects.filter(id=item_id, cart=cart).update(quantity=quantity)

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='remove')
    def remove_item(self, request):
        cart = self._get_cart(request)
        item_id = request.data.get('item_id')
        
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='clear')
    def clear_cart(self, request):
        cart = self._get_cart(request)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
