from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Coupon
from .serializers import CouponSerializer

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAdminUser]

class ValidateCouponView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        subtotal = float(request.data.get('subtotal', 0.0))

        if not code:
            return Response({"valid": False, "message": "Code is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code__iexact=code)
            valid, message = coupon.is_valid(subtotal)
            if not valid:
                return Response({"valid": False, "message": message}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate discount
            discount = 0.0
            if coupon.discount_type == 'percentage':
                discount = subtotal * float(coupon.discount_value) / 100.0
            elif coupon.discount_type == 'fixed':
                discount = float(coupon.discount_value)

            # Cap discount at subtotal
            discount = min(discount, subtotal)

            return Response({
                "valid": True,
                "code": coupon.code,
                "discount_type": coupon.discount_type,
                "discount_value": coupon.discount_value,
                "discount_amount": discount
            }, status=status.HTTP_200_OK)
            
        except Coupon.DoesNotExist:
            return Response({"valid": False, "message": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)
