// Order Management for Admin Panel
const API_BASE = 'https://cycber-1.onrender.com/api/v1';

// Load all orders
async function loadOrders(status = '') {
    try {
        showLoading('Loading orders...');
        const token = localStorage.getItem('token');
        
        if (!token) {
            showError('Please login to view orders');
            return;
        }

        const url = status 
            ? `${API_BASE}/admin/orders?status=${status}`
            : `${API_BASE}/admin/orders`;
            
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.status === 'success') {
            displayOrders(data.data.orders);
            updateOrderStats(data.data.orders);
        } else {
            throw new Error(data.message || 'Failed to load orders');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Display orders in table
function displayOrders(orders) {
    const container = document.getElementById('orders-list');
    
    if (!container) {
        console.error('Orders container not found');
        return;
    }

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No orders found</p>
            </div>
        `;
        return;
    }

    const ordersHTML = orders.map(order => {
        const statusBadge = getStatusBadge(order.status);
        const date = new Date(order.createdAt).toLocaleString();
        const itemsCount = order.items.length;
        const totalAmount = order.totalAmount || 0;

        return `
            <tr data-order-id="${order._id}">
                <td><strong>#${order._id.substring(0, 8)}</strong></td>
                <td>
                    ${order.customerName || order.user?.name || 'N/A'}<br>
                    <small style="color: #666;">${order.customerEmail || order.user?.email || ''}</small>
                </td>
                <td>${itemsCount} item(s)</td>
                <td><strong>₹${totalAmount.toFixed(2)}</strong></td>
                <td>${statusBadge}</td>
                <td>
                    <small>${order.paymentMethod?.toUpperCase() || 'UPI'}</small><br>
                    <small style="color: #666;">${order.upiTransactionId || 'N/A'}</small>
                </td>
                <td><small>${date}</small></td>
                <td>
                    ${order.status === 'pending_verification' ? `
                        <button class="btn btn-sm btn-success" onclick="viewOrderDetails('${order._id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="verifyOrder('${order._id}')" title="Approve">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="rejectOrder('${order._id}')" title="Reject">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-secondary" onclick="viewOrderDetails('${order._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    `}
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${ordersHTML}
            </tbody>
        </table>
    `;
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'pending_verification': '<span class="badge badge-warning">Pending</span>',
        'verified': '<span class="badge badge-success">Verified</span>',
        'rejected': '<span class="badge badge-danger">Rejected</span>',
        'completed': '<span class="badge badge-info">Completed</span>'
    };
    return badges[status] || '<span class="badge badge-secondary">Unknown</span>';
}

// Update order statistics
function updateOrderStats(orders) {
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending_verification').length,
        verified: orders.filter(o => o.status === 'verified').length,
        rejected: orders.filter(o => o.status === 'rejected').length,
        totalRevenue: orders
            .filter(o => o.status === 'verified')
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };

    // Update stat cards if they exist
    const pendingEl = document.getElementById('pending-orders-count');
    const verifiedEl = document.getElementById('verified-orders-count');
    const revenueEl = document.getElementById('total-revenue');

    if (pendingEl) pendingEl.textContent = stats.pending;
    if (verifiedEl) verifiedEl.textContent = stats.verified;
    if (revenueEl) revenueEl.textContent = `₹${stats.totalRevenue.toFixed(2)}`;
}

// View order details
async function viewOrderDetails(orderId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        const order = data.data.orders.find(o => o._id === orderId);

        if (!order) {
            showError('Order not found');
            return;
        }

        // Create modal with order details
        const modalHTML = `
            <div class="modal" id="orderDetailsModal" style="display: block;">
                <div class="modal-content" style="max-width: 700px;">
                    <span class="close" onclick="closeOrderModal()">&times;</span>
                    <h2>Order Details #${order._id.substring(0, 8)}</h2>
                    
                    <div style="margin: 2rem 0;">
                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ${order.customerName || order.user?.name}</p>
                        <p><strong>Email:</strong> ${order.customerEmail || order.user?.email}</p>
                        <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
                    </div>

                    <div style="margin: 2rem 0;">
                        <h3>Order Items</h3>
                        ${order.items.map(item => `
                            <div style="padding: 1rem; background: #f5f5f5; margin: 0.5rem 0; border-radius: 5px;">
                                <p><strong>${item.productName}</strong></p>
                                <p>Type: ${item.productType} | Price: ₹${item.price} | Qty: ${item.quantity || 1}</p>
                            </div>
                        `).join('')}
                    </div>

                    <div style="margin: 2rem 0;">
                        <h3>Payment Information</h3>
                        <p><strong>Method:</strong> ${order.paymentMethod?.toUpperCase() || 'UPI'}</p>
                        <p><strong>Transaction ID:</strong> ${order.upiTransactionId || 'N/A'}</p>
                        <p><strong>Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
                        <p><strong>Status:</strong> ${getStatusBadge(order.status)}</p>
                        ${order.paymentScreenshot ? `
                            <p><strong>Screenshot:</strong> <a href="${order.paymentScreenshot}" target="_blank">View Payment Screenshot</a></p>
                        ` : ''}
                    </div>

                    ${order.status === 'pending_verification' ? `
                        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                            <button class="btn btn-success" onclick="verifyOrder('${order._id}'); closeOrderModal();">
                                <i class="fas fa-check"></i> Verify Order
                            </button>
                            <button class="btn btn-danger" onclick="rejectOrder('${order._id}'); closeOrderModal();">
                                <i class="fas fa-times"></i> Reject Order
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        console.error('Error viewing order:', error);
        showError('Failed to load order details');
    }
}

// Close order modal
function closeOrderModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) modal.remove();
}

// Verify order
async function verifyOrder(orderId) {
    if (!confirm('Are you sure you want to verify this order? Products will be added to user\'s account.')) {
        return;
    }

    try {
        showLoading('Verifying order...');
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE}/admin/orders/${orderId}/verify`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.status === 'success') {
            showSuccess('Order verified successfully! Products added to user account.');
            loadOrders(); // Reload orders
        } else {
            throw new Error(data.message || 'Failed to verify order');
        }
    } catch (error) {
        console.error('Error verifying order:', error);
        showError('Failed to verify order: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Reject order
async function rejectOrder(orderId) {
    const reason = prompt('Enter rejection reason (optional):');
    
    if (reason === null) return; // User cancelled

    try {
        showLoading('Rejecting order...');
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE}/admin/orders/${orderId}/reject`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: reason || 'Payment verification failed' })
        });

        const data = await response.json();

        if (data.status === 'success') {
            showSuccess('Order rejected successfully');
            loadOrders(); // Reload orders
        } else {
            throw new Error(data.message || 'Failed to reject order');
        }
    } catch (error) {
        console.error('Error rejecting order:', error);
        showError('Failed to reject order: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Filter orders by status
function filterOrders(status) {
    loadOrders(status);
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Utility functions
function showLoading(message = 'Loading...') {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.textContent = message;
        loading.style.display = 'flex';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

function showError(message) {
    alert('Error: ' + message);
}

function showSuccess(message) {
    alert(message);
}

// Export functions for global access
window.loadOrders = loadOrders;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderModal = closeOrderModal;
window.verifyOrder = verifyOrder;
window.rejectOrder = rejectOrder;
window.filterOrders = filterOrders;

// Auto-load orders when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the orders page
    if (document.getElementById('orders-list')) {
        loadOrders();
    }
});
