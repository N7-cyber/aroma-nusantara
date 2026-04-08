/* --------------------------------------------------------------------------
    DATA PRODUK DUMMY
    -------------------------------------------------------------------------- */
const productsData = [
    {
        id: 1,
        name: "Aceh Gayo Arabica",
        category: "biji",
        desc: "Notes of chocolate, dark caramel, and floral hint. Body tebal dengan acidity rendah.",
        price: 85000,
        img: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        bestSeller: true
    },
    {
        id: 2,
        name: "Bali Kintamani Arabica",
        category: "biji",
        desc: "Karakteristik fruity dengan dominasi citrus/jeruk. Clean aftertaste.",
        price: 90000,
        img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        bestSeller: false
    },
    {
        id: 3,
        name: "Toraja Sapan House Blend",
        category: "bubuk",
        desc: "Bubuk kopi siap seduh. Cita rasa rempah yang kaya, earthy, dengan hint of dark chocolate.",
        price: 75000,
        img: "https://images.unsplash.com/photo-1610632380989-680fe40816c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        bestSeller: true
    },
    {
        id: 4,
        name: "Nusantara Signature Espresso",
        category: "signature",
        desc: "Blend khusus 70% Arabica 30% Robusta. Crema tebal, sangat cocok untuk kopi susu gula aren.",
        price: 110000,
        img: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        bestSeller: true
    },
    {
        id: 5,
        name: "Flores Bajawa",
        category: "biji",
        desc: "Aroma nutty, karamel, dipadukan dengan wangi cokelat dan sedikit tembakau.",
        price: 88000,
        img: "https://images.unsplash.com/photo-1551030173-122aabc4489c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        bestSeller: false
    },
    
        // GANTI OBJEK INI DI DALAM productsData PADA FILE script.js
{
    id: 6,
    name: "Java Preanger Peaberry",
    category: "biji",
    desc: "Biji kopi lanang langka. Rasa lebih intens, manis natural, dengan acidity yang seimbang.",
    price: 125000,
    img: "https://th.bing.com/th/id/OIP.bm9g7EGfjZoVIfbrKpgbigHaFW?w=234&h=180&c=7&r=0&o=7&pid=1.7&rm=3", // URL BARU SUDAH TERPASANG
    bestSeller: false
}
];

/* --------------------------------------------------------------------------
    STATE MANAGEMENT (CART & WISHLIST) - WITH ERROR HANDLING
    -------------------------------------------------------------------------- */
let cart = [];
let wishlist = [];
const phoneWA = "6281234567890"; // Ganti dengan nomor WA UMKM

// Safe localStorage access
function safeLocalStorageGet(key, defaultValue = []) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.warn(`Error reading ${key} from localStorage:`, e);
        return defaultValue;
    }
}

function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`Error saving ${key} to localStorage:`, e);
    }
}

// Initialize state with error handling
try {
    cart = safeLocalStorageGet('aroma_cart', []);
    wishlist = safeLocalStorageGet('aroma_wishlist', []);
} catch (e) {
    console.error('Error initializing state:', e);
    cart = [];
    wishlist = [];
}

/* --------------------------------------------------------------------------
    DOM ELEMENTS - WITH NULL CHECKS
    -------------------------------------------------------------------------- */
