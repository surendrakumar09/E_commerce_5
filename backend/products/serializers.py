from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, ProductVariant, Banner, Newsletter, ContactMessage

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'parent', 'children', 'is_active']

    def get_children(self, obj):
        # Only serialize one level of children to avoid infinite recursion
        serializer = CategorySerializer(obj.children.all(), many=True)
        return serializer.data

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'description', 'is_featured']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'is_featured']

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'variant_type', 'value', 'price_modifier', 'stock']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'category_name', 'category_slug', 'brand', 'brand_name',
            'description', 'price', 'discount_price', 'discount_percentage', 'sku', 'stock', 'is_active',
            'is_featured', 'ratings_average', 'reviews_count', 'images', 'variants',
            'features', 'specifications', 'thumbnail_url', 'seller_name', 'warranty',
            'return_policy', 'delivery_time', 'cash_on_delivery', 'is_trending',
            'is_best_seller', 'is_new_arrival', 'is_special_promo',
            'created_at', 'updated_at'
        ]

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'image_url', 'link_url', 'order', 'is_active']

class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ['id', 'email', 'subscribed_at']

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
