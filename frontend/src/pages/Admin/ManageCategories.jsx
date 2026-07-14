import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get('products/categories/');
      // Extract results if paginated
      setCategories(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching admin categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    setAdding(true);
    try {
      await api.post('products/categories/', {
        name,
        description,
        image: imageUrl || null
      });
      addToast(`Category "${name}" created successfully!`, 'success');
      setName('');
      setDescription('');
      setImageUrl('');
      // Re-fetch list
      await fetchCategories();
    } catch (error) {
      addToast('Failed to create category.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"? This will affect products linked to it.`)) return;
    try {
      await api.delete(`products/categories/${id}/`);
      addToast(`Deleted category "${catName}" successfully.`, 'info');
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      addToast('Failed to delete category.', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '8px' }}>Manage Categories</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure shop parent and sub-categories listings.</p>
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Category List */}
        <div className="glass-card" style={{ flex: '2 1 450px', padding: '30px', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>Existing Categories</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Image</th>
                <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Category Name</th>
                <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Slug</th>
                <th style={{ padding: '12px 0', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 0' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <img src={cat.image || 'https://via.placeholder.com/40'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td style={{ padding: '14px 0', fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ padding: '14px 0', fontFamily: 'monospace' }}>{cat.slug}</td>
                  <td style={{ padding: '14px 0', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side: Create Category Form */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <div className="glass-card" style={{ padding: '30px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>Add Category</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="form-control" placeholder="e.g. Smart Audio" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Cover Image URL</label>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="form-control" placeholder="https://images.unsplash.com/..." />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea rows="4" value={description} onChange={e => setDescription(e.target.value)} className="form-control" />
              </div>

              <button type="submit" disabled={adding} className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: '10px', gap: '8px' }}>
                <Plus size={16} />
                <span>{adding ? 'Creating...' : 'Create Category'}</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageCategories;
