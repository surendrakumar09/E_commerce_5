import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FolderTree, ClipboardList, Home, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DarkModeToggle from '../components/Common/DarkModeToggle';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Admin Sidebar */}
      <aside className="admin-sidebar" style={{
        width: '260px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        {/* Admin Branding */}
        <div className="admin-logo" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.5rem',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Admin Portal</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logged as {user?.username}</span>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <NavLink
            to="/admin/dashboard"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
              fontWeight: 500
            })}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
              fontWeight: 500
            })}
          >
            <ShoppingBag size={20} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
              fontWeight: 500
            })}
          >
            <FolderTree size={20} />
            <span>Categories</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
              fontWeight: 500
            })}
          >
            <ClipboardList size={20} />
            <span>Orders</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Dark Mode</span>
            <DarkModeToggle />
          </div>

          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}>
            <Home size={20} />
            <span>View Shop</span>
          </Link>

          <button onClick={logout} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--error)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            textAlign: 'left',
            width: '100%'
          }}>
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="admin-content" style={{ flexGrow: 1, padding: '40px', overflowY: 'auto', height: '100vh' }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
