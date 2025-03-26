# Blog-Post Application

## Project Overview

This project is a web application developed using **Node.js**, **Express**, and **MongoDB** for user authentication, along with various other packages to enhance functionality. It includes features like user registration and login with password encryption, session management, and file uploads.

## Features

- **User Authentication:**
  - Secure user registration with unique username, email, and password.
  - Passwords are hashed using **bcrypt.js**.
  - Login history is tracked and stored for each user.
  
- **Session Management:**
  - Sessions are managed using **client-sessions**.
  
- **File Uploads:**
  - Files are uploaded using **Multer** and stored on **Cloudinary**.

## Technologies Used

### Backend

- **Node.js**: JavaScript runtime used to build the server.
- **Express**: Web framework for routing and server management.
- **MongoDB**: NoSQL database for storing user data, managed with **Mongoose**.
- **bcrypt.js**: Library for securely hashing passwords.
- **client-sessions**: Middleware for managing user sessions.
- **Cloudinary**: Cloud storage for file uploads.

### Dependencies

- `auth-service`: Custom service for user authentication and management.
- `bcryptjs`: Password hashing library.
- `client-sessions`: Middleware for session management.
- `cloudinary`: For integrating Cloudinary's image and file hosting services.
- `express`: Web framework.
- `express-handlebars`: Templating engine for server-side rendering.
- `mongoose`: Object Data Modeling (ODM) library for MongoDB.
- `multer`: Middleware for handling file uploads.
- `pg` & `sequelize`: PostgreSQL and ORM for relational data (if needed).
- `streamifier` & `strip-js`: Libraries for handling and processing data streams.

For a full list of dependencies, see the [`package.json`](./package.json) file.

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository-url>

2. Navigate to the project directory:

   ```bash
   cd web322-app> 

3. Install the necessary dependencies:

   ```bash
   npm install

4. Create a .env file in the root directory and add the following environment variables:

   ```bash
   MONGO_URI=<your-mongodb-connection-string>
   SESSION_SECRET=<your-session-secret>
   CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<cloudinary-api-key>
   CLOUDINARY_API_SECRET=<cloudinary-api-secret>

5. Start the server:

   ```bash
   npm start

6. The application will run on http://localhost:3000.

## API Endpoints
- POST /register: Register a new user.
- POST /login: Log in an existing user.
- POST /upload: Upload files to Cloudinary.
