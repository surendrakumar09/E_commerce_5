from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'product_details', 'variant_details', 'quantity', 'price', 'total_price']
        read_only_fields = ['order']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'username', 'order_number', 'total_amount', 'discount_amount',
            'shipping_charges', 'tax_amount', 'grand_total', 'status', 'payment_status',
            'payment_method', 'shipping_address', 'billing_address', 'coupon', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'user']