const productGrid = document.getElementById('productGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const cartBadge = document.getElementById('cartBadge');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalAmt = document.getElementById('cartTotalAmt');
const cartEmptyMsg = document.getElementById('cartEmptyMsg');
const cartOverlay = document.getElementById('cartOverlay');
const cartSidebar = document.getElementById('cartSidebar');
const cartOpenBtn = document.getElementById('cartOpenBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');

// Check critical elements
if (!productGrid) console.error('Critical: productGrid element not found');
if (!cartBadge) console.error('Critical: cartBadge element not found');
if (!cartItemsContainer) console.error('Critical: cartItemsContainer element not found');
if (!cartTotalAmt) console.error('Critical: cartTotalAmt element not found');
if (!cartEmptyMsg) console.error('Critical: cartEmptyMsg element not found');

/* --------------------------------------------------------------------------
    FORMAT CURRENCY RUPIAH
    -------------------------------------------------------------------------- */
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

/* --------------------------------------------------------------------------
    RENDER PRODUCTS FUNCTION - WITH ERROR HANDLING & FALLBACKS
    -------------------------------------------------------------------------- */
function renderProducts(filterType = 'all') {
    if (!productGrid) {
        console.error('Cannot render products: productGrid not found');
        return;
    }
    
    productGrid.innerHTML = ''; // Clear existing
    
    let filteredProducts = productsData;
    if (filterType === 'bestseller') {
        filteredProducts = productsData.filter(p => p && p.bestSeller);
    } else if (filterType !== 'all') {
        filteredProducts = productsData.filter(p => p && p.category === filterType);
    }

    // Validate products data
    if (!Array.isArray(filteredProducts)) {
        console.error('Products data is not an array');
        return;
    }

    // Animate fade-in
    filteredProducts.forEach((product, index) => {
        // Validate product object
        if (!product || !product.id || !product.name) {
            console.warn('Invalid product data:', product);
            return;
        }
        
        const isWished = wishlist.includes(product.id) ? 'active' : '';
        const bestSellerBadge = product.bestSeller ? `<span class="badge-bestseller">Best Seller</span>` : '';
        
        const card = document.createElement('div');
        card.className = 'product-card reveal active'; // Keep active because it's re-rendered
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Safe image src with fallback
        const imgSrc = product.img || 'https://via.placeholder.com/280x260?text=No+Image';
        
        card.innerHTML = `
            ${bestSellerBadge}
            <button class="btn-wishlist ${isWished}" onclick="toggleWishlist(${product.id}, this)">
                <i class="fas fa-heart"></i>
            </button>
            <div class="product-img-wrapper">
                <img src="${imgSrc}" alt="${product.name || 'Product Image'}" onerror="this.src='https://via.placeholder.com/280x260?text=Image+Error'">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category || 'N/A'}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.desc || 'No description available'}</p>
                <div class="product-footer">
                    <span class="product-price">${formatRupiah(product.price || 0)}</span>
                    <button class="btn-add-cart" onclick="addToCart(${product.id})" title="Tambah ke Keranjang">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

/* --------------------------------------------------------------------------
    FILTER LOGIC
    -------------------------------------------------------------------------- */
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        btn.classList.add('active');
        // Render
        renderProducts(btn.getAttribute('data-filter'));
    });
});

/* --------------------------------------------------------------------------
    WISHLIST LOGIC
    -------------------------------------------------------------------------- */
window.toggleWishlist = function(id, btnElement) {
    const index = wishlist.indexOf(id);
    if (index > -1) {
        wishlist.splice(index, 1);
        btnElement.classList.remove('active');
    } else {
        wishlist.push(id);
        btnElement.classList.add('active');
        // Optional: Show tiny toast notification
    }
    localStorage.setItem('aroma_wishlist', JSON.stringify(wishlist));
};

/* --------------------------------------------------------------------------
    CART LOGIC - WITH ERROR HANDLING
    -------------------------------------------------------------------------- */
window.addToCart = function(id) {
    if (!id || typeof id !== 'number') {
        console.error('Invalid product ID:', id);
        return;
    }
    
    const product = productsData.find(p => p && p.id === id);
    if (!product) {
        console.error('Product not found:', id);
        alert('Produk tidak ditemukan. Silakan refresh halaman.');
        return;
    }
    
    const existingItem = cart.find(item => item && item.id === id);
    
    if (existingItem) {
        existingItem.qty = (existingItem.qty || 1) + 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    
    saveCart();
    updateCartUI();
    
    // Open sidebar automatically
    if (cartOverlay && cartSidebar) {
        cartOverlay.classList.add('active');
        cartSidebar.classList.add('active');
    }
};

window.updateQty = function(id, change) {
    if (!id || typeof change !== 'number') {
        console.error('Invalid parameters for updateQty:', id, change);
        return;
    }
    
    const item = cart.find(i => i && i.id === id);
    if (item) {
        item.qty = Math.max(0, (item.qty || 1) + change);
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartUI();
        }
    }
};

window.removeFromCart = function(id) {
    if (!id) {
        console.error('Invalid ID for removeFromCart:', id);
        return;
    }
    
    cart = cart.filter(item => item && item.id !== id);
    saveCart();
    updateCartUI();
};

function saveCart() {
    safeLocalStorageSet('aroma_cart', cart);
}

function updateCartUI() {
    if (!cartBadge || !cartItemsContainer || !cartTotalAmt || !cartEmptyMsg || !checkoutBtn) {
        console.error('Critical cart UI elements missing');
        return;
    }
    
    // Update Badge
    const totalItems = cart.reduce((sum, item) => sum + (item && item.qty ? item.qty : 0), 0);
    cartBadge.innerText = totalItems;
    
    // Clear items
    const itemsNode = document.querySelectorAll('.cart-item');
    itemsNode.forEach(n => n && n.remove());

    if (!cart || cart.length === 0) {
        cartEmptyMsg.style.display = 'block';
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.pointerEvents = 'none';
        cartTotalAmt.innerText = formatRupiah(0);
        return;
    }

    cartEmptyMsg.style.display = 'none';
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.pointerEvents = 'auto';

    let total = 0;
    cart.forEach(item => {
        if (!item || !item.id || !item.name) {
            console.warn('Invalid cart item:', item);
            return;
        }
        
        const qty = item.qty || 1;
        const price = item.price || 0;
        total += (price * qty);
        
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${item.img || 'https://via.placeholder.com/80x80?text=No+Img'}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/80x80?text=Error'">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${formatRupiah(price)}</div>
                <div class="cart-item-actions">
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                        <span class="qty-input">${qty}</span>
                        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Hapus</button>
                </div>
            </div>
        `;
        // Insert before empty msg
        cartItemsContainer.insertBefore(itemEl, cartEmptyMsg);
    });

    cartTotalAmt.innerText = formatRupiah(total);
}

// Sidebar Toggles
if (cartOpenBtn) {
    cartOpenBtn.addEventListener('click', () => {
        if (cartOverlay) cartOverlay.classList.add('active');
        if (cartSidebar) cartSidebar.classList.add('active');
    });
}

if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
        if (cartOverlay) cartOverlay.classList.remove('active');
        if (cartSidebar) cartSidebar.classList.remove('active');
    });
}

