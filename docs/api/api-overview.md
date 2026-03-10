# API Overview

## 🎯 API Architecture

The DSA Tracker API is built on RESTful principles with comprehensive role-based access control, efficient data handling, and consistent response patterns. The API serves three distinct user roles: SuperAdmin, Teachers/Admins, and Students.

## 🏛️ API Structure

### **Base URL**
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### **API Routes Organization**
```
/api/
├── auth/           # Authentication endpoints
├── students/       # Student-specific endpoints
├── admin/          # Teacher/Admin endpoints
└── superadmin/     # SuperAdmin endpoints
```

### **Route Protection**
```typescript
// Authentication middleware chain
app.use('/api/students', verifyToken, isStudent, extractStudentInfo);
app.use('/api/admin', verifyToken, isAdmin, extractAdminInfo);
app.use('/api/superadmin', verifyToken, isSuperAdmin);
```

## 🔐 Authentication System

### **JWT Token-Based Authentication**
The API uses JSON Web Tokens (JWT) for authentication with a dual-token system (access + refresh tokens).

#### **Token Structure**
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
  iat: number;  // Issued at
  exp: number;  // Expiration time
}
```

#### **Authentication Flow**
```
1. User Login → Credentials Validation
2. Token Generation → Access Token + Refresh Token
3. Token Storage → Database + Client
4. API Requests → Bearer Token in Authorization Header
5. Token Validation → Middleware Verification
6. Token Refresh → Automatic Renewal
```

### **Authorization Headers**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## 📋 Response Format Standards

### **Success Response Structure**
```json
{
  "message": "Operation completed successfully",
  "data": {
    // Response data specific to endpoint
  },
  "pagination": {  // For paginated responses
    "page": 1,
    "limit": 20,
    "totalQuestions": 150,
    "totalPages": 8
  },
  "filters": {      // For filtered responses
    "topics": [...],
    "levels": [...],
    "platforms": [...]
  },
  "stats": {        // For statistical responses
    "total": 150,
    "solved": 45
  }
}
```

### **Error Response Structure**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation_error",
    "message": "Specific error details"
  }
}
```

### **HTTP Status Codes**
| Status | Usage | Description |
|--------|-------|-------------|
| `200` | Success | Request completed successfully |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists |
| `500` | Server Error | Internal server error |

## 🔄 Request Processing Pipeline

### **Middleware Chain**
```
Request → Authentication → Authorization → Data Extraction → Controller → Service → Database → Response
```

### **Middleware Functions**
```typescript
// 1. Authentication (verifyToken)
export const verifyToken = (req, res, next) => {
  // JWT token validation
  // Token extraction and verification
  // User payload attachment to request
};

// 2. Role Authorization (isStudent, isAdmin, isSuperAdmin)
export const isStudent = (req, res, next) => {
  // Role validation
  // Permission checking
  // Access control enforcement
};

// 3. Data Extraction (extractStudentInfo, extractAdminInfo)
export const extractStudentInfo = async (req, res, next) => {
  // Database user data fetching
  // Context enrichment
  // Request object augmentation
};
```

## 📊 Data Handling Patterns

### **Pagination Strategy**
```typescript
interface PaginationParams {
  page: number;      // Current page (default: 1)
  limit: number;     // Items per page (default: 20)
}

// Implementation
const skip = (page - 1) * limit;
const items = await prisma.model.findMany({
  skip,
  take: limit,
  // ... other filters
});
```

### **Filtering System**
```typescript
interface FilterParams {
  search?: string;     // Text search
  topic?: string;      // Topic slug filter
  level?: string;      // Difficulty filter
  platform?: string;   // Platform filter
  type?: string;       // Question type filter
  solved?: string;     // Solved status filter
}

// Implementation
const whereClause = {
  ...(search && {
    OR: [
      { question_name: { contains: search, mode: 'insensitive' } },
      { topic: { topic_name: { contains: search, mode: 'insensitive' } } }
    ]
  }),
  ...(topic && { topic: { slug: topic } }),
  ...(level && { level: level.toUpperCase() }),
  ...(platform && { platform: platform.toUpperCase() }),
  ...(type && { type: type.toUpperCase() }),
  ...(solved && { progress: { some: { student_id: studentId } } })
};
```

### **Data Selection Optimization**
```typescript
// Efficient field selection
const optimizedQuery = await prisma.model.findMany({
  select: {
    id: true,
    name: true,
    // Only select needed fields
    related: {
      select: {
        id: true,
        name: true
        // Nested field selection
      }
    }
  }
});
```

## 🎯 API Design Principles

