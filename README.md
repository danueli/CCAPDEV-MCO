

````md
# CCAPDEV-MCO 

A Node.js + Express e-commerce web application built with MongoDB, Handlebars, and session-based user flows.

## Features

- Customer and manager user accounts
- Customer signup and login
- Product catalog with category filtering and search
- Product detail pages with reviews
- Shopping cart add/remove/update flow
- Checkout page and order submission
- Manager product upload via file upload route
- Order status auto-updates from Pending → Shipped → Delivered
- Help page and dashboard views

## Installation

1. Clone the repository or copy the project files.
2. Install dependencies:

```bash
npm install
````

3. Create a `.env` file in the project root with at least:

```text
MONGODB_URI=mongodb://localhost:27017/bakehub
SESSION_SECRET=your_secret_here
PORT=3000
```

4. Start the application:

```bash
node app.js
```

5. Open the app in your browser:

```text
http://localhost:3000
```

## Environment Variables

* `MONGODB_URI` → MongoDB connection string
* `SESSION_SECRET` → secret for express-session
* `PORT` → optional port number (default: 3000)

## Main Routes

* `GET /login` → login page
* `POST /login` → login form submit
* `GET /signup` → customer signup page
* `POST /signup` → create customer account
* `GET /s_login` → manager/seller login page
* `GET /s_signup` → manager/seller signup page
* `POST /s_signup` → create manager account
* `GET /main/:username` → main dashboard after login
* `GET /catalog/:username` → product catalog by user
* `GET /search?q=...&username=...` → product search
* `GET /products` → view all products
* `GET /products/:id` → product detail and reviews
* `GET /products/add-product` → add product form
* `POST /products/add-product` → add new product with image upload
* `GET /cart/:username` → view cart
* `POST /cart/add/:username` → add item to cart
* `POST /cart/remove/:username` → remove cart item
* `POST /cart/update/:username` → update cart quantity
* `GET /checkout/:username` → checkout page
* `POST /checkout/:username` → place order
* `GET /help` → help page
* `GET /admin` → admin dashboard

## Database Models

* `User` → firstName, lastName, username, email, password, phone, address, type
* `Product` → name, price, category, stock, description, image
* `Cart` → userId, items, totalPrice
* `Order` → userId, items, totalPrice, status, date, address
* `Reviews` → productId, userId, rating, comment, date

## Notes

* Passwords are currently stored as plaintext in the database. Add hashing with `bcryptjs` for production-ready security.
* The current login flow uses username and password validation in the database.
* Product images are uploaded into `public/` and served as static assets.
* `seed.js` is included for future sample data seeding if you complete the seed data logic.

## Dependencies

* `dotenv`
* `express`
* `express-handlebars`
* `express-session`
* `mongoose`
* `multer`

## Running the Seed Script

If you implement or complete the seed file, run:

```bash
node seed.js
```

## Development

* Modify Handlebars views in `views/`
* Static assets are in `public/`
* Route files live in `routes/`
* Models are inside `models/`
