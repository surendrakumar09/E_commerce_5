from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CouponViewSet, ValidateCouponView

router = DefaultRouter()
router.register(r'manage', CouponViewSet, basename='coupon-manage')

urlpatterns = [
    path('', include(router.urls)),
    path('validate/', ValidateCouponView.as_view(), name='coupon-validate'),
]
