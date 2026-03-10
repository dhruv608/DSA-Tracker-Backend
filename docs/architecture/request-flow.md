# Request Flow Architecture

## 🔄 Complete Request Lifecycle

This document explains how a request flows through the DSA Tracker backend system from the moment it enters the server to when the response is returned to the client.

## 📋 Request Flow Overview

```
Client Request → Express Router → Middleware Chain → Controller → Service → Database → Response
```

## 🎯 Detailed Request Flow

### **Step 1: Request Reception**
```typescript
// Express app receives HTTP request
app.use('/api/students', studentRoutes);
```

**What happens:**
- Express server receives HTTP request
- Router matches the endpoint pattern
- Request is passed to appropriate route handler

### **Step 2: Middleware Chain Processing**
```typescript
// Student routes middleware chain
router.use(verifyToken, isStudent, extractStudentInfo);
```

**Middleware Execution Order:**
1. **verifyToken** - Authentication middleware
2. **isStudent** - Role authorization middleware  
3. **extractStudentInfo** - Data enrichment middleware

#### **2.1 Authentication Middleware (verifyToken)**
```typescript
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    // Validate token presence
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
    
    // Attach user data to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

**What happens:**
- Extracts Bearer token from Authorization header
- Validates token format and presence
- Verifies JWT signature and expiration
- Decodes token payload
- Attaches user information to request object
- Passes control to next middleware

#### **2.2 Role Authorization Middleware (isStudent)**
```typescript
export const isStudent = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  // Check if user has student role
  if (user.userType !== 'student' || user.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Student access required' });
  }
  
  next();
};
```

**What happens:**
- Extracts user information from request
- Validates user role and type
- Checks if user has required permissions
- Returns 403 Forbidden if unauthorized
- Passes control to next middleware if authorized

#### **2.3 Data Enrichment Middleware (extractStudentInfo)**
```typescript
export const extractStudentInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    
    // Fetch student details from database
    const student = await prisma.student.findUnique({
      where: { id: userId },
      include: {
        batch: {
          select: {
            id: true,
            batch_name: true,
            slug: true
          }
        },
        city: {
          select: {
            id: true,
            city_name: true
          }
        }
      }
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Attach enriched student data to request
    (req as any).student = {
      id: student.id,
      batchId: student.batch?.id,
      batchName: student.batch?.batch_name,
      batchSlug: student.batch?.slug,
      cityId: student.city?.id,
      cityName: student.city?.city_name
    };
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to extract student info' });
  }
};
```

**What happens:**
- Extracts user ID from JWT payload
- Fetches complete student profile from database
- Includes related batch and city information
- Attaches enriched student data to request
- Provides context for subsequent processing

### **Step 3: Route Handler Invocation**
```typescript
// Route definition
router.get("/topics", getTopicsWithBatchProgress);
```

**What happens:**
- Express matches route pattern `/topics`
- Invokes the specified controller function
- Passes request and response objects to controller

### **Step 4: Controller Processing**
```typescript
export const getTopicsWithBatchProgress = async (req: Request, res: Response) => {
  try {
    // Extract data from enriched request
    const studentId = (req as any).student?.id;
    const batchId = (req as any).student?.batchId;
    
    // Validate required data
    if (!studentId || !batchId) {
      return res.status(400).json({ error: 'Student ID and Batch ID are required' });
    }
    
    // Call service layer
    const topics = await getTopicsWithBatchProgressService({
      studentId,
      batchId
    });
    
    // Send response
    res.json(topics);
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};
```

**Controller Responsibilities:**
- Extract relevant data from request object
- Validate input parameters
- Call appropriate service function
- Handle service response
- Format and send HTTP response
- Handle errors appropriately

### **Step 5: Service Layer Business Logic**
```typescript
export const getTopicsWithBatchProgressService = async ({
  studentId,
  batchId
}: GetTopicsWithBatchProgressInput) => {
  // Complex database query with multiple joins
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
        },
        orderBy: { created_at: 'asc' }
      }
    }
  });
  
  // Business logic: Collect assigned question IDs
  const assignedQuestionIds = new Set<number>();
  topics.forEach((topic: any) => {
    topic.classes.forEach((cls: any) => {
      cls.questionVisibility.forEach((qv: any) => {
        assignedQuestionIds.add(qv.question.id);
      });
    });
  });
  
  // Business logic: Get student progress for assigned questions
  const studentProgress = await prisma.studentProgress.findMany({
    where: {
      student_id: studentId,
      question_id: { in: Array.from(assignedQuestionIds) }
    },
    include: {
      question: {
        select: { topic_id: true }
      }
    }
  });
  
  // Business logic: Group solved questions by topic
  const solvedByTopic = new Map<number, Set<number>>();
  studentProgress.forEach(progress => {
    const topicId = progress.question.topic_id;
    if (!solvedByTopic.has(topicId)) {
      solvedByTopic.set(topicId, new Set());
    }
    solvedByTopic.get(topicId)!.add(progress.question_id);
  });
  
  // Business logic: Format response data
  const formattedTopics = topics.map((topic: any) => {
    const assignedQuestions = new Set<number>();
    
    topic.classes.forEach((cls: any) => {
      cls.questionVisibility.forEach((qv: any) => {
        if (qv.question.topic_id === topic.id) {
          assignedQuestions.add(qv.question.id);
        }
      });
    });
    
    const solvedQuestions = solvedByTopic.get(topic.id) || new Set();
    
    return {
      id: topic.id,
      topic_name: topic.topic_name,
      slug: topic.slug,
      batchSpecificData: {
        totalClasses: topic.classes.length,
        totalQuestions: assignedQuestions.size,
        solvedQuestions: solvedQuestions.size
      }
    };
  });
  
  return formattedTopics;
};
```

**Service Layer Responsibilities:**
- Execute complex business logic
- Perform database operations via Prisma
- Handle data transformation and aggregation
- Enforce business rules
- Process multiple related entities
- Return formatted data to controller

### **Step 6: Database Operations**
```typescript
// Prisma ORM operations
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
```

**Database Layer Responsibilities:**
- Execute SQL queries via Prisma ORM
- Handle database connections
- Manage transactions
- Enforce data integrity
- Return structured data

### **Step 7: Response Formation**
```typescript
// Controller sends response
res.json(topics);
```

**Response Process:**
- Express converts JavaScript object to JSON
- Sets appropriate Content-Type header
- Sends response to client
- Closes HTTP connection

## 🔍 Error Flow Handling

### **Error Propagation Path**
```
Database Error → Service Layer → Controller → Error Handler → Client
```

### **Error Handler Middleware**
```typescript
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);
  
  // Handle Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({ error: 'Resource already exists' });
      case 'P2025':
        return res.status(404).json({ error: 'Resource not found' });
      default:
        return res.status(400).json({ error: 'Database operation failed' });
    }
  }
  
  // Handle validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: 'Invalid data provided' });
  }
  
  // Handle JWT errors
  if (error instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Generic error
  res.status(500).json({ error: 'Internal server error' });
};
```

## 📊 Request Flow Examples

### **Example 1: Student Topics Request**
```
GET /api/students/topics
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Flow:
1. Express matches /api/students/topics route
2. verifyToken middleware validates JWT
3. isStudent middleware checks role
4. extractStudentInfo middleware fetches student data
5. getTopicsWithBatchProgress controller extracts studentId, batchId
6. getTopicsWithBatchProgressService executes complex query
7. Prisma executes SQL with joins
8. Service processes and formats data
9. Controller returns JSON response
10. Client receives topics with progress data
```

### **Example 2: Authentication Request**
```
POST /api/auth/student/login
Content-Type: application/json
{
  "email": "student@example.com",
  "password": "password123"
}

