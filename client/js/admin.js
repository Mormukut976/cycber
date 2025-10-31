// Admin.js - Admin panel functionality

// Initialize admin panel
function initializeAdminPanel() {
    if (!isAdminUser()) {
        showNotification('Access denied. Admin privileges required.', 'error');
        window.location.href = '#home';
        return;
    }
    
    loadAdminData();
    setupAdminEvents();
}

// Check if user is admin
function isAdminUser() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin' || user.email === 'kanu9264@gmail.com'; // Temporary for demo
}

// Load admin data
async function loadAdminData() {
    try {
        showLoading();
        
        const [salesData, userStats, productStats] = await Promise.all([
            loadSalesData(),
            loadUserStats(),
            loadProductStats()
        ]);
        
        renderAdminPanel(salesData, userStats, productStats);
        
    } catch (error) {
        console.error('Error loading admin data:', error);
        showNotification('Failed to load admin data', 'error');
    } finally {
        hideLoading();
    }
}

// Load sales data (simulated)
async function loadSalesData() {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
        totalRevenue: 12450.75,
        monthlyRevenue: 2450.25,
        totalSales: 89,
        activeSubscriptions: 45
    };
}

// Load user stats (simulated)
async function loadUserStats() {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
        totalUsers: 156,
        newUsersThisMonth: 23,
        activeUsers: 89
    };
}

// Load product stats (simulated)
async function loadProductStats() {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return {
        totalProducts: 15,
        topProducts: [
            { name: 'Network Scanner', sales: 34 },
            { name: 'Ethical Hacking Course', sales: 28 },
            { name: 'Cloud Security Auditor', sales: 22 }
        ]
    };
}

// Render admin panel
function renderAdminPanel(salesData, userStats, productStats) {
    const adminHTML = `
        <section id="admin" class="section">
            <div class="container">
                <div class="admin-header">
                    <h1 class="section-title">Admin Dashboard</h1>
                    <p>Manage your cybersecurity platform</p>
                </div>
                
                <!-- Admin Stats -->
                <div class="admin-stats-grid">
                    <div class="admin-stat-card">
                        <div class="admin-stat-icon revenue">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="admin-stat-info">
                            <h3>₹${salesData.totalRevenue.toLocaleString()}</h3>
                            <p>Total Revenue</p>
                            <span class="stat-change">+12% this month</span>
                        </div>
                    </div>
                    
                    <div class="admin-stat-card">
                        <div class="admin-stat-icon users">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="admin-stat-info">
                            <h3>${userStats.totalUsers}</h3>
                            <p>Total Users</p>
                            <span class="stat-change">+${userStats.newUsersThisMonth} new</span>
                        </div>
                    </div>
                    
                    <div class="admin-stat-card">
                        <div class="admin-stat-icon sales">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="admin-stat-info">
                            <h3>${salesData.totalSales}</h3>
                            <p>Total Sales</p>
                            <span class="stat-change">+8% growth</span>
                        </div>
                    </div>
                    
                    <div class="admin-stat-card">
                        <div class="admin-stat-icon products">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="admin-stat-info">
                            <h3>${productStats.totalProducts}</h3>
                            <p>Products</p>
                            <span class="stat-change">3 new this month</span>
                        </div>
                    </div>
                </div>
                
                <div class="admin-content">
                    <!-- Quick Actions -->
                    <div class="admin-section">
                        <h3>Quick Actions</h3>
                        <div class="admin-actions-grid">
                            <button class="admin-action-btn" onclick="openProductManager()">
                                <i class="fas fa-plus"></i>
                                <span>Add New Product</span>
                            </button>
                            <button class="admin-action-btn" onclick="openUserManager()">
                                <i class="fas fa-user-cog"></i>
                                <span>Manage Users</span>
                            </button>
                            <button class="admin-action-btn" onclick="openSalesReport()">
                                <i class="fas fa-chart-bar"></i>
                                <span>Sales Reports</span>
                            </button>
                            <button class="admin-action-btn" onclick="openContentManager()">
                                <i class="fas fa-file-alt"></i>
                                <span>Content Management</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Top Products -->
                    <div class="admin-section">
                        <h3>Top Selling Products</h3>
                        <div class="top-products-list">
                            ${productStats.topProducts.map((product, index) => `
                                <div class="top-product-item">
                                    <div class="product-rank">#${index + 1}</div>
                                    <div class="product-info">
                                        <h4>${product.name}</h4>
                                        <p>${product.sales} sales</p>
                                    </div>
                                    <div class="product-actions">
                                        <button class="btn btn-outline btn-sm" onclick="editProduct('${product.name}')">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    // Add admin panel to main content
    const main = document.querySelector('main') || document.body;
    main.insertAdjacentHTML('beforeend', adminHTML);
}

// Setup admin events
function setupAdminEvents() {
    // Add admin-specific event listeners here
}

// Admin action functions
function openProductManager() {
    showNotification('Product manager opening...', 'info');
    // Implement product manager modal
}

function openUserManager() {
    showNotification('User manager opening...', 'info');
    // Implement user manager modal
}

function openSalesReport() {
    showNotification('Generating sales report...', 'info');
    // Implement sales report
}

function openContentManager() {
    showNotification('Content manager opening...', 'info');
    // Implement content manager
}

function editProduct(productName) {
    showNotification(`Editing ${productName}...`, 'info');
    // Implement product editing
}

// Initialize admin panel when needed
window.initializeAdminPanel = initializeAdminPanel;
