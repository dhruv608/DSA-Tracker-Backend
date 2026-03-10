# Backend Architecture

## 🏗️ Technology Stack

### **Core Technologies**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)

### **Development Tools**
- **Package Manager**: npm
- **Build Tool**: TypeScript Compiler
- **Linting**: ESLint
- **Environment**: dotenv
- **Testing**: Jest (planned)

## 📁 Project Structure

```
src/
├── app.ts              # Express app configuration
├── server.ts           # Server startup and initialization
├── config/             # Configuration files
│   └── prisma.ts       # Prisma client configuration
├── controllers/        # API route handlers
│   ├── auth.controller.ts
│   ├── topic.controller.ts
│   ├── class.controller.ts
│   ├── questionVisibility.controller.ts
│   ├── leaderboard.controller.ts
│   ├── profile.controller.ts
│   └── studentProfile.controller.ts
├── middlewares/        # Request processing middleware
│   ├── auth.middleware.ts
│   ├── role.middleware.ts
│   ├── student.middleware.ts
│   └── errorHandler.middleware.ts
├── routes/            # API route definitions
│   ├── auth.routes.ts
│   ├── student.routes.ts
│   ├── admin.routes.ts
│   └── superadmin.routes.ts
├── services/          # Business logic layer
│   ├── auth.service.ts
│   ├── topic.service.ts
│   ├── class.service.ts
│   ├── questionVisibility.service.ts
│   ├── leaderboard.service.ts
│   ├── student.service.ts
│   └── profile.service.ts
├── utils/             # Utility functions
│   ├── jwt.util.ts
│   ├── password.util.ts
│   └── validation.util.ts
├── types/             # TypeScript type definitions
│   ├── auth.types.ts
│   └── api.types.ts
├── jobs/              # Background jobs
│   └── sync.jobs.ts
└── workers/           # Worker processes
    └── leaderboard.worker.ts
```

## 🔄 Layer Architecture

### **1. Application Layer (app.ts)**
```typescript
// Express application configuration
- CORS setup
- JSON parsing
- Route mounting
- Error handling
- Health check endpoint
```

### **2. Routing Layer (routes/)**
```typescript
// API endpoint definitions
- HTTP method mapping
- Middleware composition
- Controller binding
- Parameter validation
```

### **3. Middleware Layer (middlewares/)**
```typescript
// Request processing pipeline
- Authentication (JWT verification)
- Authorization (role checking)
- Data extraction (student info)
- Error handling
```

### **4. Controller Layer (controllers/)**
```typescript
// HTTP request/response handling
- Request parameter extraction
- Input validation
- Response formatting
- Error propagation
```

### **5. Service Layer (services/)**
```typescript
// Business logic implementation
- Database operations
- Data transformation
- Business rule enforcement
- External integrations
```

### **6. Data Layer (Prisma)**
```typescript
// Database abstraction
- Query building
- Transaction management
- Relationship handling
- Data validation
```

## 🎯 Layer Responsibilities

### **Controllers**
- **Purpose**: HTTP request/response handling
- **Responsibilities**:
  - Extract request parameters
  - Validate input data
  - Call appropriate services
  - Format response data
  - Handle HTTP status codes
- **Example**: `topic.controller.ts`

```typescript
export const getTopicsWithBatchProgress = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).student?.id;
    const batchId = (req as any).student?.batchId;
    
    const topics = await getTopicsWithBatchProgressService({
      studentId,
      batchId
    });
    
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};
```

### **Services**
- **Purpose**: Business logic implementation
- **Responsibilities**:
  - Database operations via Prisma
  - Data transformation and aggregation
  - Business rule enforcement
  - Complex query orchestration
- **Example**: `topic.service.ts`

```typescript
export const getTopicsWithBatchProgressService = async ({
  studentId,
  batchId
}: GetTopicsWithBatchProgressInput) => {
  // Complex database query with joins
  const topics = await prisma.topic.findMany({
    include: {
      classes: {
        where: { batch_id: batchId },
        include: {
          questionVisibility: {
            include: {
              question: {
                select: { id: true, topic_id: true }
              }
            }
          }
        }
      }
    }
  });
  
  // Business logic for progress calculation
  const assignedQuestionIds = new Set<number>();
  topics.forEach(topic => {
    topic.classes.forEach(cls => {
      cls.questionVisibility.forEach(qv => {
        assignedQuestionIds.add(qv.question.id);
      });
    });
  });
  
  // Additional processing...
  return formattedTopics;
};
```

### **Middleware**
- **Purpose**: Request processing pipeline
- **Responsibilities**:
  - Authentication verification
  - Role-based authorization
  - Data extraction and enrichment
  - Error handling
- **Example**: `auth.middleware.ts`

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

## 🔐 Authentication & Authorization

