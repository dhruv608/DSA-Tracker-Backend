# REDIS CACHING + INVALIDATION PLAN - VERIFIED

## SECTION 1: ALL GET APIs WITH DEPENDENCIES (VERIFIED)

### Student APIs (from student.routes.ts)
- **GET /students/profile/:username** (Public route with optional auth)
  - Returns: Public profile view for any student
  - Dependencies: Student, StudentProgress, Question, Topic, City, Batch, Leaderboard
  - Heavy: Yes (joins + aggregations)

- **GET /students/me**
  - Returns: Current student profile with basic info
  - Dependencies: Student, City, Batch, Leaderboard
  - Heavy: No (single record lookup)

- **GET /students/batches**
  - Returns: All batches list
  - Dependencies: Batch
  - Heavy: No (simple list)

- **GET /students/cities**
  - Returns: All cities list
  - Dependencies: City
  - Heavy: No (simple list)

- **GET /students/topics**
  - Returns: Topics with batch-specific progress
  - Dependencies: Topic, Class, QuestionVisibility, Question, StudentProgress, Batch
  - Heavy: Yes (complex aggregations + progress calculations)

- **GET /students/topics/:topicSlug**
  - Returns: Topic overview with classes summary
  - Dependencies: Topic, Class, QuestionVisibility, Question, StudentProgress, Batch
  - Heavy: Yes (complex aggregations + pagination)

- **GET /students/topics/:topicSlug/classes/:classSlug**
  - Returns: Class details with full questions and progress
  - Dependencies: Class, Topic, Batch, QuestionVisibility, Question, StudentProgress
  - Heavy: Yes (complex joins + progress tracking)

- **GET /students/addedQuestions**
  - Returns: All questions with filters and solved status
  - Dependencies: Question, Topic, QuestionVisibility, Class, StudentProgress, Batch
  - Heavy: Yes (complex joins + progress tracking)

- **GET /students/recent-questions**
  - Returns: Recently added questions (last 7 days)
  - Dependencies: Question, Topic
  - Heavy: Yes (date filtering + joins)

- **POST /students/leaderboard**
  - Returns: Student leaderboard with top 10 and personal rank
  - Dependencies: Leaderboard, Student, City, Batch
  - Heavy: Yes (complex joins + ranking logic)

- **GET /students/bookmarks**
  - Returns: Student's bookmarks with pagination
  - Dependencies: Bookmark, Question, Topic
  - Heavy: Yes (joins + pagination)

### Admin APIs (from admin.routes.ts)
- **GET /admin/me**
  - Returns: Current admin profile
  - Dependencies: Admin, City, Batch
  - Heavy: No (single record lookup)

- **GET /admin/cities**
  - Returns: All cities list
  - Dependencies: City
  - Heavy: No (simple list)

- **GET /admin/batches**
  - Returns: All batches list
  - Dependencies: Batch
  - Heavy: No (simple list)

- **GET /admin/topics**
  - Returns: All topics list
  - Dependencies: Topic
  - Heavy: No (simple list)

- **GET /admin/questions**
  - Returns: Paginated questions with filters
  - Dependencies: Question, Topic
  - Heavy: Yes (pagination + filtering)

- **GET /admin/students**
  - Returns: Paginated list of all students with filters
  - Dependencies: Student, City, Batch, Leaderboard, StudentProgress
  - Heavy: Yes (joins + pagination + rank filtering)

- **GET /admin/roles**
  - Returns: Available admin roles
  - Dependencies: None (enum values)
  - Heavy: No (simple enum list)

- **POST /admin/leaderboard**
  - Returns: Admin leaderboard with pagination and filters
  - Dependencies: Leaderboard, Student, City, Batch
  - Heavy: Yes (complex joins + pagination + filtering)

- **GET /admin/:batchSlug/topics**
  - Returns: Topics with class/question counts for batch
  - Dependencies: Topic, Class, QuestionVisibility, Batch
  - Heavy: Yes (aggregations + joins)

