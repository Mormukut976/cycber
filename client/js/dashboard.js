// Dashboard.js - User dashboard functionality

// Initialize dashboard
function initializeDashboard() {
    if (!isLoggedIn()) {
        showNotification('Please login to access dashboard', 'warning');
        openLoginModal();
        return;
    }
    
    loadDashboardData();
    setupDashboardEvents();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        showLoading();
        
        // Simulate API calls for dashboard data
        const [purchases, stats, recentActivity] = await Promise.all([
            loadUserPurchases(),
            loadUserStats(),
            loadRecentActivity()
        ]);
        
        renderDashboard(purchases, stats, recentActivity);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Failed to load dashboard data', 'error');
    } finally {
        hideLoading();
    }
}

// Load user purchases (simulated)
async function loadUserPurchases() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
        {
            id: 'p1',
            productName: 'Network Vulnerability Scanner',
            purchaseDate: new Date('2024-01-15'),
            amount: 49.99,
            status: 'completed',
            downloadUrl: '#'
        },
        {
            id: 'p2',
            productName: 'Ethical Hacking Course',
            purchaseDate: new Date('2024-01-10'),
            amount: 199.99,
            status: 'completed',
            downloadUrl: '#'
        }
    ];
}

// Load user stats (simulated)
async function loadUserStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
        totalPurchases: 2,
        totalSpent: 249.98,
        downloads: 5,
        memberSince: new Date('2024-01-01')
    };
}

// Load recent activity (simulated)
async function loadRecentActivity() {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
        {
            id: 'a1',
            type: 'purchase',
            description: 'Purchased Network Vulnerability Scanner',
            date: new Date('2024-01-15T10:30:00'),
            icon: 'fas fa-shopping-cart'
        },
        {
            id: 'a2',
            type: 'download',
            description: 'Downloaded Ethical Hacking Course materials',
            date: new Date('2024-01-12T14:20:00'),
            icon: 'fas fa-download'
        },
        {
            id: 'a3',
            type: 'login',
            description: 'Logged in from new device',
            date: new Date('2024-01-10T09:15:00'),
            icon: 'fas fa-sign-in-alt'
        }
    ];
}

// Render dashboard
function renderDashboard(purchases, stats, recentActivity) {
    const dashboardHTML = `
        <section id="dashboard" class="section">
            <div class="container">
                <div class="dashboard-header">
                    <h1 class="section-title">Welcome back, ${currentUser?.name || 'User'}!</h1>
                    <p>Here's your cybersecurity learning overview</p>
                </div>
                
                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.totalPurchases}</h3>
                            <p>Total Purchases</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-info">
                            <h3>₹${stats.totalSpent}</h3>
                            <p>Total Spent</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-download"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.downloads}</h3>
                            <p>Downloads</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${formatMemberSince(stats.memberSince)}</h3>
                            <p>Member Since</p>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <!-- Recent Purchases -->
                    <div class="dashboard-section">
                        <h3>Recent Purchases</h3>
                        <div class="purchases-list">
                            ${purchases.length > 0 ? 
                                purchases.map(purchase => `
                                    <div class="purchase-item">
                                        <div class="purchase-info">
                                            <h4>${purchase.productName}</h4>
                                            <p>Purchased on ${formatDate(purchase.purchaseDate)}</p>
                                        </div>
                                        <div class="purchase-actions">
                                            <span class="price">$${purchase.amount}</span>
                                            <button class="btn btn-outline btn-sm" onclick="downloadProduct('${purchase.id}')">
                                                <i class="fas fa-download"></i> Download
                                            </button>
                                        </div>
                                    </div>
                                `).join('') : 
                                '<p class="no-data">No purchases yet</p>'
                            }
                        </div>
                    </div>
                    
                    <!-- Recent Activity -->
                    <div class="dashboard-section">
                        <h3>Recent Activity</h3>
                        <div class="activity-list">
                            ${recentActivity.length > 0 ?
                                recentActivity.map(activity => `
                                    <div class="activity-item">
                                        <div class="activity-icon">
                                            <i class="${activity.icon}"></i>
                                        </div>
                                        <div class="activity-content">
                                            <p>${activity.description}</p>
                                            <span class="activity-time">${formatTimeAgo(activity.date)}</span>
                                        </div>
                                    </div>
                                `).join('') :
                                '<p class="no-data">No recent activity</p>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    // Add dashboard to main content
    const main = document.querySelector('main') || document.body;
    main.insertAdjacentHTML('beforeend', dashboardHTML);
}

// Setup dashboard events
function setupDashboardEvents() {
    // Add any dashboard-specific event listeners here
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

function formatMemberSince(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
}

// Download product (simulated)
function downloadProduct(productId) {
    showNotification('Download started!', 'success');
    // In real app, this would trigger actual download
}

// Check if user is logged in
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// Initialize dashboard when needed
window.initializeDashboard = initializeDashboard;
