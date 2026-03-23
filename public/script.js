// Cart Function Commands
// This app now persists cart entirely in MongoDB; client localStorage cart is deprecated.

document.addEventListener('DOMContentLoaded', () => {
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');

    addToCartForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = form.getAttribute('action');
            const body = new URLSearchParams(new FormData(form)).toString();

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || 'Server error');
                }

                const data = await response.json();
                if (data.success) {
                    if (data.cartCount !== undefined) {
                        updateCartCount(data.cartCount);
                    }
                    showToast(data.message || 'Added to cart', 'success');
                } else {
                    showToast(data.error || 'Unable to add to cart', 'error');
                }
            } catch (err) {
                showToast(`Add to cart failed: ${err.message}`, 'error');
            }
        });
    });

    function updateCartCount(count) {
        let badge = document.querySelector('.cart-count');
        if (!badge) {
            const cartLink = document.querySelector('a[href*="/cart/"]');
            if (cartLink) {
                badge = document.createElement('div');
                badge.className = 'cart-count';
                badge.textContent = count;
                cartLink.style.position = 'relative';
                cartLink.appendChild(badge);
            }
        } else {
            badge.textContent = count;
        }
    }

    function showToast(text, type) {
        let toast = document.getElementById('toast-message');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-message';
            toast.style.position = 'fixed';
            toast.style.top = '22px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.padding = '12px 18px';
            toast.style.borderRadius = '10px';
            toast.style.zIndex = 2000;
            toast.style.fontWeight = '700';
            toast.style.color = '#fff';
            toast.style.boxShadow = '0 3px 10px rgba(0,0,0,0.25)';
            document.body.appendChild(toast);
        }

        toast.textContent = text;
        toast.style.background = type === 'success' ? '#2a8a3f' : '#c91c1c';
        toast.style.opacity = '1';

        clearTimeout(window.toastTimer);
        window.toastTimer = setTimeout(() => {
            if (toast) toast.style.opacity = '0';
        }, 2200);
    }

    // Search Button 
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector(".search-btn");
    
    if (searchInput && searchBtn) {
        function doSearch() {
            const query = searchInput.value.toLowerCase();
            // Re-query every call so seller-added cards are always included
            document.querySelectorAll(".product-card").forEach(card => {
                const name = card.dataset.name.toLowerCase();
                card.style.display = name.includes(query) ? "block" : "none";
            });
        }
        searchBtn.addEventListener("click", doSearch);
    }

});

// Login Section (Valid user/Buyer accounts)

// ---------- localStorage Helpers ----------

function getUsers() {
    return JSON.parse(localStorage.getItem('bakehubUsers') || '{}');
}

function saveUsers(users) {
    localStorage.setItem('bakehubUsers', JSON.stringify(users));
}

function getSession() {
    return JSON.parse(localStorage.getItem('bakehubSession') || 'null');
}

function saveSession(sessionObj) {
    localStorage.setItem('bakehubSession', JSON.stringify(sessionObj));
}

// User Login - let server handle auth forms in this Express app

const submit = document.querySelector('.submit');
const usernameField = document.getElementById('username');

if (submit && usernameField && window.location.pathname === '/login') {
    // remove client-side interception so form POSTS to /login as intended
    // no client-side logic here
}

// We leave localStorage helpers for legacy/static-only pages, but the server handles /login and /signup now.


// Signup section for sellers

const addseller = document.querySelector('.ss');

if (addseller) {
    addseller.addEventListener("click", (e) => {
        try {
            e.preventDefault();
            const shopname = document.getElementById('shop').value.trim();
            const password = document.getElementById('s_password').value;
            addSeller(shopname, password);
        } catch (error) {
            console.error("Error during signup:", error);
        }
    });
}