- **GET /admin/:batchSlug/topics/:topicSlug/classes**
  - Returns: Classes for topic in batch
  - Dependencies: Class, Topic, Batch
  - Heavy: Yes (joins + pagination)

- **GET /admin/:batchSlug/topics/:topicSlug/classes/:classSlug**
  - Returns: Class details with assigned questions
  - Dependencies: Class, Topic, Batch, QuestionVisibility, Question
  - Heavy: Yes (joins + question data)

- **GET /admin/:batchSlug/topics/:topicSlug/classes/:classSlug/questions**
  - Returns: Questions assigned to specific class
  - Dependencies: Class, Topic, Batch, QuestionVisibility, Question
  - Heavy: Yes (joins + pagination)

### Public APIs (from public.routes.ts)
- **GET /public/cities**
  - Returns: All cities list
  - Dependencies: City
  - Heavy: No (simple list)

- **GET /public/batches**
  - Returns: All batches list
  - Dependencies: Batch
  - Heavy: No (simple list)

- **GET /public/topicprogress/:username**
  - Returns: User's topic progress by username
  - Dependencies: Student, Topic, Class, QuestionVisibility, Question, StudentProgress, Batch
  - Heavy: Yes (complex joins + progress calculations)

- **GET /public/topics**
  - Returns: Paginated topics for dropdown
  - Dependencies: Topic
  - Heavy: No (simple pagination)

### User APIs (from user.routes.ts)
- **GET /user/check-username**
  - Returns: Username availability check
  - Dependencies: Student
  - Heavy: No (simple existence check)

### Auth APIs (from auth.routes.ts)
- **POST /auth/student/register**
  - Returns: Student registration result
  - Dependencies: Student, Leaderboard
  - Heavy: Yes (creates student + leaderboard entry)

- **POST /auth/student/login**
  - Returns: Student login tokens
  - Dependencies: Student
  - Heavy: No (authentication check)

- **POST /auth/admin/login**
  - Returns: Admin login tokens
  - Dependencies: Admin
  - Heavy: No (authentication check)

- **POST /auth/refresh-token**
  - Returns: Refreshed JWT tokens
  - Dependencies: None (token validation)
  - Heavy: No (token operations)

- **POST /auth/forgot-password**
  - Returns: Password reset OTP
  - Dependencies: PasswordResetOTP
  - Heavy: No (simple insert)

- **POST /auth/verify-otp**
  - Returns: OTP verification result
  - Dependencies: PasswordResetOTP
  - Heavy: No (simple query)

- **POST /auth/reset-password**
  - Returns: Password reset result
  - Dependencies: Student, PasswordResetOTP
  - Heavy: No (simple update)

- **POST /auth/google-login**
  - Returns: Google OAuth login result
  - Dependencies: Student
  - Heavy: Yes (potential student creation)

## SECTION 2: ALL WRITE APIs WITH AFFECTED MODELS (VERIFIED)

### Student WRITE APIs
- **PUT /students/me**
  - Affects: Student
  - Impact: Profile updates

- **PATCH /students/username**
  - Affects: Student
  - Impact: Username change

- **POST /students/bookmarks**
  - Affects: Bookmark
  - Impact: New bookmark creation

- **PUT /students/bookmarks/:questionId**
  - Affects: Bookmark
  - Impact: Bookmark update

- **DELETE /students/bookmarks/:questionId**
  - Affects: Bookmark
  - Impact: Bookmark removal

### Admin WRITE APIs
- **POST /admin/topics**
  - Affects: Topic
  - Impact: New topic addition

- **PUT /admin/topics/:topicSlug**
  - Affects: Topic
  - Impact: Topic modification

- **PATCH /admin/topics/:topicSlug**
  - Affects: Topic
  - Impact: Topic modification

- **DELETE /admin/topics/:topicSlug**
  - Affects: Topic, Class, Question, QuestionVisibility, StudentProgress
  - Impact: Topic removal cascades

- **POST /admin/topics/bulk-upload**
  - Affects: Topic
  - Impact: Bulk topic creation

