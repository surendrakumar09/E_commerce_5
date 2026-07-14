import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, X, Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Modal forms state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Standard fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Extended fields
  const [features, setFeatures] = useState('');
  const [specifications, setSpecifications] = useState('{}');
  const [sellerName, setSellerName] = useState('OmniRetail');
  const [warranty, setWarranty] = useState('1 Year Brand Warranty');
  const [returnPolicy, setReturnPolicy] = useState('7 Days Replacement');
  const [deliveryTime, setDeliveryTime] = useState('3-5 Business Days');
  const [cashOnDelivery, setCashOnDelivery] = useState(true);
  const [isTrending, setIsTrending] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isSpecialPromo, setIsSpecialPromo] = useState(false);

  const fetchCatalogData = async () => {
    try {
      const prodRes = await api.get('products/products/');
      setProducts(prodRes.data.results || prodRes.data || []);
      
      const catRes = await api.get('products/categories/');
      // Flat categories out of hierarchy if needed
      setCategories(catRes.data.results || catRes.data || []);
      
      const brandRes = await api.get('products/brands/');
      setBrands(brandRes.data.results || brandRes.data || []);
    } catch (err) {
      console.error('Error fetching admin products catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setName('');
    setSku('');
    setPrice('');
    setDiscountPrice('');
    setStock('');
    setDescription('');
    setCategory(categories[0]?.id || '');
    setBrand(brands[0]?.id || '');
    setIsActive(true);
    setIsFeatured(false);
    setImageUrl('');
    
    setFeatures('✓ Feature 1\n✓ Feature 2');
    setSpecifications('{\n  "Model Year": "2026",\n  "Origin": "India"\n}');
    setSellerName('OmniRetail');
    setWarranty('1 Year Brand Warranty');
    setReturnPolicy('7 Days Replacement');
    setDeliveryTime('3-5 Business Days');
    setCashOnDelivery(true);
    setIsTrending(false);
    setIsBestSeller(false);
    setIsNewArrival(true);
    setIsSpecialPromo(false);
    
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingId(prod.id);
    setName(prod.name);
    setSku(prod.sku);
    setPrice(prod.price);
    setDiscountPrice(prod.discount_price || '');
    setStock(prod.stock);
    setDescription(prod.description);
    setCategory(prod.category);
    setBrand(prod.brand || '');
    setIsActive(prod.is_active);
    setIsFeatured(prod.is_featured);
    setImageUrl(prod.images?.[0]?.image_url || prod.thumbnail_url || '');
    
    setFeatures(prod.features || '');
    setSpecifications(JSON.stringify(prod.specifications || {}, null, 2));
    setSellerName(prod.seller_name || 'OmniRetail');
    setWarranty(prod.warranty || '1 Year Brand Warranty');
    setReturnPolicy(prod.return_policy || '7 Days Replacement');
    setDeliveryTime(prod.delivery_time || '3-5 Business Days');
    setCashOnDelivery(prod.cash_on_delivery !== false);
    setIsTrending(prod.is_trending || false);
    setIsBestSeller(prod.is_best_seller || false);
    setIsNewArrival(prod.is_new_arrival || false);
    setIsSpecialPromo(prod.is_special_promo || false);
    
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Parse specs JSON
    let parsedSpecs = {};
    try {
      parsedSpecs = JSON.parse(specifications);
    } catch (err) {
      addToast('Invalid JSON structure in Specifications field.', 'error');
      return;
    }

    const payload = {
      name,
      sku,
      price: parseFloat(price),
      discount_price: discountPrice ? parseFloat(discountPrice) : null,
      stock: parseInt(stock),
      description,
      category,
      brand: brand || null,
      is_active: isActive,
      is_featured: isFeatured,
      thumbnail_url: imageUrl || null,
      features,
      specifications: parsedSpecs,
      seller_name: sellerName,
      warranty,
      return_policy: returnPolicy,
      delivery_time: deliveryTime,
      cash_on_delivery: cashOnDelivery,
      is_trending: isTrending,
      is_best_seller: isBestSeller,
      is_new_arrival: isNewArrival,
      is_special_promo: isSpecialPromo
    };

    try {
      if (editingId) {
        // Edit product
        const response = await api.put(`products/products/${editingId}/`, payload);
        
        // Image update if url provided
        if (imageUrl) {
          await api.post(`products/products/${editingId}/images/`, {
            image_url: imageUrl,
            is_featured: true
          });
        }
        
        addToast(`Updated product "${name}" successfully.`, 'success');
      } else {
        // Create product
        const response = await api.post('products/products/', payload);
        
        // Image creation
        if (imageUrl) {
          await api.post(`products/products/${response.data.id}/images/`, {
            image_url: imageUrl,
            is_featured: true
          });
        }

        addToast(`Created product "${name}" successfully.`, 'success');
      }
      setModalOpen(false);
      setLoading(true);
      fetchCatalogData();
    } catch (error) {
      addToast('Operation failed. Check inputs validation.', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await api.delete(`products/products/${id}/`);
      addToast(`Deleted product "${name}" successfully.`, 'info');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      addToast('Failed to delete product.', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '8px' }}>Manage Products</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Add, modify, track levels and delete product inventory entries.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products list Table */}
      <div className="glass-card" style={{ padding: '30px', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Image</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Product Name</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>SKU</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Price</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Stock</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => {
              const featuredImg = prod.thumbnail_url || prod.images?.[0]?.image_url || 'https://via.placeholder.com/50';
              return (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 0' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <img src={featuredImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td style={{ padding: '14px 0', fontWeight: 600 }}>{prod.name}</td>
                  <td style={{ padding: '14px 0', fontFamily: 'monospace' }}>{prod.sku}</td>
                  <td style={{ padding: '14px 0', fontWeight: 700 }}>₹{parseFloat(prod.price).toFixed(2)}</td>
                  <td style={{ padding: '14px 0' }}>{prod.stock} units</td>
                  <td style={{ padding: '14px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: prod.is_active ? 'var(--success-light)' : 'var(--border)',
                        color: prod.is_active ? 'var(--success)' : 'var(--text-muted)',
                        padding: '2px 8px',
                        borderRadius: '100px',
                        textTransform: 'uppercase',
                        width: 'fit-content'
                      }}>{prod.is_active ? 'Active' : 'Draft'}</span>
                      {prod.is_special_promo && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>🔥 PROMO</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 0', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '6px' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '6px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal CRUD overlay popup */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '24px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingId ? 'Edit Product details' : 'Add New Product'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="form-control" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">SKU</label>
                  <input type="text" required value={sku} onChange={e => setSku(e.target.value)} className="form-control" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="form-control" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Price (₹)</label>
                  <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="form-control" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Discount Price (₹)</label>
                  <input type="number" step="0.01" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} className="form-control" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="form-control">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Brand</label>
                  <select value={brand} onChange={e => setBrand(e.target.value)} className="form-control">
                    <option value="">No Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Image URL</label>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="form-control" placeholder="https://images.unsplash.com/..." />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Seller Name</label>
                <input type="text" value={sellerName} onChange={e => setSellerName(e.target.value)} className="form-control" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Warranty Details</label>
                  <input type="text" value={warranty} onChange={e => setWarranty(e.target.value)} className="form-control" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Return Policy</label>
                  <input type="text" value={returnPolicy} onChange={e => setReturnPolicy(e.target.value)} className="form-control" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Delivery Timeframe</label>
                  <input type="text" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="form-control" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '28px' }}>
                  <input type="checkbox" id="cod-chk" checked={cashOnDelivery} onChange={e => setCashOnDelivery(e.target.checked)} />
                  <label htmlFor="cod-chk" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>COD Available</label>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Description</label>
                <textarea rows="3" required value={description} onChange={e => setDescription(e.target.value)} className="form-control" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Features Bullet Points (one per line)</label>
                <textarea rows="3" value={features} onChange={e => setFeatures(e.target.value)} className="form-control" placeholder="✓ High performance&#10;✓ Sleek styling" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Specifications (JSON Object)</label>
                <textarea rows="4" value={specifications} onChange={e => setSpecifications(e.target.value)} className="form-control" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
              </div>

              {/* Status and Badge Checkboxes */}
              <div>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Status & Badge Settings</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="active-chk" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                    <label htmlFor="active-chk" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Is Active (Visible)</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="feat-chk" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                    <label htmlFor="feat-chk" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Is Featured Slider</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="trending-chk" checked={isTrending} onChange={e => setIsTrending(e.target.checked)} />
                    <label htmlFor="trending-chk" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Badge: Trending</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="best-chk" checked={isBestSeller} onChange={e => setIsBestSeller(e.target.checked)} />
                    <label htmlFor="best-chk" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Badge: Best Seller</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="new-chk" checked={isNewArrival} onChange={e => setIsNewArrival(e.target.checked)} />
                    <label htmlFor="new-chk" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Badge: New Arrival</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="promo-chk" checked={isSpecialPromo} onChange={e => setIsSpecialPromo(e.target.checked)} />
                    <label htmlFor="promo-chk" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>🔥 Special Launch Promo (₹1)</label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: '10px' }}>
                <span>Save Product details</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageProducts;
