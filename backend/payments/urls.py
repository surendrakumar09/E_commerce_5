from django.urls import path
from .views import (
    RazorpayCreateOrderView,
    RazorpayVerifyPaymentView,
    UPICreateIntentView,
    UPIVerifyPaymentView,
    CashOnDeliveryCheckoutView
)

urlpatterns = [
    path('razorpay/order/', RazorpayCreateOrderView.as_view(), name='razorpay-order'),
    path('razorpay/verify/', RazorpayVerifyPaymentView.as_view(), name='razorpay-verify'),
    path('upi/create/', UPICreateIntentView.as_view(), name='upi-create'),
    path('upi/verify/', UPIVerifyPaymentView.as_view(), name='upi-verify'),
    path('cod/checkout/', CashOnDeliveryCheckoutView.as_view(), name='cod-checkout'),
]