- **POST /admin/bulkTestUpload**
  - Affects: Question, Topic
  - Impact: Bulk question creation with topic mapping

- **POST /admin/questions**
  - Affects: Question, Topic (relation count)
  - Impact: New question addition

- **PATCH /admin/questions/:id**
  - Affects: Question, Topic (if topic changed)
  - Impact: Question modification

- **DELETE /admin/questions/:id**
  - Affects: Question, QuestionVisibility, StudentProgress, Bookmark
  - Impact: Question removal cascades

- **POST /admin/questions/bulk-upload**
  - Affects: Question, Topic (relation counts)
  - Impact: Bulk question addition

- **POST /admin/student/reportdownload**
  - Affects: None (CSV generation)
  - Impact: Report download

- **POST /admin/bulk-operations**
  - Affects: Student, Leaderboard
  - Impact: Bulk student operations

- **POST /admin/stats**
  - Affects: None (statistics calculation)
  - Impact: Admin statistics

- **PATCH /admin/students/:id**
  - Affects: Student
  - Impact: Profile data changes

- **DELETE /admin/students/:id**
  - Affects: Student, StudentProgress, Leaderboard, Bookmark
  - Impact: Complete student removal

- **POST /admin/students**
  - Affects: Student, Leaderboard (creates entry)
  - Impact: New student addition

- **POST /admin/students/progress**
  - Affects: StudentProgress, Leaderboard (triggers recalculation)
  - Impact: Progress tracking updates

- **POST /admin/students/sync/:id**
  - Affects: StudentProgress, Leaderboard
  - Impact: Manual progress synchronization

- **POST /admin/:batchSlug/topics/:topicSlug/classes**
  - Affects: Class, Topic (relation count)
  - Impact: New class addition

- **PATCH /admin/:batchSlug/topics/:topicSlug/classes/:classSlug**
  - Affects: Class
  - Impact: Class modification

- **DELETE /admin/:batchSlug/topics/:topicSlug/classes/:classSlug**
  - Affects: Class, QuestionVisibility
  - Impact: Class removal cascades

- **POST /admin/:batchSlug/topics/:topicSlug/classes/:classSlug/questions**
  - Affects: QuestionVisibility, Class (question count)
  - Impact: Question assignment to class

- **DELETE /admin/:batchSlug/topics/:topicSlug/classes/:classSlug/questions/:questionId**
  - Affects: QuestionVisibility, Class (question count)
  - Impact: Question removal from class

- **PATCH /admin/:batchSlug/topics/:topicSlug/classes/:classSlug/visibility/:visibilityId**
  - Affects: QuestionVisibility
  - Impact: Visibility type change

### Auth WRITE APIs
- **POST /auth/student/register**
  - Affects: Student, Leaderboard
  - Impact: New student registration

- **POST /auth/student/logout**
  - Affects: None (token invalidation)
  - Impact: Student logout

- **POST /auth/admin/logout**
  - Affects: None (token invalidation)
  - Impact: Admin logout

- **POST /auth/forgot-password**
  - Affects: PasswordResetOTP
  - Impact: Password reset request

- **POST /auth/verify-otp**
  - Affects: PasswordResetOTP
  - Impact: OTP verification

- **POST /auth/reset-password**
  - Affects: Student, PasswordResetOTP
  - Impact: Password reset completion

- **POST /auth/google-login**
  - Affects: Student (potential creation), Leaderboard
  - Impact: Google OAuth login

## SECTION 3: CACHE PLAN (API-WISE) - VERIFIED

### HIGH PRIORITY CACHING (Heavy APIs)

#### Student APIs
- **GET /students/profile/:username** (Public route)
  - Cache: YES (complex aggregations)
  - Key: `public_profile:{username}`
  - TTL: 10 minutes (public data less volatile)

- **GET /students/topics**
  - Cache: YES (complex progress calculations)
  - Key: `topics_progress:{studentId}:{batchId}:{hash(query_params)}`
  - TTL: 3 minutes (progress changes frequently)

