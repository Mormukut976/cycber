// API Configuration
const API_BASE = 'https://cycber-1.onrender.com/api/v1';

// Global State
let currentUser = null;
let products = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupEventListeners();
    loadInitialData();
    checkAuthStatus();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', handleTab);
    });
}

// Load Initial Data
async function loadInitialData() {
    showLoading();
    try {
        await loadProducts();
        await loadCourses();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data');
    } finally {
        hideLoading();
    }
}

// Load Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products?category=script`);
        const data = await response.json();
        
        if (data.status === 'success') {
            products = data.data.products;
            renderProducts(products, 'scripts-grid');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load Courses
async function loadCourses() {
    try {
        const response = await fetch(`${API_BASE}/products?category=course`);
        const data = await response.json();
        
        if (data.status === 'success') {
            renderProducts(data.data.products, 'courses-grid');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Render Products
function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="loading">No products found</div>';
        return;
    }

    const productsHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}" data-tags="${product.tags?.join(' ') || ''}">
            <div class="product-image">
                <i class="${product.image || 'fas fa-shield-alt'}"></i>
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-tags">
                    <span class="tag">${product.category}</span>
                    <span class="tag">${product.level}</span>
                    ${product.tags ? product.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="product-price">$${product.price}</div>
                <button class="btn btn-primary btn-full" onclick="openPaymentModal('${product._id}')">
                    Purchase Now
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = productsHTML;
}

// Navigation Handler
function handleNavigation(e) {
    e.preventDefault();
    
    // Update active link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');

    // Scroll to section
    const targetId = e.target.getAttribute('href').substring(1);
    scrollToSection(targetId);
}

// Scroll to Section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offset = 80; // Navigation height
        const elementPosition = element.offsetTop - offset;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// Filter Handler
function handleFilter(e) {
    // Update active filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    const filter = e.target.dataset.filter;
    filterProducts(filter);
}

// Filter Products
function filterProducts(filter) {
    const productCards = document.querySelectorAll('#scripts-grid .product-card');
    
    productCards.forEach(card => {
        if (filter === 'all' || card.dataset.tags.includes(filter)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Tab Handler
function handleTab(e) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    e.target.classList.add('active');

    const tab = e.target.dataset.tab;
    // In real implementation, you would filter courses by level
    console.log('Selected tab:', tab);
}

// Check Auth Status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token and get user data
        // This would be implemented in auth.js
        console.log('User is logged in');
    }
}

// Show Loading
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

// Hide Loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Show Error
function showError(message) {
    alert('Error: ' + message); // In production, use a better notification system
}

// Open Payment Modal
function openPaymentModal(productId) {
    // This will be handled in payments.js
    console.log('Opening payment for product:', productId);
}

// Global functions for HTML onclick
window.scrollToSection = scrollToSection;
window.openPaymentModal = openPaymentModal;

// Update Cart Count in UI
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'flex' : 'none';
    }
}

// Open Cart
function openCart() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'info');
        return;
    }
    
    showCartModal();
}

// Show Cart Modal
function showCartModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'cartModal';
    modal.style.display = 'block';
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeCartModal()">&times;</span>
            <h2>Shopping Cart</h2>
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item">
                        <i class="${item.image}"></i>
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>$${item.price}</p>
                        </div>
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-total">
                <strong>Total: $${total.toFixed(2)}</strong>
            </div>
            <div class="cart-actions">
                <button class="btn btn-outline" onclick="closeCartModal()">Continue Shopping</button>
                <button class="btn btn-primary" onclick="openCartPaymentModal()">Checkout</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close Cart Modal
function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.remove();
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    
    // Update cart modal if open
    const modal = document.getElementById('cartModal');
    if (modal) {
        if (cart.length === 0) {
            closeCartModal();
            showNotification('Cart is now empty', 'info');
        } else {
            showCartModal(); // Refresh modal
        }
    }
    
    showNotification('Item removed from cart', 'info');
}

// Add to Cart function update
function addToCart(productId) {
    const product = products.find(p => p._id === productId) || 
                   Array.from(document.querySelectorAll('.product-card'))
                       .find(card => card.dataset.id === productId)?.dataset;
    
    if (product) {
        cart.push({
            id: productId,
            name: product.name || 'Product',
            price: product.price || 0,
            image: product.image || 'fas fa-shield-alt'
        });
        
        updateCartCount();
        showNotification('Product added to cart!', 'success');
    }
}

// Global functions
window.openCart = openCart;
window.closeCartModal = closeCartModal;
window.removeFromCart = removeFromCart;