if (cartOverlay) {
    cartOverlay.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
        if (cartSidebar) cartSidebar.classList.remove('active');
    });
}

// Touch swipe gesture for cart sidebar on mobile
if (cartSidebar) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    cartSidebar.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    cartSidebar.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    const handleSwipe = () => {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        // Swiped left (closing cart)
        if (diff > swipeThreshold) {
            if (cartOverlay) cartOverlay.classList.remove('active');
            cartSidebar.classList.remove('active');
        }
    };
}

/* --------------------------------------------------------------------------
    WHATSAPP CHECKOUT LOGIC - WITH VALIDATION
    -------------------------------------------------------------------------- */
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (!cart || cart.length === 0) {
            alert('Keranjang kosong. Tambahkan produk terlebih dahulu.');
            return;
        }

        if (!phoneWA || phoneWA.length < 10) {
            alert('Nomor WhatsApp belum diatur. Silakan hubungi admin.');
            console.error('Invalid WhatsApp number:', phoneWA);
            return;
        }

        let message = "Halo *Aroma Nusantara*, saya ingin memesan produk berikut:\n\n";
        let totalOrder = 0;

        cart.forEach((item, index) => {
            if (!item || !item.name || !item.price) {
                console.warn('Invalid item in cart:', item);
                return;
            }
            
            const qty = item.qty || 1;
            const subtotal = item.price * qty;
            totalOrder += subtotal;
            message += `${index + 1}. *${item.name}*\n   ${qty} x ${formatRupiah(item.price)} = ${formatRupiah(subtotal)}\n\n`;
        });

        if (totalOrder <= 0) {
            alert('Total pesanan tidak valid.');
            return;
        }

        message += `*Total Belanja: ${formatRupiah(totalOrder)}*\n\n`;
        message += "Mohon informasi ketersediaan barang dan total ongkos kirim. Terima kasih!";

        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://api.whatsapp.com/send?phone=${phoneWA}&text=${encodedMessage}`;
        
        try {
            window.open(waUrl, '_blank');
        } catch (e) {
            console.error('Error opening WhatsApp:', e);
            alert('Gagal membuka WhatsApp. Silakan coba lagi.');
        }
    });
} else {
    console.error('Checkout button not found');
}

