OAuth - Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [System Architecture](#system-architecture)
5. [Authentication Flow](#authentication-flow)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Frontend Architecture](#frontend-architecture)
9. [Security Features](#security-features)
10. [How Everything Works Together](#how-everything-works-together)

---

## 🎯 Project Overview

**Nimbus OAuth** is a full-stack MERN (MongoDB, Express, React, Node.js) application that implements OAuth2 social authentication with Google and Facebook. Users can log in using their social media accounts, link multiple providers to a single account, and manage their profile settings.

### Key Features
- Social login with Google and Facebook OAuth2
- JWT-based authentication with access and refresh tokens
- Account linking (connect multiple social providers)
- User profile management
- Authentication activity logging
- Rate limiting and security middleware
- Mock OAuth mode for testing without real credentials

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: 
  - Passport.js (OAuth strategies)
  - JWT (jsonwebtoken)
  - bcryptjs (password hashing - if needed)
- **Security**:
  - Helmet (HTTP headers security)
  - CORS (Cross-Origin Resource Sharing)
  - express-rate-limit (API rate limiting)
  - express-validator (input validation)
- **Logging**: Winston
- **Utilities**: 
  - cookie-parser (cookie handling)
  - dotenv (environment variables)
  - uuid (correlation IDs)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Styling**: CSS (custom)

### Development Tools
- **Process Manager**: Nodemon (backend hot reload)
- **Concurrent Execution**: Concurrently (run both servers)
- **Scripts**: Custom batch and PowerShell scripts

---

## 📁 Project Structure

```
nimbus-oauth/
├── backend/                      # Backend Node.js application
│   ├── config/                   # Configuration files
│   │   ├── database.js          # MongoDB connection setup
│   │   ├── oauth.config.js      # OAuth provider configurations
│   │   └── passport.js          # Passport strategies (Google, Facebook)
│   ├── controllers/             # Request handlers
│   │   ├── auth.controller.js   # Authentication logic
│   │   └── user.controller.js   # User management logic
│   ├── middleware/              # Express middleware
│   │   ├── auth.js             # JWT authentication middleware
│   │   ├── rateLimiter.js      # Rate limiting middleware
│   │   └── validation.js       # Input validation middleware
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js             # User data model
│   │   └── AuthLog.js          # Authentication logs model
│   ├── routes/                  # API route definitions
│   │   ├── auth.routes.js      # Authentication routes
│   │   └── user.routes.js      # User management routes
│   ├── scripts/                 # Utility scripts
│   │   └── seed.js             # Database seeding
│   ├── utils/                   # Helper functions
│   │   ├── jwt.js              # JWT token utilities
│   │   ├── logger.js           # Winston logger setup
│   │   └── pkce.js             # PKCE state generation
│   ├── .env                     # Environment variables (not in git)
│   ├── .env.example            # Environment template
│   ├── server.js               # Express server entry point
│   └── package.json            # Backend dependencies
│
├── frontend/                    # Frontend React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Auth/          # Authentication components
│   │   │   │   ├── LoginPage.jsx      # Login page
│   │   │   │   └── SocialLogin.jsx    # Social login buttons
│   │   │   ├── Profile/       # Profile components
│   │   │   │   └── AccountSettings.jsx # Settings page
│   │   │   ├── Dashboard.jsx   # Main dashboard
│   │   │   ├── Navbar.jsx      # Navigation bar
│   │   │   └── ProtectedRoute.jsx # Route guard
│   │   ├── context/            # React Context
│   │   │   └── AuthContext.jsx # Global auth state
│   │   ├── services/           # API services
│   │   │   └── api.js          # Axios configuration & API calls
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── .env                     # Frontend environment variables
│   ├── .env.example            # Environment template
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   └── package.json            # Frontend dependencies
│
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package.json (scripts)
├── start.bat                    # Windows batch startup script
├── start.ps1                    # PowerShell startup script
└── PROJECT_DOCUMENTATION.md     # This file

```

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ◄─────► │   Frontend   │ ◄─────► │   Backend   │
│  (Client)   │         │  React/Vite  │         │  Express.js │
└─────────────┘         └──────────────┘         └──────┬──────┘
                                                         │
                        ┌────────────────────────────────┼────────┐
                        │                                │        │
                        ▼                                ▼        ▼
                ┌───────────────┐              ┌──────────────┐  │
                │  OAuth        │              │   MongoDB    │  │
                │  Providers    │              │   Database   │  │
                │ (Google/FB)   │              └──────────────┘  │
                └───────────────┘                                │
                                                    ┌────────────▼──────┐
                                                    │  Winston Logger   │
                                                    │  (error.log,      │
                                                    │   combined.log)   │
                                                    └───────────────────┘
```

### Request Flow

1. **User initiates action** → Browser
2. **Frontend handles UI** → React components
3. **API call made** → Axios (with credentials)
4. **Backend receives request** → Express middleware chain
5. **Authentication check** → JWT verification
6. **Business logic** → Controllers
7. **Database operation** → Mongoose models
8. **Response sent** → JSON data
9. **Frontend updates** → React state/context
10. **UI re-renders** → User sees result

---

## 🔐 Authentication Flow

### OAuth Login Flow (Google/Facebook)

```
┌──────┐                ┌──────────┐              ┌─────────┐              ┌──────────┐
│ User │                │ Frontend │              │ Backend │              │  OAuth   │
│      │                │          │              │         │              │ Provider │
└──┬───┘                └────┬─────┘              └────┬────┘              └────┬─────┘
   │                         │                         │                        │
   │ 1. Click "Login with Google"                     │                        │
   ├────────────────────────►│                         │                        │
   │                         │                         │                        │
   │                         │ 2. Redirect to /api/auth/google                 │
   │                         ├────────────────────────►│                        │
   │                         │                         │                        │
   │                         │                         │ 3. Generate state      │
   │                         │                         │    Store in cookie     │
   │                         │                         │                        │
   │                         │                         │ 4. Redirect to OAuth   │
   │                         │                         ├───────────────────────►│
   │                         │                         │                        │
   │                         │                         │                        │
   │ 5. User authenticates with Google                                         │
   │◄──────────────────────────────────────────────────────────────────────────┤
   │                         │                         │                        │
   │                         │                         │ 6. Callback with code  │
   │                         │                         │◄───────────────────────┤
   │                         │                         │                        │
   │                         │                         │ 7. Exchange code       │
   │                         │                         │    for access token    │
   │                         │                         ├───────────────────────►│
   │                         │                         │                        │
   │                         │                         │ 8. Get user profile    │
   │                         │                         │◄───────────────────────┤
   │                         │                         │                        │
   │                         │                         │ 9. Find/Create user    │
   │                         │                         │    in MongoDB          │
   │                         │                         │                        │
   │                         │                         │ 10. Generate JWT       │
   │                         │                         │     (access + refresh) │
   │                         │                         │                        │
   │                         │ 11. Set cookies &       │                        │
   │                         │     redirect to frontend│                        │
   │                         │◄────────────────────────┤                        │
   │                         │                         │                        │
   │ 12. User logged in      │                         │                        │
   │◄────────────────────────┤                         │                        │
   │                         │                         │                        │
```

### JWT Token Management

**Access Token**:
- Short-lived (15 minutes)
- Stored in httpOnly cookie
- Used for API authentication
- Contains: userId, role

**Refresh Token**:
- Long-lived (7 days)
- Stored in httpOnly cookie
- Used to get new access tokens
- Stored in database (User.refreshTokens array)
- Rotated on each refresh

**Token Refresh Flow**:
```
1. API request with expired access token
2. Frontend receives 401 error
3. Axios interceptor catches error
4. Automatically calls /api/auth/refresh
5. Backend validates refresh token
6. Issues new access + refresh tokens
7. Retries original request
8. User stays logged in seamlessly
```

---

## 💾 Database Schema

### User Model (`User.js`)

```javascript
{
  _id: ObjectId,                    // MongoDB ID
  email: String,                    // User email (sparse index)
  name: String,                     // Display name (required)
  avatar: String,                   // Profile picture URL
  role: String,                     // 'user' or 'admin'
  providers: [String],              // ['google', 'facebook']
  googleId: String,                 // Google OAuth ID (sparse index)
  facebookId: String,               // Facebook OAuth ID (sparse index)
  refreshTokens: [{                 // Array of refresh tokens
    token: String,
    createdAt: Date                 // Auto-expires after 7 days
  }],
  lastLogin: Date,                  // Last login timestamp
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

**Key Features**:
- Sparse indexes on email, googleId, facebookId (allows nulls)
- Multiple providers per user (account linking)
- Refresh token rotation (keeps last 5)
- Auto-cleanup of old refresh tokens (TTL)

### AuthLog Model (`AuthLog.js`)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Reference to User
  action: String,                   // 'login', 'logout', 'link', 'unlink', etc.
  provider: String,                 // 'google', 'facebook', 'jwt'
  success: Boolean,                 // Operation success status
  errorMessage: String,             // Error details (if failed)
  ipAddress: String,                // Client IP
  userAgent: String,                // Browser/device info
  correlationId: String,            // Request tracking ID
  metadata: Mixed,                  // Additional data
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

**Key Features**:
- Audit trail for all auth operations
- Correlation IDs for request tracking
- Auto-expires after 30 days (TTL index)
- Indexed by userId and correlationId

---

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/google` | Initiate Google OAuth | No |
| GET | `/google/callback` | Google OAuth callback | No |
| GET | `/facebook` | Initiate Facebook OAuth | No |
| GET | `/facebook/callback` | Facebook OAuth callback | No |
| POST | `/refresh` | Refresh access token | Refresh token |
| POST | `/logout` | Logout user | Yes |
| GET | `/me` | Get current user | Yes |

### User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| POST | `/link/:provider` | Link social account | Yes |
| DELETE | `/unlink/:provider` | Unlink social account | Yes |
| GET | `/auth-logs` | Get auth activity logs | Yes |

### Request/Response Examples

**GET /api/auth/me**
```javascript
// Response
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "role": "user",
    "providers": ["google"],
    "lastLogin": "2025-11-10T10:30:00.000Z",
    "createdAt": "2025-11-01T08:00:00.000Z",
    "updatedAt": "2025-11-10T10:30:00.000Z"
  }
}
```

**PUT /api/user/profile**
```javascript
// Request
{
  "name": "Jane Doe",
  "avatar": "https://new-avatar-url.com/image.jpg"
}

// Response
{
  "user": { /* updated user object */ },
  "message": "Profile updated successfully"
}
```

---

## ⚛️ Frontend Architecture

### Component Hierarchy

```
App.jsx (BrowserRouter)
├── AuthProvider (Context)
│   ├── Navbar.jsx
│   └── Routes
│       ├── /login → LoginPage.jsx
│       │            └── SocialLogin.jsx
│       ├── /dashboard → ProtectedRoute → Dashboard.jsx
│       └── /settings → ProtectedRoute → AccountSettings.jsx
```

### State Management

**AuthContext** (`context/AuthContext.jsx`):
- Global authentication state
- User object
- Loading state
- Error handling
- Auth methods (login, logout, refresh)

```javascript
const { 
  user,           // Current user object or null
  loading,        // Initial auth check loading
  error,          // Auth errors
  logout,         // Logout function
  loginWithGoogle,    // Initiate Google login
  loginWithFacebook,  // Initiate Facebook login
  refreshUser     // Re-fetch user data
} = useAuth();
```

### API Service Layer (`services/api.js`)

**Axios Instance**:
- Base URL from environment
- Credentials included (cookies)
- Correlation ID header
- Automatic token refresh on 401

**API Methods**:
```javascript
// Authentication
authAPI.getCurrentUser()
authAPI.logout()
authAPI.initiateGoogleLogin(returnTo)
authAPI.initiateFacebookLogin(returnTo)

// User Management
userAPI.getProfile()
userAPI.updateProfile(data)
userAPI.linkProvider(provider)
userAPI.unlinkProvider(provider)
userAPI.getAuthLogs()
```

### Protected Routes

```javascript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

- Checks if user is authenticated
- Redirects to /login if not
- Shows loading state during auth check

---

## 🔒 Security Features

### 1. **HTTP Security Headers** (Helmet)
- XSS protection
- Content Security Policy
- HSTS (HTTPS enforcement)
- Frame options (clickjacking prevention)

### 2. **CORS Configuration**
- Whitelist frontend URL
- Credentials allowed
- Specific methods and headers

### 3. **Rate Limiting**
- Auth endpoints: Limited requests per IP
- API endpoints: General rate limiting
- Prevents brute force attacks

### 4. **JWT Security**
- httpOnly cookies (XSS protection)
- Secure flag in production
- SameSite attribute (CSRF protection)
- Short-lived access tokens
- Refresh token rotation

### 5. **Input Validation**
- express-validator middleware
- Sanitization of user inputs
- Type checking

### 6. **Logging & Monitoring**
- Winston logger
- Correlation IDs for request tracking
- Error logging
- Auth activity logging

### 7. **Database Security**
- Mongoose schema validation
- Indexed queries (performance)
- TTL indexes (auto-cleanup)
- No sensitive data in responses

---

## 🔄 How Everything Works Together

### Complete User Journey

#### 1. **Initial Page Load**
```
Browser → Frontend (React)
  ↓
AuthContext initializes
  ↓
Calls authAPI.getCurrentUser()
  ↓
Backend checks accessToken cookie
  ↓
If valid: Returns user data
If expired: Returns 401
  ↓
If 401: Axios interceptor tries refresh
  ↓
If refresh succeeds: Retry getCurrentUser
If refresh fails: User stays logged out
```

#### 2. **User Clicks "Login with Google"**
```
LoginPage.jsx
  ↓
useAuth().loginWithGoogle()
  ↓
window.location.href = "http://localhost:5000/api/auth/google"
  ↓
Backend: auth.controller.js → initiateOAuth('google')
  ↓
Generates state, stores in cookie
  ↓
Passport.authenticate('google')
  ↓
Redirects to Google OAuth consent screen
  ↓
User approves
  ↓
Google redirects to /api/auth/google/callback?code=...
  ↓
Backend: passport.js → GoogleStrategy
  ↓
Exchanges code for access token
  ↓
Fetches user profile from Google
  ↓
handleOAuthProfile() in passport.js:
  - Checks if user exists (by googleId or email)
  - Creates new user OR links to existing
  - Saves to MongoDB
  ↓
auth.controller.js → oauthCallback:
  - Generates JWT tokens
  - Sets httpOnly cookies
  - Logs auth event to AuthLog
  - Redirects to frontend
  ↓
Frontend: User is now logged in
  ↓
AuthContext.checkAuth() fetches user data
  ↓
UI updates (Navbar shows user info)
```

#### 3. **User Navigates to Dashboard**
```
User clicks Dashboard link
  ↓
React Router navigates to /dashboard
  ↓
ProtectedRoute component checks auth
  ↓
If user exists: Renders Dashboard
If no user: Redirects to /login
  ↓
Dashboard.jsx renders
  ↓
May call userAPI methods for data
  ↓
Each API call includes accessToken cookie
  ↓
Backend auth middleware verifies token
  ↓
If valid: Proceeds to controller
If expired: Returns 401 → triggers refresh
```

#### 4. **Access Token Expires**
```
User makes API request after 15 minutes
  ↓
Backend: JWT expired error
  ↓
Returns 401 Unauthorized
  ↓
Axios interceptor catches error
  ↓
Calls /api/auth/refresh
  ↓
Backend: auth.controller.js → refreshToken
  - Validates refreshToken cookie
  - Checks token exists in user.refreshTokens
  - Generates new access + refresh tokens
  - Rotates refresh token
  - Sets new cookies
  ↓
Axios retries original request
  ↓
Request succeeds with new token
  ↓
User doesn't notice anything
```

#### 5. **User Updates Profile**
```
AccountSettings.jsx
  ↓
User edits name, clicks Save
  ↓
userAPI.updateProfile({ name: "New Name" })
  ↓
POST /api/user/profile with JSON body
  ↓
Backend middleware chain:
  1. CORS check
  2. Body parser
  3. Rate limiter
  4. Auth middleware (JWT verification)
  5. Validation middleware
  ↓
user.controller.js → updateProfile
  - Updates user document
  - Saves to MongoDB
  - Logs action
  ↓
Returns updated user object
  ↓
Frontend updates AuthContext
  ↓
UI re-renders with new name
```

#### 6. **User Links Facebook Account**
```
AccountSettings.jsx
  ↓
User clicks "Link Facebook"
  ↓
userAPI.linkProvider('facebook')
  ↓
Backend: user.controller.js → linkProvider
  - Stores userId in session
  - Returns redirect URL
  ↓
Frontend redirects to /api/auth/facebook?link=true
  ↓
OAuth flow (similar to login)
  ↓
passport.js → handleOAuthProfile
  - Detects req.user exists (linking mode)
  - Adds facebookId to existing user
  - Adds 'facebook' to providers array
  ↓
Redirects back to frontend
  ↓
User now has both Google and Facebook linked
```

#### 7. **User Logs Out**
```
Navbar.jsx
  ↓
User clicks Logout
  ↓
useAuth().logout()
  ↓
authAPI.logout()
  ↓
POST /api/auth/logout
  ↓
Backend: auth.controller.js → logout
  - Removes refresh token from database
  - Clears cookies
  - Logs logout event
  ↓
Frontend: window.location.href = '/login'
  ↓
AuthContext resets user to null
  ↓
User redirected to login page
```

### Backend Request Processing Pipeline

```
Incoming Request
  ↓
1. Helmet (security headers)
  ↓
2. CORS (origin check)
  ↓
3. Body parser (JSON parsing)
  ↓
4. Cookie parser
  ↓
5. Passport initialization
  ↓
6. Correlation ID middleware
  ↓
7. Request logger
  ↓
8. Route matching
  ↓
9. Rate limiter (if applicable)
  ↓
10. Auth middleware (if protected)
  ↓
11. Validation middleware (if applicable)
  ↓
12. Controller logic
  ↓
13. Database operations
  ↓
14. Response sent
  ↓
15. Error handler (if error occurs)
```

### Database Interactions

**User Creation/Update Flow**:
```
Controller receives data
  ↓
Mongoose model validation
  ↓
Pre-save hooks (if any)
  ↓
MongoDB write operation
  ↓
Indexes updated
  ↓
Post-save hooks (if any)
  ↓
Document returned
  ↓
toJSON() method (removes sensitive fields)
  ↓
Sent to client
```

**Query Flow**:
```
Controller calls User.findOne({ googleId: '...' })
  ↓
Mongoose builds query
  ↓
Uses index (googleId_1) for fast lookup
  ↓
MongoDB returns document
  ↓
Mongoose hydrates document (adds methods)
  ↓
Returns User instance
```

---

## 🚀 Running the Application

### Environment Setup

1. **Backend** (`.env`):
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/nimbus-oauth
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

2. **Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_APP_URL=http://localhost:3000
```

### Start Commands

**Option 1: Using root scripts**
```bash
# Install all dependencies
npm run install-all

# Run both servers concurrently
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend
```

**Option 2: Using startup scripts**
```bash
# Windows Batch
start.bat

# PowerShell
./start.ps1
```

**Option 3: Manual**
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

---

## 🧪 Testing Features

### Mock OAuth Mode
Set `MOCK_OAUTH=true` in backend `.env` to test without real OAuth credentials:
- Creates mock users
- Simulates OAuth flow
- No external API calls

### Database Seeding
```bash
npm run seed
```
Creates test users in the database.

---

## 📝 Key Concepts Summary

### 1. **Separation of Concerns**
- **Frontend**: UI/UX, user interactions, state management
- **Backend**: Business logic, authentication, database operations
- **Database**: Data persistence

### 2. **Stateless Authentication**
- No server-side sessions
- JWT tokens carry user identity
- Scalable across multiple servers

### 3. **Token Rotation**
- Refresh tokens are single-use
- New refresh token issued on each refresh
- Prevents token replay attacks

### 4. **Account Linking**
- One user can have multiple OAuth providers
- Email-based account merging
- Prevents duplicate accounts

### 5. **Error Handling**
- Correlation IDs track requests across services
- Structured logging for debugging
- Graceful error responses

### 6. **Security Layers**
- Network (CORS, HTTPS)
- Application (rate limiting, validation)
- Authentication (JWT, OAuth)
- Database (indexes, validation)

---

## 🎓 Learning Path

To fully understand this project:

1. **Start with the flow**: Follow a single user action from click to database
2. **Read the models**: Understand data structure (User, AuthLog)
3. **Trace authentication**: Follow OAuth flow step-by-step
4. **Study middleware**: See how requests are processed
5. **Explore frontend**: Understand React context and routing
6. **Review security**: Learn about JWT, cookies, CORS
7. **Test features**: Try login, linking, profile updates
8. **Read logs**: See what happens behind the scenes

---

## 📚 Additional Resources

- **Passport.js**: http://www.passportjs.org/
- **JWT**: https://jwt.io/
- **OAuth 2.0**: https://oauth.net/2/
- **React Context**: https://react.dev/reference/react/useContext
- **Mongoose**: https://mongoosejs.com/
- **Express**: https://expressjs.com/

---

**Last Updated**: November 10, 2025
**Version**: 1.0.0
