// Cart Function Commands
document.addEventListener('DOMContentLoaded', () => {

    // Load cart from localStorage on every page load (restores after Back to Menu or login)
    function getCartKey() {
        const session = JSON.parse(localStorage.getItem('bakehubSession') || 'null');
        return session ? 'bakehubCart_' + session.username : 'bakehubCart_guest';
    }

    function loadCart() {
        return JSON.parse(localStorage.getItem(getCartKey()) || '[]');
    }

    function saveCart() {
        localStorage.setItem(getCartKey(), JSON.stringify(cart));
    }

    let cart = loadCart();
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.querySelector('.cart-total span:last-child');
    const cartCountElement = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');


    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: parseFloat(price),
                quantity: 1
            });
        }
        saveCart();
        renderCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }

    function updateQuantity(index, change) {
        cart[index].quantity += change;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        renderCart();
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon"><img src="cart-icon.png" alt="Cart Icon" style="width:50px;"></div>
                    <p>Your cart is empty</p>
                </div>`;
        } else {
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                totalCount += item.quantity;

                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                cartItem.innerHTML = `
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-price">₱${item.price.toFixed(2)}</span>
                        <div class="item-quantity">
                            <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
        }

        cartTotalElement.textContent = total.toFixed(2);
        cartCountElement.textContent = totalCount;
    }

    // Attach Add to Cart for hardcoded product cards
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const name = card.getAttribute('data-name');
            const price = card.getAttribute('data-price');
            addToCart(name, price);
            document.getElementById('cart-toggle').checked = true;
        });
    });

    // Make functions global so HTML onclick attributes can see them
    window.removeItem = removeFromCart;
    window.changeQty = updateQuantity;

    // Checkout Logic
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Your cart is empty! Add some delicious pastries first.");
                return;
            }
            window.location.href = 'checkout.html';
        });
    }

    // Render cart immediately on load to restore saved items
    if (cartItemsContainer) renderCart();

    // Show seller nav link if logged in as seller
    const session = getSession();
    const addProductLink = document.getElementById('add-product-link');
    if (addProductLink && session && session.role === 'seller') {
        addProductLink.style.display = 'inline';
    }

    // Render seller added-products 
    const sellerProductsContainer = document.getElementById('seller-products');
    if (sellerProductsContainer) {
        renderSellerProducts();
    }

    // Listen for cart events from dynamically created seller product cards
    document.addEventListener('sellerAddToCart', (e) => {
        addToCart(e.detail.name, e.detail.price);
    });

    // Search Button 
    const searchInput = document.querySelector(".search-input");
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

// User Login 

const submit = document.querySelector('.submit');
const usernameField = document.getElementById('username');

if (submit && usernameField) {
    submit.addEventListener("click", (e) => {
        try {
            e.preventDefault();
            const username = usernameField.value;
            const password = document.getElementById('password').value;
            validateLogin(username, password);
        } catch (error) {
            console.error("Error during login:", error);
        }
    });
}


function validateLogin(username, password) {
    const users = getUsers();
    const user  = users[username];

    // Hardcoded admin account — username: admin / password: admin123
    if (username === 'admin' && password === 'admin123') {
        saveSession({ username: 'admin', role: 'admin' });
        alert("Welcome, Admin!");
        window.location.href = "admin.html";
        return;
    }

    if (user && user.password === password) {
        saveSession({ username, role: user.role });
        alert("Login successful!");
        // Route admins registered in localStorage to dashboard too
        if (user.role === 'admin') {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }
    } else {
        alert("Invalid username or password. Please try again.");
        document.getElementById('username').value = "";
        document.getElementById('password').value = "";
    }
}

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