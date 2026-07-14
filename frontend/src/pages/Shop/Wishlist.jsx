import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Rating from '../../components/Common/Rating';

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const { addToast } = useToast();

  const handleRemove = async (productId, name) => {
    const res = await toggleWishlist(productId);
    if (res.success) {
      addToast(`Removed "${name}" from your wishlist.`, 'info');
    }
  };

  const handleAddToCart = async (product) => {
    // Select default variants if they exist
    const defaultSize = product.variants?.find(v => v.variant_type === 'size')?.id || null;
    const defaultColor = product.variants?.find(v => v.variant_type === 'color')?.id || null;

    const res = await addToCart(product.id, 1, defaultSize, defaultColor);
    if (res.success) {
      addToast(`Added "${product.name}" to your shopping cart!`, 'success');
      // Proactively remove from wishlist since it's now in the cart
      await toggleWishlist(product.id);
    } else {
      addToast(res.message, 'error');
    }
  };

  return (
    <div className="wishlist-page section" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '80vh' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '32px' }}>My Wishlist</h1>

        {wishlist.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {wishlist.map((item) => {
              const product = item.product_details;
              if (!product) return null;
              
              const featuredImg = product.images?.[0]?.image_url || 'https://via.placeholder.com/300';
              
              return (
                <div key={item.id} className="glass-card" style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    {/* Image */}
                    <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#f1f5f9', aspectRatio: '1', marginBottom: '16px' }}>
                      <img src={featuredImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Rating value={parseFloat(product.ratings_average)} />
                      <Link to={`/products/${product.slug}`}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', height: '44px', overflow: 'hidden' }}>{product.name}</h3>
                      </Link>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{product.discount_price ? product.discount_price : product.price}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn btn-primary"
                      style={{ flexGrow: 1, gap: '8px', fontSize: '0.85rem', padding: '10px' }}
                    >
                      <ShoppingCart size={16} />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => handleRemove(product.id, product.name)}
                      className="btn btn-secondary"
                      style={{ padding: '10px', color: 'var(--error)', borderColor: 'var(--border)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Heart size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Your Wishlist is Empty</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Save items you love here to easily purchase them later.</p>
            <Link to="/products" className="btn btn-primary">Start Exploring</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