/* --------------------------------------------------------------------------
    DARK MODE TOGGLE - WITH ERROR HANDLING
    -------------------------------------------------------------------------- */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
        
// Cek preference dengan safe access
const currentTheme = safeLocalStorageGet('aroma_theme', null);
if (currentTheme && document.documentElement) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark' && themeIcon) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        if (!document.documentElement) return;
        
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            safeLocalStorageSet('aroma_theme', 'light');
            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            safeLocalStorageSet('aroma_theme', 'dark');
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
        }
    });
} else {
    console.warn('Theme toggle button not found');
}

/* --------------------------------------------------------------------------
    MOBILE MENU TOGGLE & STICKY NAVBAR - WITH ERROR HANDLING
    -------------------------------------------------------------------------- */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const header = document.getElementById('navbar');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        }
    });

    // Close mobile menu when clicking link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) icon.classList.replace('fa-times', 'fa-bars');
        });
    });
} else {
    console.warn('Mobile menu elements not found');
}

window.addEventListener('scroll', () => {
    // Sticky Navbar Style
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Update Active Link based on scroll
    let current = '';
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });

    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href').includes(current)) {
                li.classList.add('active');
            }
        });
    }
}, { passive: true });

/* --------------------------------------------------------------------------
    SCROLL REVEAL ANIMATION (INTERSECTION OBSERVER)
    -------------------------------------------------------------------------- */
const revealElements = document.querySelectorAll('.reveal');
        
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Hanya animasi sekali
        }
    });
}, {
    root: null,
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
});

revealElements.forEach(el => revealObserver.observe(el));

/* --------------------------------------------------------------------------
    CUSTOM CURSOR LOGIC - WITH ERROR HANDLING & MOBILE DETECTION
    -------------------------------------------------------------------------- */
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

// Detect mobile/touch device
const isTouchDevice = () => {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
};

if (cursorDot && cursorOutline && !isTouchDevice()) {
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows exactly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Outline follows with slight delay (animation effect)
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Hover effect on interactable elements
    const hoverElements = document.querySelectorAll('a, button, .product-card, .contact-item');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });
} else {
    console.warn('Custom cursor disabled - touch device detected');
}

/* --------------------------------------------------------------------------
    NEWSLETTER FORM VALIDATION - MOBILE OPTIMIZED
    -------------------------------------------------------------------------- */
const newsletterInputs = document.querySelectorAll('input[type="email"]');
const newsletterBtns = document.querySelectorAll('.footer-grid button[type="submit"], .footer-grid > div:last-child button');

// Find newsletter input and button more reliably
let newsletterForm = null;
let newsletterBtn = null;

// Try to find them by traversing footer grid
const footerGrids = document.querySelectorAll('.footer-grid > div');
if (footerGrids.length > 0) {
    const lastDiv = footerGrids[footerGrids.length - 1];
    newsletterForm = lastDiv.querySelector('input[type="email"]');
    newsletterBtn = lastDiv.querySelector('button');
}

if (newsletterForm && newsletterBtn) {
    // Prevent form submission and zoom on iOS
    newsletterForm.setAttribute('inputmode', 'email');
    newsletterForm.setAttribute('autocomplete', 'email');
    
    const submitNewsletter = () => {
        const email = newsletterForm.value.trim();
        
        if (!email) {
            alert('Email tidak boleh kosong.');
            newsletterForm.focus();
            return;
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Format email tidak valid.');
            newsletterForm.focus();
            return;
        }
        
        // Simulate subscription (replace with actual API call)
        alert('Terima kasih! Email Anda telah terdaftar untuk newsletter.');
        newsletterForm.value = '';
    };
    
    newsletterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        submitNewsletter();
    });
    
    // Allow Enter key submission
    newsletterForm.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitNewsletter();
        }
    });
} else {
    console.warn('Newsletter form elements not found');
}
/* --------------------------------------------------------------------------
    INITIALIZATION & PRELOADER
    -------------------------------------------------------------------------- */
window.onload = () => {
    // Sembunyikan preloader setelah halaman dimuat
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 800); // Artificial delay 0.8s for premium feel

    // Render awal
    renderProducts();
    updateCartUI();
};