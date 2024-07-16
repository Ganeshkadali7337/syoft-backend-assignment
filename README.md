# Backend Project

This project is a backend application built using Node.js, Express, and Mongoose. It implements a role-based authentication system with different levels of access for admin, manager, and staff users.

## Features

- User registration and login with JWT token generation
- Role-based access control (admin, manager, staff)
- CRUD operations for products
- Secure endpoints using JWT authentication

## Technologies Used

- **Node.js**
- **Express**
- **jsonwebtoken**
- **bcrypt**
- **CORS**
- **Mongoose**

## Models

### User Model

- `userName`: String
- `email`: String
- `password`: String
- `role`: String (admin, manager, staff)

### Product Model

- `title`: String
- `description`: String
- `inventoryCount`: Number

## API Endpoints

### User Endpoints

#### Register User

- **URL**: `/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "string"
  }
  ```

#### User Login

- **URL**: `/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

#### Create Product

- **URL**: `/create-product`
- **Method**: `POST`
- **Header**:
  ```json
  {
    "Authorization": "Bearer <token>(admin)"
  }
  ```
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "inventoryCount": "number"
  }
  ```

#### Update Product

- **URL**: `/update-product/:id`
- **Method**: `PUT`
- **Header**:
  ```json
  {
    "Authorization": "Bearer <token>(admin and manager)"
  }
  ```
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "inventoryCount": "number"
  }
  ```

#### Delete Product

- **URL**: `/delete-product/:id`
- **Method**: `Delete`
- **Header**:
  ```json
  {
    "Authorization": "Bearer <token>(admin)"
  }
  ```

#### Get Products

- **URL**: `/products`
- **Method**: `GET`
- **Header**:
  ```json
  {
    "Authorization": "Bearer <token>(admin and manager)"
  }
  ```

#### Get Product

- **URL**: `/product/:id`
- **Method**: `GET`
- **Header**:
  ```json
  {
    "Authorization": "Bearer <token>(admin and manager)"
  }
  ```

### Authentication

- `JWT Verification`: All CRUD operations require JWT verification using authentication middleware.
- `Role-Based Access Control`:
- - `Admin`: Can create, read, update, and delete products.
- - `Manager`: Can read and update products.
- - `Staff`: No CRUD rights on products.
