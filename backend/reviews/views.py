from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Review
from .serializers import ReviewSerializer
from products.models import Product

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        if product_id:
            return Review.objects.filter(product_id=product_id, is_approved=True).order_by('-created_at')
        return Review.objects.filter(is_approved=True).order_by('-created_at')

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()] # validated in check_object_permissions
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Prevent user from submitting multiple reviews for the same product
        product_id = self.request.data.get('product')
        product = get_object_or_404(Product, id=product_id)
        
        # Check if already reviewed
        existing_review = Review.objects.filter(user=self.request.user, product=product).first()
        if existing_review:
            # Overwrite or return error. Let's update the existing review!
            existing_review.rating = serializer.validated_data.get('rating', existing_review.rating)
            existing_review.comment = serializer.validated_data.get('comment', existing_review.comment)
            existing_review.save()
            return
            
        serializer.save(user=self.request.user, product=product)

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        if review.user != request.user and not request.user.is_staff:
            return Response({"error": "You cannot delete this review."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
