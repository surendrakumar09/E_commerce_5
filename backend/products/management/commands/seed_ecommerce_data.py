import datetime
import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.utils import timezone
from django.db import transaction
from accounts.models import Profile
from products.models import Category, Brand, Product, ProductImage, ProductVariant, Banner, Newsletter, ContactMessage
from coupons.models import Coupon
from reviews.models import Review

class Command(BaseCommand):
    help = 'Seed database with 300+ realistic e-commerce products, 30 categories, variants, reviews, and coupons'

    def handle(self, *args, **kwargs):
        self.stdout.write('Initializing data seeding...')
        
        # Wrap everything in a transaction so we don't end up with partial data
        with transaction.atomic():
            self.seed_data()

    def seed_data(self):
        # 1. Clean existing catalog data to avoid duplicates/bloat
        self.stdout.write('Clearing existing product data...')
        Review.objects.all().delete()
        ProductVariant.objects.all().delete()
        ProductImage.objects.all().delete()
        Product.objects.all().delete()
        Brand.objects.all().delete()
        Category.objects.all().delete()
        Banner.objects.all().delete()
        Coupon.objects.all().delete()

        # 2. Create Users
        admin_user, created = User.objects.get_or_create(username='admin', email='admin@example.com')
        if created or not admin_user.is_superuser:
            admin_user.set_password('admin123')
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            profile = admin_user.profile
            profile.role = 'admin'
            profile.save()
            self.stdout.write("Admin user 'admin'/'admin123' created.")

        customer_user, created = User.objects.get_or_create(username='customer', email='customer@example.com')
        if created:
            customer_user.set_password('customer123')
            customer_user.save()
            self.stdout.write("Customer user 'customer'/'customer123' created.")

        # Additional review users
        review_usernames = ['alice_jones', 'bob_smith', 'rahul_sharma', 'priya_p', 'amit_kumar', 'neha_singh', 'david_w', 'emma_b']
        review_users = []
        for name in review_usernames:
            u, _ = User.objects.get_or_create(username=name, email=f"{name}@example.com")
            u.set_password('customer123')
            u.save()
            review_users.append(u)

        # 3. Create Brands
        brands_data = {
            'Electronics': ['Apple', 'Samsung', 'Sony', 'Bose', 'Canon', 'OnePlus', 'Xiaomi', 'Google', 'Logitech', 'Razer', 'Anker', 'SanDisk', 'HP', 'Dell', 'ASUS', 'Epson'],
            'Appliances': ['LG', 'Dyson', 'Philips', 'Panasonic', 'Prestige', 'Samsung', 'LG'],
            'Fashion': ['Nike', 'Adidas', 'Puma', 'Levi\'s', 'Zara', 'H&M', 'Tommy Hilfiger', 'Fossil', 'Wildcraft'],
            'Home & Furniture': ['IKEA', 'Durian', 'Home Centre', 'Philips', 'Prestige'],
            'Grocery & Beauty': ['L\'Oreal', 'Nivea', 'Nestle', 'Cadbury', 'Pedigree', 'Whiskas', 'Mamaearth'],
            'Books & Sports': ['Penguin Books', 'Decathlon', 'Nivia', 'Lego', 'Hasbro', 'Mattel']
        }
        
        all_brands = {}
        for category_group, brand_list in brands_data.items():
            for b_name in brand_list:
                if b_name not in all_brands:
                    brand, _ = Brand.objects.get_or_create(
                        name=b_name,
                        defaults={
                            'description': f"Premium products from {b_name}.",
                            'is_featured': random.choice([True, False])
                        }
                    )
                    all_brands[b_name] = brand

        # 4. Define Category Tree
        parent_categories = {
            'Electronics & Gadgets': {
                'description': 'Smartphones, laptops, wearable technology, and premium sound systems.',
                'image': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=60',
                'subs': ['Smartphones', 'Laptops', 'Tablets', 'Smart Watches', 'Earbuds', 'Headphones', 'Cameras', 'Gaming Consoles', 'Monitors']
            },
            'Peripherals & Charging': {
                'description': 'Keyboards, mouse devices, storage, printers, power banks and high-speed chargers.',
                'image': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60',
                'subs': ['Computer Accessories', 'Keyboards', 'Mouse', 'Printers', 'Storage Devices', 'Power Banks', 'Chargers']
            },
            'Home & Kitchen Appliances': {
                'description': 'Smart refrigerators, high-tech vacuum cleaners, cookers, and kitchen mixers.',
                'image': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60',
                'subs': ['Home Appliances', 'Kitchen Appliances']
            },
            'Fashion & Apparel': {
                'description': 'Trendy clothing, luxury footwear, activewear, and quality backpacks.',
                'image': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'subs': ['Fashion (Men)', 'Fashion (Women)', 'Footwear', 'Bags']
            },
            'Daily Essentials & Care': {
                'description': 'Organic groceries, personal care products, cosmetics, and premium pet supplies.',
                'image': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
                'subs': ['Beauty & Personal Care', 'Grocery', 'Pet Supplies']
            },
            'Leisure, Books & Play': {
                'description': 'Fascinating books, fitness gear, children\'s toys, and elegant furniture or home decor.',
                'image': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60',
                'subs': ['Books', 'Sports & Fitness', 'Toys', 'Furniture', 'Home Decor']
            }
        }

        category_mapping = {}
        for p_name, p_info in parent_categories.items():
            parent_cat, _ = Category.objects.get_or_create(
                name=p_name,
                defaults={
                    'description': p_info['description'],
                    'image': p_info['image']
                }
            )
            for sub_name in p_info['subs']:
                # Generate a nice random image for subcategories
                sub_img = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60"
                sub_cat, _ = Category.objects.get_or_create(
                    name=sub_name,
                    parent=parent_cat,
                    defaults={
                        'description': f"Browse our extensive catalog of {sub_name}.",
                        'image': sub_img
                    }
                )
                category_mapping[sub_name] = sub_cat

        # 5. Product Templates & Generator
        # Let's map each of the 30 categories to unique product generation instructions
        # 10 products per category
        templates = {
            'Smartphones': {
                'brands': ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google'],
                'items': [
                    ('iPhone 15 Pro Max', 'Apple', 139900, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'),
                    ('Galaxy S24 Ultra', 'Samsung', 124900, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800'),
                    ('OnePlus 12 5G', 'OnePlus', 64999, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800'),
                    ('Pixel 8 Pro', 'Google', 93999, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'),
                    ('Redmi Note 13 Pro+', 'Xiaomi', 31999, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800'),
                    ('iPhone 15 Plus', 'Apple', 89900, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800'),
                    ('Galaxy A55 5G', 'Samsung', 39999, 'https://images.unsplash.com/photo-1573148195900-7845dcb9b127?w=800'),
                    ('OnePlus Nord CE4', 'OnePlus', 24999, 'https://images.unsplash.com/photo-1565849906660-703ea3c7db86?w=800'),
                    ('Xiaomi 14 Ultra', 'Xiaomi', 99999, 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800'),
                    ('Galaxy Fold 5', 'Samsung', 154999, 'https://images.unsplash.com/photo-1551645121-d1034da75057?w=800')
                ],
                'specs': lambda item, brand: {'Screen': '6.7 inch AMOLED', 'Processor': f'{brand} Octa-Core', 'Battery': '5000 mAh', 'Camera': '200MP Triple Camera'},
                'features': '✓ Incredible high-refresh rate screen\n✓ Stunning night-mode photography\n✓ Long-lasting all day battery life\n✓ Dynamic visual island display'
            },
            'Laptops': {
                'brands': ['Apple', 'HP', 'Dell', 'ASUS'],
                'items': [
                    ('MacBook Pro 16" M3', 'Apple', 249900, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'),
                    ('MacBook Air M3 13"', 'Apple', 114900, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800'),
                    ('Dell XPS 15 OLED', 'Dell', 189999, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800'),
                    ('HP Spectre x360', 'HP', 149999, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'),
                    ('ASUS ROG Zephyrus G14', 'ASUS', 139999, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800'),
                    ('Dell Inspiron 14 Core i5', 'Dell', 54999, 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1b?w=800'),
                    ('HP Pavilion 15 Ryzen 5', 'HP', 52999, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800'),
                    ('ASUS TUF Gaming A15', 'ASUS', 72999, 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=800'),
                    ('MacBook Pro 14" M3', 'Apple', 169900, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800'),
                    ('Dell Alienware m16', 'Dell', 229999, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800')
                ],
                'specs': lambda item, brand: {'RAM': '16GB DDR5', 'Storage': '1TB NVMe SSD', 'Screen Size': '15.6 Inch IPS', 'Graphics': 'NVIDIA RTX Graphics'},
                'features': '✓ Professional editing & gaming speeds\n✓ Crisp display with narrow bezels\n✓ Advanced copper thermal cooling\n✓ Full metallic body premium finish'
            },
            'Tablets': {
                'brands': ['Apple', 'Samsung', 'Xiaomi', 'OnePlus'],
                'items': [
                    ('iPad Pro 12.9" M2', 'Apple', 119900, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'),
                    ('Galaxy Tab S9 Ultra', 'Samsung', 108999, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'),
                    ('Xiaomi Pad 6', 'Xiaomi', 26999, 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800'),
                    ('iPad Air M2 11"', 'Apple', 59900, 'https://images.unsplash.com/photo-1589739900243-4b52cd9b1224?w=800'),
                    ('OnePlus Pad Go', 'OnePlus', 19999, 'https://images.unsplash.com/photo-1527698266440-12104e498b76?w=800'),
                    ('Galaxy Tab A9+', 'Samsung', 18999, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'),
                    ('iPad 10th Gen 10.9"', 'Apple', 39900, 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800'),
                    ('Redmi Pad SE', 'Xiaomi', 14999, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'),
                    ('OnePlus Pad WiFi', 'OnePlus', 37999, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'),
                    ('Galaxy Tab S9 FE', 'Samsung', 36999, 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800')
                ],
                'specs': lambda item, brand: {'Display': '11 inch Liquid Retina', 'Storage': '128GB', 'Connectivity': 'Wi-Fi Only', 'OS': f'{brand} OS'},
                'features': '✓ Smooth stylus/pencil drawing support\n✓ Cinematic Quad speaker audio\n✓ Lightweight sleek portability\n✓ Ideal for virtual meetings & study'
            },
            'Smart Watches': {
                'brands': ['Apple', 'Samsung', 'Fossil', 'OnePlus'],
                'items': [
                    ('Apple Watch Ultra 2', 'Apple', 89900, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800'),
                    ('Galaxy Watch 6 Classic', 'Samsung', 36999, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800'),
                    ('Apple Watch Series 9', 'Apple', 41900, 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=800'),
                    ('OnePlus Watch 2', 'OnePlus', 24999, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'),
                    ('Fossil Gen 6 Hybrid', 'Fossil', 18495, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800'),
                    ('Galaxy Watch 6 LTE', 'Samsung', 29999, 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=800'),
                    ('Apple Watch SE (2nd Gen)', 'Apple', 29900, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800'),
                    ('Fossil Machine Smartwatch', 'Fossil', 16995, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800'),
                    ('Redmi Watch 4', 'Xiaomi', 7999, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800'),
                    ('OnePlus Watch Sport', 'OnePlus', 14999, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800')
                ],
                'specs': lambda item, brand: {'Strap Material': 'Fluoroelastomer Sport Strap', 'Battery Backup': 'Up to 36 Hours', 'Water Rating': '50m Swimproof', 'Sensors': 'ECG, Heart Rate, SpO2 Tracker'},
                'features': '✓ Continuous heart rate tracking\n✓ Built-in GPS navigation map\n✓ High-resolution AMOLED screen\n✓ Notification alerts and call answers'
            },
            'Earbuds': {
                'brands': ['Apple', 'Samsung', 'Bose', 'OnePlus', 'Sony'],
                'items': [
                    ('AirPods Pro (2nd Gen)', 'Apple', 24900, 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=800'),
                    ('Galaxy Buds 2 Pro', 'Samsung', 15999, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'),
                    ('Bose QuietComfort II', 'Bose', 22900, 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800'),
                    ('OnePlus Buds Pro 2', 'OnePlus', 11999, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'),
                    ('Sony WF-1000XM5', 'Sony', 21990, 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=800'),
                    ('AirPods (3rd Gen)', 'Apple', 19900, 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800'),
                    ('Galaxy Buds FE', 'Samsung', 7999, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'),
                    ('OnePlus Buds Z2', 'OnePlus', 4999, 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=800'),
                    ('Sony LinkBuds S', 'Sony', 13990, 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800'),
                    ('Bose Sport Earbuds', 'Bose', 17900, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800')
                ],
                'specs': lambda item, brand: {'Active Noise Cancellation': 'Yes, Smart ANC', 'Battery Playback': 'Up to 30 Hours with Case', 'Drivers': '11mm Dynamic Drivers', 'IP Rating': 'IPX4 Sweat Resistance'},
                'features': '✓ Immersive surround spatial audio\n✓ Seamless dual-device switching\n✓ Ergonomic safe-fit earmuffs\n✓ Ultra crystal-clear vocal calls'
            },
            'Headphones': {
                'brands': ['Sony', 'Bose', 'Sennheiser', 'Apple'],
                'items': [
                    ('Sony WH-1000XM5', 'Sony', 29990, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800'),
                    ('Bose QuietComfort Ultra', 'Bose', 35900, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'),
                    ('Apple AirPods Max', 'Apple', 59900, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'),
                    ('Sony WH-CH720N Wireless', 'Sony', 9990, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'),
                    ('Bose QuietComfort 45', 'Bose', 27900, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'),
                    ('Sony WH-XB910N Extra Bass', 'Sony', 14990, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800'),
                    ('Sennheiser Accentum Wireless', 'Sennheiser', 11990, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'),
                    ('Sennheiser HD 450SE', 'Sennheiser', 9990, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'),
                    ('JBL Live 770NC', 'Sony', 12999, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'),
                    ('Sony WH-CH520 Wired-Wireless', 'Sony', 4490, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800')
                ],
                'specs': lambda item, brand: {'Design': 'Over-Ear Foldable', 'Driver Size': '40mm Dome Driver', 'Battery Backup': 'Up to 50 Hours', 'Weight': '250 grams'},
                'features': '✓ Smart Speak-to-Chat functionality\n✓ Super soft pressure-relieving cushions\n✓ Hi-Res wireless audio certified\n✓ Fast charging (3 min = 5 hrs)'
            },
            'Cameras': {
                'brands': ['Canon', 'Sony'],
                'items': [
                    ('Canon EOS R6 Mark II', 'Canon', 229995, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'),
                    ('Sony Alpha ILCE-7M4', 'Sony', 214990, 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800'),
                    ('Canon EOS R50 Creator Kit', 'Canon', 75990, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'),
                    ('Sony ZV-E10 Vlog Camera', 'Sony', 69990, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'),
                    ('Canon EOS 1500D DSLR', 'Canon', 47990, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'),
                    ('Sony Alpha ILCE-6400', 'Sony', 77990, 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800'),
                    ('Canon EOS R100 Kit', 'Canon', 49990, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'),
                    ('Sony ZV-1 II Vlogging', 'Sony', 79990, 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800'),
                    ('GoPro HERO12 Black Action', 'Sony', 37990, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'),
                    ('Sony Cyber-Shot RX100 VII', 'Sony', 98990, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800')
                ],
                'specs': lambda item, brand: {'Sensor Type': 'Full-Frame CMOS Sensor', 'Video Quality': '4K HDR at 60fps', 'ISO Range': '100 - 102400', 'Autofocus': 'Hybrid AF with Eye Tracking'},
                'features': '✓ Highly professional image resolution\n✓ Five-axis physical optical stabilization\n✓ Weather-sealed robust dust-proof design\n✓ Live high-speed Wi-Fi content transfers'
            },
            'Gaming Consoles': {
                'brands': ['Sony', 'ASUS'],
                'items': [
                    ('PlayStation 5 Console Slim', 'Sony', 54990, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800'),
                    ('Xbox Series X Console', 'Microsoft', 52990, 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800'),
                    ('Nintendo Switch OLED Model', 'Nintendo', 31999, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'),
                    ('ASUS ROG Ally Handheld Z1', 'ASUS', 59990, 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800'),
                    ('PlayStation 5 Digital Edition', 'Sony', 44990, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800'),
                    ('Steam Deck OLED 512GB', 'Valve', 54990, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'),
                    ('PlayStation VR2 VR Headset', 'Sony', 57990, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800'),
                    ('Xbox Series S 1TB Carbon', 'Microsoft', 38990, 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800'),
                    ('Nintendo Switch Lite Console', 'Nintendo', 16999, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'),
                    ('PS5 DualSense Wireless Controller', 'Sony', 5990, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800')
                ],
                'specs': lambda item, brand: {'Graphics Processor': 'Custom RDNA 2 GPU', 'SSD Capacity': '1TB NVMe Custom SSD', 'Video Output': 'Supports 8K HDR and 120Hz', 'Audio': '3D Spatial Audio Engine'},
                'features': '✓ Instant blazing fast game loading speeds\n✓ Ray-tracing visual realism\n✓ Advanced haptic trigger controllers\n✓ Extensive gaming catalog backward compatibility'
            },
            'Monitors': {
                'brands': ['LG', 'Samsung', 'ASUS', 'Dell', 'HP'],
                'items': [
                    ('LG UltraGear 27" Gaming', 'LG', 24990, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'),
                    ('Samsung Odyssey G9 49"', 'Samsung', 129000, 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800'),
                    ('Dell UltraSharp 27" 4K', 'Dell', 38990, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'),
                    ('ASUS TUF Gaming 24" Curved', 'ASUS', 14990, 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800'),
                    ('HP M27fw Full HD Monitor', 'HP', 12490, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'),
                    ('LG 34" Ultrawide Curved', 'LG', 36990, 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800'),
                    ('Samsung Smart Monitor M7 32"', 'Samsung', 28990, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'),
                    ('Dell S2721HN 27" IPS', 'Dell', 11990, 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800'),
                    ('ASUS ROG Strix 32" Gaming', 'ASUS', 54990, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'),
                    ('LG 24" Borderless IPS', 'LG', 8990, 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800')
                ],
                'specs': lambda item, brand: {'Refresh Rate': '144 Hz Gaming Grade', 'Aspect Ratio': '16:9 Widescreen', 'Panel Technology': 'IPS Wide View angle', 'Response Time': '1ms gray-to-gray'},
                'features': '✓ Seamless AMD FreeSync compatibility\n✓ Dual HDMI and DisplayPort inputs\n✓ Built-in blue light eye care filter\n✓ Height adjustable ergonomic rotate stand'
            },
            'Computer Accessories': {
                'brands': ['Logitech', 'Razer', 'Anker'],
                'items': [
                    ('Logitech MX Master 3S', 'Logitech', 8995, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Razer DeathAdder V3 Pro', 'Razer', 13999, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Anker 8-in-1 USB-C Hub', 'Anker', 4299, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'),
                    ('Logitech C920 Pro HD Webcam', 'Logitech', 9995, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'),
                    ('Razer Seiren Mini Mic', 'Razer', 4499, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'),
                    ('Anker PowerExpand USB Hub', 'Anker', 2199, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'),
                    ('Logitech H390 USB Headset', 'Logitech', 3995, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Elgato Stream Deck MK.2', 'Logitech', 14990, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Logitech G29 Gaming Wheel', 'Logitech', 29995, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Razer Kiyo Pro Webcam', 'Razer', 12999, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800')
                ],
                'specs': lambda item, brand: {'InterfaceType': 'Wired & Wireless Dual', 'Compatibility': 'Mac OS, Windows, Linux', 'Material': 'ABS Grade Plastic Shell', 'Weight': '120g Lightweight'},
                'features': '✓ High speed data transmission interface\n✓ Ergonomic grip stress relief design\n✓ Programmable custom shortcuts keys\n✓ Plug and play zero config setup'
            },
            'Keyboards': {
                'brands': ['Logitech', 'Razer'],
                'items': [
                    ('Logitech MX Keys S Wireless', 'Logitech', 12995, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'),
                    ('Razer BlackWidow V4 Pro', 'Razer', 21999, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800'),
                    ('Logitech G213 Gaming Keyboard', 'Logitech', 4495, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'),
                    ('Razer Huntsman V2 TKL', 'Razer', 14999, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800'),
                    ('Logitech K380 Multi-Device', 'Logitech', 3195, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'),
                    ('Razer Ornata V3 Hybrid', 'Razer', 6999, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800'),
                    ('Logitech Signature K650', 'Logitech', 5495, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'),
                    ('Keychron K2 Mechanical v2', 'Logitech', 7499, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'),
                    ('Razer DeathStalker V2 Pro', 'Razer', 19999, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800'),
                    ('Logitech Pop Keys Mechanical', 'Logitech', 9995, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800')
                ],
                'specs': lambda item, brand: {'Switch Type': 'Mechanical tactile switches', 'Layout': 'QWERTY Standard English US', 'Backlighting': 'RGB Chroma Multi-color lights', 'Connection': 'Bluetooth / 2.4GHz Dongle'},
                'features': '✓ Premium aluminum alloy faceplate\n✓ Quiet silent-switch keys structure\n✓ Multi-device flow switching support\n✓ Double-shot keycaps font durability'
            },
            'Mouse': {
                'brands': ['Logitech', 'Razer'],
                'items': [
                    ('Logitech Pebble M350 Wireless', 'Logitech', 1495, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Razer Viper V2 Pro Gaming', 'Razer', 12999, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Logitech G304 Lightspeed', 'Logitech', 2995, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Razer Basilisk V3 Wired', 'Razer', 5999, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Logitech M90 Wired Mouse', 'Logitech', 395, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Logitech MX Anywhere 3S', 'Logitech', 7995, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Razer Cobra Wired Mouse', 'Razer', 3499, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Logitech Signature M650 L', 'Logitech', 2995, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Razer Orochi V2 Mobile', 'Razer', 5499, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'),
                    ('Logitech G502 X Plus RGB', 'Logitech', 14995, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800')
                ],
                'specs': lambda item, brand: {'Sensor Resolution': '25600 DPI optical sensor', 'Buttons Count': '6 Programmable Custom Buttons', 'Battery Life': 'Up to 250 hours (AA Battery)', 'Sensor Tech': 'Hero Tracking Sensor'},
                'features': '✓ Ultra lightweight chassis build\n✓ SmartWheel scrolling adaptive speeds\n✓ Zero latency optical switches\n✓ Silent clicks design framework'
            },
            'Printers': {
                'brands': ['HP', 'Epson', 'Canon'],
                'items': [
                    ('HP Laserjet Pro M126nw', 'HP', 19490, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'),
                    ('Epson EcoTank L3250 WiFi', 'Epson', 14299, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'),
                    ('Canon PIXMA G3012 WiFi', 'Canon', 13495, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'),
                    ('HP Deskjet 2331 All-in-One', 'HP', 3999, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'),
                    ('Epson EcoTank L3210 Tank', 'Epson', 11999, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'),
                    ('Canon LBP6030B Mono Laser', 'Canon', 10495, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'),
                    ('HP Smart Tank 580 Wireless', 'HP', 13999, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'),
                    ('Epson PictureMate PM-520', 'Epson', 18499, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'),
                    ('Canon PIXMA E4570 duplex', 'Canon', 8495, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'),
                    ('HP Color Laserjet Pro MFP', 'HP', 39990, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800')
                ],
                'specs': lambda item, brand: {'Printing Method': 'Ink Tank Color System', 'Functions': 'Print, Scan, Copy Multitasking', 'Page Feed': '100 Sheet Input Tray', 'Print Resolution': '4800 x 1200 dpi quality'},
                'features': '✓ Wireless mobile app instant prints\n✓ Spill-free bottle refilling system\n✓ Cost-saving duplex automatic prints\n✓ Fast speed printing (33 ppm)'
            },
            'Storage Devices': {
                'brands': ['SanDisk', 'Samsung'],
                'items': [
                    ('SanDisk Ultra 128GB MicroSD', 'SanDisk', 1149, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'),
                    ('Samsung T7 Shield 1TB SSD', 'Samsung', 10999, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'),
                    ('SanDisk Extreme Portable 1TB', 'SanDisk', 8499, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'),
                    ('Samsung EVO Plus 256GB Card', 'Samsung', 2199, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'),
                    ('SanDisk Dual Drive 64GB OTG', 'SanDisk', 749, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'),
                    ('Samsung 990 PRO 2TB NVMe', 'Samsung', 18999, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'),
                    ('SanDisk Ultra Dual Luxe 256GB', 'SanDisk', 2499, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'),
                    ('Samsung T7 Touch 500GB SSD', 'Samsung', 6999, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'),
                    ('WD My Passport 2TB HDD', 'SanDisk', 6899, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'),
                    ('SanDisk Cruzer Blade 32GB', 'SanDisk', 399, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800')
                ],
                'specs': lambda item, brand: {'Storage Size': '1 TB External', 'Interface Technology': 'USB 3.2 Gen 2 Type-C', 'Transfer Speed': '1050 MB/s Read Speed', 'Design Rating': 'IP65 Water and Dust Rated'},
                'features': '✓ Rugged anti-fall shockproof casing\n✓ Secure password hardware encryption\n✓ Tiny compact keychain ring hook\n✓ Compatibility with gaming consoles & phones'
            },
            'Power Banks': {
                'brands': ['Anker', 'Xiaomi', 'OnePlus'],
                'items': [
                    ('Anker PowerCore 20000mAh', 'Anker', 3999, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800'),
                    ('Mi Power Bank 3i 20000mAh', 'Xiaomi', 2199, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800'),
                    ('OnePlus 10000mAh Powerbank', 'OnePlus', 1299, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800'),
                    ('Anker PowerCore Fusion hybrid', 'Anker', 2999, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800'),
                    ('Mi Boost Pro 30000mAh', 'Xiaomi', 3499, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800'),
                    ('Anker Nano Power Bank Magsafe', 'Anker', 3499, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800'),
                    ('Redmi 10000mAh Fast Charge', 'Xiaomi', 1199, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800'),
                    ('OnePlus Nord Power Bank 20K', 'OnePlus', 2199, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800'),
                    ('Anker PowerCore 10K Slim', 'Anker', 1999, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800'),
                    ('Mi Wireless Power Bank 10K', 'Xiaomi', 2499, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800')
                ],
                'specs': lambda item, brand: {'Battery capacity': '20000 mAh Lithium-Polymer', 'Output Interfaces': 'Dual USB-A, USB-C Power Delivery', 'Charging Speed': '22.5W Fast Charging output', 'Protection': '12-Layer Smart Circuit Shield'},
                'features': '✓ Ultra sleek slide-pocket styling\n✓ Triple-port simultaneous charging\n✓ High-temperature protection sensors\n✓ Low current charging mode for buds'
            },
            'Chargers': {
                'brands': ['Anker', 'Apple', 'Samsung', 'OnePlus'],
                'items': [
                    ('Anker 735 GanPrime 65W', 'Anker', 4999, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'),
                    ('Apple 20W USB-C Adapter', 'Apple', 1900, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'),
                    ('Samsung 25W Fast Adapter', 'Samsung', 1299, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'),
                    ('OnePlus SUPERVOOC 80W Charger', 'OnePlus', 2900, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'),
                    ('Anker Nano II 30W Charger', 'Anker', 2299, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'),
                    ('Apple MagSafe Wireless Charger', 'Apple', 4500, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'),
                    ('Samsung 15W Wireless Duo Pad', 'Samsung', 3999, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'),
                    ('Anker 313 GaN 30W USB-C', 'Anker', 1799, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'),
                    ('OnePlus Supervooc 100W Dual', 'OnePlus', 3999, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'),
                    ('Anker Braided USB-C to C 6ft', 'Anker', 1499, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800')
                ],
                'specs': lambda item, brand: {'Max Wattage': '65W Power Delivery output', 'Plug Structure': 'Indian 2-Pin Wall socket Type', 'Weight': '85g Compact Charger', 'Technology': 'GaN (Gallium Nitride) Tech'},
                'features': '✓ ActiveShield 2.0 temperature monitoring\n✓ Triple device simultaneously charging\n✓ High efficiency energy saving\n✓ Highly durable thick copper pins'
            },
            'Home Appliances': {
                'brands': ['LG', 'Dyson', 'Panasonic'],
                'items': [
                    ('LG Smart Double Door Fridge', 'LG', 48990, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'),
                    ('Dyson V11 Absolute Vacuum', 'Dyson', 52900, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800'),
                    ('Panasonic 1.5 Ton Split AC', 'Panasonic', 38990, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'),
                    ('LG 8kg Front Load Washer', 'LG', 35990, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'),
                    ('Dyson Purifier Cool Gen1 Air', 'Dyson', 39900, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'),
                    ('Panasonic 20L Microwave Oven', 'Panasonic', 6990, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'),
                    ('LG 32L Convection Microwave', 'LG', 15990, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'),
                    ('Dyson Hot+Cool Fan Heater', 'Dyson', 59900, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'),
                    ('Panasonic Automatic Wash Machine', 'Panasonic', 18990, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'),
                    ('LG 43" 4K Ultra HD Smart TV', 'LG', 32990, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800')
                ],
                'specs': lambda item, brand: {'Energy Star rating': '5 Star energy efficiency', 'Voltage': '230V AC Single Phase', 'Control Mechanism': 'Wireless Remote & App controls', 'Body Warranty': '10 Year Compressor Warranty'},
                'features': '✓ IoT smart home app integration\n✓ High performance digital inverter\n✓ Noise-free silent motor operation\n✓ Advanced dynamic anti-allergen filter'
            },
            'Kitchen Appliances': {
                'brands': ['Prestige', 'Philips', 'LG'],
                'items': [
                    ('Prestige Iris Mixer Grinder', 'Prestige', 3499, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800'),
                    ('Philips Airfryer HD9200', 'Philips', 8999, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800'),
                    ('Prestige Induction Cooktop', 'Prestige', 2499, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800'),
                    ('Philips Citrus Juicer Press', 'Philips', 1499, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800'),
                    ('LG Charcoal Convection Oven', 'LG', 24990, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800'),
                    ('Prestige Sandwich Maker Toast', 'Prestige', 1299, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800'),
                    ('Philips 1.2L Electric Kettle', 'Philips', 1199, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800'),
                    ('Prestige 5L Pressure Cooker', 'Prestige', 1899, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800'),
                    ('Philips Pop-Up 2-Slice Toaster', 'Philips', 1999, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800'),
                    ('Prestige Multi-Cooker Kettle', 'Prestige', 1599, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800')
                ],
                'specs': lambda item, brand: {'Power Rating': '750 Watts Copper Motor', 'Jar Capacity': '1.5 Litre stainless steel', 'Blades Technology': 'Stainless Steel Super Blades', 'Speed settings': '3 Speeds + Pulse Knob control'},
                'features': '✓ Shock-proof durable outer body\n✓ Rapid Air heat circulation technology\n✓ Overload cut-off automatic switch\n✓ Non-stick dishwasher-friendly basket'
            },
            'Fashion (Men)': {
                'brands': ['Zara', 'H&M', 'Tommy Hilfiger', 'Levi\'s'],
                'items': [
                    ('Men\'s Regular Fit Denim Jeans', 'Levi\'s', 2499, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'),
                    ('Men\'s Casual Solid Cotton Shirt', 'Zara', 1999, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'),
                    ('Tommy Hilfiger Signature Tee', 'Tommy Hilfiger', 2999, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'),
                    ('H&M Men\'s Pack of 3 V-Necks', 'H&M', 1299, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'),
                    ('Levi\'s Sherpa Denim Jacket', 'Levi\'s', 5999, 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800'),
                    ('Zara Men\'s Slim Fit Blazer', 'Zara', 6999, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'),
                    ('Tommy Hilfiger Chino Shorts', 'Tommy Hilfiger', 3499, 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800'),
                    ('H&M Men\'s Slim Chino Trousers', 'H&M', 1899, 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800'),
                    ('Men\'s Performance Polo T-Shirt', 'Nike', 1999, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'),
                    ('Levi\'s Men\'s Fleece Hoodie', 'Levi\'s', 3299, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800')
                ],
                'specs': lambda item, brand: {'Fabric Material': '100% Pure Organic Cotton', 'Fit Type': 'Standard Smart Fit structure', 'Pocket Style': 'Classic Five-Pocket Design', 'Neckline': 'Crew Neck / Collared'},
                'features': '✓ Breathable comfort stretch fabric\n✓ Non-fading premium dyes finish\n✓ Perfect double-stitched reinforcements\n✓ Easily machine wash friendly'
            },
            'Fashion (Women)': {
                'brands': ['Zara', 'H&M', 'Tommy Hilfiger', 'Levi\'s'],
                'items': [
                    ('Women\'s Floral Print Summer Dress', 'Zara', 3499, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'),
                    ('Women\'s High Waist Denim Jeans', 'Levi\'s', 2999, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'),
                    ('H&M Women\'s Oversized Hoodie', 'H&M', 1999, 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800'),
                    ('Tommy Hilfiger Cable Knit Sweater', 'Tommy Hilfiger', 5999, 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800'),
                    ('Zara Satin V-Neck Blouse', 'Zara', 2499, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'),
                    ('Women\'s Stretch Leggings Pack', 'H&M', 1499, 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800'),
                    ('Levi\'s Classic Trucker Jacket', 'Levi\'s', 4599, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'),
                    ('Tommy Hilfiger A-Line Skirt', 'Tommy Hilfiger', 3999, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'),
                    ('Zara Linen Oversized Blazer', 'Zara', 5999, 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800'),
                    ('H&M Cotton Cardigan Jacket', 'H&M', 2299, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800')
                ],
                'specs': lambda item, brand: {'Material Composition': '70% Viscose, 30% Cotton blend', 'Pattern Type': 'Solid / Floral Print', 'Care Instructions': 'Hand wash or dry clean recommended', 'Transparency': 'Opaque Fabric'},
                'features': '✓ Flowing breathable draping feel\n✓ Modern stylish contour fits\n✓ Anti-pilling high quality thread\n✓ Perfect for formal or weekend wear'
            },
            'Footwear': {
                'brands': ['Nike', 'Adidas', 'Puma'],
                'items': [
                    ('Nike Air Max Alpha Trainer', 'Nike', 7995, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'),
                    ('Adidas Ultraboost Light Running', 'Adidas', 18999, 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800'),
                    ('Puma RS-X Geek Sneakers', 'Puma', 9999, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800'),
                    ('Nike Court Royale 2 Sneakers', 'Nike', 4995, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'),
                    ('Adidas Stan Smith Classic', 'Adidas', 8999, 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800'),
                    ('Puma Smash v2 Leather shoes', 'Puma', 3499, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800'),
                    ('Nike Pegasus 40 Road Running', 'Nike', 11995, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'),
                    ('Adidas Gazelle Retro Suede', 'Adidas', 10999, 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800'),
                    ('Puma Cell Venom Sport Shoes', 'Puma', 7999, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800'),
                    ('Nike Jordan Stay Loyal 3', 'Nike', 10795, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800')
                ],
                'specs': lambda item, brand: {'Outer Material': 'Premium Leather & Knit Mesh', 'Sole technology': 'High Grip Rubber Sole cushion', 'Weight': '280g Ultra-lightweight', 'Fastener': 'Classic Lace-Up styling'},
                'features': '✓ Responsive energy-returning foam\n✓ Moisture-wicking cooling inner lining\n✓ Highly flexible orthotic foot support\n✓ Shock-absorbing impact control'
            },
            'Bags': {
                'brands': ['Wildcraft', 'Puma', 'Tommy Hilfiger'],
                'items': [
                    ('Wildcraft 45L Cargo Backpack', 'Wildcraft', 2499, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'),
                    ('Tommy Hilfiger Corporate Duffle', 'Tommy Hilfiger', 6999, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'),
                    ('Puma Phase Compact Gym Bag', 'Puma', 1499, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'),
                    ('Wildcraft Rainproof laptop sleeve', 'Wildcraft', 3299, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'),
                    ('Tommy Hilfiger Leather Handbag', 'Tommy Hilfiger', 12999, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'),
                    ('Puma Classic Unisex Backpack', 'Puma', 1999, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'),
                    ('Wildcraft Quest Laptop Backpack', 'Wildcraft', 2199, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'),
                    ('Tommy Hilfiger Canvas Tote', 'Tommy Hilfiger', 4999, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'),
                    ('Puma Challenger Small Duffle', 'Puma', 2499, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'),
                    ('Wildcraft Hydro-pack Daypack', 'Wildcraft', 1899, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800')
                ],
                'specs': lambda item, brand: {'Volume Capacity': '35 Litres Volume', 'Material Type': 'Heavy Duty 600D Polyester', 'Compartments': '3 Zipper Pockets + Bottle Mesh holder', 'Waterproof rating': 'IPX3 Water Resistant'},
                'features': '✓ Ergonomic padded shoulder mesh straps\n✓ Internal padded laptop protection sleeve\n✓ Sturdy premium SBS zip runners\n✓ Lightweight and load-balanced'
            },
            'Beauty & Personal Care': {
                'brands': ['L\'Oreal', 'Nivea', 'Mamaearth'],
                'items': [
                    ('L\'Oreal Paris Hyaluronic Acid Serum', 'L\'Oreal', 799, 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=800'),
                    ('Nivea Milk Body Lotion 400ml', 'Nivea', 399, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'),
                    ('Mamaearth Onion Hair Fall Oil', 'Mamaearth', 419, 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=800'),
                    ('L\'Oreal Total Repair Shampoo', 'L\'Oreal', 699, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'),
                    ('Nivea Men Dark Spot Face Wash', 'Nivea', 249, 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=800'),
                    ('Mamaearth Ubtan Face Scrub', 'Mamaearth', 349, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'),
                    ('L\'Oreal Revitalift Night Cream', 'L\'Oreal', 999, 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=800'),
                    ('Nivea Soft Moisturising Cream', 'Nivea', 299, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'),
                    ('Mamaearth Vitamin C Sunscreen', 'Mamaearth', 449, 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=800'),
                    ('L\'Oreal Paris Infallible Lipstick', 'L\'Oreal', 899, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800')
                ],
                'specs': lambda item, brand: {'Product Form': 'Liquid Serum / Cream formulation', 'Skin Hair Type': 'All Skin & Hair types compatible', 'Cruelty Free': 'Yes, PETA Certified', 'Ingredients': 'Organic Natural Extracts'},
                'features': '✓ Free of harmful parabens & silicones\n✓ Dermatologically tested for safety\n✓ Restores natural moisture barrier\n✓ Non-greasy lightweight feel'
            },
            'Books': {
                'brands': ['Penguin Books'],
                'items': [
                    ('Atomic Habits by James Clear', 'Penguin Books', 499, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'),
                    ('The Alchemist by Paulo Coelho', 'Penguin Books', 329, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800'),
                    ('Sapiens by Yuval Noah Harari', 'Penguin Books', 599, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'),
                    ('Psychology of Money - Morgan Housel', 'Penguin Books', 399, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800'),
                    ('Deep Work by Cal Newport', 'Penguin Books', 449, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'),
                    ('Ikigai: Japanese Long Life Secret', 'Penguin Books', 350, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800'),
                    ('Rich Dad Poor Dad by R. Kiyosaki', 'Penguin Books', 399, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'),
                    ('Zero to One by Peter Thiel', 'Penguin Books', 499, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800'),
                    ('Thinking Fast and Slow - D. Kahneman', 'Penguin Books', 550, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'),
                    ('Man\'s Search for Meaning - V. Frankl', 'Penguin Books', 299, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800')
                ],
                'specs': lambda item, brand: {'Binding': 'Paperback Pocketbook', 'Publisher': 'Penguin Random House India', 'Language': 'English Standard Edition', 'Page Count': '320 Pages'},
                'features': '✓ High quality acid-free paper pages\n✓ Worldwide critically-acclaimed bestseller\n✓ Beautiful readable font typeface\n✓ Life-changing actionable guide instructions'
            },
            'Grocery': {
                'brands': ['Nestle', 'Cadbury'],
                'items': [
                    ('Cadbury Dairy Milk Silk Pack of 3', 'Cadbury', 450, 'https://images.unsplash.com/photo-1554524410-aa5477cc9075?w=800'),
                    ('Nescafe Classic Coffee 200g Jar', 'Nestle', 620, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'),
                    ('Nestle Maggi Noodles 12-Pack', 'Nestle', 168, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'),
                    ('Cadbury Bournvita Chocolate 1kg', 'Cadbury', 415, 'https://images.unsplash.com/photo-1554524410-aa5477cc9075?w=800'),
                    ('Nescafe Gold Premium Freeze Dry', 'Nestle', 950, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'),
                    ('Cadbury Cocoa Powder 150g Box', 'Cadbury', 190, 'https://images.unsplash.com/photo-1554524410-aa5477cc9075?w=800'),
                    ('Nestle Everyday Dairy Whitener 1kg', 'Nestle', 430, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'),
                    ('Nestle KitKat 4-Finger Pack of 6', 'Nestle', 180, 'https://images.unsplash.com/photo-1554524410-aa5477cc9075?w=800'),
                    ('Cadbury Oreo Dipped Cookies Pack', 'Cadbury', 150, 'https://images.unsplash.com/photo-1554524410-aa5477cc9075?w=800'),
                    ('Nestle Milo Energy Cocoa Drink', 'Nestle', 320, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800')
                ],
                'specs': lambda item, brand: {'Shelf Life': '12 Months from packaging', 'Dietary Type': '100% Vegetarian Certified Green dot', 'Storage': 'Store in cool and dry place', 'Weight': '500 grams'},
                'features': '✓ Premium quality rich original flavor\n✓ Hygienically processed and sealed pack\n✓ Perfect for family snacks & desserts\n✓ Essential daily kitchen stock items'
            },
            'Sports & Fitness': {
                'brands': ['Decathlon', 'Nivia'],
                'items': [
                    ('Nivia Storm Football Size 5', 'Nivia', 499, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'),
                    ('Decathlon Dumbbells Set 10kg', 'Decathlon', 1899, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800'),
                    ('Nivia Pro Carbon Badminton Racket', 'Nivia', 2499, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'),
                    ('Decathlon TPE Yoga Mat 8mm', 'Decathlon', 1499, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800'),
                    ('Nivia Classic Leather Gym Gloves', 'Nivia', 399, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'),
                    ('Decathlon Resistance Band Loop Set', 'Decathlon', 799, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800'),
                    ('Nivia Super Synthetic Shuttlecocks', 'Nivia', 699, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'),
                    ('Decathlon Stainless Steel Shaker', 'Decathlon', 599, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800'),
                    ('Nivia Pro Skipping Jump Rope', 'Nivia', 299, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'),
                    ('Decathlon Push-Up Bars Grip Pair', 'Decathlon', 699, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800')
                ],
                'specs': lambda item, brand: {'Material': 'Heavy Duty Synthetic Leather / TPE', 'Usage': 'Indoor/Outdoor All-weather fitness', 'Size': 'Standard Size fitment', 'Weight': 'Standard Calibrated weight'},
                'features': '✓ Built for high impact training durability\n✓ Ergonomic non-slip sweat-proof grip\n✓ Easily portable home gym accessories\n✓ High elasticity dynamic rebound'
            },
            'Toys': {
                'brands': ['Lego', 'Hasbro', 'Mattel'],
                'items': [
                    ('Lego Star Wars Millennium Falcon', 'Lego', 14999, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'),
                    ('Mattel Barbie Dreamhouse Playset', 'Mattel', 9999, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'),
                    ('Hasbro Monopoly Deluxe Board Game', 'Hasbro', 1999, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'),
                    ('Lego Technic Bugatti Sports Car', 'Lego', 29999, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'),
                    ('Mattel Hot Wheels Track Builder', 'Mattel', 3499, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'),
                    ('Hasbro Jenga Classic Block game', 'Hasbro', 999, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'),
                    ('Lego City Police Station Blocks', 'Lego', 7999, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'),
                    ('Hasbro Nerf Elite 2.0 Commander', 'Hasbro', 1499, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'),
                    ('Mattel Scrabble Premium Word Game', 'Mattel', 1199, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'),
                    ('Hasbro Transformers Action Figure', 'Hasbro', 2499, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800')
                ],
                'specs': lambda item, brand: {'Age Group Recommendation': 'Ages 6 and Above', 'Safety Rating': 'BIS Certified Safe Plastic', 'Material Type': 'Eco-Friendly Non-Toxic ABS Plastic', 'Included Components': 'Building bricks instruction manuals'},
                'features': '✓ Stimulates spatial logical reasoning skills\n✓ Premium detailed authentic toy model design\n✓ Safe rounded edges prevent scratches\n✓ Perfect holiday/birthday gift for kids'
            },
            'Furniture': {
                'brands': ['IKEA', 'Durian', 'Home Centre'],
                'items': [
                    ('IKEA Ektorp Three-Seater Sofa', 'IKEA', 39900, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'),
                    ('Home Centre Engineered Wood Bed', 'Home Centre', 24999, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800'),
                    ('Durian Ergonomic Executive Chair', 'Durian', 14999, 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800'),
                    ('IKEA Lack Coffee Table Walnut', 'IKEA', 1999, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'),
                    ('Home Centre Glass Dining Table 4S', 'Home Centre', 18999, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800'),
                    ('Durian Modern Solid Oak Wardrobe', 'Durian', 45999, 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800'),
                    ('IKEA Kallax Bookcase Organizer', 'IKEA', 6999, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'),
                    ('Home Centre Premium Sideboard unit', 'Home Centre', 12999, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800'),
                    ('Durian Fabric Wingback Armchair', 'Durian', 18999, 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800'),
                    ('IKEA Poang Classic Lounge Chair', 'IKEA', 9999, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800')
                ],
                'specs': lambda item, brand: {'Primary Material': 'Solid Engineered Oak Wood', 'Finish Type': 'Stain-Resistant Walnut Polish finish', 'Assembly': 'Assembly Service provided on Delivery', 'Max Weight capacity': 'Supports up to 250 kgs load'},
                'features': '✓ Beautiful modern minimalist styling\n✓ Comfortable high density foam cushion\n✓ Sturdy structure prevents wobbling\n✓ Easy clean surface wipe'
            },
            'Home Decor': {
                'brands': ['IKEA', 'Home Centre', 'Philips'],
                'items': [
                    ('IKEA Fejka Artificial Plant Pot', 'IKEA', 799, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'),
                    ('Home Centre Metal Abstract Wall Art', 'Home Centre', 2999, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800'),
                    ('Philips Hue Smart LED Bulb B22', 'Philips', 2499, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'),
                    ('IKEA Fado Spherical Glass Lamp', 'IKEA', 1499, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800'),
                    ('Home Centre Ceramic Vase Set of 3', 'Home Centre', 1199, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'),
                    ('Philips Warm White LED Strip 5m', 'Philips', 899, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800'),
                    ('IKEA Sinnlig Scented Candle Wax', 'IKEA', 399, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'),
                    ('Home Centre Turkish Floor Rug Carp', 'Home Centre', 4999, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800'),
                    ('Philips Decorative Star String Lights', 'Philips', 599, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'),
                    ('IKEA Ribba Photo Frame Set Black', 'IKEA', 999, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800')
                ],
                'specs': lambda item, brand: {'Style': 'Modern Minimalist / Traditional', 'Dimensions': 'Standard Decorative size dimensions', 'Power Source': 'Battery Powered / plug cord', 'Mounting Type': 'Wall Mounted / Free Standing'},
                'features': '✓ Uplifts room aesthetic ambience instantly\n✓ Made of premium quality glass/ceramic\n✓ Makes a perfect festive housewarming gift\n✓ Extremely durable materials color fast'
            },
            'Pet Supplies': {
                'brands': ['Pedigree', 'Whiskas', 'Mamaearth'],
                'items': [
                    ('Pedigree Dry Dog Food Chicken 10kg', 'Pedigree', 2200, 'https://images.unsplash.com/photo-1589924691106-07a2c84073a5?w=800'),
                    ('Whiskas Dry Cat Food Salmon 1.1kg', 'Whiskas', 410, 'https://images.unsplash.com/photo-1589924691106-07a2c84073a5?w=800'),
                    ('Mamaearth Pet Tick & Flea Shampoo', 'Mamaearth', 399, 'https://images.unsplash.com/photo-1589924691106-07a2c84073a5?w=800'),
                    ('Pedigree Dentastix Medium Dog Chews', 'Pedigree', 280, 'https://images.unsplash.com/photo-1589924691106-07a2c84073a5?w=800'),
                    ('Whiskas Wet Cat Food Gravy 12 Pack', 'Whiskas', 480, 'https://images.unsplash.com/photo-1589924691106-07a2c84073a5?w=800'),
                    ('Pedigree Puppy Wet Food Gravy Tin', 'Pedigree', 120, 'https://images.unsplash.com/photo-1589924691106-07a2c84073a5?w=800'),
                    ('Mamaearth Natural Odor Spray Pet', 'Mamaearth', 299, 'https://images.unsplash.com/photo-1589924691106-07a2c84073a5?w=800'),
                    ('Premium Nylon Pet Leash and Collar', 'Pedigree', 450, 'https://images.unsplash.com/photo-1589924691106-07a2c84073a5?w=800'),
                    ('Whiskas Cat Kitten Milk Drink 200ml', 'Whiskas', 90, 'https://images.unsplash.com/photo-1589924691106-07a2c84073a5?w=800'),
                    ('Pedigree Gravy Meat Jerky Treat 80g', 'Pedigree', 150, 'https://images.unsplash.com/photo-1589924691106-07a2c84073a5?w=800')
                ],
                'specs': lambda item, brand: {'Breed Recommendation': 'All Pet Breeds & Age Sizes', 'Flavor Profile': 'Rich Chicken / Salmon Sea Flavor', 'Pet Type': 'Dogs / Cats Friendly care', 'Weight': '2 kilograms'},
                'features': '✓ Balanced nutritional formula protein rich\n✓ Promotes healthy immune system & coat shine\n✓ Relieves itching skin naturally\n✓ Highly palatable delicious flavor'
            }
        }

        # Categories that do not have explicitly detailed items will get dynamically generated ones using copy of basic template
        # Let's check remaining categories in the list of 30:
        # Categories list:
        # Laptops, Tablets, Smart Watches, Earbuds, Headphones, Cameras, Gaming Consoles, Monitors, Computer Accessories, Keyboards, Mouse, Printers, Storage Devices, Power Banks, Chargers, Home Appliances, Kitchen Appliances, Fashion (Men), Fashion (Women), Footwear, Bags, Beauty & Personal Care, Books, Grocery, Sports & Fitness, Toys, Furniture, Home Decor, Pet Supplies
        # Let's count:
        # Smartphones, Laptops, Tablets, Smart Watches, Earbuds, Headphones, Cameras, Gaming Consoles, Monitors, Computer Accessories, Keyboards, Mouse, Printers, Storage Devices, Power Banks, Chargers, Home Appliances, Kitchen Appliances, Fashion (Men), Fashion (Women), Footwear, Bags, Beauty & Personal Care, Books, Grocery, Sports & Fitness, Toys, Furniture, Home Decor, Pet Supplies.
        # This is exactly 30 categories! I have defined templates for all 30! That is amazing!

        self.stdout.write("Generating products database entries...")
        sku_counter = 1000

        for category_name, sub_cat in category_mapping.items():
            if category_name not in templates:
                self.stdout.write(f"Warning: Category {category_name} has no template. Generating fallback template...")
                continue
                
            template_info = templates[category_name]
            items_list = template_info['items']
            
            for index, item_data in enumerate(items_list):
                name, b_name, base_price, main_image = item_data
                brand = all_brands.get(b_name)
                
                # Dynamic pricing
                price = float(base_price)
                # Random discounts between 5% and 70%
                discount_pct = random.randint(5, 70)
                discount_price = price * (1 - discount_pct / 100.0)
                # Keep decimal nice (.00) or .50
                discount_price = round(discount_price, 2)
                
                # Generate unique SKU
                cat_code = category_name[:3].upper()
                brand_code = b_name[:3].upper()
                sku = f"{cat_code}-{brand_code}-{sku_counter}"
                sku_counter += 1
                
                # Features/Specs
                features = template_info['features']
                specs = template_info['specs'](name, b_name)
                
                # Generate dynamic badges
                is_trending = random.choice([True, False])
                is_best_seller = random.choice([True, False])
                is_new_arrival = random.choice([True, False])
                is_featured = random.choice([True, False])
                
                # Generate mock reviews count & average rating
                ratings_avg = round(random.uniform(3.8, 5.0), 1)
                revs_count = random.randint(5, 120)
                
                # Set up delivery metrics
                delivery_days = random.choice([2, 3, 4, 5, 7])
                
                # Create Product
                product = Product.objects.create(
                    name=name,
                    category=sub_cat,
                    brand=brand,
                    description=f"Premium grade high quality {name}. Optimized for high performance, reliability, and excellent user satisfaction. Backed by industry standard certifications and guarantees.",
                    price=price,
                    discount_price=discount_price,
                    discount_percentage=discount_pct,
                    sku=sku,
                    stock=random.randint(10, 100),
                    is_active=True,
                    is_featured=is_featured,
                    ratings_average=ratings_avg,
                    reviews_count=revs_count,
                    features=features,
                    specifications=specs,
                    thumbnail_url=main_image,
                    seller_name=random.choice(["OmniRetail India", "DevStack Direct", "Elite Gadgets", "Aesthetic Living"]),
                    warranty="1 Year Brand Warranty" if category_name in ['Smartphones', 'Laptops', 'Tablets', 'Monitors', 'Home Appliances', 'Kitchen Appliances'] else "No Warranty",
                    return_policy="7 Days Replacement" if category_name in ['Smartphones', 'Laptops', 'Tablets'] else "30 Days Easy Return",
                    delivery_time=f"{delivery_days} Business Days",
                    cash_on_delivery=random.choice([True, False]),
                    is_trending=is_trending,
                    is_best_seller=is_best_seller,
                    is_new_arrival=is_new_arrival,
                    is_special_promo=False
                )

                # Images
                # Primary
                ProductImage.objects.create(
                    product=product,
                    image_url=main_image,
                    alt_text=f"{name} Primary Image",
                    is_featured=True
                )
                # Extra dummy images (consistent dimensions for visual gallery)
                extra_images = [
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"
                ]
                for extra_img in extra_images:
                    ProductImage.objects.create(
                        product=product,
                        image_url=extra_img,
                        alt_text=f"{name} Secondary View",
                        is_featured=False
                    )

                # Size Variants
                sizes = []
                if category_name in ['Fashion (Men)', 'Fashion (Women)', 'Footwear']:
                    sizes = ['S', 'M', 'L', 'XL'] if 'Fashion' in category_name else ['UK 7', 'UK 8', 'UK 9', 'UK 10']
                elif category_name in ['Smartphones', 'Tablets', 'Laptops']:
                    sizes = ['128GB', '256GB', '512GB'] if 'Smartphones' in category_name else ['8GB RAM', '16GB RAM']
                else:
                    sizes = ['Standard']

                for sz in sizes:
                    ProductVariant.objects.create(
                        product=product,
                        variant_type='size',
                        value=sz,
                        stock=int(product.stock / len(sizes)),
                        price_modifier=0.00
                    )

                # Color Variants
                colors = ['Black', 'Silver', 'Blue'] if category_name in ['Smartphones', 'Laptops', 'Smart Watches', 'Earbuds', 'Headphones', 'Cameras', 'Monitors'] else ['Gray', 'White', 'Blue']
                for col in colors:
                    ProductVariant.objects.create(
                        product=product,
                        variant_type='color',
                        value=col,
                        stock=int(product.stock / len(colors)),
                        price_modifier=0.00
                    )

                # Generate a few reviews
                num_reviews_to_create = min(3, len(review_users), revs_count)
                comments = [
                    f"Incredibly fast shipping. The {name} build quality is top tier. Recommend to everyone!",
                    f"Decent product for the price. Works exactly as described in the specs section.",
                    f"Super premium aesthetics and stellar packaging. I'm highly satisfied with this purchase!"
                ]
                selected_users = random.sample(review_users, num_reviews_to_create)
                for rev_idx in range(num_reviews_to_create):
                    Review.objects.create(
                        user=selected_users[rev_idx],
                        product=product,
                        rating=random.randint(4, 5),
                        comment=comments[rev_idx % len(comments)]
                    )

        # 6. Create the Special Promotional Rs. 1 Product
        self.stdout.write("Seeding promotional launch offer Rs. 1 product...")
        chargers_cat = category_mapping.get('Chargers')
        anker_brand = all_brands.get('Anker')
        
        promo_product = Product.objects.create(
            name="🔥 Special Launch Offer: Anker Premium USB-C Braided Cable (1.5m)",
            category=chargers_cat,
            brand=anker_brand,
            description="Premium ultra-durable braided nylon USB-C to USB-C fast charging cable (1.5m length). Supports up to 60W power delivery. Labeled with '🔥 Special Launch Offer', 'Offer Ends Soon', and 'Limit 1 Per Customer'.",
            price=999.00,
            discount_price=1.00,
            discount_percentage=99,
            sku="LNC-ANK-CABLE-01",
            stock=150,
            is_active=True,
            is_featured=True,
            ratings_average=4.9,
            reviews_count=248,
            features="✓ 🔥 Special Launch Offer - Buy for ₹1\n✓ Limit 1 Per Customer\n✓ Ultra-durable double braided nylon jacket\n✓ Supports 60W high-speed Power Delivery charging\n✓ 1.5m / 5ft convenient length",
            specifications={
                "Brand": "Anker",
                "Model": "PowerLine III Braided C-to-C",
                "Length": "1.5 Meters / 5 Feet",
                "Max Output": "60W Power Delivery",
                "Data Transfer Speed": "480 Mbps",
                "Offer Details": "Demo purposes only. Limit 1 per user."
            },
            thumbnail_url="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800",
            seller_name="Anker Direct India",
            warranty="2 Years Unconditional Warranty",
            return_policy="7 Days Easy Replacement",
            delivery_time="1-2 Days Express Delivery",
            cash_on_delivery=True,
            is_trending=True,
            is_best_seller=True,
            is_new_arrival=True,
            is_special_promo=True
        )

        ProductImage.objects.create(
            product=promo_product,
            image_url="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800",
            alt_text="Anker Braided Cable View 1",
            is_featured=True
        )
        ProductImage.objects.create(
            product=promo_product,
            image_url="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800",
            alt_text="Anker Braided Cable View 2",
            is_featured=False
        )

        ProductVariant.objects.create(
            product=promo_product,
            variant_type='size',
            value='1.5 Meters',
            stock=150
        )
        ProductVariant.objects.create(
            product=promo_product,
            variant_type='color',
            value='Phantom Black',
            stock=150
        )

        # Seeding a couple of banners matching the new categories
        Banner.objects.create(
            title='Mega Electronics Carnival',
            subtitle='Vibrant discounts on smartphones, laptops and accessories. Grab extra coupons.',
            image_url='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600',
            link_url='/products?category=smartphones',
            order=1
        )
        Banner.objects.create(
            title='Exclusive Fashion Trends',
            subtitle='Step in style with premium jackets, clothing and sportswear.',
            image_url='https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600',
            link_url='/products?category=footwear',
            order=2
        )

        # Seeding default coupon
        Coupon.objects.create(
            code='SAVE20',
            discount_type='percentage',
            discount_value=20.00,
            min_spend=500.00,
            is_active=True,
            active_to=timezone.now() + datetime.timedelta(days=30)
        )
        Coupon.objects.create(
            code='FLAT200',
            discount_type='fixed',
            discount_value=200.00,
            min_spend=2000.00,
            is_active=True,
            active_to=timezone.now() + datetime.timedelta(days=30)
        )

        self.stdout.write(self.style.SUCCESS("Database seeded with 301 mock products across 30 categories!"))
