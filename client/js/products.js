// Products.js - Product management functions

let allProducts = [];

// Enhanced product loading with search and filtering
async function loadAllProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            allProducts = data.data.products;
            return allProducts;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error loading all products:', error);
        // Return sample data as fallback
        return getSampleProducts();
    }
}

// Get sample products (fallback)
function getSampleProducts() {
    return [
        {
            _id: '1',
            name: 'Network Vulnerability Scanner',
            description: 'Advanced Python script to identify network vulnerabilities and security gaps.',
            price: 49.99,
            category: 'script',
            level: 'intermediate',
            image: 'fas fa-network-wired',
            tags: ['network', 'security', 'python', 'vulnerability']
        },
        {
            _id: '2',
            name: 'Penetration Testing Toolkit',
            description: 'Comprehensive Bash script collection for ethical hacking and penetration testing.',
            price: 79.99,
            category: 'script',
            level: 'advanced',
            image: 'fas fa-user-secret',
            tags: ['pentesting', 'ethical-hacking', 'bash', 'security']
        },
        {
            _id: '3',
            name: 'Cloud Security Auditor',
            description: 'AWS & Azure security assessment scripts to identify misconfigurations.',
            price: 64.99,
            category: 'script',
            level: 'intermediate',
            image: 'fas fa-cloud',
            tags: ['cloud', 'aws', 'azure', 'security', 'audit']
        },
        {
            _id: '4',
            name: 'Web Application Firewall',
            description: 'Python-based WAF for protecting web applications from common attacks.',
            price: 89.99,
            category: 'script',
            level: 'advanced',
            image: 'fas fa-shield-alt',
            tags: ['web', 'firewall', 'security', 'python']
        },
        {
            _id: '5',
            name: 'Encryption Toolkit',
            description: 'Collection of encryption/decryption scripts for secure data handling.',
            price: 39.99,
            category: 'script',
            level: 'beginner',
            image: 'fas fa-lock',
            tags: ['encryption', 'security', 'crypto']
        }
    ];
}

// Search products
function searchProducts(query) {
    if (!query.trim()) return allProducts;
    
    const lowerQuery = query.toLowerCase();
    return allProducts.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
}

// Filter products by multiple criteria
function filterProducts(filters = {}) {
    let filtered = [...allProducts];
    
    if (filters.category) {
        filtered = filtered.filter(product => product.category === filters.category);
    }
    
    if (filters.level && filters.level !== 'all') {
        filtered = filtered.filter(product => product.level === filters.level);
    }
    
    if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(product => 
            product.tags && filters.tags.some(tag => product.tags.includes(tag))
        );
    }
    
    if (filters.minPrice) {
        filtered = filtered.filter(product => product.price >= filters.minPrice);
    }
    
    if (filters.maxPrice) {
        filtered = filtered.filter(product => product.price <= filters.maxPrice);
    }
    
    return filtered;
}

// Get product by ID
function getProductById(productId) {
    return allProducts.find(product => product._id === productId);
}

// Initialize products search and filter
function initializeProductsSearch() {
    const searchInput = document.getElementById('products-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value;
            const filteredProducts = searchProducts(query);
            renderProducts(filteredProducts, 'scripts-grid');
        });
    }
}

// Export functions
window.searchProducts = searchProducts;
window.filterProducts = filterProducts;
window.getProductById = getProductById;
window.initializeProductsSearch = initializeProductsSearch;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    await loadAllProducts();
    initializeProductsSearch();
});
