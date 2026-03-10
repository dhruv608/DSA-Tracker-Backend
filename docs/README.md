# DSA Tracker - Developer Documentation

## 🎯 Overview

DSA Tracker is a comprehensive learning management system designed to help students track their Data Structures and Algorithms (DSA) progress across multiple coding platforms. The system enables teachers to assign coding questions, monitor student progress, and maintain competitive leaderboards.

## 🏗️ System Architecture

- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT-based with role-based access control
- **APIs**: RESTful APIs with comprehensive filtering and pagination

## 👥 User Roles

- **SuperAdmin**: System administration, city/batch management
- **Teacher/Admin**: Question assignment, progress monitoring
- **Student**: Problem solving, progress tracking, leaderboard viewing

## 📚 Documentation Structure

### 🏛️ [Architecture](./architecture/)
- [System Overview](./architecture/system-overview.md) - High-level system design
- [Backend Architecture](./architecture/backend-architecture.md) - Technical implementation details
- [Request Flow](./architecture/request-flow.md) - API request lifecycle

### 👤 [Roles & Permissions](./roles/)
- [Roles Overview](./roles/roles-overview.md) - Role hierarchy and permissions
- [SuperAdmin](./roles/superadmin.md) - System administrator guide
- [Teacher/Admin](./roles/teacher-admin.md) - Educator guide
- [Student](./roles/student.md) - Student user guide

### 🗄️ [Database](./database/)
- [Models](./database/models.md) - Complete database schema
- [Relationships](./database/relationships.md) - Entity relationships

### 🔌 [API Documentation](./api/)
- [API Overview](./api/api-overview.md) - API design principles
- [API Index](./api/api-index.md) - Complete API reference table
- [Authentication](./api/auth.md) - Auth endpoints
- [Topics](./api/topics.md) - Topic management APIs
- [Questions](./api/questions.md) - Question APIs
- [Students](./api/students.md) - Student APIs
- [Leaderboard](./api/leaderboard.md) - Leaderboard APIs

### 🎨 [Frontend Integration](./frontend/)
- [Frontend Overview](./frontend/frontend-overview.md) - Integration guide
- [API Integration](./frontend/api-integration.md) - Frontend API usage
- [UI Pages](./frontend/ui-pages.md) - Page documentation
- [State Management](./frontend/state-management.md) - Data flow

### 🔄 [Workflows](./workflows/)
- [Teacher Workflow](./workflows/teacher-workflow.md) - Teacher operations
- [Student Workflow](./workflows/student-workflow.md) - Student operations
- [Progress Tracking](./workflows/progress-tracking.md) - Progress system

### ⚙️ [System](./system/)
- [Cron Jobs](./system/cron-jobs.md) - Background processes
- [External Integrations](./system/external-integrations.md) - Third-party services
- [Error Handling](./system/error-handling.md) - Error management

### 🚀 [Future](./future/)
- [Performance](./future/performance.md) - Optimization strategies
- [Scaling](./future/scaling.md) - Scaling considerations
- [Future Improvements](./future/future-improvements.md) - Roadmap

## 🚀 Quick Start for Developers

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd dsa-tracker-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure database and JWT secrets
   ```

4. **Database Setup**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Key Development Commands

```bash
# Database operations
npx prisma studio          # Database GUI
npx prisma migrate dev      # Run migrations
npx prisma generate         # Generate client

# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run test               # Run tests
```

## 🏛️ Project Structure

```
src/
├── app.ts              # Express app configuration
├── server.ts           # Server startup
├── config/             # Configuration files
├── controllers/        # API route handlers
├── middlewares/        # Request processing middleware
├── routes/            # API route definitions
├── services/          # Business logic layer
├── utils/             # Utility functions
├── types/             # TypeScript types
└── jobs/              # Background jobs
```

## 🔐 Authentication Flow

1. User login with email/username + password
2. Server validates credentials
3. JWT access token + refresh token generated
4. Tokens stored in database for session management
5. Subsequent requests use Bearer token
6. Role-based middleware enforces permissions

## 📊 Core Features

### 🎯 Student Features
- View assigned questions by topic and class
- Track progress across LeetCode, GFG, InterviewBit
- View personal and batch leaderboards
- Filter questions by difficulty, platform, type
- Real-time progress synchronization

### 👨‍🏫 Teacher Features
- Create and manage topics
- Assign questions to classes
- Monitor student progress
- View batch-specific statistics
- Manage class schedules

### 🏛️ Admin Features
- City and batch management
- Admin user management
- System-wide statistics
- User role management

## 🔄 Request Flow

```
Frontend → API Route → Middleware → Controller → Service → Database → Response
```

1. **API Route**: Defines endpoint and HTTP method
2. **Middleware**: Authentication, validation, role checking
3. **Controller**: Request/response handling
4. **Service**: Business logic implementation
5. **Database**: Data persistence via Prisma

## 📱 API Design Principles

- **RESTful**: Clean resource-based endpoints
- **Consistent**: Standardized response formats
- **Secure**: Role-based access control
- **Scalable**: Pagination and filtering support
- **Documented**: Comprehensive API documentation

## 🔧 Development Guidelines

### Code Organization
- Controllers handle HTTP concerns only
- Services contain business logic
- Middleware handles cross-cutting concerns
- Types ensure type safety

### Database Design
- Use Prisma migrations for schema changes
- Foreign key constraints ensure data integrity
- Indexes optimize query performance
- Soft deletes for data preservation

### Error Handling
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for debugging
- Client-friendly error descriptions

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.js

# Run with coverage
npm run test:coverage
```

## 📈 Monitoring & Logging

- Request/response logging
- Error tracking and reporting
- Performance metrics
- Database query optimization

## 🚀 Deployment

### Environment Variables
```env
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
NODE_ENV=production
PORT=5000
```

### Production Considerations
- Use environment-specific configurations
- Enable database connection pooling
- Implement proper logging
- Set up monitoring and alerting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Update documentation
5. Submit pull request

## 📞 Support

For technical questions or issues:
1. Check existing documentation
2. Review API specifications
3. Contact development team
4. Create GitHub issue

---

**Last Updated**: March 2025  
**Version**: 2.0.0  
**Maintainers**: DSA Tracker Development Team
