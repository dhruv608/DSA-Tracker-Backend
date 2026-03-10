# Authentication API Documentation

## 🔐 Authentication Overview

The DSA Tracker uses JWT (JSON Web Token) based authentication with a dual-token system (access token + refresh token) for secure user authentication across three different user roles: Student, Teacher/Admin, and SuperAdmin.

## 📋 Authentication Endpoints

| Endpoint | Method | Role Access | Description |
|----------|--------|------------|-------------|
| `/api/auth/student/register` | POST | Public | Student registration |
| `/api/auth/student/login` | POST | Public | Student authentication |
| `/api/auth/admin/register` | POST | Public | Teacher/Intern registration |
| `/api/auth/admin/login` | POST | Public | Teacher/Intern authentication |
| `/api/auth/superadmin/login` | POST | Public | SuperAdmin authentication |
| `/api/auth/refresh` | POST | Public | Refresh access token |
| `/api/auth/logout` | POST | Authenticated | User logout |

---

## 👨‍🎓 Student Registration

### **Endpoint**
`POST /api/auth/student/register`

### **Description**
Registers a new student account with the system. Students can register using email/username and password, or via OAuth integration.

### **Authentication**
- **Required**: None (Public endpoint)
- **Middleware**: None

### **Request Headers**
```http
Content-Type: application/json
```

### **Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "password123",
  "enrollment_id": "ENR2025001",
  "batch_id": 1,
  "leetcode_id": "johndoe_lc",
  "gfg_id": "johndoe_gfg"
}
```

### **Request Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Student's full name |
| `email` | string | Yes | Student's email (unique) |
| `username` | string | Yes | Unique username |
| `password` | string | Yes | Student's password |
| `enrollment_id` | string | No | Institutional enrollment ID |
| `batch_id` | number | Yes | Assigned batch ID |
| `leetcode_id` | string | No | LeetCode username |
| `gfg_id` | string | No | GeeksforGeeks username |

### **Example Request**
```bash
curl -X POST http://localhost:5000/api/auth/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "password": "password123",
    "enrollment_id": "ENR2025001",
    "batch_id": 1,
    "leetcode_id": "johndoe_lc",
    "gfg_id": "johndoe_gfg"
  }'
```

### **Success Response (201)**
```json
{
  "message": "Student registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "city": {
      "id": 1,
      "city_name": "Bangalore",
      "slug": "bangalore"
    },
    "batch": {
      "id": 1,
      "batch_name": "SO-Batch-2025",
      "slug": "so-batch-2025"
    }
  }
}
```

### **Error Responses**
- `400`: Invalid input data
- `409`: Email or username already exists
- `500`: Server error

---

## 👨‍🎓 Student Login

### **Endpoint**
`POST /api/auth/student/login`

### **Description**
Authenticates a student and returns JWT tokens for session management.

### **Authentication**
- **Required**: None (Public endpoint)
- **Middleware**: None

### **Request Headers**
```http
Content-Type: application/json
```

### **Request Body**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### **Request Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Student's email |
| `password` | string | Yes | Student's password |

### **Example Request**
```bash
curl -X POST http://localhost:5000/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### **Success Response (200)**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "STUDENT",
    "city": {
      "id": 1,
      "city_name": "Bangalore",
      "slug": "bangalore"
    },
    "batch": {
      "id": 1,
      "batch_name": "SO-Batch-2025",
      "slug": "so-batch-2025"
    }
  }
}
```

### **Response Fields**
| Field | Type | Description |
|-------|------|-------------|
| `accessToken` | string | JWT access token (7 days expiry) |
| `refreshToken` | string | JWT refresh token (7 days expiry) |
| `user` | object | User profile information |

### **Error Responses**
- `400`: Invalid credentials
- `401`: Authentication failed
- `500`: Server error

---

## 👨‍🏫 Admin Registration

### **Endpoint**
`POST /api/auth/admin/register`

### **Description**
Registers a new admin user (Teacher or Intern) in the system.

### **Authentication**
- **Required**: None (Public endpoint)
- **Middleware**: None

### **Request Headers**
```http
Content-Type: application/json
```

### **Request Body**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "username": "janesmith",
  "password": "password123",
  "role": "TEACHER",
  "batch_id": 1,
  "city_id": 1
}
```

### **Request Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Admin's full name |
| `email` | string | Yes | Admin's email (unique) |
| `username` | string | Yes | Unique username |
| `password` | string | Yes | Admin's password |
| `role` | string | Yes | Admin role (TEACHER/INTERN) |
| `batch_id` | number | Yes | Assigned batch ID |
| `city_id` | number | Yes | Assigned city ID |

### **Success Response (201)**
```json
{
  "message": "Admin registered successfully",
  "user": {
    "id": 1,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "username": "janesmith",
    "role": "TEACHER",
    "city": {
      "id": 1,
      "city_name": "Bangalore",
      "slug": "bangalore"
    },
    "batch": {
      "id": 1,
      "batch_name": "SO-Batch-2025",
      "slug": "so-batch-2025"
    }
  }
}
```

---

## 👨‍🏫 Admin Login

### **Endpoint**
`POST /api/auth/admin/login`

### **Description**
Authenticates an admin user (Teacher or Intern) and returns JWT tokens.

### **Request Body**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### **Success Response (200)**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "username": "janesmith",
    "role": "TEACHER",
    "city": {
      "id": 1,
      "city_name": "Bangalore",
      "slug": "bangalore"
    },
    "batch": {
      "id": 1,
      "batch_name": "SO-Batch-2025",
      "slug": "so-batch-2025"
    }
  }
}
```

---

## 🏛️ SuperAdmin Login

### **Endpoint**
`POST /api/auth/superadmin/login`

### **Description**
Authenticates a SuperAdmin user and returns JWT tokens for system administration.

### **Request Body**
```json
{
  "email": "superadmin@example.com",
  "password": "superadmin123"
}
```

### **Success Response (200)**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Super Admin",
    "email": "superadmin@example.com",
    "username": "superadmin",
    "role": "SUPERADMIN"
  }
}
```

