// ==========================================
// COFFEECRAFT - MODERN JAVASCRIPT
// ==========================================

'use strict';

// Configuración
const CONFIG = {
    ANIMATION_DELAY: 100,
    NOTIFICATION_DURATION: 2500,
    SCROLL_OFFSET: 80,
    COUNTER_SPEED: 2000
};

// Estado de la aplicación
const state = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    currentFilter: 'todos',
    isMenuOpen: false,
    isCartOpen: false
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Ocultar loader
    hidePageLoader();
    
    // Inicializar componentes
    initProducts();
    initCart();
    initNavigation();
    initFilters();
    initScrollEffects();
    initAnimations();
    initContactForm();
    initScrollToTop();
    
    console.log('✅ CoffeeCraft initialized successfully');
}

// ==========================================
// PAGE LOADER
// ==========================================

function hidePageLoader() {
    const loader = document.querySelector('.page-loader');
    setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 1000);
}

// ==========================================
// PRODUCTOS
// ==========================================

function initProducts() {
    displayProducts();
}

function displayProducts(filter = 'todos') {
    const container = document.getElementById('productos-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const filteredProducts = filter === 'todos' 
        ? productos 
        : productos.filter(p => p.categoria === filter);
    
    filteredProducts.forEach((producto, index) => {
        const card = createProductCard(producto);
        card.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(card);
    });
    
    // Observar animaciones
    observeElements('.product-card');
}

function createProductCard(producto) {
    const card = document.createElement('div');
    card.className = 'product-card animate-on-scroll';
    card.dataset.category = producto.categoria;
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
        </div>
        <div class="product-info">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <div class="product-price">
                <span class="price">$${producto.precio.toFixed(2)}</span>
                <button class="add-to-cart" data-id="${producto.id}" aria-label="Añadir ${producto.nombre} al carrito">
                    <span>Añadir</span>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `;
    
    // Event listener
    const btn = card.querySelector('.add-to-cart');
    btn.addEventListener('click', () => addToCart(producto.id));
    
    return card;
}

// ==========================================
// FILTROS
// ==========================================

function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            
            // Actualizar estado activo
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filtrar productos
            state.currentFilter = filter;
            displayProducts(filter);
        });
    });
}

// ==========================================
// CARRITO
// ==========================================

function initCart() {
    updateCartUI();
    
    // Event listeners
    document.querySelector('.cart-icon').addEventListener('click', openCart);
    document.querySelector('.close-cart').addEventListener('click', closeCart);
    document.querySelector('.cart-overlay')?.addEventListener('click', closeCart);
    document.querySelector('.clear-cart').addEventListener('click', clearCart);
    document.querySelector('.checkout-btn').addEventListener('click', checkout);
}

function addToCart(productId) {
    const producto = productos.find(p => p.id === productId);
    if (!producto) return;
    
    const existingItem = state.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({
            ...producto,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification('✓ Producto añadido al carrito', 'success');
    
    // Animación del ícono del carrito
    animateCartIcon();
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showNotification('Producto eliminado', 'info');
}

function updateQuantity(productId, change) {
    const item = state.cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartUI();
    }
}

function clearCart() {
    if (state.cart.length === 0) return;
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        state.cart = [];
        saveCart();
        updateCartUI();
        showNotification('Carrito vaciado', 'info');
    }
}

function checkout() {
    if (state.cart.length === 0) {
        showNotification('⚠ Por favor, agrega productos al carrito antes de finalizar la compra', 'warning');
        return;
    }
    
    const total = calculateTotal();
    const message = `¡Gracias por tu compra! Total: $${total.toFixed(2)}`;
    
    showNotification(message, 'success');
    
    // Limpiar carrito
    setTimeout(() => {
        state.cart = [];
        saveCart();
        updateCartUI();
        closeCart();
    }, 2000);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
}

function updateCartUI() {
    updateCartCount();
    updateCartModal();
}

function updateCartCount() {
    const count = state.cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        if (count > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    }
}

function updateCartModal() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (state.cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
                <i class="fas fa-shopping-cart" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p style="font-size: 1.125rem;">Tu carrito está vacío</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">¡Añade productos para comenzar!</p>
            </div>
        `;
        updateCartTotal(0);
        return;
    }
    
    state.cart.forEach(item => {
        const cartItem = createCartItem(item);
        container.appendChild(cartItem);
    });
    
    updateCartTotal(calculateTotal());
}

