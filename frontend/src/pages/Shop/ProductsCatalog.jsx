import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, Star, Percent, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/Product/ProductCard';

// Pulsing skeleton loader card for modern UX
const SkeletonCard = () => (
  <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', minHeight: '380px', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
    <div style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--border)', animation: 'pulse 1.5s infinite ease-in-out' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, marginTop: '8px' }}>
      <div style={{ width: '30%', height: '12px', borderRadius: '4px', backgroundColor: 'var(--border)', animation: 'pulse 1.5s infinite ease-in-out' }} />
      <div style={{ width: '85%', height: '18px', borderRadius: '4px', backgroundColor: 'var(--border)', animation: 'pulse 1.5s infinite ease-in-out', marginTop: '4px' }} />
      <div style={{ width: '50%', height: '18px', borderRadius: '4px', backgroundColor: 'var(--border)', animation: 'pulse 1.5s infinite ease-in-out', marginTop: '6px' }} />
    </div>
    <div style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--border)', animation: 'pulse 1.5s infinite ease-in-out', marginTop: '12px' }} />
  </div>
);

const ProductsCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [ratingMin, setRatingMin] = useState(searchParams.get('rating_min') || '');
  const [discountMin, setDiscountMin] = useState(searchParams.get('discount_min') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // Fetch filter metadata (categories, brands)
  const fetchFilterData = async () => {
    try {
      const catRes = await api.get('products/categories/');
      // Flat categories out of hierarchy if needed
      setCategories(catRes.data.results || catRes.data || []);
      
      const brandRes = await api.get('products/brands/');
      setBrands(brandRes.data.results || brandRes.data || []);
    } catch (err) {
      console.error('Error fetching filter lists:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      const search = searchParams.get('search');
      const cat = searchParams.get('category');
      const brand = searchParams.get('brand');
      const min_p = searchParams.get('min_price');
      const max_p = searchParams.get('max_price');
      const rat_min = searchParams.get('rating_min');
      const disc_min = searchParams.get('discount_min');
      const in_st = searchParams.get('in_stock');
      const sort = searchParams.get('sort');
      const discount = searchParams.get('discount');
      const featured = searchParams.get('featured');
      const trending = searchParams.get('trending');
      const best_seller = searchParams.get('best_seller');
      const new_arrival = searchParams.get('new_arrival');

      if (search) params.search = search;
      if (cat) params.category = cat;
      if (brand) params.brand = brand;
      if (min_p) params.min_price = min_p;
      if (max_p) params.max_price = max_p;
      if (rat_min) params.rating_min = rat_min;
      if (disc_min) params.discount_min = disc_min;
      if (in_st) params.in_stock = in_st;
      if (sort) params.sort = sort;
      if (discount) params.discount = discount;
      if (featured) params.featured = featured;
      if (trending) params.trending = trending;
      if (best_seller) params.best_seller = best_seller;
      if (new_arrival) params.new_arrival = new_arrival;

      const response = await api.get('products/products/', { params });
      setProducts(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching catalog products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchProducts();
    // Synchronize UI filter states when query parameters change
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCat(searchParams.get('category') || '');
    setSelectedBrand(searchParams.get('brand') || '');
    setMinPrice(searchParams.get('min_price') || '');
    setMaxPrice(searchParams.get('max_price') || '');
    setRatingMin(searchParams.get('rating_min') || '');
    setDiscountMin(searchParams.get('discount_min') || '');
    setInStockOnly(searchParams.get('in_stock') === 'true');
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    const newParams = {};
    if (searchTerm.trim()) newParams.search = searchTerm.trim();
    if (selectedCat) newParams.category = selectedCat;
    if (selectedBrand) newParams.brand = selectedBrand;
    if (minPrice) newParams.min_price = minPrice;
    if (maxPrice) newParams.max_price = maxPrice;
    if (ratingMin) newParams.rating_min = ratingMin;
    if (discountMin) newParams.discount_min = discountMin;
    if (inStockOnly) newParams.in_stock = 'true';
    if (sortBy) newParams.sort = sortBy;

    // Retain special badge parameters if active
    if (searchParams.get('discount')) newParams.discount = 'true';
    if (searchParams.get('featured')) newParams.featured = 'true';
    if (searchParams.get('trending')) newParams.trending = 'true';
    if (searchParams.get('best_seller')) newParams.best_seller = 'true';
    if (searchParams.get('new_arrival')) newParams.new_arrival = 'true';

    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCat('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setRatingMin('');
    setDiscountMin('');
    setInStockOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="catalog-page section" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '80vh' }}>
      
      {/* Dynamic Keyframe Injection for Pulsing Animation Skeletons */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}} />

      <div className="container" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Sidebar Filters */}
        <aside className="glass-card" style={{
          flex: '1 1 280px',
          maxWidth: '320px',
          height: 'fit-content',
          padding: '24px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
            <SlidersHorizontal size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Filters</h3>
          </div>

          <form onSubmit={handleApplyFilters} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Search Input */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Search Name or Brand</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                  style={{ paddingRight: '40px' }}
                />
                <Search size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Category Filter */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Categories</label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="form-control"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Brands</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="form-control"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.slug}>{brand.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Price Range (₹)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="form-control"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Minimum Rating</label>
              <select
                value={ratingMin}
                onChange={(e) => setRatingMin(e.target.value)}
                className="form-control"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5 Stars & Above</option>
                <option value="4.0">4.0 Stars & Above</option>
                <option value="3.5">3.5 Stars & Above</option>
                <option value="3.0">3.0 Stars & Above</option>
              </select>
            </div>

            {/* Discount Filter */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Min Discount Percentage</label>
              <select
                value={discountMin}
                onChange={(e) => setDiscountMin(e.target.value)}
                className="form-control"
              >
                <option value="">Any Discount</option>
                <option value="10">10% Off & Above</option>
                <option value="20">20% Off & Above</option>
                <option value="30">30% Off & Above</option>
                <option value="50">50% Off & Above</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="instock-chk"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="instock-chk" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', selectNone: 'none' }}>
                Only Show In-Stock Items
              </label>
            </div>

            {/* Apply & Clear buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Apply Filters</button>
              <button type="button" onClick={handleClearFilters} className="btn btn-secondary" style={{ width: '100%' }}>Clear All</button>
            </div>
          </form>
        </aside>

        {/* Catalog Main Panel */}
        <div style={{ flex: '3 1 600px' }}>
          
          {/* Header sorting row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '30px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border)'
          }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Catalog Collection</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{products.length} Products Found</span>
            </div>
            
            {/* Sorting dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ArrowUpDown size={16} style={{ color: 'var(--primary)' }} />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  const currentParams = Object.fromEntries(searchParams.entries());
                  setSearchParams({ ...currentParams, sort: e.target.value });
                }}
                className="form-control"
                style={{ width: '200px', padding: '10px' }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="best_selling">Best Selling</option>
                <option value="highest_rated">Highest Rated</option>
                <option value="most_popular">Most Popular</option>
                <option value="biggest_discount">Biggest Discount</option>
              </select>
            </div>
          </div>

          {/* Catalog grid */}
          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '24px'
            }}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '24px'
            }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '80px 24px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              maxWidth: '600px',
              margin: '40px auto'
            }}>
              <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No Products Found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try refining your search terms or clearing current filter variables.</p>
              <button onClick={handleClearFilters} className="btn btn-primary" style={{ marginTop: '20px' }}>Reset Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsCatalog;