function addSeller(shopname, password) {
    if (!shopname || !password) {
        alert("Please fill in all fields.");
        return;
    }

    const users = getUsers();

    if (users[shopname]) {
        alert("That shop name is already registered. Please choose another.");
        return;
    }

    users[shopname] = { password, role: 'seller', shopname: shopname };
    saveUsers(users);

    alert("Seller account created successfully!");
    window.location.href = "index.html";
}

// Signup section for buyers

const addcustomer = document.querySelector('.cs');

if (addcustomer) {
    addcustomer.addEventListener("click", (e) => {
        try {
            e.preventDefault();
            const username = document.getElementById('c_username').value.trim();
            const password = document.getElementById('c_password').value;
            addCustomer(username, password);
        } catch (error) {
            console.error("Error during signup:", error);
        }
    });
}

function addCustomer(username, password) {
    if (!username || !password) {
        alert("Please fill in all fields.");
        return;
    }

    const users = getUsers();

    if (users[username]) {
        alert("That username is already taken. Please choose another.");
        return;
    }

    users[username] = { password, role: 'customer' };
    saveUsers(users);

    alert("Customer account created successfully!");
    window.location.href = "login.html";
}

// Render seller-added products from localStorage onto index.html
function renderSellerProducts() {
    const container = document.getElementById('seller-products');
    if (!container) return;

    const products = JSON.parse(localStorage.getItem('bakehubSellerProducts') || '[]');
    container.innerHTML = '';

    if (products.length === 0) return;

    // Check if the current user is a seller to decide whether to show Remove buttons
    const session = getSession();
    const isSeller = session && session.role === 'seller';

    products.forEach((product) => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.setAttribute('data-name', product.name);
        card.setAttribute('data-price', product.price.toFixed(2));
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p class="price">₱${product.price.toFixed(2)}</p>
            <button class="add-to-cart-btn seller-cart-btn">Add to Cart</button>
            ${isSeller ? `<button class="remove-product-btn" style="margin-top:8px;background:#8b5e3c;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;width:100%;">Remove Listing</button>` : ''}
        `;

        // Add to Cart
        card.querySelector('.seller-cart-btn').addEventListener('click', () => {
            const event = new CustomEvent('sellerAddToCart', {
                detail: { name: product.name, price: product.price.toFixed(2) }
            });
            document.dispatchEvent(event);
            document.getElementById('cart-toggle').checked = true;
        });

        // Remove Listing (only rendered for sellers)
        if (isSeller) {
            card.querySelector('.remove-product-btn').addEventListener('click', () => {
                if (!confirm(`Remove "${product.name}" from your listings?`)) return;

                let stored = JSON.parse(localStorage.getItem('bakehubSellerProducts') || '[]');
                stored = stored.filter(p => p.name.toLowerCase() !== product.name.toLowerCase());
                localStorage.setItem('bakehubSellerProducts', JSON.stringify(stored));

                // Re-render so the card disappears immediately
                renderSellerProducts();
            });
        }

        container.appendChild(card);
    });
}

window.renderSellerProducts = renderSellerProducts;

// ── UPDATED: review block now guards against running on non-review pages ──
document.addEventListener('DOMContentLoaded', () => {

    // Only run on reviews.html — bail out if the hero elements don't exist
    const heroName = document.getElementById('hero-name');
    if (!heroName) return;

    //  Determine which product this page is for
    const params      = new URLSearchParams(window.location.search);
    const productName = params.get('product') || 'Chocolate Cake';
    const storageKey  = 'bakehubReviews_' + productName.toLowerCase().replace(/\s+/g, '_');

    // extend as you add more products
    const productMeta = {
        'Chocolate Cake':       { img: 'cake.png',      desc: 'Rich, moist, and layered with deep chocolate flavor.' },
        'Croissant':            { img: 'croissant.png', desc: 'Buttery, flaky, and fresh from the oven.' },
        'Blueberry Muffin':     { img: 'muffin.png',    desc: 'Soft, fluffy, and packed with sweet blueberries.' },
        'Chocolate Chip Cookie':{ img: 'cookie.png',    desc: 'Delicious and crispy with chunks of chocolate.' },
        'Red Velvet Cupcake':   { img: 'cupcake.png',   desc: 'Velvety smooth with a hint of cocoa and creamy frosting.' },
    };

    const meta = productMeta[productName] || { img: 'cake.png', desc: '' };
    heroName.textContent = productName;
    document.getElementById('hero-desc').textContent = meta.desc;
    document.getElementById('hero-img').src          = meta.img;
    document.getElementById('hero-img').alt          = productName;
    document.title = 'Bakehub | ' + productName + ' Reviews';

    //  Load reviews 
    function getReviews() {
        return JSON.parse(localStorage.getItem(storageKey) || '[]');
    }

    function saveReviews(reviews) {
        localStorage.setItem(storageKey, JSON.stringify(reviews));
    }

    //  Star helpers 
    function starsHTML(n) {
        return '★'.repeat(n) + '☆'.repeat(5 - n);
    }

    //  Render everything 
    function render() {
        const reviews = getReviews();
        const list    = document.getElementById('reviews-list');

        // Rating summary
        const counts = [0, 0, 0, 0, 0]; // index 0 = 1 star
        reviews.forEach(r => counts[r.stars - 1]++);
        const total = reviews.length;
        const avg   = total
            ? (reviews.reduce((s, r) => s + r.stars, 0) / total).toFixed(1)
            : null;

        document.getElementById('avg-score').textContent     = avg || '—';
        document.getElementById('avg-stars').textContent     = avg ? starsHTML(Math.round(avg)) : '☆☆☆☆☆';
        document.getElementById('review-count').textContent  = total + (total === 1 ? ' review' : ' reviews');

        // Bar chart
        const barsEl = document.getElementById('rating-bars');
        barsEl.innerHTML = '';
        for (let i = 5; i >= 1; i--) {
            const pct = total ? Math.round((counts[i - 1] / total) * 100) : 0;
            const row = document.createElement('div');
            row.className = 'bar-row';
            row.innerHTML = `
                <span>${i} ★</span>
                <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                <span>${counts[i - 1]}</span>
            `;
            barsEl.appendChild(row);
        }

        // Review cards
        if (!total) {
            list.innerHTML = '<p class="no-reviews">No reviews yet — be the first!</p>';
            return;
        }

        list.innerHTML = '';
        reviews.slice().reverse().forEach((r, i) => {
            const card = document.createElement('div');
            card.className = 'review-card';
            card.style.animationDelay = (i * 0.06) + 's';
            card.innerHTML = `
                <div class="review-header">
                    <div>
                        <div class="reviewer-name">${escapeHTML(r.name)}</div>
                        <div class="review-date">${r.date}</div>
                    </div>
                    <div class="review-stars">${starsHTML(r.stars)}</div>
                </div>
                <p class="review-comment">${escapeHTML(r.comment)}</p>
            `;
            list.appendChild(card);
        });
    }

    const submitBtn = document.getElementById('submit-review-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const name    = document.getElementById('reviewer-name').value.trim();
            const comment = document.getElementById('review-comment').value.trim();
            const starEl  = document.querySelector('input[name="stars"]:checked');

            if (!name)    { alert('Please enter your name.'); return; }
            if (!starEl)  { alert('Please select a star rating.'); return; }
            if (!comment) { alert('Please write a comment.'); return; }

            const reviews = getReviews();
            reviews.push({
                name,
                stars:   parseInt(starEl.value),
                comment,
                date: new Date().toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                })
            });
            saveReviews(reviews);

            // Reset form
            document.getElementById('reviewer-name').value  = '';
            document.getElementById('review-comment').value = '';
            document.querySelector('input[name="stars"]:checked').checked = false;

            render();

            // Scroll to reviews list
            document.getElementById('reviews-list').scrollIntoView({ behavior: 'smooth' });
        });
    }

    function escapeHTML(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    render();
});