- **GET /students/topics/:topicSlug**
  - Cache: YES (complex aggregations)
  - Key: `topic_overview:{studentId}:{batchId}:{topicSlug}:{hash(query_params)}`
  - TTL: 5 minutes (class/progress changes affect this)

- **GET /students/topics/:topicSlug/classes/:classSlug**
  - Cache: YES (complex joins + progress)
  - Key: `class_questions_full:{studentId}:{batchId}:{topicSlug}:{classSlug}:{hash(query_params)}`
  - TTL: 3 minutes (progress changes frequently)

- **GET /students/addedQuestions**
  - Cache: YES (complex joins + progress)
  - Key: `filtered_questions:{studentId}:{hash(query_params)}`
  - TTL: 3 minutes (progress changes frequently)

- **GET /students/recent-questions**
  - Cache: YES (date filtering + joins)
  - Key: `recent_questions:{hash(query_params)}`
  - TTL: 15 minutes (recent questions relatively stable)

- **POST /students/leaderboard**
  - Cache: YES (complex joins + ranking)
  - Key: `leaderboard_student:{studentId}:{hash(body_params)}`
  - TTL: 5 minutes (personal ranking changes)

- **GET /students/bookmarks**
  - Cache: YES (joins + pagination)
  - Key: `bookmarks:{studentId}:{hash(query_params)}`
  - TTL: 5 minutes (bookmark changes affect this)

#### Admin APIs
- **GET /admin/questions**
  - Cache: YES (pagination + filtering)
  - Key: `questions:{hash(query_params)}`
  - TTL: 10 minutes (questions relatively stable)

- **GET /admin/students**
  - Cache: YES (complex queries with pagination)
  - Key: `students_all:{hash(query_params)}`
  - TTL: 2 minutes (student list changes frequently)

- **POST /admin/leaderboard**
  - Cache: YES (complex joins + ranking)
  - Key: `leaderboard_admin:{hash(body_params)}:{hash(query_params)}`
  - TTL: 10 minutes (leaderboard updates periodically)

- **GET /admin/:batchSlug/topics**
  - Cache: YES (aggregations)
  - Key: `topics_batch:{batchId}:{hash(query_params)}`
  - TTL: 5 minutes (class/question assignments change)

- **GET /admin/:batchSlug/topics/:topicSlug/classes**
  - Cache: YES (joins + pagination)
  - Key: `classes:{batchId}:{topicSlug}:{hash(query_params)}`
  - TTL: 5 minutes (class changes affect this)

- **GET /admin/:batchSlug/topics/:topicSlug/classes/:classSlug**
  - Cache: YES (question assignments)
  - Key: `class_details:{batchId}:{topicSlug}:{classSlug}`
  - TTL: 5 minutes (question assignments change)

- **GET /admin/:batchSlug/topics/:topicSlug/classes/:classSlug/questions**
  - Cache: YES (question assignments)
  - Key: `class_assigned_questions:{batchId}:{topicSlug}:{classSlug}:{hash(query_params)}`
  - TTL: 5 minutes (assignments change)

#### Public APIs
- **GET /public/topicprogress/:username**
  - Cache: YES (complex progress calculations)
  - Key: `username_progress:{username}:{hash(query_params)}`
  - TTL: 10 minutes (public progress data)

- **GET /public/topics**
  - Cache: YES (simple pagination)
  - Key: `topics_paginated:{hash(query_params)}`
  - TTL: 20 minutes (stable data)

### MEDIUM PRIORITY CACHING (Light APIs)

#### Topic APIs
- **GET /admin/topics**
  - Cache: YES (simple list)
  - Key: `topics_all`
  - TTL: 30 minutes (topic list stable)

#### Student APIs
- **GET /students/me**
  - Cache: NO (real-time data needed)
  - Reason: Current user data must be fresh

- **GET /students/batches**
  - Cache: YES (simple list)
  - Key: `batches_all`
  - TTL: 1 hour (very stable)

