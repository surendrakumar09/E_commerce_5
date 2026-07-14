from django.contrib import admin
from django.utils.html import format_html
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'payment_id',
        'get_customer',
        'get_order_link',
        'payment_method',
        'razorpay_payment_id',
        'amount',
        'status_badge',
        'transaction_date'
    )
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = (
        'payment_id',
        'razorpay_order_id',
        'razorpay_payment_id',
        'order__order_number',
        'user__username',
        'user__email'
    )
    readonly_fields = (
        'payment_id',
        'razorpay_order_id',
        'razorpay_payment_id',
        'signature',
        'user',
        'order',
        'amount',
        'currency',
        'payment_method',
        'transaction_date',
        'created_at',
        'updated_at'
    )

    def status_badge(self, obj):
        colors = {
            'pending': '#d97706',  # Amber
            'success': '#16a34a',  # Green
            'failed': '#dc2626',   # Red
            'refunded': '#2563eb'  # Blue
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase;">{}</span>',
            colors.get(obj.status, '#71717a'),
            obj.status
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'

    def get_customer(self, obj):
        if obj.user:
            return f"{obj.user.username} ({obj.user.email})"
        return "Guest"
    get_customer.short_description = 'Customer'
    get_customer.admin_order_field = 'user'

    def get_order_link(self, obj):
        if obj.order:
            # Quick link to order detail page in admin panel
            from django.urls import reverse
            url = reverse('admin:orders_order_change', args=[obj.order.id])
            return format_html('<a href="{}" style="font-family: monospace; font-weight: bold;">{}</a>', url, obj.order.order_number)
        return "-"
    get_order_link.short_description = 'Order Reference'
    get_order_link.admin_order_field = 'order'

    # Display total transactions stats in admin change list footer if needed
