from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, BrandViewSet, ProductViewSet, BannerViewSet, NewsletterCreateView, ContactMessageCreateView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'banners', BannerViewSet, basename='banner')

urlpatterns = [
    path('', include(router.urls)),
    path('newsletter/', NewsletterCreateView.as_view(), name='newsletter'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact'),
]
