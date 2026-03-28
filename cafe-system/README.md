# Cafe Ordering System

Production-style cafe ordering system with:

- Customer website for QR-based table ordering
- PHP REST API using a clean layered structure
- MySQL schema with seed data
- Admin dashboard that behaves like a waiter console

## Folder Structure

```text
cafe-system/
+-- .htaccess
+-- README.md
+-- router.php
+-- backend/
|   +-- .env.example
|   +-- api/
|   |   +-- index.php
|   |   +-- create_order.php
|   |   +-- get_menu.php
|   |   +-- get_orders.php
|   |   +-- update_order.php
|   +-- bootstrap.php
|   +-- config/
|   |   +-- app.php
|   |   +-- database.php
|   +-- src/
|       +-- Core/
|       +-- Menu/
|       +-- Order/
|       +-- Shared/
|       +-- Table/
+-- database/
|   +-- schema.sql
+-- frontend/
    +-- admin.html
    +-- cart.html
    +-- index.html
    +-- menu.html
    +-- order.html
    +-- css/
    |   +-- style.css
    +-- images/
    |   +-- logo.svg
    |   +-- menu/
    +-- js/
        +-- admin.js
        +-- api.js
        +-- cart.js
        +-- cart-page.js
        +-- config.js
        +-- home.js
        +-- menu.js
        +-- order.js
        +-- utils.js
```

## Architecture

### 1. Database

The schema in [`database/schema.sql`](database/schema.sql) creates the required tables:

- `tables`
- `menu_items`
- `orders`
- `order_items`

It also seeds:

- cafe tables `1` to `20`
- starter menu items for every requested category
- menu descriptions and availability flags used by the waiter app

### 2. Backend API

The backend uses a small clean architecture split:

- `Core`: database connection, request parsing, router, JSON response
- `Menu`: controller, service, repository
- `Order`: controller, service, repository
- `Table`: repository for validating table numbers
- `Shared/Exceptions`: consistent API error handling

Main routes:

- `GET /api/health`
- `GET /api/menu`
- `GET /api/menu?include_unavailable=true`
- `POST /api/menu`
- `PUT /api/menu/{id}`
- `DELETE /api/menu/{id}`
- `GET /api/orders`
- `POST /api/order`
- `PUT /api/order/{id}/status`

### 3. Frontend

The frontend is plain HTML + Bootstrap 5 + ES modules:

- `index.html`: landing page after scanning the QR code
- `menu.html`: customer menu
- `cart.html`: cart with quantity editing
- `order.html`: confirmation page
- `admin.html`: waiter/admin dashboard

Enhancements included:

- LocalStorage cart persistence
- automatic table context persistence
- toast notifications
- loading overlay spinner
- responsive UI
- animated cards and warm cafe visual styling

## API Payload Examples

### Create Order

```json
{
  "table_number": 5,
  "items": [
    {
      "id": 2,
      "name": "Cappuccino",
      "price": 20,
      "quantity": 2
    },
    {
      "id": 6,
      "name": "Orange Juice",
      "price": 15,
      "quantity": 1
    }
  ],
  "total": 55,
  "status": "pending"
}
```

### Update Order Status

```json
{
  "status": "served"
}
```

## Run Locally

### 1. Import the database

Create the database and tables by importing:

```powershell
Get-Content .\database\schema.sql | mysql -u root -p
```

### 2. Configure the backend

Copy the example environment file:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

Update the database credentials inside `backend/.env`.

### 3. Start the local server

From the `cafe-system` folder:

```powershell
php -S 127.0.0.1:8000 router.php
```

### 4. Open the project

Customer QR-style entry:

```text
http://127.0.0.1:8000/table/5
```

Admin dashboard:

```text
http://127.0.0.1:8000/frontend/admin.html
```

## Notes For Production

- Add real authentication for the admin dashboard
- Move configuration secrets to environment variables only
- Replace polling with WebSockets or Firebase for true real-time waiter updates
- Add server-side logging and audit trails
- Add automated tests and CI deployment
