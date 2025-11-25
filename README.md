RESTful E-commerce API: Book Management System

A production-ready backend service for managing a multi-role book catalog and secure order transactions — built with Node.js, Express.js, and MongoDB.

Provides secure JWT authentication, strict Role-Based Access Control (RBAC), atomic inventory updates, and clean REST API architecture, with ready-to-use deployment and API documentation.

🚀 Overview

The Book Management API enables:

User registration & secure authentication (JWT in HTTP-only cookies).

Role-Based Access Control (RBAC) for admin, author, and customer roles.

Secure publishing and management of the book catalog by Authors and Admins.

Transactional integrity for order placement and inventory deduction.

Advanced filtering, sorting, and pagination of the public book catalog.

Built using a professional MVC architecture with strict resource ownership rules and scalable backend design.

🎯 Problem Solved

Traditional book management or simple e-commerce platforms struggle with:

Security: Unsafe token storage or weak password hashing.

Inventory Overselling: Lack of synchronized updates between orders and stock.

User Segmentation: Allowing all users the same access levels (e.g., a Customer creating books).

This API solves these issues with:

✔ Secure authentication using JWT in HTTP-Only cookies.
✔ Strict RBAC enforced on all critical endpoints.
✔ Atomic inventory control upon order placement.
✔ Modular, scalable backend ready for professional frontend integration.

🏗 Tech Stack

Layer

Technology

Language

JavaScript (Node.js)

Framework

Express.js

Database

MongoDB + Mongoose (ODM)

Auth

JWT (HTTP-only Cookie)

Security

bcrypt (password hashing)

Deployment

Render (as a continuous deployment environment)

API Docs

Swagger/OpenAPI

🔐 Authentication Flow

Passwords hashed using bcrypt before storage.

JWT generated on login & stored in HTTP-only cookie for XSS protection.

Authorization middleware: Reads token, verifies JWT, loads authenticated user (req.user), and blocks unauthorized access based on role.

✨ Key Backend Features

1. Inventory & Order Management

/order/place Endpoint: Handles simultaneous purchase of multiple books (cart checkout) or single-book purchase.

Inventory Control: Stock is checked and sequentially deducted during the order process, ensuring immediate inventory update.

Data Integrity: The Order model permanently saves the priceAtPurchase to ensure historical transactional accuracy, independent of current catalog pricing.

2. Resource Ownership & RBAC

Author Privileges: Only users with author or admin roles can use POST /book/create.

Ownership Check: The updateBook and deleteBook controllers check if the user is either the resource owner (createdBy) or an admin.

Admin Management: Dedicated admin routes (/author/users/:id/role) allow Admins to manage and modify user permissions.

3. Catalog Querying

Dynamic Filtering: Supports complex queries on the /book endpoint (genre, minPrice, maxPrice, etc.).

Pagination: Implements server-side skip/limit logic for fetching data efficiently without performance impact on large catalogs.

📄 API Documentation (Swagger/OpenAPI)

The API is fully documented using an OpenAPI 3.0.3 specification (bookstore_api.yaml).

View Documentation: The bookstore_api.yaml file in this repository can be loaded into tools like Swagger UI or Postman for interactive documentation.

Benefits: Clearly defines all request schemas, security requirements, and structured HTTP responses (400, 403, 404, 500).

🌐 Deployment & Setup

Deployment Strategy (Render)

This project is configured for continuous deployment on Render.

Environment Variables: Sensitive variables (databaseUrl, Secret) are securely injected via Render's dashboard.

Live Base URL: (To be added after deployment, e.g., https://your-bookstore-api.onrender.com)

Local Setup

Clone the repository:

git clone [YOUR_REPO_URL]
cd book-management-api


Install dependencies:

npm install


Create and configure .env:

databaseUrl=YOUR_MONGODB_URI_HERE
Secret=YOUR_VERY_STRONG_JWT_SECRET


Start the server:

npm start 


The API will be available at https://bookstoremanagement-2.onrender.com
📡 API Endpoints Summary


Render automatically builds the project and hosts:

The backend

Swagger UI at /api-docs

📘 Swagger Integration Explanation

This project includes full Swagger integration:

openapi.yaml created with all endpoints

Loaded using:

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


Accessible on both local and Render deployment.

Category

Method

Endpoint

Access

Description

Auth

POST

/author/login

Public

Authenticate and issue secure JWT cookie.

Books

GET

/book?filter...

Public

Retrieves filtered, sorted, and paginated catalog.

Books

POST

/book/create

Private (Author/Admin)

Publishes a new book resource.

Orders

POST

/order/place

Private (Customer)

Places order and controls inventory stock.

Orders

GET

/order/history

Private

Retrieves the authenticated user's purchase history.

Admin

PATCH

/author/users/:id/role

Private (Admin)

Modifies a user's role (promote/demote).

Admin

GET

/author/users

Private (Admin)

Retrieves list of all user accounts.

🙌 Author
Ishan Gupta
Backend Developer