Flow:
1. Express matches /api/auth/student/login route
2. No middleware chain (public endpoint)
3. loginStudent controller extracts credentials
4. loginStudentService validates password
5. Prisma queries student table
6. Service generates JWT tokens
7. Controller returns tokens and user data
8. Client receives authentication response
```

### **Example 3: Error Scenario**
```
GET /api/students/topics
Authorization: Bearer invalid_token

Flow:
1. Express matches route
2. verifyToken middleware attempts to validate token
3. JWT verification fails
4. Middleware returns 401 Unauthorized
5. Request flow stops
6. Client receives error response
```

## 🚀 Performance Optimizations in Request Flow

### **Database Query Optimization**
```typescript
// Efficient query with selective includes
const topics = await prisma.topic.findMany({
  include: {
    classes: {
      where: { batch_id: batchId }, // Filter at database level
      include: {
        questionVisibility: {
          include: {
            question: {
              select: { id: true, topic_id: true } // Select only needed fields
            }
          }
        }
      }
    }
  }
});
```

### **Memory Management**
```typescript
// Use Sets for efficient duplicate checking
const assignedQuestionIds = new Set<number>();
// Use Maps for efficient lookups
const solvedByTopic = new Map<number, Set<number>>();
```

### **Response Optimization**
```typescript
// Format response to include only necessary data
return {
  id: topic.id,
  topic_name: topic.topic_name,
  slug: topic.slug,
  batchSpecificData: {
    totalClasses: topic.classes.length,
    totalQuestions: assignedQuestions.size,
    solvedQuestions: solvedQuestions.size
  }
};
```

## 🔧 Request Flow Debugging

### **Logging Strategy**
```typescript
// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Service layer logging
console.log(`Fetching topics for student ${studentId}, batch ${batchId}`);

// Error logging
console.error('Service error:', error);
```

### **Request Tracing**
```typescript
// Add request ID for tracking
app.use((req, res, next) => {
  req.headers['x-request-id'] = uuidv4();
  next();
});
```

This request flow architecture ensures clean separation of concerns, proper error handling, and maintainable code while providing the flexibility to handle complex business logic requirements.
