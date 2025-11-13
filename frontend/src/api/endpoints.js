import apiClient from './apiClient';

// Auth API calls
export const registerUser = (data) => apiClient.post('/auth/register', data);
export const loginUser = (data) => apiClient.post('/auth/login', data);
export const getMe = () => apiClient.get('/auth/me');

// Product API calls
export const createProduct = (data) => apiClient.post('/products', data);
export const getProducts = () => apiClient.get('/products');
export const getProductById = (id) => apiClient.get(`/products/${id}`);
export const updateProduct = (id, data) => apiClient.put(`/products/${id}`, data);
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`);
export const searchProducts = (query) => apiClient.get(`/products/search?query=${query}`);
export const getProductsByCategory = (category) => apiClient.get(`/products/category/${category}`);

// User Management (Admin only)
export const getAllUsers = () => apiClient.get('/auth/users');
export const updateUserRole = (userId, role) => apiClient.put(`/auth/users/${userId}/role`, { role });
export const deleteUser = (userId) => apiClient.delete(`/auth/users/${userId}`);
export const getUserStats = () => apiClient.get('/auth/stats');

export default {
  registerUser,
  loginUser,
  getMe,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getUserStats,
};
