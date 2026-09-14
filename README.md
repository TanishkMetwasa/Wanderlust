Wanderlust 🌍✈️

Wanderlust is a full-stack web application inspired by Airbnb, built for discovering, listing, and reviewing vacation rentals and unique stays across the globe.

The application provides a complete rental-platform experience with user authentication, authorization, CRUD operations, reviews and ratings, image uploads, server-side validation, cloud storage, and responsive UI design.

🌟 Features
🏠 Listing Management
Browse vacation rentals and unique stays.
View detailed listing information including:
Title
Description
Price
Location
Country
Landmark
Map coordinates
Listing images
Create new listings.
Upload listing images directly to Cloudinary.
Edit listings with owner-only authorization.
Delete listings with owner-only authorization.
Automatically delete associated reviews when a listing is removed.
⭐ Reviews & Ratings
Add reviews and ratings from 1 to 5 stars.
Display reviews on individual listings.
Delete reviews with author-based authorization.
Prevent unauthorized users from modifying other users' reviews.
🔐 Authentication & Authorization
User registration and login.
Secure logout functionality.
Session-based authentication.
Authentication powered by Passport.js and Passport-Local-Mongoose.
Persistent sessions stored in MongoDB using connect-mongo.
Authorization middleware protects sensitive routes and operations.
☁️ Cloud Image Storage
Image uploads handled using Multer.
Images stored securely using Cloudinary.
Cloudinary integration through multer-storage-cloudinary.
🛡️ Validation & Error Handling
Server-side validation using Joi.
Centralized error-handling middleware.
Custom error classes and error pages.
Async error handling using reusable utility functions.
Flash messages for success and error notifications.
📱 Responsive User Interface
Responsive design using Bootstrap.
Custom styling with CSS.
EJS templates with reusable layouts and components.
Interactive client-side functionality using Vanilla JavaScript.


🛠️ Tech Stack
Backend
Node.js
Express.js
MongoDB
Mongoose
MongoDB Atlas
Authentication & Security
Passport.js
Passport-Local
Passport-Local-Mongoose
Express Session
Connect Mongo
Connect Flash
Validation
Joi
Frontend
EJS
EJS-Mate
Bootstrap
HTML
CSS
Vanilla JavaScript
Image & Media Storage
Cloudinary
Multer
Multer Storage Cloudinary  

📁 Project Architecture
MAJORPROJECT/
│
├── controllers/
│   └── Request logic and route handlers
│       ├── listings.js
│       ├── reviews.js
│       └── users.js
│
├── models/
│   └── Mongoose database schemas
│       ├── listing.js
│       ├── review.js
│       └── user.js
│
├── routes/
│   └── Express routers
│       ├── listing.js
│       ├── review.js
│       └── user.js
│
├── views/
│   ├── includes/
│   │   ├── navbar.ejs
│   │   ├── footer.ejs
│   │   └── flash.ejs
│   │
│   ├── layouts/
│   │   └── boilerplate.ejs
│   │
│   ├── listings/
│   │   ├── index.ejs
│   │   ├── show.ejs
│   │   ├── new.ejs
│   │   └── edit.ejs
│   │
│   └── users/
│       ├── signup.ejs
│       └── login.ejs
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│
├── utils/
│   ├── ExpressError.js
│   └── wrapAsync.js
│
├── init/
│   └── index.js
│
├── cloudConfig.js
├── middleware.js
├── schema.js
├── app.js
├── package.json
└── .env

🚀 Getting Started

Follow the steps below to run Wanderlust locally.

Prerequisites

Make sure you have the following installed or available:

Node.js v18+ recommended
MongoDB Atlas account or local MongoDB installation
Cloudinary account
Git
1. Clone the Repository
git clone https://github.com/TanishkMetwasa/Wanderlust
cd MAJORPROJECT


2. Install Dependencies
npm install

3. Configure Environment Variables

Create a .env file in the root directory:

ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret_key

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret


⚠️ Never commit your .env file to GitHub.

Make sure .env is included in your .gitignore:

.env
node_modules/

4. Initialize Sample Data

To populate the database with sample listings:

node init/index.js

This step is optional.

5. Start the Application

Run the application using:

node app.js

For development with Nodemon:

npm nodemon app.js

6. Open the Application

Once the server is running, open:

http://localhost:8080


or

http://localhost:8080/listings

🔑 Environment Variables
Variable	Description
ATLASDB_URL	MongoDB Atlas connection string
SECRET	Secret key used for session management
CLOUD_NAME	Cloudinary cloud name
CLOUD_API_KEY	Cloudinary API key
CLOUD_API_SECRET	Cloudinary API secret
🔐 Security Best Practices
Keep .env out of version control.
Never expose MongoDB or Cloudinary credentials publicly.
Use a strong, randomly generated session secret.
Restrict MongoDB Atlas Network Access to trusted IP addresses when possible.
Avoid using 0.0.0.0/0 in production unless there is a specific reason.
Validate user input on the server.
Protect authenticated and owner-only routes with authorization middleware.
Use environment variables for sensitive configuration.
🧩 Application Flow

The application follows an MVC-style architecture:

User
  │
  ▼
EJS / Browser
  │
  ▼
Express Routes
  │
  ▼
Middleware
  │
  ├── Authentication
  ├── Authorization
  └── Validation
  │
  ▼
Controllers
  │
  ▼
Mongoose Models
  │
  ▼
MongoDB Atlas


Images follow a separate upload flow:

User
  │
  ▼
Multer
  │
  ▼
Cloudinary
  │
  ▼
Image URL
  │
  ▼
MongoDB Listing

🌐 Future Improvements
Search and filtering by location and price.
Category-based listings.
Interactive maps with listing markers.
Wishlist / favorites functionality.
User profile pages.
Pagination for listings.
Advanced review sorting and filtering.
Email notifications.
Social authentication.
Improved mobile-first UI.
Deployment with CI/CD.


👨‍💻 Author
 Tanishk Metwasa


GitHub: https://github.com/TanishkMetwasa
LinkedIn: www.linkedin.com/in/tanishk-metwasa-69a715262

⭐ Support

If you found this project interesting, consider giving the repository a ⭐ on GitHub.
