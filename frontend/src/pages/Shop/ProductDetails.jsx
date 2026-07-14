import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Shield, RefreshCw, Send, Check, Star, CheckCircle, HelpCircle } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Rating from '../../components/Common/Rating';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ProductCard from '../../components/Product/ProductCard';

const ProductDetails = () => {
  const { slug } = useParams();
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [bundleProducts, setBundleProducts] = useState([]);
  const [bundleChecked, setBundleChecked] = useState([true, true, true]); // [main, sub1, sub2]
  const [reviews, setReviews] = useState([]);
  const [selectedImg, setSelectedImg] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Selected variants
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Zoom on hover state
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center', transform: 'scale(1)' });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.8)' });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'center', transform: 'scale(1)' });
  };

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get('products/products/', { params: { slug } });
      const productData = response.data[0] || response.data.results?.[0];
      
      if (productData) {
        setProduct(productData);
        setSelectedImg(productData.images?.[0]?.image_url || productData.thumbnail_url || '');
        
        // Auto select first variant options
        const sizeVar = productData.variants?.find(v => v.variant_type === 'size');
        const colorVar = productData.variants?.find(v => v.variant_type === 'color');
        if (sizeVar) setSelectedSize(sizeVar);
        if (colorVar) setSelectedColor(colorVar);

        // Fetch related products
        const relatedRes = await api.get('products/products/', { params: { category: productData.category_slug } });
        const filtered = (relatedRes.data.results || relatedRes.data || []).filter(p => p.id !== productData.id);
        setRelatedProducts(filtered.slice(0, 4));
        setBundleProducts(filtered.slice(0, 2)); // Select first 2 related products for bundle

        // Fetch reviews
        const reviewRes = await api.get('reviews/', { params: { product_id: productData.id } });
        setReviews(reviewRes.data.results || reviewRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching product detail info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    const res = await addToCart(product.id, quantity, selectedSize?.id, selectedColor?.id);
    if (res.success) {
      addToast(`Added ${quantity} x "${product.name}" to your cart.`, 'success');
    } else {
      addToast(res.message, 'error');
    }
  };

  const handleWishlist = async () => {
    if (!product) return;
    const res = await toggleWishlist(product.id);
    if (res.success) {
      if (res.added) {
        addToast(`Added "${product.name}" to wishlist.`, 'success');
      } else {
        addToast(`Removed "${product.name}" from wishlist.`, 'info');
      }
    } else {
      addToast(res.message, 'error');
    }
  };

  const handleAddBundleToCart = async () => {
    let successCount = 0;
    if (bundleChecked[0] && product) {
      const res = await addToCart(product.id, 1, selectedSize?.id, selectedColor?.id);
      if (res.success) successCount++;
    }
    if (bundleChecked[1] && bundleProducts[0]) {
      const p = bundleProducts[0];
      const defaultSize = p.variants?.find(v => v.variant_type === 'size')?.id || null;
      const defaultColor = p.variants?.find(v => v.variant_type === 'color')?.id || null;
      const res = await addToCart(p.id, 1, defaultSize, defaultColor);
      if (res.success) successCount++;
    }
    if (bundleChecked[2] && bundleProducts[1]) {
      const p = bundleProducts[1];
      const defaultSize = p.variants?.find(v => v.variant_type === 'size')?.id || null;
      const defaultColor = p.variants?.find(v => v.variant_type === 'color')?.id || null;
      const res = await addToCart(p.id, 1, defaultSize, defaultColor);
      if (res.success) successCount++;
    }
    
    if (successCount > 0) {
      addToast(`Successfully added ${successCount} bundle products to your cart!`, 'success');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment) return;
    setSubmittingReview(true);
    try {
      await api.post('reviews/', {
        product: product.id,
        rating: reviewRating,
        comment: reviewComment
      });
      addToast('Review submitted successfully!', 'success');
      setReviewComment('');
      
      // Re-fetch reviews
      const reviewRes = await api.get('reviews/', { params: { product_id: product.id } });
      setReviews(reviewRes.data.results || reviewRes.data || []);
    } catch (error) {
      addToast('Failed to submit review. Check if you already left a review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}><h2>Product not found.</h2></div>;

  // Calculate price with variants modifiers
  const basePrice = parseFloat(product.discount_price || product.price);
  const sizeModifier = selectedSize ? parseFloat(selectedSize.price_modifier) : 0.0;
  const colorModifier = selectedColor ? parseFloat(selectedColor.price_modifier) : 0.0;
  const currentUnitPrice = basePrice + sizeModifier + colorModifier;

  const isWishlisted = wishlist.some((item) => item.product === product.id);

  // Parse features bullet list
  const featuresList = product.features 
    ? product.features.split('\n').filter(line => line.trim().length > 0)
    : [];

  // Parse specifications key-values
  const specs = typeof product.specifications === 'string'
    ? JSON.parse(product.specifications)
    : product.specifications || {};

  // Calculate Bundle Pricing
  const companion1Price = bundleProducts[0] ? parseFloat(bundleProducts[0].discount_price || bundleProducts[0].price) : 0;
  const companion2Price = bundleProducts[1] ? parseFloat(bundleProducts[1].discount_price || bundleProducts[1].price) : 0;
  const bundleTotal = (bundleChecked[0] ? currentUnitPrice : 0) + 
                      (bundleChecked[1] ? companion1Price : 0) + 
                      (bundleChecked[2] ? companion2Price : 0);

  return (
    <div className="product-details-page section" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        
        {/* Core details layout */}
        <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap', marginBottom: '80px' }}>
          
          {/* Zoom gallery section */}
          <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass-card" style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: '#f1f5f9',
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <img
                src={selectedImg}
                alt={product.name}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'zoom-in',
                  transition: 'transform 0.1s ease-out',
                  ...zoomStyle
                }}
              />
            </div>
            
            {/* Gallery thumbnails */}
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImg(img.image_url)}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: selectedImg === img.image_url ? '2px solid var(--primary)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      padding: 0,
                      backgroundColor: 'transparent',
                      flexShrink: 0
                    }}
                  >
                    <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Details panel */}
          <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Badges and tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.is_special_promo && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: '#d97706', padding: '6px 14px', borderRadius: '100px' }}>
                  🔥 SPECIAL LAUNCH OFFER
                </span>
              )}
              {product.is_trending && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: '#8b5cf6', padding: '6px 14px', borderRadius: '100px' }}>
                  TRENDING
                </span>
              )}
              {product.is_best_seller && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: '#10b981', padding: '6px 14px', borderRadius: '100px' }}>
                  BEST SELLER
                </span>
              )}
              {product.is_new_arrival && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: '#3b82f6', padding: '6px 14px', borderRadius: '100px' }}>
                  NEW ARRIVAL
                </span>
              )}
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {product.brand_name}
              </span>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '4px', marginBottom: '8px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {product.name}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Rating value={parseFloat(product.ratings_average)} text={`${product.reviews_count} Reviews`} />
                <span style={{ fontSize: '0.85rem', color: product.stock > 0 ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                  {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Price section */}
            <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{currentUnitPrice}</span>
                {product.discount_price && (
                  <>
                    <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ₹{parseFloat(product.price) + sizeModifier + colorModifier}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--error)' }}>
                      ({product.discount_percentage}% OFF)
                    </span>
                  </>
                )}
              </div>
              {product.is_special_promo && (
                <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 700, marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>⏳ Offer Ends Soon</span>
                  <span>|</span>
                  <span>⚠️ Limit 1 Per Customer</span>
                </div>
              )}
            </div>

            {/* Product description */}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
              {product.description}
            </p>

            {/* Bullet features list */}
            {featuresList.length > 0 && (
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>Product Highlights</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {featuresList.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <CheckCircle size={14} style={{ color: 'var(--success)', marginTop: '3px', flexShrink: 0 }} />
                      <span>{feature.replace(/^[✓\-\*\s]+/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Variants Selector */}
            {product.variants?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Size selection */}
                {product.variants.some(v => v.variant_type === 'size') && (
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Select Options</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {product.variants.filter(v => v.variant_type === 'size').map(v => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedSize(v)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '100px',
                            border: selectedSize?.id === v.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                            backgroundColor: selectedSize?.id === v.id ? 'var(--primary-light)' : 'transparent',
                            color: selectedSize?.id === v.id ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {v.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color selection */}
                {product.variants.some(v => v.variant_type === 'color') && (
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Select Color</label>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {product.variants.filter(v => v.variant_type === 'color').map(v => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedColor(v)}
                          style={{
                            padding: '8px 18px',
                            borderRadius: '100px',
                            border: selectedColor?.id === v.id ? '2px solid var(--secondary)' : '1px solid var(--border)',
                            backgroundColor: selectedColor?.id === v.id ? 'var(--secondary-light)' : 'transparent',
                            color: selectedColor?.id === v.id ? 'var(--secondary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {v.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity and Actions row */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}
                >-</button>
                <span style={{ padding: '12px 18px', minWidth: '40px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  style={{ padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}
                >+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn btn-primary"
                style={{ flexGrow: 1, gap: '10px', height: '48px' }}
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleWishlist}
                className="btn btn-secondary"
                style={{ height: '48px', width: '48px', padding: 0 }}
              >
                <Heart size={18} fill={isWishlisted ? 'var(--primary)' : 'none'} style={{ color: isWishlisted ? 'var(--primary)' : 'inherit' }} />
              </button>
            </div>

            {/* Specifications table */}
            {Object.keys(specs).length > 0 && (
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Specifications</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <tbody>
                    {Object.entries(specs).map(([key, val]) => (
                      <tr key={key} style={{ borderBottom: '1px solid var(--border)', display: 'flex', padding: '8px 0' }}>
                        <td style={{ width: '40%', fontWeight: 600, color: 'var(--text-secondary)' }}>{key}</td>
                        <td style={{ width: '60%', color: 'var(--text-primary)' }}>{String(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Extra assurance and metadata badges */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Seller:</span> <strong style={{ color: 'var(--text-secondary)' }}>{product.seller_name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Warranty:</span> <strong style={{ color: 'var(--text-secondary)' }}>{product.warranty}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Return Policy:</span> <strong style={{ color: 'var(--text-secondary)' }}>{product.return_policy}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Delivery:</span> <strong style={{ color: 'var(--text-secondary)' }}>{product.delivery_time}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>COD Available:</span> <strong style={{ color: 'var(--text-secondary)' }}>{product.cash_on_delivery ? 'Yes' : 'No'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>SKU:</span> <strong style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{product.sku}</strong>
              </div>
            </div>
            
          </div>
        </div>

        {/* FREQUENTLY BOUGHT TOGETHER BUNDLE */}
        {bundleProducts.length > 0 && (
          <div className="glass-card" style={{ padding: '30px', border: '1px solid var(--border)', marginBottom: '80px', borderRadius: 'var(--radius-md)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>Frequently Bought Together</h2>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              {/* Product item list */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', flexGrow: 1 }}>
                
                {/* Main Product */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="checkbox" checked={bundleChecked[0]} 
                    onChange={e => setBundleChecked([e.target.checked, bundleChecked[1], bundleChecked[2]])}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div style={{ width: '70px', height: '70px', overflow: 'hidden', borderRadius: 'var(--radius-sm)', backgroundColor: '#f1f5f9' }}>
                    <img src={product.thumbnail_url || selectedImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      This Item: {product.name}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>₹{currentUnitPrice}</span>
                  </div>
                </div>

                <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>+</span>

                {/* Sub Product 1 */}
                {bundleProducts[0] && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox" checked={bundleChecked[1]} 
                      onChange={e => setBundleChecked([bundleChecked[0], e.target.checked, bundleChecked[2]])}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div style={{ width: '70px', height: '70px', overflow: 'hidden', borderRadius: 'var(--radius-sm)', backgroundColor: '#f1f5f9' }}>
                      <img src={bundleProducts[0].thumbnail_url || bundleProducts[0].images?.[0]?.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <Link to={`/products/${bundleProducts[0].slug}`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {bundleProducts[0].name}
                      </Link>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>₹{companion1Price}</span>
                    </div>
                  </div>
                )}

                {bundleProducts[1] && (
                  <>
                    <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>+</span>

                    {/* Sub Product 2 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="checkbox" checked={bundleChecked[2]} 
                        onChange={e => setBundleChecked([bundleChecked[0], bundleChecked[1], e.target.checked])}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <div style={{ width: '70px', height: '70px', overflow: 'hidden', borderRadius: 'var(--radius-sm)', backgroundColor: '#f1f5f9' }}>
                        <img src={bundleProducts[1].thumbnail_url || bundleProducts[1].images?.[0]?.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <Link to={`/products/${bundleProducts[1].slug}`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {bundleProducts[1].name}
                        </Link>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>₹{companion2Price}</span>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Action Box */}
              <div style={{ paddingLeft: '24px', borderLeft: '1px solid var(--border)', minWidth: '220px' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Bundle Price:</span>
                <span style={{ display: 'block', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>₹{bundleTotal.toFixed(2)}</span>
                <button 
                  onClick={handleAddBundleToCart}
                  disabled={bundleTotal === 0}
                  className="btn btn-primary" 
                  style={{ width: '100%', gap: '8px', fontSize: '0.85rem', height: '42px' }}
                >
                  <ShoppingCart size={16} />
                  <span>Buy Bundle together</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Customer Reviews section */}
        <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '60px' }}>
          <div style={{ flex: '1 1 450px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px' }}>Customer Reviews ({reviews.length})</h2>
            
            {reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} className="glass-card" style={{ padding: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                          {rev.username.substring(0, 2).toUpperCase()}
                        </div>
                        <h5 style={{ fontWeight: 600 }}>{rev.username}</h5>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.created_at.substring(0, 10)}</span>
                    </div>
                    <Rating value={rev.rating} />
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to leave your feedback for this product!</p>
            )}
          </div>

          {/* Leave a review form */}
          <div style={{ flex: '1 1 400px', maxWidth: '500px' }}>
            <div className="glass-card" style={{ padding: '30px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Submit a Review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label className="form-label">Overall Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(parseInt(e.target.value))}
                    className="form-control"
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Very Good)</option>
                    <option value="3">3 Stars (Good)</option>
                    <option value="2">2 Stars (Fair)</option>
                    <option value="1">1 Star (Poor)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Comment</label>
                  <textarea
                    rows="4"
                    placeholder="Tell us what you liked or disliked about this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>

                <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
                  <Send size={16} />
                  <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Related products row */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '80px', borderTop: '1px solid var(--border)', paddingTop: '60px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '30px' }}>Related Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;
