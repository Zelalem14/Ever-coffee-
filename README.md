# ☕ Keffa & Bunna — Premium Ethiopian Coffee House Digital Menu

A modern, luxurious, and fully responsive digital menu website crafted for an artisanal coffee house in Ethiopia. Designed to showcase rich Ethiopian coffee ceremonies, specialty espresso drinks, herbal teas, cold-pressed tropical juices, biscuits, chips, and bakery sweets.

> **Digital Menu Notice**: This platform is strictly a digital menu display and management website. It does not include reservations, appointment booking, or cart checkouts. Customers can easily browse the menu, explore items, and view prices in Ethiopian Birr (ETB).

---

## 🌟 Key Features

### 1. Customer-Facing Digital Menu
- **Coffee House Aesthetic**: Warm Ethiopian color palette featuring deep roasted espresso, coffee beige, warm cream, caramel, and Ethiopian gold accents.
- **Hero Section**: "Your Perfect Coffee, Your Perfect Moment" celebrating Ethiopian coffee culture from the birthplace of Arabica in Keffa.
- **Menu Categories**:
  - **A. Coffee (Buna)**: Ethiopian Traditional Coffee (Jebena Buna with popcorn and frankincense), Macchiato, Espresso, Double Espresso, Cappuccino, Café Latte, Americano, Mocha, Iced Coffee, Caramel Coffee, Special House Coffee.
  - **B. Tea (Shai)**: Ethiopian Traditional Tea (Shai), Black Tea, Green Tea, Lemon Tea, Ginger Tea, Cinnamon Tea, Milk Tea, Special Spiced Tea.
  - **C. Cold Drinks & Juices**: Fresh Mango Juice, Avocado Juice, Papaya Juice, Pineapple Juice, Watermelon Juice, Mixed Fruit Layered Spris, Coca-Cola, Sprite, Fanta, Pepsi, Soft Drinks, Bottled Natural Spring Water, Sparkling Water.
  - **D. Biscuits & Cookies**: Butter Biscuits, Chocolate Cookies, Cream Biscuits, Digestive Biscuits, Wafer Biscuits, Oreo, Local Biscuits, Assorted Cookies.
  - **E. Chips & Snacks**: Sun Chips, Cheetos, Potato Chips, Pringles, Doritos, Popcorn, Corn Snacks, Salted Peanuts, Mixed Nuts.
  - **F. Sweets & Bakery**: Chocolate Cake, Vanilla Cake, Doughnuts, Muffins, Croissants, Cupcakes, Brownies, Lollipops, Chocolate Bars, Candy, Wafers, Other Sweet Snacks.
- **Real-Time Live Search**: Instantly searches by drink name, description, or ingredients.
- **Filter Pills**: All, Popular (🔥), Featured (✨), New Arrivals (⭐), Under 100 ETB (🏷️), In Stock Only (🟢).
- **Sort Options**: Featured / Recommended, Price (Low to High), Price (High to Low), Name (A-Z).
- **Product Details Modal**: Full high-resolution photo, flavor notes, dietary badges, and price in Ethiopian Birr (ETB).
- **Signature Highlights & Daily Combos**: Morning Buna & Popcorn ritual, Addis Macchiato & Croissant combo, and Afternoon Spris juice pairings.
- **Ethiopian Heritage Story**: Rich background on Ethiopian coffee ceremonies and single-origin heirloom beans.
- **Opening Hours & Location**: 6:30 AM – 10:30 PM, Bole Medhanialem Road, Addis Ababa, Ethiopia.

### 2. Administrator Management Portal
- **Secure Authentication**: JWT-based authentication with bcrypt-hashed passwords.
- **Overview Dashboard**:
  - Total Products count
  - Active Categories count
  - In Stock vs. Out of Stock counts
  - Featured Specialties count
  - Average Price in ETB
- **Full Product CRUD**:
  - Add new products with name, category, price in ETB, description, tags, and badges.
  - Image file upload (via Multer) or high-res image URL input with real-time preview.
  - Edit any product's details and price.
  - One-click instant availability toggle switch directly in the products table.
  - Delete products with custom confirmation dialog.
- **Category Management**:
  - Add custom categories with custom icons (Coffee, CupSoda, GlassWater, Cookie, Popcorn, Cake, etc.)
  - Edit category name, URL slug, and display order.
  - Delete categories.
- **Restore Default Menu**: One-click action to reset or re-seed the full authentic Ethiopian menu at any time.
- **Permanent Database Storage**: High-performance SQLite database (`coffeehouse.db` in WAL mode) with foreign key cascading and prepared statements.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons
- **Backend**: Node.js v24, Express, SQLite via native `node:sqlite` (DatabaseSync in WAL mode)
- **Image Uploads**: Multer with static file serving (`/uploads/...`)
- **Authentication**: JSON Web Tokens (JWT) & BcryptJS

---

## 🚀 Quick Start Guide

### 1. Start the Production Server
To run both the backend API and the served frontend web application on `http://localhost:5050`:

```bash
npm start
```

Open your browser at `http://localhost:5050`.

### 2. Development Mode (Hot Reload)
If modifying client code in development mode:

```bash
# Terminal 1 - Start backend server
npm run server:dev

# Terminal 2 - Start Vite client
npm run client
```

Vite dev server will run on `http://localhost:5173` with automatic API proxying to `http://localhost:5050`.

### 3. Run Automated End-to-End Tests
```bash
npm test
```

---

## 🔐 Administrator Credentials

- **Username**: `admin`
- **Password**: `admin123`

Click **"Admin"** in the top navigation bar or footer to access the dashboard. A convenient "Fill Demo" button is also provided on the login modal.
