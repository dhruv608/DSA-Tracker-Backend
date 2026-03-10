# API Index - Complete Endpoint Reference

## 📋 All API Endpoints

This comprehensive index lists all available API endpoints in the DSA Tracker system, organized by route and role access.

---

## 🔐 Authentication Endpoints

| Method | Endpoint | Role Access | Frontend Usage | Description |
|--------|----------|------------|---------------|-------------|
| `POST` | `/api/auth/student/register` | Public | Registration Page | Student registration |
| `POST` | `/api/auth/student/login` | Public | Login Page | Student authentication |
| `POST` | `/api/auth/admin/register` | Public | Admin Registration | Teacher/Intern registration |
| `POST` | `/api/auth/admin/login` | Public | Admin Login | Teacher/Intern authentication |
| `POST` | `/api/auth/superadmin/login` | Public | SuperAdmin Login | SuperAdmin authentication |
| `POST` | `/api/auth/refresh` | Public | Token Refresh | Refresh access token |
| `POST` | `/api/auth/logout` | Authenticated | Logout | User logout |

---

## 👨‍🎓 Student Endpoints

| Method | Endpoint | Role Access | Frontend Usage | Description |
|--------|----------|------------|---------------|-------------|
| `GET` | `/api/students/topics` | Student | Topics Dashboard | Get topics with batch progress |
| `GET` | `/api/students/topics/:slug` | Student | Topic Details Page | Get topic overview with classes |
| `GET` | `/api/students/topics/:topicSlug/classes/:classSlug` | Student | Class Details Page | Get class with questions |
| `GET` | `/api/students/addedQuestions` | Student | Questions Page | Get all questions with filters |
| `POST` | `/api/students/leaderboard` | Student | Leaderboard Page | Get leaderboard data |
| `GET` | `/api/students/profile` | Student | Profile Page | Get complete student profile |

---

## 👨‍🏫 Admin/Teacher Endpoints

| Method | Endpoint | Role Access | Frontend Usage | Description |
|--------|----------|------------|---------------|-------------|
| `GET` | `/api/admin/topics` | Admin | Topics Management | Get all topics |
| `POST` | `/api/admin/topics` | Admin | Topic Creation | Create new topic |
| `PUT` | `/api/admin/topics/:id` | Admin | Topic Edit | Update topic |
| `DELETE` | `/api/admin/topics/:id` | Admin | Topic Delete | Delete topic |
| `GET` | `/api/admin/classes` | Admin | Classes Management | Get all classes |
| `POST` | `/api/admin/classes` | Admin | Class Creation | Create new class |
| `PUT` | `/api/admin/classes/:id` | Admin | Class Edit | Update class |
| `DELETE` | `/api/admin/classes/:id` | Admin | Class Delete | Delete class |
| `POST` | `/api/admin/assign-questions` | Admin | Question Assignment | Assign questions to classes |
| `GET` | `/api/admin/students` | Admin | Student Management | Get students in batch |
| `GET` | `/api/admin/progress` | Admin | Progress Dashboard | Get batch progress |
| `GET` | `/api/admin/analytics` | Admin | Analytics Dashboard | Get batch analytics |

---

## 🏛️ SuperAdmin Endpoints

| Method | Endpoint | Role Access | Frontend Usage | Description |
|--------|----------|------------|---------------|-------------|
| `GET` | `/api/superadmin/cities` | SuperAdmin | Cities Management | Get all cities |
| `POST` | `/api/superadmin/cities` | SuperAdmin | City Creation | Create new city |
| `PUT` | `/api/superadmin/cities/:id` | SuperAdmin | City Edit | Update city |
| `DELETE` | `/api/superadmin/cities/:id` | SuperAdmin | City Delete | Delete city |
| `GET` | `/api/superadmin/batches` | SuperAdmin | Batches Management | Get all batches |
| `POST` | `/api/superadmin/batches` | SuperAdmin | Batch Creation | Create new batch |
| `PUT` | `/api/superadmin/batches/:id` | SuperAdmin | Batch Edit | Update batch |
| `DELETE` | `/api/superadmin/batches/:id` | SuperAdmin | Batch Delete | Delete batch |
| `GET` | `/api/superadmin/admins` | SuperAdmin | Admin Management | Get all admins |
| `POST` | `/api/superadmin/admins` | SuperAdmin | Admin Creation | Create new admin |
| `PUT` | `/api/superadmin/admins/:id` | SuperAdmin | Admin Edit | Update admin |
| `DELETE` | `/api/superadmin/admins/:id` | SuperAdmin | Admin Delete | Delete admin |
| `GET` | `/api/superadmin/stats` | SuperAdmin | Dashboard | Get system statistics |
| `GET` | `/api/superadmin/settings` | SuperAdmin | Settings | Get system settings |
| `PUT` | `/api/superadmin/settings` | SuperAdmin | Settings | Update system settings |

---

## 📊 Endpoint Categories

### **Authentication & Authorization**
- **Purpose**: User authentication and session management
- **Endpoints**: 7 endpoints
- **Access**: Public for login/register, authenticated for refresh/logout
- **Frontend Pages**: Login, Registration, Logout

### **Student Features**
- **Purpose**: Learning progress tracking and question solving
- **Endpoints**: 6 endpoints
- **Access**: Student role only
- **Frontend Pages**: Dashboard, Topics, Questions, Leaderboard, Profile

### **Admin/Teacher Features**
- **Purpose**: Content management and progress monitoring
- **Endpoints**: 12 endpoints
- **Access**: Teacher/Intern roles
- **Frontend Pages**: Topic Management, Class Management, Student Progress

