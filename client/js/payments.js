// Payments.js - Payment processing functions

let currentProduct = null;
let cartItems = [];

// Open payment modal for single product
function openPaymentModal(productId) {
    if (!isLoggedIn()) {
        showNotification('Please login to make a purchase', 'warning');
        openLoginModal();
        return;
    }

    const product = getProductById(productId);
    if (product) {
        currentProduct = product;
        showPaymentModal([product]);
    }
}

// Open cart payment modal
function openCartPaymentModal() {
    if (!isLoggedIn()) {
        showNotification('Please login to checkout', 'warning');
        openLoginModal();
        return;
    }

    if (cartItems.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }

    showPaymentModal(cartItems);
}

// Show payment modal
function showPaymentModal(products) {
    const modal = document.getElementById('paymentModal');
    const content = document.getElementById('payment-content');
    
    const totalAmount = products.reduce((sum, product) => sum + product.price, 0);
    
    content.innerHTML = `
        <div class="payment-header">
            <h3>Complete Your Purchase</h3>
            <p>Total Amount: <strong>$${totalAmount.toFixed(2)}</strong></p>
        </div>
        
        <div class="payment-products">
            ${products.map(product => `
                <div class="payment-product-item">
                    <i class="${product.image}"></i>
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p>$${product.price}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <form id="paymentForm" class="payment-form">
            <div class="form-group">
                <label for="cardNumber">Card Number</label>
                <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" required 
                       pattern="[0-9\s]{13,19}" maxlength="19">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="expiryDate">Expiry Date</label>
                    <input type="text" id="expiryDate" placeholder="MM/YY" required 
                           pattern="(0[1-9]|1[0-2])\/[0-9]{2}">
                </div>
                <div class="form-group">
                    <label for="cvc">CVC</label>
                    <input type="text" id="cvc" placeholder="123" required 
                           pattern="[0-9]{3,4}" maxlength="4">
                </div>
            </div>
            
            <div class="form-group">
                <label for="cardName">Name on Card</label>
                <input type="text" id="cardName" placeholder="John Doe" required>
            </div>
            
            <div class="form-group">
                <label for="billingEmail">Billing Email</label>
                <input type="email" id="billingEmail" placeholder="your@email.com" required 
                       value="${currentUser?.email || ''}">
            </div>
            
            <button type="submit" class="btn btn-primary btn-full payment-btn">
                <i class="fas fa-lock"></i> Pay $${totalAmount.toFixed(2)}
            </button>
            
            <p class="payment-security">
                <i class="fas fa-shield-alt"></i> Your payment is secure and encrypted
            </p>
        </form>
    `;

    modal.style.display = 'block';
    
    // Add form validation
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmission);
    }
    
    // Format card number input
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    // Format expiry date input
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }
}

// Close payment modal
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    currentProduct = null;
}

// Format card number with spaces
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
        e.target.value = parts.join(' ');
    } else {
        e.target.value = value;
    }
}

// Format expiry date
function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    e.target.value = value;
}

// Handle payment form submission
async function handlePaymentSubmission(e) {
    e.preventDefault();
    
    if (!validatePaymentForm()) {
        showNotification('Please check your payment details', 'error');
        return;
    }

    try {
        showLoading();
        
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful payment
        showNotification('Payment successful! Your products are available for download.', 'success');
        
        // Clear cart
        cartItems = [];
        updateCartCount();
        
        closePaymentModal();
        
        // In real app, you would redirect to download page or show success page
        setTimeout(() => {
            showNotification('Check your email for download instructions', 'info');
        }, 1000);
        
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('Payment failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Validate payment form
function validatePaymentForm() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiryDate').value;
    const cvc = document.getElementById('cvc').value;
    const cardName = document.getElementById('cardName').value;
    const billingEmail = document.getElementById('billingEmail').value;
    
    // Basic validation
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        return false;
    }
    
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiryDate)) {
        return false;
    }
    
    if (!/^[0-9]{3,4}$/.test(cvc)) {
        return false;
    }
    
    if (!cardName.trim()) {
        return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail)) {
        return false;
    }
    
    return true;
}

// Check if user is logged in
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// Global functions
window.openPaymentModal = openPaymentModal;
window.openCartPaymentModal = openCartPaymentModal;
window.closePaymentModal = closePaymentModal;
