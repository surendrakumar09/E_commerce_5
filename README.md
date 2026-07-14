# Premium Full-Stack E-Commerce Application

A complete, production-ready Full-Stack E-Commerce Web Application built with **React** (Vite build system) on the frontend, **Django & Django REST Framework** on the backend, and **MySQL** as the primary database (with a seamless automatic SQLite local file fallback for instant zero-config evaluation).

---

## 📂 Project Structure

```
E_commerce_4/
├── backend/
│   ├── config/             # Django root settings, routing URLs
│   ├── accounts/           # Profile, Address models, custom authentication
│   ├── products/           # Categories, Brands, Products, Variants, Banners, Contact logs
│   ├── cart/               # Cart, CartItem, Wishlist managers
│   ├── orders/             # Order placement, items details, status trackers
│   ├── coupons/            # Coupons validations
│   ├── reviews/            # Product ratings & comments aggregates
│   ├── payments/           # Mock Stripe & Razorpay gateway structures
│   ├── api/                # Unified API V1 router
│   ├── manage.py           # Administrative tasks launcher
│   ├── requirements.txt    # Python packages requirements
│   └── .env                # Backend environment settings
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/     # Navbar, Footer, Toast alerts, Star rating
│   │   │   └── Product/    # ProductCard, etc.
│   │   ├── pages/
│   │   │   ├── Shop/       # Home, Catalog, ProductDetails, Cart, Wishlist, Checkout, Success
│   │   │   ├── Auth/       # Login, Register, ForgotPassword
│   │   │   ├── Company/    # About, Contact
│   │   │   └── Admin/      # Dashboard overview, Manage Products/Categories/Orders
│   │   ├── layouts/        # MainLayout frame, AdminLayout sidebar frames
│   │   ├── context/        # Theme, Toast, Auth, and Cart state providers
│   │   ├── services/       # Axios API client setup
│   │   ├── styles/         # Variables, global, and component styling CSS
│   │   ├── routes/         # Protected and admin routing paths
│   │   ├── App.jsx         # App root wrapper
│   │   └── main.jsx        # Mounting entry point
│   ├── index.html          # HTML entry
│   ├── package.json        # Dependencies list
│   └── vite.config.js      # Vite options
│
└── README.md               # Documentation
```

---

## 🛠️ Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **MySQL Server** (Optional, database setup falls back automatically to a local SQLite `db.sqlite3` file if MySQL is offline or not installed, enabling immediate local development with zero configurations).

---

### 1. Django Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```

4. Install python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Setup environment variables:
   A pre-configured `.env` is already created with standard defaults:
   ```env
   DEBUG=True
   DATABASE_URL=mysql://root:admin123@localhost:3306/ecommerce_db
   CORS_ALLOW_ALL_ORIGINS=True
   ```
   *Note: If your local MySQL root user has a different password, change the password in the DATABASE_URL. If MySQL is offline, the backend will auto-fallback to SQLite.*

6. Initialize database schema migrations:
   ```bash
   python manage.py makemigrations accounts products cart orders coupons reviews payments
   ```

7. Run database migrations:
   ```bash
   python manage.py migrate
   ```

8. Seed initial products, categories, variants, and admin login accounts:
   ```bash
   python manage.py seed_ecommerce_data
   ```
   This command creates:
   - Superuser/Admin login: **`admin`** / password **`admin123`**
   - Customer login: **`customer`** / password **`customer123`**
   - 3 Parent categories (Electronics, Fashion, Home & Living) and child subcategories.
   - Mock products with high quality Unsplash photos, color and size variants.
   - Active coupons: **`SAVE20`** (20% off above $50) and **`FLAT50`** (flat $50 off above $200).
   - Mock home slider banners.

9. Start the Django API dev server:
   ```bash
   python manage.py runserver
   ```
   The backend API is live at `http://127.0.0.1:8000/`.

---

### 2. React Frontend Setup

1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install npm packages:
   ```bash
   npm install
   ```

3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```
   The React web app is live at `http://localhost:5173/`.

---

## 📡 REST API Reference

All backend endpoints are scoped under `/api/v1/`:

| Endpoint | Method | Authentication | Description |
|---|---|---|---|
| `auth/token/` | `POST` | None | Fetch JWT Access & Refresh tokens (login) |
| `auth/token/refresh/` | `POST` | None | Refresh JWT Access token |
| `accounts/register/` | `POST` | None | Create new customer account |
| `accounts/user/` | `GET` | Bearer Token | Fetch authenticated user information |
| `accounts/profile/` | `GET`, `PUT` | Bearer Token | Fetch/Update phone, avatar, bio |
| `accounts/addresses/` | `GET`, `POST`, `DELETE` | Bearer Token | Manage user shipping addresses |
| `products/products/` | `GET` | None | Filter, search, and sort products |
| `products/products/<id>/` | `GET` | None | Fetch individual product specifications |
| `products/categories/` | `GET` | None | Fetch categories list hierarchy |
| `cart/items/` | `GET` | None (Guest/Auth) | Fetch items in cart (merges guest cart upon login) |
| `cart/items/add/` | `POST` | None (Guest/Auth) | Add product & selected variant to cart |
| `cart/items/update-quantity/` | `POST` | None (Guest/Auth) | Modify item quantity in cart |
| `cart/items/remove/` | `POST` | None (Guest/Auth) | Delete item from cart |
| `cart/wishlist/` | `GET`, `POST`, `DELETE` | Bearer Token | Manage user wishlist |
| `coupons/validate/` | `POST` | None | Validate coupon code & deduct subtotal discounts |
| `orders/` | `GET`, `POST` | Bearer Token | List history/place checkout orders |
| `dashboard/stats/` | `GET` | Admin Token | Fetch monthly sales analytics & category metrics |

---

## 🛡️ Admin Portal Details
To access the Django Admin Portal:
`http://localhost:8000/admin/`
- Username: `admin`
- Password: `admin123`
