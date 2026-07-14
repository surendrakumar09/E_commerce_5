from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, Count
from django.contrib.auth.models import User
from orders.models import Order
from products.models import Product, Category
import datetime

class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Overall metrics
        total_orders = Order.objects.count()
        total_revenue = Order.objects.filter(payment_status='paid').aggregate(Sum('grand_total'))['grand_total__sum'] or 0.0
        total_products = Product.objects.count()
        total_customers = User.objects.filter(profile__role='customer').count()

        # Sales analytics (last 6 months)
        sales_chart_data = []
        today = datetime.date.today()
        for i in range(5, -1, -1):
            date = today - datetime.timedelta(days=i*30)
            month_name = date.strftime('%b')
            year = date.year
            month = date.month
            
            monthly_revenue = Order.objects.filter(
                created_at__year=year,
                created_at__month=month,
                payment_status='paid'
            ).aggregate(Sum('grand_total'))['grand_total__sum'] or 0.0
            
            sales_chart_data.append({
                "label": month_name,
                "revenue": float(monthly_revenue)
            })

        # Category share data
        category_share = []
        categories = Category.objects.filter(parent__isnull=True)
        for cat in categories:
            product_count = Product.objects.filter(category=cat).count()
            if product_count > 0:
                category_share.append({
                    "name": cat.name,
                    "value": product_count
                })

        # Recent orders
        recent_orders_qs = Order.objects.all().order_by('-created_at')[:5]
        recent_orders = []
        for order in recent_orders_qs:
            recent_orders.append({
                "id": order.id,
                "order_number": order.order_number,
                "customer": order.user.username if order.user else "Guest",
                "grand_total": float(order.grand_total),
                "status": order.status,
                "created_at": order.created_at.strftime('%Y-%m-%d')
            })

        return Response({
            "metrics": {
                "totalOrders": total_orders,
                "totalRevenue": float(total_revenue),
                "totalProducts": total_products,
                "totalCustomers": total_customers
            },
            "salesChart": sales_chart_data,
            "categoryShare": category_share,
            "recentOrders": recent_orders
        }, status=status.HTTP_200_OK)
