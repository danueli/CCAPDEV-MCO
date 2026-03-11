# BakeHub 🧁
A web application for browsing and purchasing baked goods online.

Built with Node.js, Express, MongoDB (Atlas), and Handlebars.

---

## Group Members
- Dan
- Titus
- Enzo
- Ethan

---

## Prerequisites
Make sure you have the following installed before running the app:
- [Node.js](https://nodejs.org/) v18 or higher
- A stable internet connection (required for MongoDB Atlas)




### 1. Install dependencies
```bash
npm install
```

### 2. Seed the database
Populate the database with sample data (at least 5 entries per collection):
```bash
node seed.js
```

### 4. Run the application
```bash
node app.js
```

### 5. Open in browser
Go to: [http://localhost:3000](http://localhost:3000)

---

## Project Structure
```
CCAPDEV-MCO/
├── controllers/       # Route logic
├── models/            # Mongoose schemas
│   ├── User.js
│   ├── Product.js
│   ├── Review.js
│   ├── Cart.js
│   └── Order.js
├── public/            # Static files (CSS, images)
├── routes/            # Express route definitions
├── views/             # Handlebars templates (.hbs)
├── app.js             # Main server file
├── seed.js            # Database seeder
└── README.md
```

---

## Features
- **Login / Signup** — User authentication
- **Main Menu** — Landing page with navigation
- **Product Catalog** — Browse all product categories
- **Products Page** — View all available products
- **Product Detail & Reviews** — View a product and its reviews
- **Search** — Search for products by name
- **Cart** — Add and manage items in cart
- **Checkout** — Place an order
- **Profile** — View and edit user profile
- **Add Product** — Store manager can add/edit products
- **Help** — Customer service and FAQ page

---

## Dependencies
| Package | Purpose |
|---|---|
| express | Web server framework |
| mongoose | MongoDB ODM |
| express-handlebars | Template engine |

---

## Notes
- The app runs on **http://localhost:3000**
- Database is hosted on **MongoDB Atlas**
- Session management and password hashing are not implemented in this phase
- No form validation is required for this phase