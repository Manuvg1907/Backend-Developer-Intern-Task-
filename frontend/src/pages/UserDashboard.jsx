import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { getProducts, createProduct, updateProduct, deleteProduct, searchProducts } from '../api/endpoints';
import '../styles/Dashboard.css';

export const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('marketplace'); // marketplace, my-products, analytics
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: 'other',
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data.products);
      // Filter products created by current user
      const myProds = response.data.products.filter(p => p.createdBy?._id === user?.id);
      setUserProducts(myProds);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }
    try {
      setLoading(true);
      const response = await searchProducts(searchQuery);
      setProducts(response.data.products);
      setError('');
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!newProduct.price) {
      setError('Price is required');
      return;
    }

    try {
      await createProduct(newProduct);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: 'other',
      });
      await fetchProducts();
      setError('');
      setActiveTab('my-products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
      status: product.status,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editFormData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!editFormData.price) {
      setError('Price is required');
      return;
    }

    try {
      await updateProduct(editingProduct._id, editFormData);
      await fetchProducts();
      setShowEditModal(false);
      setEditingProduct(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleQuickUpdate = async (id, updatedData) => {
    try {
      await updateProduct(id, updatedData);
      await fetchProducts();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        await fetchProducts();
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  // Calculate analytics
  const totalProducts = products.length;
  const myProductCount = userProducts.length;
  const avgPrice = products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : 0;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2);
  const myProductValue = userProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2);
  const categoryBreakdown = {};
  products.forEach(p => {
    categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
  });

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
      <header className="dashboard-header user-dashboard-header">
        {/* Header removed - now in Navbar */}
      </header>

      <div style={{ borderBottom: '2px solid #e0e0e0', marginBottom: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '10px', padding: '10px' }}>
          <button
            onClick={() => setActiveTab('marketplace')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'marketplace' ? '#667eea' : '#f0f0f0',
              color: activeTab === 'marketplace' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            📦 Marketplace
          </button>
          <button
            onClick={() => setActiveTab('my-products')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'my-products' ? '#667eea' : '#f0f0f0',
              color: activeTab === 'my-products' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🏪 My Products ({myProductCount})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'analytics' ? '#667eea' : '#f0f0f0',
              color: activeTab === 'analytics' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {activeTab === 'marketplace' && (
          <>
            <div className="search-section">
              <h2>Browse All Products</h2>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: '10px', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                />
                <button onClick={handleSearch} style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>Search</button>
                <button onClick={fetchProducts} style={{
                  padding: '10px 20px',
                  background: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>Reset</button>
              </div>
            </div>

            <div className="tasks-section">
              <h2>Available Products ({products.filter(p => p.status === 'active').length})</h2>
              {loading ? (
                <p>Loading products...</p>
              ) : products.filter(p => p.status === 'active').length === 0 ? (
                <p>No active products available</p>
              ) : (
                <div className="tasks-list">
                  {products.filter(p => p.status === 'active').map((product) => (
                    <div key={product._id} className="task-card">
                      <div className="task-header">
                        <h3>{product.name}</h3>
                        <span style={{ fontSize: '0.85rem', background: '#f0f0f0', padding: '3px 8px', borderRadius: '3px' }}>
                          By: {product.createdBy?.name || 'Unknown'}
                        </span>
                      </div>
                      {product.description && <p>{product.description}</p>}
                      <div className="task-meta" style={{ fontSize: '1rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#667eea' }}>${product.price.toFixed(2)}</span>
                        <span style={{ color: product.quantity > 0 ? '#51cf66' : '#ff6b6b' }}>
                          {product.quantity > 0 ? `Stock: ${product.quantity}` : 'Out of Stock'}
                        </span>
                        <span className="priority-badge" style={{ textTransform: 'capitalize' }}>{product.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'my-products' && (
          <>
            <div className="add-task-section">
              <h2>Create New Product</h2>
              <form onSubmit={handleAddProduct}>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Product Description (optional)"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    min="0"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food</option>
                  <option value="books">Books</option>
                  <option value="other">Other</option>
                </select>
                <button type="submit">Add Product</button>
              </form>
            </div>

            <div className="tasks-section">
              <h2>My Products ({myProductCount})</h2>
              {loading ? (
                <p>Loading products...</p>
              ) : userProducts.length === 0 ? (
                <p>You haven't created any products yet. Create one to get started!</p>
              ) : (
                <div className="tasks-list">
                  {userProducts.map((product) => (
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
                      </div>
                      <div className="task-actions">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="update-btn"
                          style={{ background: '#667eea' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => {
                            const newStatus = product.status === 'active' ? 'inactive' : 'active';
                            handleQuickUpdate(product._id, { status: newStatus });
                          }}
                          className="update-btn"
                        >
                          {product.status === 'active' ? '🔒 Deactivate' : '🔓 Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
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
          </>
        )}

        {activeTab === 'analytics' && (
          <div style={{ maxWidth: '1200px' }}>
            <h2>Product Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#e7f3ff', padding: '20px', borderRadius: '10px', border: '2px solid #667eea' }}>
                <h3 style={{ color: '#667eea', marginTop: 0 }}>Total Products</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0' }}>{totalProducts}</p>
                <p style={{ color: '#666', marginBottom: 0 }}>In marketplace</p>
              </div>
              <div style={{ background: '#f0ffe7', padding: '20px', borderRadius: '10px', border: '2px solid #51cf66' }}>
                <h3 style={{ color: '#51cf66', marginTop: 0 }}>My Products</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0' }}>{myProductCount}</p>
                <p style={{ color: '#666', marginBottom: 0 }}>Products created by you</p>
              </div>
              <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '10px', border: '2px solid #ff9800' }}>
                <h3 style={{ color: '#ff9800', marginTop: 0 }}>Avg Price</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0' }}>${avgPrice}</p>
                <p style={{ color: '#666', marginBottom: 0 }}>Average product price</p>
              </div>
              <div style={{ background: '#f3e5ff', padding: '20px', borderRadius: '10px', border: '2px solid #9c27b0' }}>
                <h3 style={{ color: '#9c27b0', marginTop: 0 }}>Market Value</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0' }}>${totalValue}</p>
                <p style={{ color: '#666', marginBottom: 0 }}>Total inventory value</p>
              </div>
            </div>

            <div style={{ background: '#fff5e6', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '2px solid #ff6b35' }}>
              <h3 style={{ color: '#ff6b35', marginTop: 0 }}>My Portfolio Value</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#ff6b35' }}>${myProductValue}</p>
              <p style={{ color: '#666', marginBottom: 0 }}>Total value of your products (price × quantity)</p>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
              <h3>Products by Category</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                {Object.entries(categoryBreakdown).map(([cat, count]) => (
                  <div key={cat} style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ textTransform: 'capitalize', fontWeight: '600', margin: '0 0 10px 0', color: '#667eea' }}>{cat}</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#333' }}>{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginTop: 0 }}>Edit Product</h2>
            <input
              type="text"
              placeholder="Product Name"
              value={editFormData.name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            />
            <textarea
              placeholder="Product Description"
              value={editFormData.description || ''}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '5px',
                boxSizing: 'border-box',
                minHeight: '100px',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input
                type="number"
                placeholder="Price"
                step="0.01"
                min="0"
                value={editFormData.price || ''}
                onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })}
                style={{
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="number"
                placeholder="Quantity"
                min="0"
                value={editFormData.quantity || ''}
                onChange={(e) => setEditFormData({ ...editFormData, quantity: parseInt(e.target.value) })}
                style={{
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <select
              value={editFormData.category || 'other'}
              onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            >
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="food">Food</option>
              <option value="books">Books</option>
              <option value="other">Other</option>
            </select>
            <select
              value={editFormData.status || 'active'}
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                border: '2px solid #e0e0e0',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDashboard;
