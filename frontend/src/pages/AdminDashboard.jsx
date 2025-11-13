import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { getAllUsers, updateUserRole, deleteUser, getUserStats, getProducts, deleteProduct, updateProduct } from '../api/endpoints';
import '../styles/Dashboard.css';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, products
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, productsRes, statsRes] = await Promise.all([
        getAllUsers(),
        getProducts(),
        getUserStats(),
      ]);
      setUsers(usersRes.data.users);
      setProducts(productsRes.data.products);
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      await fetchAdminData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await deleteUser(userId);
        await fetchAdminData();
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete product "${productName}"? This action cannot be undone.`)) {
      try {
        await deleteProduct(productId);
        await fetchAdminData();
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleUpdateProductStatus = async (productId, newStatus) => {
    try {
      await updateProduct(productId, { status: newStatus });
      await fetchAdminData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  // Calculate stats
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const regularUsers = users.filter(u => u.role === 'user').length;
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalProductValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2);
  const avgProductPrice = products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : 0;

  const usersByRole = {
    admin: adminUsers,
    user: regularUsers,
  };

  const productsByStatus = {};
  products.forEach(p => {
    productsByStatus[p.status] = (productsByStatus[p.status] || 0) + 1;
  });

  const productsByCategory = {};
  products.forEach(p => {
    productsByCategory[p.category] = (productsByCategory[p.category] || 0) + 1;
  });

  return (
    <>
      <Navbar />
      <div className="dashboard-container admin-dashboard-container">
      <header className="dashboard-header admin-dashboard-header">
        {/* Header removed - now in Navbar */}
      </header>

      <div style={{ borderBottom: '2px solid #e0e0e0', marginBottom: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '10px', padding: '10px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'overview' ? '#667eea' : '#f0f0f0',
              color: activeTab === 'overview' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'users' ? '#667eea' : '#f0f0f0',
              color: activeTab === 'users' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            👥 User Management ({totalUsers})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'products' ? '#667eea' : '#f0f0f0',
              color: activeTab === 'products' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            📦 Product Management ({totalProducts})
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {activeTab === 'overview' && (
          <div>
            <h2>System Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#e7f3ff', padding: '20px', borderRadius: '10px', border: '2px solid #667eea' }}>
                <h3 style={{ color: '#667eea', marginTop: 0 }}>Total Users</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0' }}>{totalUsers}</p>
                <p style={{ color: '#666', marginBottom: 0 }}>Registered users</p>
              </div>
              <div style={{ background: '#ffe7e7', padding: '20px', borderRadius: '10px', border: '2px solid #ff6b6b' }}>
                <h3 style={{ color: '#ff6b6b', marginTop: 0 }}>Administrators</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0' }}>{adminUsers}</p>
                <p style={{ color: '#666', marginBottom: 0 }}>Admin accounts</p>
              </div>
              <div style={{ background: '#f0ffe7', padding: '20px', borderRadius: '10px', border: '2px solid #51cf66' }}>
                <h3 style={{ color: '#51cf66', marginTop: 0 }}>Regular Users</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0' }}>{regularUsers}</p>
                <p style={{ color: '#666', marginBottom: 0 }}>Standard user accounts</p>
              </div>
              <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '10px', border: '2px solid #ff9800' }}>
                <h3 style={{ color: '#ff9800', marginTop: 0 }}>Total Products</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0' }}>{totalProducts}</p>
                <p style={{ color: '#666', marginBottom: 0 }}>Products in system</p>
              </div>
              <div style={{ background: '#f3e5ff', padding: '20px', borderRadius: '10px', border: '2px solid #9c27b0' }}>
                <h3 style={{ color: '#9c27b0', marginTop: 0 }}>Active Products</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0' }}>{activeProducts}</p>
                <p style={{ color: '#666', marginBottom: 0 }}>Available for purchase</p>
              </div>
              <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '10px', border: '2px solid #009688' }}>
                <h3 style={{ color: '#009688', marginTop: 0 }}>Market Value</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0' }}>${totalProductValue}</p>
                <p style={{ color: '#666', marginBottom: 0 }}>Total inventory value</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                <h3>Users by Role</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(usersByRole).map(([role, count]) => (
                    <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: '600', color: '#667eea' }}>{role}</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#333' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                <h3>Products by Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(productsByStatus).map(([status, count]) => (
                    <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: '600', color: '#ff9800' }}>{status}</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#333' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                <h3>Products by Category</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(productsByCategory).map(([cat, count]) => (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: '600', color: '#51cf66' }}>{cat}</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#333' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2>User Management</h2>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '5px', maxWidth: '500px' }}
              />
            </div>

            {loading ? (
              <p>Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p>No users found</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: 'white',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#333' }}>Current Role</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#333' }}>Change Role</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#333' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #e0e0e0', '&:hover': { background: '#f9f9f9' } }}>
                        <td style={{ padding: '12px', color: '#333' }}>{u.name}</td>
                        <td style={{ padding: '12px', color: '#666', fontSize: '0.9rem' }}>{u.email}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            background: u.role === 'admin' ? '#ff6b6b' : '#51cf66',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            textTransform: 'uppercase'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u._id, e.target.value)}
                            style={{
                              padding: '6px 10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            style={{
                              background: '#ff6b6b',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.85rem'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <h2>Product Management</h2>
            <div className="tasks-section">
              <p style={{ color: '#666', marginBottom: '20px' }}>Total Products: <strong>{totalProducts}</strong> | Active: <strong>{activeProducts}</strong> | Average Price: <strong>${avgProductPrice}</strong></p>
              {loading ? (
                <p>Loading products...</p>
              ) : products.length === 0 ? (
                <p>No products available</p>
              ) : (
                <div className="tasks-list">
                  {products.map((product) => (
                    <div key={product._id} className="task-card">
                      <div className="task-header">
                        <h3>{product.name}</h3>
                        <span className={`status-badge ${product.status}`}>{product.status}</span>
                      </div>
                      {product.description && <p>{product.description}</p>}
                      <div className="task-meta" style={{ fontSize: '1rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#667eea' }}>${product.price.toFixed(2)}</span>
                        <span>Stock: {product.quantity}</span>
                        <span className="priority-badge" style={{ textTransform: 'capitalize' }}>{product.category}</span>
                        <span style={{ fontSize: '0.85rem', background: '#f0f0f0', padding: '3px 8px', borderRadius: '3px' }}>
                          By: {product.createdBy?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="task-actions">
                        <button
                          onClick={() => handleUpdateProductStatus(product._id, product.status === 'active' ? 'inactive' : 'active')}
                          className="update-btn"
                        >
                          {product.status === 'active' ? '🔒 Deactivate' : '🔓 Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                          className="delete-btn"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default AdminDashboard;
