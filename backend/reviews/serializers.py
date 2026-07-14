from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.URLField(source='user.profile.avatar', read_only=True, default='')

    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'avatar', 'product', 'rating', 'comment', 'is_approved', 'created_at']
        read_only_fields = ['user', 'is_approved']