### **RESTful Conventions**
- **Resource-Based URLs**: Nouns, not verbs
- **HTTP Methods**: Proper method usage
- **Status Codes**: Standard HTTP responses
- **Consistent Patterns**: Uniform endpoint structure

### **Endpoint Naming**
```
GET    /api/students/topics           # List topics
GET    /api/students/topics/:id      # Get specific topic
POST   /api/students/topics          # Create topic
PUT    /api/students/topics/:id      # Update topic
DELETE /api/students/topics/:id      # Delete topic
```

### **Query Parameters**
```
GET /api/students/addedQuestions?page=1&limit=20&level=EASY&platform=LEETCODE&solved=true
```

### **Request Body Validation**
```typescript
interface CreateTopicRequest {
  topic_name: string;
  description?: string;
  order?: number;
}

// Validation in controller
const { topic_name, description, order } = req.body;
if (!topic_name) {
  return res.status(400).json({ error: 'Topic name is required' });
}
```

## 🚀 Performance Optimizations

### **Database Query Optimization**
```typescript
// Efficient joins with selective includes
const optimizedQuery = await prisma.topic.findMany({
  include: {
    classes: {
      where: { batch_id: batchId }, // Filter at database level
      include: {
        questionVisibility: {
          include: {
            question: {
              select: { id: true, level: true } // Select only needed fields
            }
          }
        }
      }
    }
  }
});
```

### **Caching Strategy**
```typescript
// In-memory caching for frequently accessed data
const cache = new Map();

const getCachedData = async (key: string, fetchFunction: () => Promise<any>) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchFunction();
  cache.set(key, data);
  
  // Set cache expiration
  setTimeout(() => cache.delete(key), 5 * 60 * 1000); // 5 minutes
  
  return data;
};
```

### **Response Compression**
```typescript
// Gzip compression for API responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));
```

## 🛡️ Security Measures

### **Input Validation**
```typescript
// Sanitize and validate all inputs
const sanitizeInput = (input: any) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};
```

### **SQL Injection Prevention**
```typescript
// Prisma ORM provides automatic SQL injection protection
// No raw SQL queries without proper escaping
const safeQuery = await prisma.student.findMany({
  where: {
    email: sanitizedEmail
  }
});
```

### **Rate Limiting**
```typescript
// Implement rate limiting for API protection
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP'
}));
```

## 📈 Monitoring & Logging

### **Request Logging**
```typescript
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});
```

### **Error Tracking**
```typescript
// Comprehensive error handling
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error details
  console.error({
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Send appropriate error response
  res.status(500).json({ error: 'Internal server error' });
};
```

## 🔧 API Development Guidelines

### **Controller Responsibilities**
- HTTP request/response handling
- Input validation and sanitization
- Response formatting
- Error handling and propagation

### **Service Layer Responsibilities**
- Business logic implementation
- Database operations via Prisma
- Data transformation and aggregation
- External service integrations

### **Error Handling Best Practices**
```typescript
// Consistent error handling pattern
try {
  const result = await serviceOperation(params);
  res.json(result);
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    return res.status(400).json({ error: 'Database operation failed' });
  }
  
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  
  // Generic error handling
  console.error('Unexpected error:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

### **Testing Strategy**
```typescript
// API endpoint testing
describe('GET /api/students/topics', () => {
  it('should return topics for authenticated student', async () => {
    const response = await request(app)
      .get('/api/students/topics')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  it('should require authentication', async () => {
    await request(app)
      .get('/api/students/topics')
      .expect(401);
  });
});
```

## 📚 API Documentation Standards

### **Endpoint Documentation Structure**
Each API endpoint should include:
- **Purpose**: What the endpoint does
- **Method**: HTTP method and URL
- **Authentication**: Required auth level
- **Parameters**: Query and body parameters
- **Request**: Example request structure
- **Response**: Example response structure
- **Errors**: Possible error responses
- **Usage**: How to use the response

### **Example Documentation**
```markdown
## Get Topics with Progress

### Endpoint
`GET /api/students/topics`

### Description
Retrieves all topics with batch-specific progress information for the authenticated student.

### Authentication
- **Required**: Student JWT token
- **Middleware**: verifyToken, isStudent, extractStudentInfo

### Parameters
None

### Response
```json
{
  "data": [
    {
      "id": 1,
      "topic_name": "Arrays and Strings",
      "slug": "arrays-strings",
      "batchSpecificData": {
        "totalClasses": 3,
        "totalQuestions": 15,
        "solvedQuestions": 8
      }
    }
  ]
}
```

### Errors
- `401`: Authentication required
- `403`: Student access required
- `500`: Server error
```

This API overview provides the foundation for understanding the DSA Tracker's API architecture, design principles, and implementation patterns.
