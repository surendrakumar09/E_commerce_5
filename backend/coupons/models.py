from django.db import models
from django.utils import timezone

class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ('percentage', 'Percentage Discount (%)'),
        ('fixed', 'Fixed Amount Discount ($)'),
    )
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=15, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_spend = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    is_active = models.BooleanField(default=True)
    active_from = models.DateTimeField(default=timezone.now)
    active_to = models.DateTimeField()
    max_uses = models.PositiveIntegerField(default=100)
    uses_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.code} ({self.discount_type}: {self.discount_value})"

    def is_valid(self, cart_subtotal=0):
        now = timezone.now()
        if not self.is_active:
            return False, "Coupon is inactive."
        if now < self.active_from or now > self.active_to:
            return False, "Coupon has expired."
        if self.uses_count >= self.max_uses:
            return False, "Coupon limit reached."
        if cart_subtotal < self.min_spend:
            return False, f"Minimum spend of ${self.min_spend} required to use this coupon."
        return True, ""