- **GET /students/cities**
  - Cache: YES (simple list)
  - Key: `cities_all`
  - TTL: 1 hour (very stable)

#### Admin APIs
- **GET /admin/me**
  - Cache: NO (real-time data needed)
  - Reason: Current admin data must be fresh

- **GET /admin/cities**
  - Cache: YES (simple list)
  - Key: `cities_all`
  - TTL: 1 hour (very stable)

- **GET /admin/batches**
  - Cache: YES (simple list)
  - Key: `batches_all`
  - TTL: 1 hour (very stable)

- **GET /admin/roles**
  - Cache: YES (enum values)
  - Key: `admin_roles`
  - TTL: 24 hours (very stable)

#### Public APIs
- **GET /public/cities**
  - Cache: YES (simple list)
  - Key: `cities_all`
  - TTL: 1 hour (very stable)

- **GET /public/batches**
  - Cache: YES (simple list)
  - Key: `batches_all`
  - TTL: 1 hour (very stable)

### LOW PRIORITY CACHING (Simple APIs)

#### User APIs
- **GET /user/check-username**
  - Cache: NO (real-time validation needed)
  - Reason: Username availability must be checked in real-time

#### Auth APIs
- **POST /auth/student/login**
  - Cache: NO (authentication must be real-time)
  - Reason: Login requires real-time validation

- **POST /auth/admin/login**
  - Cache: NO (authentication must be real-time)
  - Reason: Login requires real-time validation

- **POST /auth/refresh-token**
  - Cache: NO (token validation must be real-time)
  - Reason: Token refresh requires real-time validation

## SECTION 4: INVALIDATION PLAN (API-WISE) - VERIFIED

### Student WRITE APIs

#### PUT /students/me
- **Affects**: Student table
- **Invalidate**:
  - `public_profile:{username}` (if username changed)

#### PATCH /students/username
- **Affects**: Student
- **Invalidate**:
  - `public_profile:{oldUsername}` (old username cache)
  - `public_profile:{newUsername}` (new username cache)
  - `username_progress:{oldUsername}` (old progress cache)
  - `username_progress:{newUsername}` (new progress cache)

