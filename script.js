document.addEventListener('DOMContentLoaded', () => {
    
    let cart = [];
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
        renderCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        renderCart();
    }

    function updateQuantity(index, change) {
        cart[index].quantity += change;
        
        // If quantity drops to 0, remove the item
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
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

        // Save the cart data to the browser's Local Storage
        // convert the array to a string (JSON) to save it
        localStorage.setItem('bakehubCart', JSON.stringify(cart));

        // 2. Redirect to the checkout page
        window.location.href = 'checkout.html';
    });
});