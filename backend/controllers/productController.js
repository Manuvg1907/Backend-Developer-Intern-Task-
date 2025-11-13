const Product = require('../models/Product');
const { sanitizeInput } = require('../utils/validation');

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!price) {
      return res.status(400).json({ message: 'Price is required' });
    }
    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    const product = new Product({
      name: sanitizeInput(name),
      description: sanitizeInput(description || ''),
      price,
      quantity: quantity || 0,
      category: category || 'other',
      createdBy: req.userId,
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('createdBy', 'name email').sort({ createdAt: -1 });

    res.status(200).json({
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Product
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('createdBy', 'name email');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity, category, status } = req.body;

    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is admin or product creator
    if (product.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    if (name) product.name = sanitizeInput(name);
    if (description) product.description = sanitizeInput(description);
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (category) product.category = category;
    if (status) product.status = status;

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is admin or product creator
    if (product.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Products by Category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({ category }).populate('createdBy', 'name email').sort({ createdAt: -1 });

    res.status(200).json({
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search Products
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
