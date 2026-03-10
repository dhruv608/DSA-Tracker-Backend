# Roles & Permissions Overview

## 🎯 Role-Based Access Control (RBAC)

DSA Tracker implements a comprehensive Role-Based Access Control (RBAC) system to ensure proper security and data isolation between different user types. Each role has specific permissions, accessible features, and API endpoints.

## 👥 User Roles Hierarchy

```
SUPERADMIN
├── System Administration
├── City & Batch Management
└── Admin User Management

TEACHER / ADMIN
├── Topic Management
├── Question Assignment
├── Progress Monitoring
└── Batch Management

INTERN
├── Limited Topic Access
├── Question Assignment (Assisted)
├── Progress Viewing
└── Basic Analytics

STUDENT
├── Question Solving
├── Progress Tracking
├── Leaderboard Viewing
└ Profile Management
```

## 🔐 Authentication & Authorization Flow

### **JWT Token Structure**
```typescript
interface JWTPayload {
  id: number;
  email: string;
  role: 'SUPERADMIN' | 'TEACHER' | 'INTERN' | 'STUDENT';
  userType: 'admin' | 'student';
  batchId?: number;        // For students and some admins
  batchName?: string;       // For students and some admins
  batchSlug?: string;       // For students and some admins
  cityId?: number;          // For students and some admins
  cityName?: string;        // For students and some admins
  iat: number;              // Issued at
  exp: number;              // Expiration time
}
```

### **Middleware Chain**
```typescript
// Authentication flow for different roles
app.use('/api/students', verifyToken, isStudent, extractStudentInfo);
app.use('/api/admin', verifyToken, isAdmin, extractAdminInfo);
app.use('/api/superadmin', verifyToken, isSuperAdmin);
```

## 📋 Role Comparison Matrix

| Feature | SUPERADMIN | TEACHER | INTERN | STUDENT |
|---------|------------|---------|---------|---------|
| **System Administration** | ✅ | ❌ | ❌ | ❌ |
| **City Management** | ✅ | ❌ | ❌ | ❌ |
| **Batch Management** | ✅ | Limited | ❌ | ❌ |
| **Admin User Management** | ✅ | ❌ | ❌ | ❌ |
| **Topic Creation** | ✅ | ✅ | Limited | ❌ |
| **Question Assignment** | ✅ | ✅ | Assisted | ❌ |
| **Progress Monitoring** | ✅ | ✅ | View Only | Personal |
| **Leaderboard Access** | ✅ | ✅ | ✅ | ✅ |
| **Question Solving** | ❌ | ❌ | ❌ | ✅ |
| **Profile Management** | ✅ | ✅ | ✅ | ✅ |
| **Analytics Access** | ✅ | Batch Only | Limited | Personal |
| **User Statistics** | ✅ | Batch Only | Limited | Personal |

## 🏛️ SUPERADMIN Role

### **Primary Responsibilities**
- System-wide administration and configuration
- City and batch management
- Admin user creation and management
- System statistics and monitoring
- User role assignments

### **Accessible Features**
- ✅ Create, update, delete cities
- ✅ Create, update, delete batches
- ✅ Create, update, delete admin users
- ✅ View system-wide statistics
- ✅ Manage user roles and permissions
- ✅ System configuration and settings

### **API Access**
```
/api/superadmin/*
├── /cities (CRUD)
├── /batches (CRUD)
├── /admins (CRUD)
├── /stats (Read)
└── /settings (CRUD)
```

### **Data Access Scope**
- **Cities**: All cities in the system
- **Batches**: All batches across all cities
- **Users**: All students and admin users
- **Statistics**: System-wide analytics and metrics

## 👨‍🏫 TEACHER / ADMIN Role

### **Primary Responsibilities**
- Topic creation and management
- Question assignment to classes
- Student progress monitoring
- Batch-specific analytics
- Class schedule management

### **Accessible Features**
- ✅ Create, update, delete topics
- ✅ Create, update, delete classes
- ✅ Assign questions to classes
- ✅ Monitor student progress
- ✅ View batch-specific leaderboards
- ✅ Generate batch reports

### **API Access**
```
/api/admin/*
├── /topics (CRUD)
├── /classes (CRUD)
├── /questions (Assignment)
├── /progress (Read)
├── /leaderboard (Read)
└── /reports (Read)
```

### **Data Access Scope**
- **Topics**: Topics they've created or have access to
- **Classes**: Classes within their assigned batches
- **Students**: Students in their assigned batches
- **Progress**: Progress data for their students only

## 🧑‍💻 INTERN Role

### **Primary Responsibilities**
- Assist teachers with topic management
- Limited question assignment capabilities
- Progress monitoring (view-only)
- Basic analytics and reporting

### **Accessible Features**
- ✅ View topics (limited)
- ✅ Assist with question assignment
- ✅ View student progress (read-only)
- ✅ View basic analytics
- ✅ Generate simple reports

