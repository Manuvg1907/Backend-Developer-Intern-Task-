import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct, searchProducts } from '../api/endpoints';
import '../styles/Dashboard.css';

export const ProductsPage = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: 'other',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data.products);
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
    } catch (err) {
      setError('Failed to create product');
    }
  };

  const handleUpdateProduct = async (id, updatedData) => {
    try {
      await updateProduct(id, updatedData);
      await fetchProducts();
      setError('');
    } catch (err) {
      setError('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        await fetchProducts();
        setError('');
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Product Catalog</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          {user?.role === 'admin' && <span className="admin-badge">Admin</span>}
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        <div className="search-section">
          <h2>Search Products</h2>
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

        <div className="add-task-section">
          <h2>Add New Product</h2>
          {user?.role === 'admin' ? (
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
          ) : (
            <div style={{
              padding: '20px',
              background: '#fff3cd',
              border: '1px solid #ffeeba',
              borderRadius: '5px',
              color: '#856404',
              fontWeight: '500'
            }}>
              ⚠️ Only administrators can create products. Current role: <strong>{user?.role}</strong>
            </div>
          )}
        </div>

        <div className="tasks-section">
          <h2>Products ({products.length})</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products found. Create one to get started!</p>
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
                  </div>
                  <div className="task-actions">
                    {user?.role === 'admin' ? (
                      <>
                        <button
                          onClick={() => {
                            const newStatus = product.status === 'active' ? 'inactive' : 'active';
                            handleUpdateProduct(product._id, { status: newStatus });
                          }}
                          className="update-btn"
                        >
                          {product.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <div style={{
                        padding: '10px',
                        background: '#e7f3ff',
                        borderRadius: '5px',
                        textAlign: 'center',
                        color: '#0066cc',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        View Only (Admin rights needed for edits)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
