

## 🛠 Ninja Eccomerce-Backend

This is the **backend API** for the Ninja E-Commerce web application. Built with **Node.js**, **Express**, and **MongoDB**, it provides all core services such as product management, authentication, order handling, cart logic, newsletter subscription, and admin functionalities.

*  **Live Backend**: [https://ninja-backend-nyf7.onrender.com](https://ninja-backend-nyf7.onrender.com)
*  **Swagger API Docs**: [https://ninja-backend-nyf7.onrender.com/api-docs](https://ninja-backend-nyf7.onrender.com/api-docs)
*  **Frontend Repo**: [https://github.com/abdiigashahun/Ninja](https://github.com/abdiigashahun/Ninja)

---

##  Features

*  User Authentication with JWT (Register/Login)
*  Admin-only routes for users, orders & product management
*  Product CRUD with filtering (search, category, size, price, etc.)
*  Cart system for guests and logged-in users
*  Checkout + Order system
*  Payment integration and status updates
*  Newsletter subscriptions
*  Image uploads using Cloudinary
*  **Swagger UI** documentation for testing all endpoints

---

##  Tech Stack

* **Backend**: Node.js, Express
* **Database**: MongoDB + Mongoose
* **Authentication**: JWT + Middleware
* **Image Uploads**: Multer + Cloudinary
* **API Documentation**: Swagger (OpenAPI 3.0)
* **Deployment**: Render.com

---

##  Getting Started Locally

1. **Clone the repo**

   ```bash
   git clone https://github.com/abdiigashahun/Ninja-Backend.git
   cd Ninja-Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with:

   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the server**

   ```bash
   npm start
   ```

5. **Access Swagger Docs**
   Once the server is running, go to:

   ```
   http://localhost:5000/api-docs
   ```

---

##  Project Structure

```
Ninja-Backend/
│
├── models/          # Mongoose models (Product, User, Order, etc.)
├── routes/          # Route definitions
├── middleware/      # JWT, admin check, error handling
├── utils/           # Utility functions
├── config/          # Cloudinary, DB connection
├── swagger.js       # Swagger setup
├── server.js        # Entry point
└── .env             # Environment variables (not committed)
```

---

##  Swagger API Docs

All API endpoints are documented and testable via Swagger UI.

🔗 **Live Swagger**:
[https://ninja-backend-nyf7.onrender.com/api-docs](https://ninja-backend-nyf7.onrender.com/api-docs)

You can test secured routes by clicking **"Authorize"** and entering a valid Bearer token:

```
Bearer <your_jwt_token>
```

---

##  Author

* **Name**: Abdi Gashahun
* **Email**: [abdigashahun0@gmail.com](mailto:abdigashahun0@gmail.com)

---


