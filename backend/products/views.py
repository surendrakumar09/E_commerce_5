from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q, Case, When, F, DecimalField
from .models import Category, Brand, Product, Banner, Newsletter, ContactMessage
from .serializers import (
    CategorySerializer, BrandSerializer, ProductSerializer,
    BannerSerializer, NewsletterSerializer, ContactMessageSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True, parent__isnull=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Filtering parameters
        category_slug = self.request.query_params.get('category')
        brand_slug = self.request.query_params.get('brand')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        size = self.request.query_params.get('size')
        color = self.request.query_params.get('color')
        search = self.request.query_params.get('search')
        featured = self.request.query_params.get('featured')
        best_seller = self.request.query_params.get('best_seller')
        new_arrival = self.request.query_params.get('new_arrival')
        trending = self.request.query_params.get('trending')
        special_promo = self.request.query_params.get('special_promo')
        discount = self.request.query_params.get('discount')
        discount_min = self.request.query_params.get('discount_min')
        rating_min = self.request.query_params.get('rating_min')
        in_stock = self.request.query_params.get('in_stock')
        slug = self.request.query_params.get('slug')
        
        if slug:
            queryset = queryset.filter(slug=slug)
        
        if category_slug:
            # Filter by category slug or its child categories
            try:
                cat = Category.objects.get(slug=category_slug)
                queryset = queryset.filter(Q(category=cat) | Q(category__parent=cat) | Q(category__parent__parent=cat))
            except Category.DoesNotExist:
                queryset = queryset.none()
                
        if brand_slug:
            queryset = queryset.filter(brand__slug=brand_slug)
            
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
            
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        if size:
            queryset = queryset.filter(variants__variant_type='size', variants__value=size)
            
        if color:
            queryset = queryset.filter(variants__variant_type='color', variants__value=color)
            
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(category__name__icontains=search) |
                Q(brand__name__icontains=search)
            )
            
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
            
        if best_seller == 'true':
            queryset = queryset.filter(Q(is_best_seller=True) | Q(ratings_average__gte=4.5))
            
        if new_arrival == 'true':
            queryset = queryset.filter(is_new_arrival=True)
            
        if trending == 'true':
            queryset = queryset.filter(is_trending=True)
            
        if special_promo == 'true':
            queryset = queryset.filter(is_special_promo=True)
            
        if discount == 'true':
            queryset = queryset.filter(discount_price__isnull=False)
            
        if discount_min:
            queryset = queryset.filter(discount_percentage__gte=discount_min)
            
        if rating_min:
            queryset = queryset.filter(ratings_average__gte=rating_min)
            
        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)

        # Annotate active price (either discount_price if available, else price)
        queryset = queryset.annotate(
            active_price=Case(
                When(discount_price__isnull=False, then=F('discount_price')),
                default=F('price'),
                output_field=DecimalField()
            )
        )

        # Sorting
        sort = self.request.query_params.get('sort')
        if sort == 'price_low_high':
            queryset = queryset.order_by('active_price')
        elif sort == 'price_high_low':
            queryset = queryset.order_by('-active_price')
        elif sort == 'rating' or sort == 'highest_rated':
            queryset = queryset.order_by('-ratings_average')
        elif sort == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort == 'best_selling' or sort == 'most_popular' or sort == 'popularity':
            queryset = queryset.order_by('-reviews_count')
        elif sort == 'biggest_discount':
            queryset = queryset.order_by('-discount_percentage')
        else:
            # Default sorting
            queryset = queryset.order_by('-created_at')
            
        return queryset.distinct()

class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.filter(is_active=True).order_by('order')
    serializer_class = BannerSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

class NewsletterCreateView(generics.CreateAPIView):
    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer
    permission_classes = [permissions.AllowAny]

class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]
