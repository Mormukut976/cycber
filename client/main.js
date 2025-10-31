// API Configuration
const API_BASE = 'https://cycber-1.onrender.com/api/v1';

// Global State
let currentUser = null;
let products = [];
let cart = [];

// Load cart from localStorage on startup
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupEventListeners();
    loadInitialData();
    checkAuthStatus();
    loadCartFromStorage();
    updateCartCount();
    loadWebsiteContent(); // Load real content from database
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

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        const paymentModal = document.getElementById('paymentModal');
        
        if (event.target === loginModal) closeLoginModal();
        if (event.target === registerModal) closeRegisterModal();
        if (event.target === paymentModal) closePaymentModal();
    });
}

// Load Initial Data
async function loadInitialData() {
    showLoading();
    try {
        await Promise.all([
            loadProducts(),
            loadCourses()
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please check if server is running.');
    } finally {
        hideLoading();
    }
}

// Load Products from API
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products?category=script`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            products = data.data.products;
            renderProducts(products, 'scripts-grid');
        } else {
            throw new Error(data.message || 'Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample data
        renderSampleProducts();
    }
}

// Load Courses from API
async function loadCourses() {
    try {
        const response = await fetch(`${API_BASE}/products?category=course`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            renderProducts(data.data.products, 'courses-grid');
        } else {
            throw new Error(data.message || 'Failed to load courses');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        // Fallback to sample data
        renderSampleCourses();
    }
}

// Sample data fallback
function renderSampleProducts() {
    const sampleProducts = [
        {
            _id: '1',
            name: 'Network Vulnerability Scanner',
            description: 'Advanced Python script to identify network vulnerabilities and security gaps.',
            price: 49.99,
            category: 'script',
            level: 'intermediate',
            image: 'fas fa-network-wired',
            tags: ['network', 'security', 'python']
        },
        {
            _id: '2',
            name: 'Penetration Testing Toolkit',
            description: 'Comprehensive Bash script collection for ethical hacking and penetration testing.',
            price: 79.99,
            category: 'script',
            level: 'advanced',
            image: 'fas fa-user-secret',
            tags: ['pentesting', 'ethical-hacking', 'bash']
        },
        {
            _id: '3',
            name: 'Cloud Security Auditor',
            description: 'AWS & Azure security assessment scripts to identify misconfigurations.',
            price: 64.99,
            category: 'script',
            level: 'intermediate',
            image: 'fas fa-cloud',
            tags: ['cloud', 'aws', 'azure', 'security']
        }
    ];
    
    renderProducts(sampleProducts, 'scripts-grid');
}

function renderSampleCourses() {
    const sampleCourses = [
        {
            _id: '4',
            name: 'Cybersecurity Fundamentals',
            description: 'Learn the basics of cybersecurity, threats, and protection mechanisms.',
            price: 99.99,
            category: 'course',
            level: 'beginner',
            image: 'fas fa-laptop-code',
            tags: ['fundamentals', 'beginners']
        },
        {
            _id: '5',
            name: 'Ethical Hacking Course',
            description: 'Learn penetration testing methodologies and ethical hacking techniques.',
            price: 199.99,
            category: 'course',
            level: 'intermediate',
            image: 'fas fa-bug',
            tags: ['ethical-hacking', 'pentesting']
        }
    ];
    
    renderProducts(sampleCourses, 'courses-grid');
}

// Render Products to Grid
function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="loading">No products found</div>';
        return;
    }

    const productsHTML = products.map(product => {
        const id = product._id || product.id || '';
        const name = product.name || 'Product';
        const price = typeof product.price === 'number' ? product.price : Number(product.price) || 0;
        const image = product.image || 'fas fa-shield-alt';
        const category = product.category || 'general';
        const level = product.level || '';
        const tags = Array.isArray(product.tags) ? product.tags : [];

        return `
        <div class="product-card" data-id="${id}" data-name="${name}" data-price="${price}" data-image="${image}" data-category="${category}" data-tags="${tags.join(' ')}">
            <div class="product-image">
                <i class="${image}"></i>
            </div>
            <div class="product-content">
                <h3 class="product-title">${name}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-tags">
                    <span class="tag">${category}</span>
                    ${level ? `<span class="tag">${level}</span>` : ''}
                    ${tags.length ? tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="product-price">$${price}</div>
                <button class="btn btn-primary btn-full" onclick="addToCart('${id}')">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button class="btn btn-outline btn-full" onclick="viewProductDetails('${id}')" style="margin-top: 0.5rem;">
                    View Details
                </button>
            </div>
        </div>`;
    }).join('');

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
        const offset = 80;
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

    const level = e.target.dataset.tab;
    filterCoursesByLevel(level);
}

// Filter Courses by Level
function filterCoursesByLevel(level) {
    const courseCards = document.querySelectorAll('#courses-grid .product-card');
    
    courseCards.forEach(card => {
        if (level === 'all' || card.dataset.level === level) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add to Cart
function addToCart(arg1, arg2) {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
        showNotification('Please login to add items to cart', 'warning');
        setTimeout(() => {
            window.openLoginModal();
        }, 500);
        return;
    }

    // Support signatures:
    // 1) addToCart(productId)
    // 2) addToCart(name, price) from inline HTML
    if (arg2 !== undefined) {
        // name/price path
        const name = String(arg1 || 'Product');
        const price = Number(arg2) || 0;
        
        // Check if already in cart - if yes, increase quantity
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            updateCartCount();
            showNotification(`✅ ${name} quantity increased to ${existingItem.quantity}!`, 'success');
            return;
        }
        
        cart.push({ id: name, name, price, quantity: 1, image: 'fas fa-shield-alt' });
        updateCartCount();
        showNotification('✅ Product added to cart!', 'success');
        return;
    }

    const productId = arg1;
    const product = products.find(p => p._id === productId) || 
                   Array.from(document.querySelectorAll('.product-card'))
                       .find(card => card.dataset.id === productId)?.dataset;

    if (product) {
        // Check if already in cart - if yes, increase quantity
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            updateCartCount();
            showNotification(`✅ ${product.name || 'Product'} quantity increased to ${existingItem.quantity}!`, 'success');
            return;
        }
        
        cart.push({
            id: productId,
            name: product.name || 'Product',
            price: Number(product.price) || 0,
            quantity: 1,
            image: product.image || 'fas fa-shield-alt'
        });
        updateCartCount();
        showNotification('✅ Product added to cart!', 'success');
    }
}

// Update Cart Count in UI
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        // Count total items including quantities
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = cart.length > 0 ? 'flex' : 'none';
    }
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// View Product Details
function viewProductDetails(productId) {
    showNotification('Product details feature coming soon!', 'info');
}

// Check Auth Status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        try {
            currentUser = JSON.parse(user);
            updateUIForAuth(currentUser);
        } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
}

// Update UI after authentication
function updateUIForAuth(user) {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    const adminLink = document.getElementById('admin-link');
    const adminDropdownLink = document.getElementById('admin-dropdown-link');
    const adminQuickAccess = document.getElementById('admin-quick-access');

    if (user) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userName) userName.textContent = user.name;
        
        // Show admin links if user is admin
        console.log('User role:', user.role);
        if (user.role === 'admin') {
            console.log('✅ Admin user detected - showing admin links');
            if (adminLink) {
                adminLink.style.display = 'block';
                console.log('Nav admin link shown');
            }
            if (adminDropdownLink) {
                adminDropdownLink.style.display = 'block';
                console.log('Dropdown admin link shown');
            }
            if (adminQuickAccess) {
                adminQuickAccess.style.display = 'block';
                console.log('Quick access shown');
            }
        } else {
            console.log('Regular user - hiding admin links');
            if (adminLink) adminLink.style.display = 'none';
            if (adminDropdownLink) adminDropdownLink.style.display = 'none';
            if (adminQuickAccess) adminQuickAccess.style.display = 'none';
        }
        
        currentUser = user;
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        if (adminDropdownLink) adminDropdownLink.style.display = 'none';
        if (adminQuickAccess) adminQuickAccess.style.display = 'none';
        currentUser = null;
    }
}

// Show Loading
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
}

// Hide Loading
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

// Cart Functions
function openCart() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'info');
        return;
    }

    const cartHTML = `
        <div class="modal" id="cartModal" style="display: block;">
            <div class="modal-content">
                <span class="close" onclick="closeCartModal()">&times;</span>
                <h2>Shopping Cart</h2>
                <div id="cart-items">
                    ${cart.map((item, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #eee;">
                            <div style="flex: 1;">
                                <h4>${item.name}</h4>
                                <p style="color: #666;">₹${item.price.toFixed(2)} × ${item.quantity || 1}</p>
                                <p style="font-weight: bold; margin-top: 0.5rem;">₹${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <button class="btn btn-outline" onclick="decreaseQuantity(${index})" style="padding: 0.5rem 0.75rem;">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span style="padding: 0.5rem 1rem; font-weight: bold;">${item.quantity || 1}</span>
                                <button class="btn btn-outline" onclick="increaseQuantity(${index})" style="padding: 0.5rem 0.75rem;">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <button class="btn btn-outline" onclick="removeFromCart(${index})" style="margin-left: 1rem;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #333;">
                    <h3>Total: ₹${cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2)}</h3>
                    <p style="color: #666; margin-top: 0.5rem;">${cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} items</p>
                    <button class="btn btn-primary btn-large" onclick="proceedToCheckout()" style="width: 100%; margin-top: 1rem;">
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    `;

    const existingCart = document.getElementById('cartModal');
    if (existingCart) existingCart.remove();

    document.body.insertAdjacentHTML('beforeend', cartHTML);
}

function closeCartModal() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) cartModal.remove();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    closeCartModal();
    if (cart.length > 0) {
        openCart();
    }
    showNotification('Item removed from cart', 'info');
}

function increaseQuantity(index) {
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + 1;
        updateCartCount();
        openCart(); // Refresh cart display
    }
}

function decreaseQuantity(index) {
    if (cart[index]) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
            updateCartCount();
            openCart(); // Refresh cart display
        } else {
            removeFromCart(index);
        }
    }
}

function proceedToCheckout() {
    const user = localStorage.getItem('user');
    
    if (!user) {
        closeCartModal();
        showNotification('Please login to proceed with checkout', 'warning');
        setTimeout(() => {
            window.openLoginModal();
        }, 500);
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }
    
    // Save cart to localStorage and redirect to payment page
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'payment.html';
}

// Payment Modal Functions
function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        const content = document.getElementById('payment-content');
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-credit-card" style="font-size: 3rem; color: #00ff88; margin-bottom: 1rem;"></i>
                    <h3>Payment Integration Coming Soon</h3>
                    <p>We're working on integrating secure payment processing.</p>
                    <p style="margin-top: 1rem;">Total: $${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</p>
                    <button class="btn btn-primary" onclick="closePaymentModal()" style="margin-top: 1rem;">Close</button>
                </div>
            `;
        }
        modal.style.display = 'block';
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.style.display = 'none';
}

// Admin Panel Function
function initializeAdminPanel() {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please login to access admin panel', 'warning');
        openLoginModal();
        return;
    }
    
    showNotification('Admin panel feature coming soon!', 'info');
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 300px;
                animation: slideIn 0.3s ease;
            }
            .notification-success { background: var(--success); }
            .notification-error { background: var(--danger); }
            .notification-info { background: var(--primary); }
            .notification-warning { background: var(--warning); color: black; }
            .notification button {
                background: none;
                border: none;
                color: inherit;
                font-size: 18px;
                cursor: pointer;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Show Error
function showError(message) {
    showNotification(message, 'error');
}

// Load Website Content from Database
async function loadWebsiteContent() {
    try {
        // Load Scripts
        const scriptsResponse = await fetch(`${API_BASE}/admin/scripts`);
        const scriptsData = await scriptsResponse.json();
        
        if (scriptsData.status === 'success' && scriptsData.data.scripts.length > 0) {
            displayScriptsOnWebsite(scriptsData.data.scripts);
        } else {
            const scriptsSection = document.getElementById('scripts');
            if (scriptsSection) scriptsSection.style.display = 'none';
        }

        // Load Courses
        const coursesResponse = await fetch(`${API_BASE}/admin/courses`);
        const coursesData = await coursesResponse.json();
        
        if (coursesData.status === 'success' && coursesData.data.courses.length > 0) {
            displayCoursesOnWebsite(coursesData.data.courses);
        } else {
            const coursesSection = document.getElementById('courses');
            if (coursesSection) coursesSection.style.display = 'none';
        }

        // Load Blogs
        const blogsResponse = await fetch(`${API_BASE}/admin/blogs`);
        const blogsData = await blogsResponse.json();
        
        if (blogsData.status === 'success' && blogsData.data.blogs.length > 0) {
            displayBlogsOnWebsite(blogsData.data.blogs);
        } else {
            const blogsSection = document.getElementById('blog');
            if (blogsSection) blogsSection.style.display = 'none';
        }
    } catch (error) {
        console.log('Could not load website content:', error);
    }
}

// Display Scripts on Main Website
function displayScriptsOnWebsite(scripts) {
    const scriptsGrid = document.getElementById('scripts-grid');
    const scriptsSection = document.getElementById('scripts');
    
    if (!scriptsGrid) return;
    
    if (scripts.length === 0) {
        scriptsSection.style.display = 'none';
        return;
    }
    
    scriptsSection.style.display = 'block';
    
    scriptsGrid.innerHTML = scripts.map(script => `
        <div class="product-card">
            <h3>${script.name}</h3>
            <p>${script.description || 'No description available'}</p>
            <div class="price">₹${script.price.toFixed(2)}</div>
            <button class="btn btn-primary" onclick="addToCart('${script.name}', ${script.price})">
                <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
        </div>
    `).join('');
}

// Display Courses on Main Website
function displayCoursesOnWebsite(courses) {
    const coursesGrid = document.getElementById('courses-grid');
    const coursesSection = document.getElementById('courses');
    
    if (!coursesGrid) return;
    
    if (courses.length === 0) {
        coursesSection.style.display = 'none';
        return;
    }
    
    coursesSection.style.display = 'block';
    
    coursesGrid.innerHTML = courses.map(course => `
        <div class="product-card" data-level="${course.level || 'beginner'}">
            ${course.thumbnail ? `<img src="${course.thumbnail}" alt="${course.title}" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:10px;">` : ''}
            <h3>${course.title}</h3>
            <p>${course.description || 'No description available'}</p>
            <div class="price">₹${course.price.toFixed(2)}</div>
            <button class="btn btn-primary" onclick="addToCart('${course.title}', ${course.price})">
                <i class="fas fa-shopping-cart"></i> Enroll Now
            </button>
        </div>
    `).join('');
}

// Display Blogs on Main Website
function displayBlogsOnWebsite(blogs) {
    const blogsGrid = document.getElementById('blog-grid');
    const blogsSection = document.getElementById('blog');
    
    if (!blogsGrid) return;
    
    if (blogs.length === 0) {
        blogsSection.style.display = 'none';
        return;
    }
    
    blogsSection.style.display = 'block';
    
    blogsGrid.innerHTML = blogs.map(blog => `
        <div class="blog-card">
            ${blog.image ? `<img src="${blog.image}" alt="${blog.title}" style="width:100%; height:200px; object-fit:cover; border-radius:8px; margin-bottom:15px;">` : ''}
            <h3>${blog.title}</h3>
            <p>${blog.excerpt || blog.content.substring(0, 150) + '...'}</p>
            <a href="#" class="btn btn-secondary" onclick="viewBlogDetails('${blog._id}'); return false;">
                Read More <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `).join('');
}

// View Blog Details (Optional - for future use)
function viewBlogDetails(blogId) {
    showNotification('Blog detail page coming soon!', 'info');
}

// Global functions for HTML onclick and cross-module usage
window.openCart = openCart;
window.closeCartModal = closeCartModal;
window.removeFromCart = removeFromCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;
window.viewProductDetails = viewProductDetails;
window.viewBlogDetails = viewBlogDetails;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showNotification = showNotification;
window.updateUIForAuth = updateUIForAuth;
window.closePaymentModal = closePaymentModal;
window.openPaymentModal = openPaymentModal;
window.proceedToCheckout = proceedToCheckout;
window.initializeAdminPanel = initializeAdminPanel;
window.scrollToSection = scrollToSection;
