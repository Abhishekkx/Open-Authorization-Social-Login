# Open Authorization Social Login

A full-stack MERN application implementing OAuth2 social authentication with Google and Facebook.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![Node.js](https://img.shields.io/badge/Node.js-v18+-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## 🚀 Features

- **Social Authentication**: Login with Google and Facebook OAuth2
- **JWT Security**: Access and refresh token management with httpOnly cookies
- **Account Linking**: Connect multiple social providers to one account
- **Profile Management**: Update user information and avatar
- **Activity Logging**: Track authentication events and user activity
- **Rate Limiting**: Protection against brute force attacks
- **Mock OAuth Mode**: Test without real OAuth credentials
- **Responsive UI**: Modern, mobile-friendly interface

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- Passport.js (OAuth strategies)
- JWT (jsonwebtoken)
- Winston (logging)
- Helmet (security)

### Frontend
- React 18
- Vite
- React Router v6
- Axios
- Context API

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google OAuth credentials (optional for mock mode)
- Facebook OAuth credentials (optional for mock mode)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/Abhishekkx/Open-Authorization-Social-Login.git
cd Open-Authorization-Social-Login
```

### 2. Install dependencies
```bash
npm run install-all
```

Or install manually:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend (.env)
Create `backend/.env` file:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/nimbus-oauth

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Session Secret
SESSION_SECRET=your-session-secret-change-this

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# Mock OAuth (for testing without real credentials)
MOCK_OAUTH=false
```

#### Frontend (.env)
Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_APP_URL=http://localhost:3000
```

### 4. Get OAuth Credentials (Optional)

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

#### Facebook OAuth:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add redirect URI: `http://localhost:5000/api/auth/facebook/callback`

**Or use Mock Mode**: Set `MOCK_OAUTH=true` in backend `.env` to test without real credentials.

## 🚀 Running the Application

### Option 1: Run both servers concurrently
```bash
npm run dev
```

### Option 2: Run separately

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

### Option 3: Use startup scripts

**Windows Batch**:
```bash
start.bat
```

**PowerShell**:
```bash
./start.ps1
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📚 API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/facebook` - Initiate Facebook OAuth
- `GET /api/auth/facebook/callback` - Facebook OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/link/:provider` - Link social account
- `DELETE /api/user/unlink/:provider` - Unlink social account
- `GET /api/user/auth-logs` - Get authentication logs

## 🗄️ Database Seeding

Seed the database with sample data:
```bash
npm run seed
```

## 📖 Documentation

For detailed documentation about the project architecture, authentication flow, and how everything works together, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).

## 🔒 Security Features

- HTTP security headers (Helmet)
- CORS configuration
- Rate limiting
- JWT with httpOnly cookies
- Refresh token rotation
- Input validation
- Request correlation IDs
- Comprehensive logging

## 📁 Project Structure

```
├── backend/              # Backend Node.js application
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   └── utils/           # Helper functions
├── frontend/            # Frontend React application
│   └── src/
│       ├── components/  # React components
│       ├── context/     # React Context
│       └── services/    # API services
└── PROJECT_DOCUMENTATION.md  # Detailed documentation
```

## 🧪 Testing

### Mock OAuth Mode
Set `MOCK_OAUTH=true` in backend `.env` to test authentication without real OAuth credentials. This creates mock users and simulates the OAuth flow.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Abhishek**
- GitHub: [@Abhishekkx](https://github.com/Abhishekkx)

## 🙏 Acknowledgments

- Passport.js for OAuth strategies
- React team for the amazing framework
- MongoDB for the database
- All open-source contributors

---

**Note**: Remember to never commit your `.env` files or expose your OAuth credentials publicly!