#### POST /students/bookmarks
- **Affects**: Bookmark
- **Invalidate**:
  - `bookmarks:{studentId}:*` (student's bookmark listings)

#### PUT /students/bookmarks/:questionId
- **Affects**: Bookmark
- **Invalidate**:
  - `bookmarks:{studentId}:*`

#### DELETE /students/bookmarks/:questionId
- **Affects**: Bookmark
- **Invalidate**:
  - `bookmarks:{studentId}:*`

### Admin WRITE APIs

#### POST /admin/topics
- **Affects**: Topic
- **Invalidate**:
  - `topics_all` (topic list)
  - `topics_paginated:{hash(query_params)}` (paginated topics)
  - `topics_batch:{batchId}:*` (batch topic listings)

#### PUT /admin/topics/:topicSlug
- **Affects**: Topic
- **Invalidate**:
  - `topics_all`
  - `topics_paginated:{hash(query_params)}`
  - `topics_batch:{batchId}:*`
  - `topics_progress:{studentId}:{batchId}:*` (if topic name/progress display changed)
  - `topic_overview:{studentId}:{batchId}:{topicSlug}:*` (specific topic)

#### PATCH /admin/topics/:topicSlug
- **Affects**: Topic
- **Invalidate**:
  - Same as PUT /admin/topics/:topicSlug

#### DELETE /admin/topics/:topicSlug
- **Affects**: Topic, Class, Question, QuestionVisibility, StudentProgress
- **Invalidate**:
  - All topic-related caches
  - All class-related caches for this topic
  - All question-related caches for questions in this topic
  - All student progress caches for questions in this topic
  - All bookmark caches for questions in this topic

#### POST /admin/topics/bulk-upload
- **Affects**: Topic
- **Invalidate**:
  - `topics_all`
  - `topics_paginated:{hash(query_params)}`

#### POST /admin/bulkTestUpload
- **Affects**: Question, Topic
- **Invalidate**:
  - Same as POST /admin/questions (but more extensive)
  - `topics_all` (topic question counts changed)

#### POST /admin/questions
- **Affects**: Question, Topic
- **Invalidate**:
  - `questions:{hash(query_params)}` (question listings)
  - `filtered_questions:{studentId}:*` (student filtered views)
  - `topics_batch:{batchId}:*` (batch topic counts)
  - `topics_progress:{studentId}:{batchId}:*` (topic progress)
  - `topic_overview:{studentId}:{batchId}:*` (topic overviews)
  - `class_details:{batchId}:*` (class details)
  - `class_assigned_questions:{batchId}:*` (class assignments)
  - `class_questions_full:{studentId}:*` (class question views)

#### PATCH /admin/questions/:id
- **Affects**: Question, Topic
- **Invalidate**:
  - Same as POST /admin/questions (if topic changed, additional topic invalidations)
  - Plus topic-specific caches if topic_id changed

#### DELETE /admin/questions/:id
- **Affects**: Question, QuestionVisibility, StudentProgress, Bookmark
- **Invalidate**:
  - All question-related caches (same as POST)
  - All student progress caches (progress removed)
  - All bookmark caches (bookmarks removed)
  - All leaderboard caches (progress affects rankings)

#### POST /admin/questions/bulk-upload
- **Affects**: Question, Topic
- **Invalidate**:
  - Same as POST /admin/questions (but more extensive)
  - `topics_all` (topic question counts changed)

#### PATCH /admin/students/:id
- **Affects**: Student table
- **Invalidate**:
  - `public_profile:{username}` (if username changed)
  - `leaderboard_admin:{hash(body_params)}:{hash(query_params)}` (leaderboard listings)
  - `leaderboard_student:{studentId}:{hash(body_params)}` (personal leaderboard)

#### DELETE /admin/students/:id
- **Affects**: Student, StudentProgress, Leaderboard, Bookmark
- **Invalidate**:
  - `public_profile:{username}`
  - `leaderboard_admin:*` (all leaderboard entries)
  - `leaderboard_student:*` (all student leaderboards)
  - `bookmarks:{studentId}:*` (all bookmark caches)
  - `topics_progress:{studentId}:*` (student's topic progress)
  - `topic_overview:{studentId}:*` (student's topic overviews)
  - `class_questions_full:{studentId}:*` (student's class question views)
  - `filtered_questions:{studentId}:*` (student's filtered questions)
  - `username_progress:{username}:*` (username progress caches)

#### POST /admin/students
- **Affects**: Student, Leaderboard
- **Invalidate**:
  - `leaderboard_admin:{hash(body_params)}:{hash(query_params)}` (leaderboard changes)
  - `topics_all` (if affects topic counts)

#### POST /admin/students/progress
- **Affects**: StudentProgress, Leaderboard
- **Invalidate**:
  - `public_profile:{username}` (public stats)
  - `topics_progress:{studentId}:{batchId}:*` (all topic progress)
  - `topic_overview:{studentId}:{batchId}:*` (all topic overviews)
  - `class_questions_full:{studentId}:*` (class question progress)
  - `filtered_questions:{studentId}:*` (filtered question views)
  - `leaderboard_admin:*` (leaderboard rankings)
  - `leaderboard_student:{studentId}:*` (personal rankings)

#### POST /admin/students/sync/:id
- **Affects**: StudentProgress, Leaderboard
- **Invalidate**:
  - Same as POST /admin/students/progress

#### POST /admin/:batchSlug/topics/:topicSlug/classes
- **Affects**: Class, Topic (relation count)
- **Invalidate**:
  - `classes:{batchId}:{topicSlug}:*` (class listings)
  - `topics_batch:{batchId}:*` (topic class counts)
  - `topics_progress:{studentId}:{batchId}:*` (topic progress)
  - `topic_overview:{studentId}:{batchId}:{topicSlug}:*` (topic overview)

#### PATCH /admin/:batchSlug/topics/:topicSlug/classes/:classSlug
- **Affects**: Class
- **Invalidate**:
  - `classes:{batchId}:{topicSlug}:*`
  - `class_details:{batchId}:{topicSlug}:{classSlug}`
  - `class_assigned_questions:{batchId}:{topicSlug}:{classSlug}:*`
  - `class_questions_full:{studentId}:{batchId}:{topicSlug}:{classSlug}:*`
  - `topic_overview:{studentId}:{batchId}:{topicSlug}:*`

#### DELETE /admin/:batchSlug/topics/:topicSlug/classes/:classSlug
- **Affects**: Class, QuestionVisibility
- **Invalidate**:
  - All class-related caches
  - All question visibility caches for this class
  - Topic progress caches (class counts changed)
  - Student progress caches for questions in this class

#### POST /admin/:batchSlug/topics/:topicSlug/classes/:classSlug/questions
- **Affects**: QuestionVisibility, Class (question count)
- **Invalidate**:
  - `filtered_questions:{studentId}:*` (student filtered views)
  - `topics_batch:{batchId}:*` (batch topic question counts)
  - `topics_progress:{studentId}:{batchId}:*` (topic progress)
  - `topic_overview:{studentId}:{batchId}:{topicSlug}:*` (topic overview)
  - `class_details:{batchId}:{topicSlug}:{classSlug}`
  - `class_assigned_questions:{batchId}:{topicSlug}:{classSlug}:*`
  - `class_questions_full:{studentId}:{batchId}:{topicSlug}:{classSlug}:*`

#### DELETE /admin/:batchSlug/topics/:topicSlug/classes/:classSlug/questions/:questionId
- **Affects**: QuestionVisibility, Class (question count)
- **Invalidate**:
  - Same as POST assign (question removal affects same caches)

#### PATCH /admin/:batchSlug/topics/:topicSlug/classes/:classSlug/visibility/:visibilityId
- **Affects**: QuestionVisibility
- **Invalidate**:
  - `filtered_questions:{studentId}:*` (if type filter used)
  - `class_assigned_questions:{batchId}:{topicSlug}:{classSlug}:*`
  - `class_questions_full:{studentId}:{batchId}:{topicSlug}:{classSlug}:*`

### Auth WRITE APIs

#### POST /auth/student/register
- **Affects**: Student, Leaderboard
- **Invalidate**:
  - `leaderboard_admin:{hash(body_params)}:{hash(query_params)}` (leaderboard changes)
  - `topics_all` (if affects topic counts)

#### POST /auth/google-login
- **Affects**: Student (potential creation), Leaderboard
- **Invalidate**:
  - Same as POST /auth/student/register (if new student created)

#### POST /auth/reset-password
- **Affects**: Student, PasswordResetOTP
- **Invalidate**:
  - `public_profile:{username}` (if student profile changes)

## SECTION 5: DEPENDENCY GRAPH EXPLANATION - VERIFIED

### Core Data Relationships (Verified from Prisma Schema)

#### Question Chain
```
Question (1) -> (N) QuestionVisibility (N) -> (1) Class (N) -> (1) Topic
Question (1) -> (N) StudentProgress (N) -> (1) Student
Question (1) -> (N) Bookmark (N) -> (1) Student
```

#### Class-Topic-Student Chain
```
Topic (1) -> (N) Class (N) -> (1) Batch
Class (1) -> (N) QuestionVisibility (N) -> (1) Question
Batch (1) -> (N) Student (1) -> (1) Leaderboard
```

#### Progress Chain
```
Student (1) -> (N) StudentProgress (N) -> (1) Question
StudentProgress changes -> Leaderboard recalculations -> Ranking changes
```

#### Auth Chain
```
Student (1) -> (1) Leaderboard
Student (1) -> (N) PasswordResetOTP
Admin (1) -> (N) Batch, City
```

### Cascading Invalidation Effects (Verified)

#### Question-Level Changes
1. **Question CRUD** affects:
   - All question listings
   - All topic progress calculations
   - All class question assignments
   - All student progress for that question
   - All bookmarks for that question
   - Leaderboard rankings (indirectly via progress)

#### Class-Level Changes
1. **Class CRUD** affects:
   - Topic class counts
   - Topic progress calculations
   - Question visibility assignments
   - Student progress for questions in that class

#### Topic-Level Changes
1. **Topic CRUD** affects:
   - All topic listings
   - All class data under topic
   - All question data under topic
   - All progress data for questions in topic

#### Student Progress Changes
1. **StudentProgress CRUD** affects:
   - Student profile statistics
   - Topic progress percentages
   - Class progress views
   - Leaderboard rankings
   - Filtered question views

#### Leaderboard Changes
1. **Leaderboard updates** affect:
   - All leaderboard views
   - Student ranking displays
   - Admin leaderboard data

### Critical Invalidation Patterns (Verified)

#### High-Frequency Updates
- **StudentProgress**: Changes frequently (daily syncs, manual updates)
  - Invalidate: Student profile, topic progress, class progress, leaderboards
  - Cache TTL: Short (2-5 minutes)

#### Medium-Frequency Updates
- **QuestionVisibility**: Changes when assignments updated
  - Invalidate: Question listings, topic progress, class details
  - Cache TTL: Medium (5-10 minutes)

#### Low-Frequency Updates
- **Topic/Class/Question CRUD**: Changes occasionally
  - Invalidate: All dependent caches
  - Cache TTL: Longer (10-30 minutes)

### Cache Key Strategy (Verified)

#### Hierarchical Key Structure
```
{entity}:{identifier}:{optional_params_hash}
```

#### Examples
- `public_profile:john_doe` (john_doe's public profile)
- `topics_progress:123:789:abc123` (student 123, batch 789, query hash abc123)
- `questions:def456` (questions with query hash def456)

#### Hashing Strategy
- Use SHA256 or similar for query parameters
- Include user-specific identifiers in student-specific caches
- Separate public vs private data with different key patterns

### Implementation Recommendations (Verified)

#### Cache Invalidation Order
1. **Immediate invalidation** on WRITE operations
2. **Batch invalidation** for bulk operations
3. **Pattern-based invalidation** for cascading effects
4. **Selective invalidation** to minimize cache misses

#### Cache Warming Strategy
1. **Warm critical paths** on application startup
2. **Background refresh** for frequently accessed data
3. **Pre-warm user-specific caches** on login
4. **Warm leaderboard data** periodically

#### Monitoring & Optimization
1. **Track cache hit/miss ratios**
2. **Monitor invalidation frequency**
3. **Optimize TTL based on access patterns**
4. **Implement cache size limits and eviction policies**

---



### APIs Added (Missing):
1. **Auth APIs**: Complete auth flow with registration, login, logout, password reset
2. **User APIs**: Username availability check
3. **Admin APIs**: Admin profile, roles, statistics
4. **Public APIs**: Cities, batches for public access

### Route Prefixes Verified:
- Student routes: `/students/*`
- Admin routes: `/admin/*`
- Public routes: `/public/*`
- User routes: `/user/*`
- Auth routes: `/auth/*`

### HTTP Methods Verified:
- GET for data retrieval
- POST for creation and complex queries (leaderboard)
- PUT/PATCH for updates
- DELETE for removal

---

## FINAL IMPLEMENTATION NOTES

1. **Start with high-impact caches** (leaderboards, student progress, topic progress)
2. **Implement gradual rollout** to measure performance impact
3. **Use Redis pipelining** for multiple cache operations
4. **Implement cache fallback** mechanisms for Redis failures
5. **Add comprehensive logging** for cache operations
6. **Monitor Redis memory usage** and implement appropriate eviction policies

This verified plan provides a complete, production-ready caching strategy tailored to your DSA Tracker backend's actual API structure and data relationships.