function createCartItem(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    
    const itemTotal = item.precio * item.quantity;
    
    div.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.imagen}" alt="${item.nombre}">
        </div>
        <div class="cart-item-info">
            <h4>${item.nombre}</h4>
            <p class="cart-item-price">$${item.precio.toFixed(2)}</p>
            <button class="cart-item-remove" data-id="${item.id}">
                <i class="fas fa-trash"></i> Eliminar
            </button>
            <div class="cart-item-quantity">
                <button class="decrement" data-id="${item.id}" aria-label="Disminuir cantidad">
                    <i class="fas fa-minus"></i>
                </button>
                <span>${item.quantity}</span>
                <button class="increment" data-id="${item.id}" aria-label="Aumentar cantidad">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `;
    
    // Event listeners
    div.querySelector('.cart-item-remove').addEventListener('click', (e) => {
        removeFromCart(parseInt(e.currentTarget.dataset.id));
    });
    
    div.querySelector('.increment').addEventListener('click', (e) => {
        updateQuantity(parseInt(e.currentTarget.dataset.id), 1);
    });
    
    div.querySelector('.decrement').addEventListener('click', (e) => {
        updateQuantity(parseInt(e.currentTarget.dataset.id), -1);
    });
    
    return div;
}

function calculateTotal() {
    return state.cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
}

function updateCartTotal(total) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    
    if (subtotalEl) subtotalEl.textContent = `$${total.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function openCart() {
    const modal = document.querySelector('.cart-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        state.isCartOpen = true;
    }
}

function closeCart() {
    const modal = document.querySelector('.cart-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        state.isCartOpen = false;
    }
}

function animateCartIcon() {
    const icon = document.querySelector('.cart-icon');
    if (icon) {
        icon.style.animation = 'none';
        setTimeout(() => {
            icon.style.animation = 'bounce 0.5s ease';
        }, 10);
    }
}

// ==========================================
// NAVEGACIÓN
// ==========================================

function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('nav ul');
    const header = document.querySelector('header');
    
    // Mobile menu toggle
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            state.isMenuOpen = !state.isMenuOpen;
            
            // Cambiar ícono
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.className = state.isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
            }
        });
    }
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                const offsetTop = target.offsetTop - CONFIG.SCROLL_OFFSET;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Cerrar menú móvil
                if (navMenu) navMenu.classList.remove('active');
                state.isMenuOpen = false;
            }
        });
    });
    
    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
        
        // Cerrar menú al hacer scroll
        if (state.isMenuOpen && Math.abs(currentScroll - lastScroll) > 50) {
            navMenu?.classList.remove('active');
            state.isMenuOpen = false;
        }
        
        lastScroll = currentScroll;
    });
}

// ==========================================
// SCROLL EFFECTS
// ==========================================

function initScrollEffects() {
    // Scroll to top button
    const scrollBtn = document.getElementById('scrollToTop');
    
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 500) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ==========================================
// ANIMACIONES
// ==========================================

function initAnimations() {
    // Animate stats on scroll
    const stats = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element) => {
        const target = parseInt(element.dataset.target);
        const duration = CONFIG.COUNTER_SPEED;
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => statsObserver.observe(stat));
    
    // Observe scroll animations
    observeElements('.animate-on-scroll');
}

function observeElements(selector) {
    const elements = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => observer.observe(el));
}

// ==========================================
// CONTACT FORM
// ==========================================

function initContactForm() {
    const form = document.getElementById('contact-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Aquí iría la lógica de envío real
            showNotification('✓ ¡Mensaje enviado con éxito! Te responderemos pronto.', 'success');
            
            // Limpiar formulario
            form.reset();
        });
    }
}

// ==========================================
// NOTIFICACIONES
// ==========================================

function showNotification(message, type = 'success') {
    // Remover notificaciones anteriores
    const existing = document.querySelectorAll('.cart-notification, .empty-cart-notification');
    existing.forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = type === 'warning' ? 'empty-cart-notification' : 'cart-notification';
    
    if (type === 'warning') {
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    } else {
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
    }
    
    document.body.appendChild(notification);
    
    // Mostrar
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Ocultar y remover
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, CONFIG.NOTIFICATION_DURATION);
}

// ==========================================
// UTILIDADES
// ==========================================

// Cerrar modales con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (state.isCartOpen) closeCart();
        if (state.isMenuOpen) {
            const navMenu = document.querySelector('nav ul');
            navMenu?.classList.remove('active');
            state.isMenuOpen = false;
        }
    }
});

// Prevenir scroll cuando el carrito está abierto
window.addEventListener('scroll', () => {
    if (state.isCartOpen) {
        document.body.style.overflow = 'hidden';
    }
});

// Log de errores
window.addEventListener('error', (e) => {
    console.error('Error en CoffeeCraft:', e.error);
});

// Performance monitoring (desarrollo)
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                        window.performance.timing.navigationStart;
        console.log(`⚡ Página cargada en ${loadTime}ms`);
    });
}