### **API Access**
```
/api/admin/*
├── /topics (Read, Limited Write)
├── /classes (Read)
├── /questions (Limited Assignment)
├── /progress (Read Only)
└── /reports (Basic)
```

### **Data Access Scope**
- **Topics**: Topics shared by teachers
- **Classes**: Classes in assigned batches (read-only)
- **Students**: Limited student information
- **Progress**: Aggregate progress data only

## 👨‍🎓 STUDENT Role

### **Primary Responsibilities**
- Solve assigned coding questions
- Track personal progress
- Participate in leaderboards
- Manage personal profile

### **Accessible Features**
- ✅ View assigned questions
- ✅ Mark questions as solved
- ✅ Track personal progress
- ✅ View leaderboards
- ✅ Manage profile information

### **API Access**
```
/api/students/*
├── /topics (Read)
├── /classes (Read)
├── /questions (Read, Update Progress)
├── /leaderboard (Read)
├── /profile (Read, Update)
└── /progress (Read, Update)
```

### **Data Access Scope**
- **Topics**: Topics assigned to their batch
- **Classes**: Classes in their batch
- **Questions**: Questions assigned to their classes
- **Progress**: Personal progress data only
- **Leaderboard**: Batch and city leaderboards

## 🔐 Permission Implementation

### **Role Middleware**
```typescript
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user.role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'SuperAdmin access required' });
  }
  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!['TEACHER', 'INTERN'].includes(user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const isStudent = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user.userType !== 'student' || user.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Student access required' });
  }
  next();
};
```

### **Data Isolation**
```typescript
// Student data isolation in services
export const getTopicsWithBatchProgressService = async ({
  studentId,
  batchId
}: GetTopicsWithBatchProgressInput) => {
  // Only fetch data for student's specific batch
  const topics = await prisma.topic.findMany({
    include: {
      classes: {
        where: { batch_id: batchId }, // Batch-specific filtering
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
  
  // Only count progress for assigned questions
  const studentProgress = await prisma.studentProgress.findMany({
    where: {
      student_id: studentId,
      question_id: { in: Array.from(assignedQuestionIds) }
    }
  });
};
```

## 🔄 Role-Based Data Flow

### **SuperAdmin Data Flow**
```
SuperAdmin Request
↓
verifyToken (Authentication)
↓
isSuperAdmin (Authorization)
↓
Service Layer (Full Data Access)
↓
Database (No Restrictions)
↓
Response (System-wide Data)
```

### **Teacher Data Flow**
```
Teacher Request
↓
verifyToken (Authentication)
↓
isAdmin (Authorization)
↓
extractAdminInfo (Context)
↓
Service Layer (Batch-filtered Data)
↓
Database (Batch-scoped Queries)
↓
Response (Batch-specific Data)
```

### **Student Data Flow**
```
Student Request
↓
verifyToken (Authentication)
↓
isStudent (Authorization)
↓
extractStudentInfo (Context)
↓
Service Layer (Personal Data)
↓
Database (Student-scoped Queries)
↓
Response (Personal Data)
```

## 🛡️ Security Considerations

### **Data Isolation**
- **Database Level**: Foreign key constraints enforce data relationships
- **Application Level**: Middleware and service layer filtering
- **API Level**: Role-based endpoint protection

### **Token Security**
- **Expiration**: Tokens expire after 7 days
- **Refresh Tokens**: Separate refresh token mechanism
- **Revocation**: Tokens can be revoked by clearing refresh_token field

### **Permission Escalation Prevention**
- **Role Validation**: Middleware checks role on each request
- **Data Validation**: Services validate data access scope
- **Audit Logging**: All role-based actions are logged

## 📊 Role Usage Analytics

### **Login Patterns**
- **SuperAdmin**: Occasional system administration
- **Teacher**: Daily teaching activities
- **Intern**: Regular assistance tasks
- **Student**: Multiple daily sessions

### **Feature Usage**
- **Content Creation**: Teachers and SuperAdmins
- **Progress Tracking**: All roles (different scopes)
- **Analytics**: Teachers and SuperAdmins primarily
- **Problem Solving**: Students exclusively

## 🚀 Future Role Enhancements

### **Planned Role Improvements**
- **Granular Permissions**: More fine-grained permission system
- **Role Hierarchies**: Nested role permissions
- **Temporary Roles**: Time-limited access permissions
- **Custom Roles**: User-defined role configurations

### **Permission Matrix Expansion**
- **Feature-level Permissions**: Control specific features within roles
- **Data-level Permissions**: Control data access granularity
- **Time-based Permissions**: Temporary access grants
- **Location-based Permissions**: Geographic access control

This role-based access control system ensures that users have appropriate access to system features while maintaining data security and privacy across the entire DSA Tracker platform.
