from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, WishlistViewSet

router = DefaultRouter()
router.register(r'wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('', include(router.urls)),
    path('items/', CartViewSet.as_view({'get': 'list'}), name='cart-items'),
    path('items/add/', CartViewSet.as_view({'post': 'add_item'}), name='cart-add'),
    path('items/update-quantity/', CartViewSet.as_view({'post': 'update_quantity'}), name='cart-update-quantity'),
    path('items/remove/', CartViewSet.as_view({'post': 'remove_item'}), name='cart-remove'),
    path('items/clear/', CartViewSet.as_view({'post': 'clear_cart'}), name='cart-clear'),
]
