import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Phone, Image, FileText } from 'lucide-react';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setPhone(user.profile.phone || '');
      setAvatar(user.profile.avatar || '');
      setBio(user.profile.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({ phone, avatar, bio });
    if (res.success) {
      addToast('Profile updated successfully!', 'success');
    } else {
      addToast(res.message, 'error');
    }
    setSaving(false);
  };

  return (
    <div className="profile-page section" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '32px' }}>Account Settings</h1>

        <div className="glass-card" style={{ padding: '40px', border: '1px solid var(--border)' }}>
          {/* Avatar display */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--primary)'
            }}>
              {avatar ? (
                <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={48} style={{ color: 'var(--primary)' }} />
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.username}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '44px' }}
                />
                <Phone size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Profile Image URL</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '44px' }}
                />
                <Image size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">About Me (Bio)</label>
              <div style={{ position: 'relative' }}>
                <textarea
                  rows="4"
                  placeholder="Write a brief description about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '44px' }}
                />
                <FileText size={16} style={{ position: 'absolute', left: '16px', top: '18px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: '10px' }}>
              <span>{saving ? 'Saving changes...' : 'Save Profile Details'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