### **JWT Token Structure**
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
  iat: number;
  exp: number;
}
```

### **Role-Based Access Control**
```typescript
// Middleware chain example
router.use(verifyToken, isStudent, extractStudentInfo);

// Role checking middleware
export const isStudent = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user.userType !== 'student' || user.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Student access required' });
  }
  next();
};
```

## 🗄️ Database Architecture

### **Prisma ORM Benefits**
- **Type Safety**: Auto-generated TypeScript types
- **Query Builder**: Intuitive database queries
- **Migrations**: Schema version control
- **Relationships**: Automatic join handling
- **Performance**: Query optimization

### **Connection Management**
```typescript
// Prisma client configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});
```

### **Transaction Handling**
```typescript
// Example transaction
const result = await prisma.$transaction(async (tx) => {
  const student = await tx.student.create({
    data: studentData
  });
  
  const leaderboard = await tx.leaderboard.create({
    data: {
      student_id: student.id
    }
  });
  
  return { student, leaderboard };
});
```

## 🔄 Request Processing Flow

### **Complete Request Lifecycle**
```
1. HTTP Request → Express Router
2. Route Matching → Middleware Chain
3. Authentication → JWT Verification
4. Authorization → Role Checking
5. Data Extraction → Student Info Enrichment
6. Controller → Request Handling
7. Service → Business Logic
8. Database → Prisma Operations
9. Response → JSON Formatting
10. Client → Response Processing
```

### **Error Handling Strategy**
```typescript
// Global error handler
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    return res.status(400).json({ error: 'Database operation failed' });
  }
  
  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: 'Invalid data provided' });
  }
  
  // Generic error
  res.status(500).json({ error: 'Internal server error' });
};
```

## 🚀 Performance Considerations

### **Database Optimization**
- **Indexing**: Strategic indexes on frequently queried fields
- **Query Optimization**: Efficient Prisma queries with proper selects
- **Connection Pooling**: Database connection management
- **Caching Strategy**: In-memory caching for frequently accessed data

### **API Performance**
- **Pagination**: Limit-based pagination for large datasets
- **Filtering**: Server-side filtering to reduce data transfer
- **Response Compression**: Gzip compression for API responses
- **Rate Limiting**: Request throttling for API protection

### **Memory Management**
- **Stream Processing**: For large data operations
- **Garbage Collection**: Proper cleanup of resources
- **Connection Management**: Database connection lifecycle

## 🔧 Development Best Practices

### **Code Organization**
- **Single Responsibility**: Each function has one clear purpose
- **Dependency Injection**: Services receive dependencies
- **Error Boundaries**: Proper error handling at each layer
- **Type Safety**: Comprehensive TypeScript usage

### **Database Design**
- **Normalization**: Proper database normalization
- **Constraints**: Foreign key constraints for data integrity
- **Indexes**: Strategic indexing for performance
- **Migrations**: Version-controlled schema changes

### **API Design**
- **RESTful Principles**: Resource-based endpoints
- **Consistent Responses**: Standardized response formats
- **HTTP Status Codes**: Proper status code usage
- **Documentation**: Comprehensive API documentation

## 📈 Scalability Architecture

### **Horizontal Scaling**
- **Stateless Design**: No session state in application
- **Database Sharding**: Potential for database partitioning
- **Load Balancing**: Multiple application instances
- **Caching Layer**: Redis for distributed caching

### **Vertical Scaling**
- **Resource Optimization**: Efficient resource usage
- **Database Tuning**: Query and index optimization
- **Memory Management**: Proper memory allocation
- **CPU Optimization**: Efficient algorithm implementation

## 🔒 Security Architecture

### **Authentication Security**
- **JWT Tokens**: Secure token generation and validation
- **Token Refresh**: Automatic token renewal
- **Password Security**: Hashing with bcrypt
- **Session Management**: Secure token storage

### **API Security**
- **CORS Configuration**: Proper cross-origin settings
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Prisma ORM protection
- **Rate Limiting**: API abuse prevention

### **Data Security**
- **Encryption**: Sensitive data encryption
- **Access Control**: Role-based permissions
- **Audit Logging**: Activity tracking
- **Data Privacy**: GDPR compliance considerations

## 🔄 Monitoring & Observability

### **Logging Strategy**
- **Structured Logging**: JSON format logs
- **Log Levels**: Error, warn, info, debug
- **Request Tracing**: Request ID tracking
- **Performance Metrics**: Response time logging

### **Health Monitoring**
- **Health Check Endpoint**: Service availability
- **Database Health**: Connection status monitoring
- **Memory Usage**: Resource consumption tracking
- **Error Rates**: Error frequency monitoring

This backend architecture provides a solid foundation for the DSA Tracker system, ensuring scalability, maintainability, and security while supporting the complex requirements of educational content management and progress tracking.
