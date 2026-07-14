import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Rating from '../Common/Rating';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const { addToast } = useToast();

  const isWishlisted = wishlist.some((item) => item.product === product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select default variants if they exist
    const defaultSize = product.variants?.find(v => v.variant_type === 'size')?.id || null;
    const defaultColor = product.variants?.find(v => v.variant_type === 'color')?.id || null;

    const res = await addToCart(product.id, 1, defaultSize, defaultColor);
    if (res.success) {
      addToast(`Added "${product.name}" to your shopping cart!`, 'success');
    } else {
      addToast(res.message, 'error');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggleWishlist(product.id);
    if (res.success) {
      if (res.added) {
        addToast(`Added "${product.name}" to your wishlist!`, 'success');
      } else if (res.removed) {
        addToast(`Removed "${product.name}" from your wishlist.`, 'info');
      }
    } else {
      addToast(res.message, 'error');
    }
  };

  // Extract featured image
  const featuredImg = product.images?.find((img) => img.is_featured)?.image_url || 
                     product.images?.[0]?.image_url || 
                     'https://via.placeholder.com/300?text=Product+Image';

  const salePercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  return (
    <div className="glass-card product-card" style={{
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'space-between'
    }}>
      {/* Product Badges */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {product.is_special_promo && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: '#d97706',
            padding: '4px 10px',
            borderRadius: '100px'
          }}>🔥 LAUNCH OFFER</span>
        )}
        {product.is_featured && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: 'var(--secondary)',
            padding: '4px 10px',
            borderRadius: '100px'
          }}>FEATURED</span>
        )}
        {product.is_trending && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: '#8b5cf6',
            padding: '4px 10px',
            borderRadius: '100px'
          }}>TRENDING</span>
        )}
        {product.is_best_seller && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: '#10b981',
            padding: '4px 10px',
            borderRadius: '100px'
          }}>BEST SELLER</span>
        )}
        {product.is_new_arrival && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: '#3b82f6',
            padding: '4px 10px',
            borderRadius: '100px'
          }}>NEW ARRIVAL</span>
        )}
        {product.discount_price && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: 'var(--error)',
            padding: '4px 10px',
            borderRadius: '100px'
          }}>-{salePercentage}% OFF</span>
        )}
        {product.stock === 0 && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: '#6b7280',
            padding: '4px 10px',
            borderRadius: '100px'
          }}>OUT OF STOCK</span>
        )}
      </div>

      {/* Image Gallery wrapper */}
      <div className="product-image-wrapper" style={{
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f1f5f9',
        aspectRatio: '1',
        marginBottom: '16px'
      }}>
        <img
          src={featuredImg}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-slow)'
          }}
          className="product-card-img"
        />

        {/* Hover Quick actions overlay */}
        <div className="product-actions-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          opacity: 0,
          transition: 'opacity var(--transition-fast)',
          zIndex: 4
        }}>
          <Link to={`/products/${product.slug}`} className="btn" style={{
            backgroundColor: '#ffffff',
            color: 'var(--text-primary)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Eye size={18} />
          </Link>
          <button onClick={handleWishlist} className="btn" style={{
            backgroundColor: isWishlisted ? 'var(--primary)' : '#ffffff',
            color: isWishlisted ? '#ffffff' : 'var(--text-primary)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer'
          }}>
            <Heart size={18} fill={isWishlisted ? '#ffffff' : 'none'} />
          </button>
        </div>
      </div>

      {/* Product metadata */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{product.brand_name}</span>
          <Rating value={parseFloat(product.ratings_average)} />
        </div>
        <Link to={`/products/${product.slug}`}>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            height: '44px'
          }}>{product.name}</h3>
        </Link>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
          {product.discount_price ? (
            <>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>₹{product.discount_price}</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.price}</span>
            </>
          ) : (
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{product.price}</span>
          )}
        </div>
      </div>

      {/* Add To Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="btn btn-primary"
        style={{
          width: '100%',
          marginTop: '16px',
          gap: '8px',
          fontSize: '0.85rem',
          padding: '10px 16px'
        }}
      >
        <ShoppingCart size={16} />
        <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
      </button>
    </div>
  );
};

export default ProductCard;
