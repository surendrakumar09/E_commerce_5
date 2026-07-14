import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, ShieldCheck, Truck, RotateCcw, HelpCircle, Star, Sparkles, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/Product/ProductCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Section Products States
  const [promoProduct, setPromoProduct] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [todaysDeals, setTodaysDeals] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [recommended, setRecommended] = useState([]);
  
  // Categorized States
  const [electronics, setElectronics] = useState([]);
  const [fashion, setFashion] = useState([]);
  const [homeEssentials, setHomeEssentials] = useState([]);
  
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchHomeData = async () => {
    try {
      // 1. Banners & categories
      const bannerRes = await api.get('products/banners/');
      setBanners(bannerRes.data.results || bannerRes.data || []);
      
      const catRes = await api.get('products/categories/');
      setCategories(catRes.data.results || catRes.data || []);
      
      // 2. Promotional product (special_promo=true)
      const promoRes = await api.get('products/products/', { params: { special_promo: 'true' } });
      const promoData = promoRes.data.results || promoRes.data || [];
      if (promoData.length > 0) {
        setPromoProduct(promoData[0]);
      }
      
      // 3. Section Products
      const trendingRes = await api.get('products/products/', { params: { trending: 'true' } });
      setTrendingProducts((trendingRes.data.results || trendingRes.data || []).slice(0, 4));

      const dealsRes = await api.get('products/products/', { params: { discount: 'true', sort: 'biggest_discount' } });
      setTodaysDeals((dealsRes.data.results || dealsRes.data || []).slice(0, 4));

      const newRes = await api.get('products/products/', { params: { new_arrival: 'true' } });
      setNewArrivals((newRes.data.results || newRes.data || []).slice(0, 4));

      const ratedRes = await api.get('products/products/', { params: { sort: 'rating' } });
      setTopRated((ratedRes.data.results || ratedRes.data || []).slice(0, 4));

      const bestRes = await api.get('products/products/', { params: { best_seller: 'true' } });
      setBestSellers((bestRes.data.results || bestRes.data || []).slice(0, 4));

      const recommendedRes = await api.get('products/products/', { params: { featured: 'true' } });
      setRecommended((recommendedRes.data.results || recommendedRes.data || []).slice(0, 4));

      // 4. Categorized Sections
      const elecRes = await api.get('products/products/', { params: { category: 'electronics-gadgets' } });
      setElectronics((elecRes.data.results || elecRes.data || []).slice(0, 4));

      const fashRes = await api.get('products/products/', { params: { category: 'fashion-apparel' } });
      setFashion((fashRes.data.results || fashRes.data || []).slice(0, 4));

      const homeRes = await api.get('products/products/', { params: { category: 'home-kitchen-appliances' } });
      setHomeEssentials((homeRes.data.results || homeRes.data || []).slice(0, 4));

    } catch (error) {
      console.error('Error fetching homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Banner slider automatic cycle
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="homepage-wrapper">
      
      {/* 1. Hero Slider Banner */}
      {banners.length > 0 && (
        <section className="hero-slider" style={{
          position: 'relative',
          height: '560px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-secondary)',
          marginTop: '-16px'
        }}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="hero-slide"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.65)), url(${banner.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                opacity: index === activeSlide ? 1 : 0,
                visibility: index === activeSlide ? 'visible' : 'hidden',
                transition: 'opacity 0.8s ease-in-out, visibility 0.8s ease-in-out',
                color: '#ffffff'
              }}
            >
              <div className="container" style={{ zIndex: 5, animation: 'fadeInUp 0.8s ease forwards' }}>
                <div style={{ maxWidth: '600px' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: 'var(--secondary)',
                    backgroundColor: 'var(--secondary-light)',
                    padding: '6px 14px',
                    borderRadius: '100px',
                    display: 'inline-block',
                    marginBottom: '16px'
                  }}>New Season Alert</span>
                  <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px', color: '#ffffff' }}>{banner.title}</h1>
                  <p style={{ fontSize: '1.2rem', marginBottom: '32px', color: '#e2e8f0', lineHeight: 1.5 }}>{banner.subtitle}</p>
                  <Link to={banner.link_url || '/products'} className="btn btn-primary" style={{ display: 'inline-flex', gap: '8px', padding: '14px 32px' }}>
                    <span>Shop Now</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Slider dots */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            zIndex: 10
          }}>
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                style={{
                  width: index === activeSlide ? '32px' : '12px',
                  height: '12px',
                  borderRadius: '100px',
                  border: 'none',
                  backgroundColor: index === activeSlide ? 'var(--primary)' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Core Brand Trust Badges */}
      <section className="section" style={{ padding: '60px 0', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Free Shipping</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>On all orders above ₹500</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--secondary-light)', padding: '12px', borderRadius: '50%', color: 'var(--secondary)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Secure Payments</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SSL encrypted gateway structure</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>30 Days Return</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Easy and hassle-free returns</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--secondary-light)', padding: '12px', borderRadius: '50%', color: 'var(--secondary)' }}>
              <HelpCircle size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>24/7 Support</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Outstanding customer support</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 🔥 SPECIAL LAUNCH OFFER Rs.1 PRODUCT BANNER */}
      {promoProduct && (
        <section className="section" style={{ padding: '60px 0', backgroundColor: 'rgba(251, 191, 36, 0.05)', borderBottom: '1px solid rgba(251, 191, 36, 0.2)' }}>
          <div className="container">
            <div className="glass-card" style={{ 
              display: 'flex', 
              gap: '40px', 
              flexWrap: 'wrap', 
              padding: '30px', 
              border: '2px solid rgba(245, 158, 11, 0.5)', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--bg-secondary)',
              alignItems: 'center'
            }}>
              <div style={{ flex: '1 1 250px', maxWidth: '300px', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                <img src={promoProduct.thumbnail_url || promoProduct.images?.[0]?.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: '2 1 450px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: '#d97706', padding: '6px 14px', borderRadius: '100px' }}>
                    🔥 SPECIAL LAUNCH OFFER
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Offer Ends Soon
                  </span>
                </div>
                
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {promoProduct.name}
                </h2>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  {promoProduct.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', margin: '8px 0' }}>
                  <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#d97706', lineHeight: '1' }}>₹1</span>
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>Original Price: ₹999</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--error)' }}>(99% OFF)</span>
                </div>
                
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  ⚠️ Limit 1 Per Customer | This product is only for demonstration purposes.
                </span>

                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                  <Link to={`/products/${promoProduct.slug}`} className="btn btn-primary" style={{ backgroundColor: '#d97706', borderColor: '#d97706', padding: '12px 28px' }}>
                    View Launch Deal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. TODAY'S DEALS */}
      {todaysDeals.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                  <Flame size={16} fill="var(--error)" />
                  <span>FLASH DEALS - TODAY ONLY</span>
                </span>
                <h2 className="section-title" style={{ margin: 0 }}>Today's Deals</h2>
              </div>
              <Link to="/products?discount=true" className="btn btn-secondary" style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                <span>See All Deals</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {todaysDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. TRENDING PRODUCTS */}
      {trendingProducts.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                  <Sparkles size={16} fill="#8b5cf6" style={{ color: '#8b5cf6' }} />
                  <span>MOST VIEWED THIS WEEK</span>
                </span>
                <h2 className="section-title" style={{ margin: 0 }}>Trending Products</h2>
              </div>
              <Link to="/products?trending=true" className="btn btn-secondary" style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                <span>See All Trending</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                  <ShoppingBag size={16} style={{ color: '#3b82f6' }} />
                  <span>JUST IN STOCK</span>
                </span>
                <h2 className="section-title" style={{ margin: 0 }}>New Arrivals</h2>
              </div>
              <Link to="/products?new_arrival=true" className="btn btn-secondary" style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                <span>View All New</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. TOP RATED */}
      {topRated.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                  <Star size={16} fill="var(--warning)" style={{ color: 'var(--warning)' }} />
                  <span>5-STAR FAVORITES</span>
                </span>
                <h2 className="section-title" style={{ margin: 0 }}>Top Rated</h2>
              </div>
              <Link to="/products?sort=highest_rated" className="btn btn-secondary" style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                <span>See All Rated</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {topRated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                  <CheckCircle size={16} style={{ color: '#10b981' }} />
                  <span>OUR TOP PERFORMERS</span>
                </span>
                <h2 className="section-title" style={{ margin: 0 }}>Best Sellers</h2>
              </div>
              <Link to="/products?best_seller=true" className="btn btn-secondary" style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                <span>See All Best Sellers</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. RECOMMENDED FOR YOU */}
      {recommended.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                  <Sparkles size={16} fill="var(--primary)" />
                  <span>TAILORED COLLECTION</span>
                </span>
                <h2 className="section-title" style={{ margin: 0 }}>Recommended For You</h2>
              </div>
              <Link to="/products?featured=true" className="btn btn-secondary" style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                <span>See All Recommendations</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {recommended.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. SHOWCASE CATEGORIES: ELECTRONICS */}
      {electronics.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>Electronics & Gadgets Showcase</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>High performance laptops, smartphones, and audio gears.</p>
              </div>
              <Link to="/products?category=smartphones" className="btn btn-secondary" style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                <span>Browse Electronics</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {electronics.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. SHOWCASE CATEGORIES: FASHION */}
      {fashion.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>Fashion & Styles</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Elite running shoes, denim apparel and designer activewear.</p>
              </div>
              <Link to="/products?category=footwear" className="btn btn-secondary" style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                <span>Browse Fashion</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {fashion.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 12. SHOWCASE CATEGORIES: HOME ESSENTIALS */}
      {homeEssentials.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>Home Essentials</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>High utility appliances and accessories for the perfect kitchen.</p>
              </div>
              <Link to="/products?category=kitchen-appliances" className="btn btn-secondary" style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                <span>Browse Home Essentials</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {homeEssentials.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 13. Customer Testimonials */}
      <section className="section" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Real experiences shared by our valued patrons worldwide.</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px'
          }}>
            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />)}
              </div>
              <p style={{ fontStyle: 'italic', fontSize: '0.95rem' }}>
                "The premium customer service was absolute class. I had a small question about mobile variations, and they resolved it in under 5 minutes. The iPhone arrived fully verified and looks breathtaking!"
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>SM</div>
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Sarah Miller</h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Customer</span>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />)}
              </div>
              <p style={{ fontStyle: 'italic', fontSize: '0.95rem' }}>
                "Incredible performance from the Sony headphones. Buying was extremely simple and guest cart syncing worked perfectly. I will absolutely buy all my workspace electronics from this portal going forward."
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--secondary)' }}>JD</div>
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 600 }}>John Doe</h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Buyer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
