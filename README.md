# BuySell — Global Marketplace

A premium, full-stack marketplace application built on the MERN stack designed for people all over the world to buy, sell, and discover amazing deals.

## Features

- It consists of a simple login and registration interface handling email and password authentication, along with refusing creation of accounts with same phone number or email.

- It consists of a home page, with 2 navbars and all the products available and unavailable in the market.

- Unavailable items are greyed out with either sold or paused status.

- There are 2 navbars, one sticky at the top and the other one below it. The bottom navbar is not always visible. It is visible only when the user scrolls to the top of the page.

- The top navbar contains of "Home", "My Products", "Orders", "Wishlist" sections on the left and a search bar for items, collapsible categorical item seach bar, theme toggle button, notifications, cart, profile and logout buttons in the right.

- The bottom navbar is an easy access to the categorical item search bar above.

- The home page contains the most recent items added to the market. To view all, select the "All" option from the second navbar, you may also choose any other category of products you wish to view.

- You can filter the products pased on price ascending/descending, category, name, brand, price range, newest/oldest.

- Each item card allows you to add it directly to cart or wishlist and show you the pric, description, seller name and other miscellaneous details.

- You can view the item by clicking on it and it can show you, the available quantity, share it with link, quantity selector to add to the cart along with seller information, product details.

- The items added to cart can be viewed from the cart button in the navbar and can allow you to adjust quantity (increase/decrease/remove) and then, update your address and place the order.

- You get notifications when any action is succesfull/failed which you may also remove early by clicking x mark on it.

- You may view your past orders, past notifications, items you have added to wishlist and the products you are selling in the respective sections.

- You can pause or remove an item you are selling from my products section.

- You can add a new item with image (optional), including its Title, Categories (allows adding the item under multiple categories) , Brand, Condition, Usage duration, Price, Stock, Location and the description and other miscellaneous details.

- You may edit your profile details in the profile section accessible through the top navbar including change in passwords.

- You may logout of your account by clicking on the button in the navbar.

## Assumptions

- **Instant order completion:** It is assumed that once a buyer successfully places an order, the transaction is immediately considered complete, instead of mimicking real life scenarios consisting of shipped, out for delivery and other multi stage processes.

- **No item review:** There is no review feature as of now, and a simple placeholder is used in the UI.

- **Doesn't allow self order:** Felt it is logical to not let a seller buy his own product and hence the design only allows him to manage his product from the item card in all items list.

- **Each item falls under only one category:** It is assumed that each item can belong to only one category. Ex:- An electric lamp belongs to either Home and Living or Electronics, but not both.

## Tech Stack

**Frontend:** React (Vite), React Router v6, Tailwind CSS v4, Framer Motion, Lucide React, Axios, React Hot Toast
**Backend:** Node.js, Express, MongoDB (Mongoose), Cloudinary, Multer, JSON Web Tokens (JWT), Bcrypt

## Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/hasitha-3/Take-Home-Assignment.git
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

In the `frontend` folder, create a `.env` file
```env
VITE_API_URL=http://localhost:8000
```

### 4. Run the Application
```bash
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)
cd frontend
npm run dev
```