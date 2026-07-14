from django.db import models
from django.contrib.auth.models import User
from products.models import Product
from django.db.models import Avg

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(default=5)  # 1 to 5
    comment = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username}'s {self.rating}-star review on {self.product.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update ratings_average and reviews_count on Product
        approved_reviews = Review.objects.filter(product=self.product, is_approved=True)
        self.product.reviews_count = approved_reviews.count()
        avg_rating = approved_reviews.aggregate(Avg('rating'))['rating__avg']
        self.product.ratings_average = avg_rating if avg_rating is not None else 0.0
        self.product.save()

    def delete(self, *args, **kwargs):
        product = self.product
        super().delete(*args, **kwargs)
        approved_reviews = Review.objects.filter(product=product, is_approved=True)
        product.reviews_count = approved_reviews.count()
        avg_rating = approved_reviews.aggregate(Avg('rating'))['rating__avg']
        product.ratings_average = avg_rating if avg_rating is not None else 0.0
        product.save()