---

## 🔄 Token Refresh

### **Endpoint**
`POST /api/auth/refresh`

### **Description**
Refreshes the access token using a valid refresh token.

### **Authentication**
- **Required**: Valid refresh token
- **Middleware**: None

### **Request Headers**
```http
Content-Type: application/json
```

### **Request Body**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Success Response (200)**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Error Responses**
- `400`: Invalid refresh token
- `401`: Refresh token expired
- `500`: Server error

---

## 🚪 Logout

### **Endpoint**
`POST /api/auth/logout`

### **Description**
Logs out the user by invalidating the refresh token in the database.

### **Authentication**
- **Required**: Valid access token
- **Middleware**: verifyToken

### **Request Headers**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### **Success Response (200)**
```json
{
  "message": "Logout successful"
}
```

---

## 🔐 JWT Token Structure

### **Access Token Payload**
```typescript
interface JWTPayload {
  id: number;
  email: string;
  role: 'SUPERADMIN' | 'TEACHER' | 'INTERN' | 'STUDENT';
  userType: 'admin' | 'student';
  batchId?: number;
  batchName?: string;
  batchSlug?: string;
  cityId?: number;
  cityName?: string;
  iat: number;  // Issued at timestamp
  exp: number;  // Expiration timestamp
}
```

### **Token Expiration**
- **Access Token**: 7 days
- **Refresh Token**: 7 days
- **Automatic Refresh**: Implemented in client-side

---

## 🔒 Security Implementation

### **Password Hashing**
```typescript
import bcrypt from 'bcrypt';

// Hash password during registration
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password during login
const isValidPassword = await bcrypt.compare(password, user.password_hash);
```

### **JWT Token Generation**
```typescript
import jwt from 'jsonwebtoken';

// Generate access token
const accessToken = jwt.sign(
  payload,
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '7d' }
);

// Generate refresh token
const refreshToken = jwt.sign(
  { id: userId },
  process.env.JWT_REFRESH_SECRET!,
  { expiresIn: '7d' }
);
```

### **Token Validation Middleware**
```typescript
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 📱 Frontend Integration

### **Login Implementation**
```javascript
// Student login
const login = async (email, password) => {
  try {
    const response = await fetch('/api/auth/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

### **Token Refresh Implementation**
```javascript
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.accessToken;
    } else {
      // Refresh failed, redirect to login
      logout();
      throw new Error('Token refresh failed');
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    logout();
    throw error;
  }
};
```

### **Authenticated Request Helper**
```javascript
const authenticatedFetch = async (url, options = {}) => {
  let accessToken = localStorage.getItem('accessToken');
  
  const makeRequest = async (token) => {
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  };
  
  let response = await makeRequest(accessToken);
  
  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      accessToken = await refreshAccessToken();
      response = await makeRequest(accessToken);
    } catch (error) {
      // Refresh failed, redirect to login
      window.location.href = '/login';
      throw error;
    }
  }
  
  return response;
};
```

---

## 🧪 Testing Examples

### **Student Registration Test**
```javascript
describe('POST /api/auth/student/register', () => {
  it('should register a new student', async () => {
    const response = await request(app)
      .post('/api/auth/student/register')
      .send({
        name: 'Test Student',
        email: 'test@example.com',
        username: 'teststudent',
        password: 'password123',
        batch_id: 1
      })
      .expect(201);
    
    expect(response.body.message).toBe('Student registered successfully');
    expect(response.body.user.email).toBe('test@example.com');
  });
  
  it('should not register with duplicate email', async () => {
    await request(app)
      .post('/api/auth/student/register')
      .send({
        name: 'Test Student',
        email: 'test@example.com',
        username: 'teststudent2',
        password: 'password123',
        batch_id: 1
      })
      .expect(409);
  });
});
```

### **Login Test**
```javascript
describe('POST /api/auth/student/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/student/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);
    
    expect(response.body.message).toBe('Login successful');
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });
  
  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/student/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
      .expect(401);
  });
});
```

---

## 📊 Error Handling

### **Common Error Responses**
```json
{
  "error": "Email already exists",
  "code": "EMAIL_EXISTS"
}
```

```json
{
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

```json
{
  "error": "Token expired",
  "code": "TOKEN_EXPIRED"
}
```

### **Error Codes**
| Code | Description | HTTP Status |
|------|-------------|-------------|
| `EMAIL_EXISTS` | Email already registered | 409 |
| `USERNAME_EXISTS` | Username already taken | 409 |
| `INVALID_CREDENTIALS` | Wrong email/password | 401 |
| `USER_NOT_FOUND` | User does not exist | 404 |
| `TOKEN_EXPIRED` | JWT token expired | 401 |
| `INVALID_TOKEN` | Invalid JWT token | 401 |
| `VALIDATION_ERROR` | Input validation failed | 400 |

---

## 🚀 Best Practices

### **Password Security**
- Use bcrypt with salt rounds >= 10
- Implement password strength requirements
- Never store plain text passwords

### **Token Management**
- Store tokens securely (httpOnly cookies recommended)
- Implement automatic token refresh
- Handle token expiration gracefully

### **Error Handling**
- Don't reveal specific error details for authentication failures
- Log authentication attempts for security monitoring
- Implement rate limiting for login endpoints

### **Frontend Security**
- Clear tokens on logout
- Implement session timeout
- Use HTTPS in production
- Validate tokens on every request

This authentication API provides secure, role-based access control for the DSA Tracker system with comprehensive token management and security features.
