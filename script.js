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
        // Check if item already exists
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
        
        // If quantity drops to 0, remove the item
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        renderCart();
    }

    // 4. Render the Cart HTML
    function renderCart() {
        // Clear current HTML
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
                        <span class="item-price">&#8369;${item.price.toFixed(2)}</span>
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

        // Update Total Price and Badge Count
        cartTotalElement.textContent = total.toFixed(2);
        cartCountElement.textContent = totalCount;
    }


    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const name = card.getAttribute('data-name');
            const price = card.getAttribute('data-price');
            
            addToCart(name, price);
            
            //Open cart automatically when adding
            document.getElementById('cart-toggle').checked = true;
        });
    });

    // Make functions global so HTML onclick attributes can see them
    window.removeItem = removeFromCart;
    window.changeQty = updateQuantity;

    //  Checkout Logic 
    const checkoutBtn = document.querySelector('.checkout-btn');

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty! Add some delicious pastries first.");
            return;
        }

        // Cart is already saved per-user — just navigate to checkout
        window.location.href = 'checkout.html';
    });

    // Search Button
    const searchInput = document.querySelector(".search-input");
    const searchBtn = document.querySelector(".search-btn");
    const productCards = document.querySelectorAll(".product-card");

    function doSearch() {
        const query = searchInput.value.toLowerCase();

        productCards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            card.style.display = name.includes(query) ? "block" : "none";
            });
        }
    searchBtn.addEventListener("click", doSearch);

    // Render cart immediately on load to restore saved items
    if (cartItemsContainer) renderCart();

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

// ------------------------------------------

const submit = document.querySelector('.submit')

if (submit) {
    submit.addEventListener("click", (e) => {
        try {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            validateLogin(username, password);
        } catch (error) {
            console.error("Error during login:", error);
        }
    })
}

function validateLogin(username, password) {
    const users = getUsers();
    const user  = users[username];

    if (user && user.password === password) {
        saveSession({ username, role: user.role });
        alert("Login successful!");
        window.location.href = "index.html";
    } else {
        alert("Invalid username or password. Please try again.");
        document.getElementById('username').value = "";
        document.getElementById('password').value = "";
    }
}

// Signup section for sellers

const addseller = document.querySelector('.ss')

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
    })
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

    // Save new seller account using shop name as the key/identifier
    users[shopname] = { password, role: 'seller', shopname: shopname };
    saveUsers(users);

    alert("Seller account created successfully!");
    window.location.href = "index.html";
}

// Signup section for buyers

const addcustomer = document.querySelector('.cs')

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
    })
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

    // Save new customer account persistently
    users[username] = { password, role: 'customer' };
    saveUsers(users);

    alert("Customer account created successfully!");
    window.location.href = "login.html";
}