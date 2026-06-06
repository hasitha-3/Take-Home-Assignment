# BuySell — Global Marketplace

A premium, full-stack marketplace application built on the MERN stack designed for people all over the world to buy, sell, and discover amazing deals.

## Features

- **Premium UI/UX:** Built with React, TailwindCSS, and a custom CSS design system featuring dark mode, glassmorphism, skeleton loaders, and smooth micro-animations.
- **Authentication:** Secure JWT-based authentication with bcrypt password hashing.
- **Advanced Listings:** Sell items with multiple image uploads (via Cloudinary), rich descriptions, dynamic specifications, tags, and condition tracking.
- **Robust Search & Filter:** Filter by category, price range, condition, or text search across item name, description, brand, and tags. Sort by newest, price, or popularity.
- **Shopping Cart & Checkout:** Comprehensive cart system preventing buying own items, checking stock limits, and calculating order totals.
- **Order Management & OTP:** Realistic order tracking with delivery partners and secure 6-digit OTP delivery verification. Full cancellation support.
- **Interactive Features:** Real-time wishlists, user profiles with avatars, reviews and seller ratings, and a notification system for order events.
- **Admin Dashboard:** Overview of platform stats, revenue, and active users, with the ability to suspend/activate accounts.

## Tech Stack

**Frontend:** React (Vite), React Router v6, Tailwind CSS v4, Framer Motion, Lucide React, Axios, React Hot Toast
**Backend:** Node.js, Express, MongoDB (Mongoose), Cloudinary, Multer, JSON Web Tokens (JWT), Bcrypt

## Local Setup

### 1. Clone & Install
```bash
git clone <repo-url>
cd Buy_Sell_App

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
In the `backend` folder, create a `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
PORT=8000
FRONTEND_URL=http://localhost:5173

# Cloudinary (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

In the `frontend` folder, create a `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Database Seeding (Optional but recommended)
We provide a rich set of realistic sample data (users, items, images).
```bash
cd backend
npm run seed
```
*Note: This will output demo credentials to the console and a `credentials.txt` file.*

### 4. Run the Application
```bash
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.