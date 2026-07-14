from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'payment_id',
            'razorpay_order_id',
            'razorpay_payment_id',
            'signature',
            'user',
            'order',
            'amount',
            'currency',
            'status',
            'payment_method',
            'transaction_date',
            'created_at',
            'updated_at'
        ]
