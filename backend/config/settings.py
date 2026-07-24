import os
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environment variables
env = environ.Env(
    DEBUG=(bool, True),
    DATABASE_URL=(str, 'mysql://root:admin123@localhost:3306/ecommerce_db'),
    CORS_ALLOW_ALL_ORIGINS=(bool, True),
)

# Read .env file from base directory
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY', default='django-insecure-ecommerce-premium-key-change-this-in-production')

DEBUG = env('DEBUG')

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Custom apps
    'accounts',
    'products',
    'orders',
    'cart',
    'payments',
    'reviews',
    'coupons',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be high up
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

try:
    import whitenoise
    MIDDLEWARE.insert(2, 'whitenoise.middleware.WhiteNoiseMiddleware')
except ImportError:
    pass

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database Setup with SQLite Fallback and Automatic MySQL Creation
DATABASE_URL = env('DATABASE_URL')
IS_VERCEL = 'VERCEL' in os.environ
SQLITE_DB_PATH = '/tmp/db.sqlite3' if IS_VERCEL else BASE_DIR / 'db.sqlite3'

try:
    db_config = env.db()
    DATABASES = {
        'default': db_config
    }
    
    # If using MySQL, check connection and create database if not exists
    if db_config['ENGINE'] == 'django.db.backends.mysql':
        import pymysql
        host = db_config.get('HOST') or 'localhost'
        user = db_config.get('USER') or 'root'
        password = db_config.get('PASSWORD') or ''
        port = int(db_config.get('PORT') or 3306)
        db_name = db_config.get('NAME')
        
        try:
            conn = pymysql.connect(
                host=host,
                user=user,
                password=password,
                port=port,
                connect_timeout=3,
            )
            with conn.cursor() as cursor:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;")
            conn.close()
            print(f"--- Database '{db_name}' verified/created ---")
        except Exception as e:
            print(f"--- Warning: Could not connect to MySQL server at {host}:{port}. Falling back to SQLite. Error: {e} ---")
            DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.sqlite3',
                    'NAME': SQLITE_DB_PATH,
                }
            }
except Exception as e:
    print(f"--- Warning: Database parsing error. Falling back to SQLite. Error: {e} ---")
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': SQLITE_DB_PATH,
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Media files (User uploaded)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Config
CORS_ALLOW_ALL_ORIGINS = env('CORS_ALLOW_ALL_ORIGINS')
CORS_ALLOW_CREDENTIALS = True

from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    "cart-session-id",
    "Cart-Session-Id",
    "Cart-Session-ID",
]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

# SimpleJWT configuration
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Email Backend Settings for local testing fallback
EMAIL_BACKEND = 'config.email_backend.SafeConsoleEmailBackend'
DEFAULT_FROM_EMAIL = 'DevStack Shop <shop@devstack.local>'

# Razorpay API Credentials
RAZORPAY_KEY_ID = env('RAZORPAY_KEY_ID', default='rzp_test_mock_123456')
RAZORPAY_KEY_SECRET = env('RAZORPAY_KEY_SECRET', default='mock_secret_123456')