### **SuperAdmin Features**
- **Purpose**: System administration and user management
- **Endpoints**: 13 endpoints
- **Access**: SuperAdmin role only
- **Frontend Pages**: City/Batch Management, Admin Management, System Stats

---

## 🔗 Endpoint Relationships

### **Student Workflow**
```
Login → Topics Dashboard → Topic Details → Class Questions → Mark Solved → Leaderboard
```

### **Teacher Workflow**
```
Login → Create Topic → Create Classes → Assign Questions → Monitor Progress
```

### **SuperAdmin Workflow**
```
Login → Create Cities → Create Batches → Create Admins → Monitor System
```

---

## 📱 Frontend Integration Map

### **Student App Pages**
```
/login → POST /api/auth/student/login
/register → POST /api/auth/student/register
/dashboard → GET /api/students/topics
/topics/:slug → GET /api/students/topics/:slug
/topics/:topicSlug/classes/:classSlug → GET /api/students/topics/:topicSlug/classes/:classSlug
/questions → GET /api/students/addedQuestions
/leaderboard → POST /api/students/leaderboard
/profile → GET /api/students/profile
```

### **Admin App Pages**
```
/admin/login → POST /api/auth/admin/login
/admin/topics → GET /api/admin/topics
/admin/topics/create → POST /api/admin/topics
/admin/classes → GET /api/admin/classes
/admin/assign → POST /api/admin/assign-questions
/admin/progress → GET /api/admin/progress
/admin/analytics → GET /api/admin/analytics
```

### **SuperAdmin App Pages**
```
/superadmin/login → POST /api/auth/superadmin/login
/superadmin/cities → GET /api/superadmin/cities
/superadmin/batches → GET /api/superadmin/batches
/superadmin/admins → GET /api/superadmin/admins
/superadmin/dashboard → GET /api/superadmin/stats
```

---

## 🔄 HTTP Method Usage

### **GET Requests** (Read Operations)
- **Purpose**: Retrieve data
- **Endpoints**: 25 endpoints
- **Caching**: Safe to cache
- **Idempotent**: Yes

### **POST Requests** (Create Operations)
- **Purpose**: Create new resources
- **Endpoints**: 8 endpoints
- **Caching**: Should invalidate caches
- **Idempotent**: No

### **PUT Requests** (Update Operations)
- **Purpose**: Update existing resources
- **Endpoints**: 6 endpoints
- **Caching**: Should invalidate caches
- **Idempotent**: Yes

### **DELETE Requests** (Delete Operations)
- **Purpose**: Remove resources
- **Endpoints**: 6 endpoints
- **Caching**: Should invalidate caches
- **Idempotent**: Yes

---

## 📊 Response Types by Category

### **Authentication Responses**
```typescript
interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: Student | Admin | SuperAdmin;
}
```

### **Data List Responses**
```typescript
interface ListResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### **Single Resource Responses**
```typescript
interface ResourceResponse<T> {
  data: T;
}
```

### **Statistics Responses**
```typescript
interface StatsResponse {
  stats: {
    [key: string]: number | string | Array<any>;
  };
}
```

---

## 🔐 Security Summary

### **Public Endpoints** (No Authentication)
- Registration endpoints
- Login endpoints
- Health check endpoint

### **Authenticated Endpoints** (Valid Token Required)
- All student endpoints
- All admin endpoints
- All superadmin endpoints
- Token refresh and logout

### **Role-Protected Endpoints**
- **Student**: `/api/students/*`
- **Admin**: `/api/admin/*`
- **SuperAdmin**: `/api/superadmin/*`

---

## 📈 Performance Considerations

### **High-Frequency Endpoints**
- `GET /api/students/addedQuestions` - Questions page with filters
- `GET /api/students/topics` - Main dashboard
- `POST /api/students/leaderboard` - Leaderboard updates

### **Data-Heavy Endpoints**
- `GET /api/superadmin/stats` - System statistics
- `GET /api/admin/analytics` - Batch analytics
- `GET /api/students/addedQuestions` - Questions with progress

### **Optimization Strategies**
- Implement caching for frequently accessed data
- Use database indexes for filter queries
- Implement pagination for large datasets
- Use field selection to reduce payload size

---

## 🚀 Future Endpoints (Planned)

### **Real-time Features**
- `WebSocket /ws/leaderboard` - Real-time leaderboard updates
- `WebSocket /ws/progress` - Real-time progress tracking

### **Advanced Analytics**
- `GET /api/admin/advanced-analytics` - Detailed analytics
- `GET /api/superadmin/system-health` - System health metrics

### **Integration Features**
- `POST /api/students/sync-external` - External platform sync
- `GET /api/students/recommendations` - AI-powered recommendations

---

## 📝 Usage Examples

### **Student API Usage**
```javascript
// Get topics with progress
const topics = await fetch('/api/students/topics', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get filtered questions
const questions = await fetch('/api/students/addedQuestions?level=EASY&platform=LEETCODE&page=1', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### **Admin API Usage**
```javascript
// Create new topic
const topic = await fetch('/api/admin/topics', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    topic_name: 'Binary Trees',
    description: 'Tree data structures'
  })
});
```

### **SuperAdmin API Usage**
```javascript
// Create new city
const city = await fetch('/api/superadmin/cities', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    city_name: 'New City',
    slug: 'new-city'
  })
});
```

This comprehensive API index serves as a quick reference for all available endpoints in the DSA Tracker system, making it easy for developers to understand the complete API surface and integration patterns.
