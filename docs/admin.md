# Admin Module Documentation

## Overview

The **Admin module** is designed for Teachers and Interns to manage educational content and track student progress within their assigned batches. Admins have contextual access based on their batch and city assignments, automatically extracted from their JWT tokens.

### Key Features

* **Batch-Specific Operations**: All operations are scoped to admin's assigned batch
* **City Context**: Automatic filtering based on admin's city assignment  
* **Question Management**: Assign and organize questions by topics and classes
* **Student Progress Tracking**: Monitor individual and batch performance
* **Leaderboard Management**: View and recalculate rankings
* **Statistics Dashboard**: Comprehensive batch analytics

---

## 🎯 Why Admin Token Contains Batch & City Details

### **Context-Aware Authentication**

Admin tokens include **batch and city context** for:

1. **Default Selection**: Set initial batch/city in UI dropdowns
2. **User Preference**: Remember admin's last selected batch/city
3. **Security**: Validate admin has access to selected batch/city
4. **Flexibility**: Allow switching between accessible batches/cities

### **Token Structure**
```json
{
  "id": 1,
  "email": "teacher@example.com",
  "role": "TEACHER",
  "userType": "admin",
  "batchId": 1,
  "batchName": "SO-Batch-2025",
  "batchSlug": "bangalore-so-batch-2025",
  "cityId": 1,
  "cityName": "Bangalore"
}
```

### **Usage Pattern**
- **Initial Load**: Use token batch/city as default selection
- **User Control**: Allow admin to switch between any accessible batch/city
- **Validation**: Server validates admin has permission for selected batch/city
- **Not Tightly Coupled**: Admin can work with multiple batches/cities

---

## 🗂️ Why Batch Slug System

### **SEO-Friendly URLs**
Batch slugs provide human-readable URLs instead of numeric IDs:

```
Before: /api/admin/123/topics
After:  /api/admin/bangalore-so-batch-2025/topics
```

### **Slug Format**
```
{cityName}-{batchName}-{year}
Examples:
- bangalore-so-batch-2025
- delhi-advanced-batch-2024
- mumbai-internship-2025
```

---

## 📊 API Reference

### **1. Admin Login**

**Request:**
```http
POST /api/auth/admin/login
```

**Request Body:**
```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "teacher@example.com",
      "role": "TEACHER",
      "batchId": 1,
      "batchName": "SO-Batch-2025",
      "batchSlug": "bangalore-so-batch-2025",
      "cityId": 1,
      "cityName": "Bangalore"
    }
  }
}
```

**UI Usage:**
- Use token `batchSlug` as **default** selection in dropdown
- Use token `cityName` as **default** selection in dropdown
- Allow admin to **switch** between any accessible batch/city
- Store admin's **last selected** batch/city in localStorage
- Validate selected batch/city on server side

---

### **2. Get Batch Statistics**

**Endpoint:** `POST /api/admin/stats`

**Default Behavior**
When admin opens Stats page, default filters (city and batch) are fetched from admin table. The frontend automatically sends the request with the corresponding batch_id, so stats for admin's assigned batch are shown initially.

**Custom Filtering**
If admin wants to view stats for other cities or batches:
- **City Dropdown**: Contains "All" option to view data across all cities. Other cities are fetched from `/cities` route.
- **Batch Dropdown**: Displays Batch Name + Year together in same dropdown. The list of batches updates based on selected city, using filtered data from `/batches` route.

**Request Body:**
```json
{
  "batch_id": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batch_id": 3,
    "batch_name": "SOT",
    "city": "Bangalore",
    "year": 2024,
    "total_classes": 2,
    "total_questions": 8,
    "total_students": 14,
    "questions_by_type": {
      "homework": 6,
      "classwork": 2
    },
    "questions_by_level": {
      "easy": 4,
      "medium": 4,
      "hard": 0
    },
    "questions_by_platform": {
      "leetcode": 3,
      "gfg": 5,
      "other": 0,
      "interviewbit": 0
    },
    "total_topics_discussed": 2
  }
}
```

**UI Usage:**
- Update `total-students` element with `total_students`
- Update `total-questions` element with `total_questions`
- Update `total-classes` element with `total_classes`
- Use `questions_by_type` for homework/classwork charts
- Use `questions_by_level` for difficulty breakdown charts
- Use `questions_by_platform` for platform distribution charts
- Use `total_topics_discussed` for topics count display

---

### **3. Get Leaderboard**

**Request:**
```http
POST /api/admin/leaderboard
```

**Request Body:**
```json
{
  "batchSlug": "bangalore-so-batch-2025",
  "type": "all",
  "page": 1,
  "limit": 10,
  "search": "john"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "student_id": 123,
        "name": "John Doe",
        "email": "john@example.com",
        "total_solved": 45,
        "score": 850.5,
        "hard_completion": 85.5,
        "medium_completion": 92.0,
        "easy_completion": 96.5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "totalStudents": 45
    }
  }
}
```

**UI Usage:**
- Loop through `leaderboard` array
- Use `rank` for rank column
- Use `name` for student name
- Use `total_solved` for solved count
- Use `score` for score display
- Use `hard_completion`, `medium_completion`, `easy_completion` for progress bars

---

### **3. Get Topics**

**Endpoint:** `GET /api/admin/{batchSlug}/topics`

**Default Behavior**
Returns all topics of a batch where the number of classes > 0 (meaning admin has discussed that topic).

The page already contains City and Batch (Name + Year) dropdowns. Based on these selections, the batch is fetched and its batchSlug is used to call this API.

**Request:**
```http
GET /api/admin/bangalore-so-batch-2025/topics
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "topic_name": "Arrays",
      "slug": "arrays",
      "totalQuestions": 25,
      "solvedQuestions": 15,
      "classesCount": 3
    }
  ]
}
```

**UI Usage:**
- Loop through `data` array
- Use `topic_name` for display text
- Use `slug` for option value
- Use `totalQuestions` for question count
- Use `solvedQuestions` for progress indicator
- Use `classesCount` for class count

---

### **4. Get Topic Details**

**Endpoint:** `GET /api/admin/{batchSlug}/topics/{topicSlug}`

**Behavior**
When an admin opens a specific topic, the page shows all classes completed for that topic in the selected batch and city. Also shows total questions uploaded by admin for that topic.

**Request:**
```http
GET /api/admin/bangalore-so-batch-2025/topics/arrays
```

**Response:**
```json
{
  "success": true,
  "data": {
    "topic": {
      "id": 1,
      "topic_name": "Arrays",
      "slug": "arrays",
      "totalQuestions": 25
    },
    "classes": [
      {
        "id": 1,
        "class_name": "Array Basics",
        "slug": "array-basics",
        "totalQuestions": 10
      }
    ],
    "total_uploaded": 15
  }
}
```

**UI Usage:**
- Use `topic.topic_name` for page heading
- Use `classes` array to display class list
- Use `total_uploaded` for uploaded questions count
- Each class uses `class_name`, `slug`, `totalQuestions`

---

### **5. Update Topic**

**Endpoint:** `PATCH /api/admin/batch/topic/{topicSlug}/{id}`

**Behavior**
Updates the name of the topic. The topicSlug will also update automatically according to new topic name.

**Request:**
```http
PATCH /api/admin/batch/topic/arrays/1
```

**Request Body:**
```json
{
  "topic_name": "Advanced Arrays"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "topic_name": "Advanced Arrays",
    "slug": "advanced-arrays"
  }
}
```

**UI Usage:**
- Update topic name in UI with response `topic_name`
- Update navigation if slug changed
- Show success notification

---

### **6. Add Topic**

**Endpoint:** `POST /api/admin/batch/topic/{topicSlug}`

**Behavior**
Adds a new topic to a particular batch.

**Request:**
```http
POST /api/admin/batch/topic/bangalore-so-batch-2025
```

**Request Body:**
```json
{
  "topic_name": "Linked Lists",
  "description": "All about linked lists"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "topic_name": "Linked Lists",
    "slug": "linked-lists"
  }
}
```

**UI Usage:**
- Add new topic to topics list with `topic_name`
- Use `slug` for navigation
- Show success message

---

### **7. Delete Topic**

**Endpoint:** `DELETE /api/admin/batch/topic/{topicSlug}`

**Behavior**
Deletes a topic from the batch.

**Request:**
```http
DELETE /api/admin/batch/topic/linked-lists
```

**Response:**
```json
{
  "success": true,
  "message": "Topic deleted successfully"
}
```

**UI Usage:**
- Remove topic from UI list
- Show confirmation message
- Refresh topics list

---

## � Student Management

### **Get All Students**

**Endpoint:** `GET /api/admin/students`

**Behavior**
Returns all students with comprehensive filtering, pagination, and ranking capabilities. Includes global and city ranks from the leaderboard system.

**Request:**
```http
GET /api/admin/students?search=john&city=Bangalore&page=1&limit=10&sortBy=totalSolved&order=desc&minGlobalRank=1&maxGlobalRank=50
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search by name, email, username, or enrollment ID | `"john"` |
| `city` | string | Filter by city name | `"Bangalore"` |
| `batchSlug` | string | Filter by batch slug | `"bangalore-so-batch-2025"` |
| `sortBy` | string | Sort field | `"created_at"`, `"totalSolved"`, `"name"` |
| `order` | string | Sort order | `"asc"`, `"desc"` |
| `page` | number | Pagination page (default: 1) | `1` |
| `limit` | number | Results per page (default: 10) | `10` |
| `minGlobalRank` | number | Minimum global rank filter | `1` |
| `maxGlobalRank` | number | Maximum global rank filter | `50` |
| `minCityRank` | number | Minimum city rank filter | `1` |
| `maxCityRank` | number | Maximum city rank filter | `20` |

**Response:**
```json
{
  "students": [
    {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "enrollment_id": "EN2025001",
      "city": "Bangalore",
      "batch": "SO-Batch-2025",
      "leetcode_id": "johndoe_lc",
      "gfg_id": "johndoe_gfg",
      "github": "johndoe",
      "linkedin": "johndoe-dev",
      "gfg_total_solved": 145,
      "lc_total_solved": 89,
      "totalSolved": 234,
      "global_rank": 15,
      "city_rank": 3,
      "provider": "google",
      "last_synced_at": "2025-01-15T10:30:00Z",
      "created_at": "2025-01-01T08:00:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**UI Usage:**
- Use `students` array to display student list/table
- Display `global_rank` and `city_rank` in rank columns
- Use `totalSolved` for progress/solved count
- Use `pagination` object for page navigation controls
- Implement search using `search` parameter
- Add rank range filters using `minGlobalRank`, `maxGlobalRank`, `minCityRank`, `maxCityRank`
- Sort by different fields using `sortBy` and `order`

**Rank Filtering Examples:**
- Top 100 students: `?maxGlobalRank=100`
- Students ranked 1-50 globally: `?minGlobalRank=1&maxGlobalRank=50`
- Top 10 in Bangalore: `?city=Bangalore&maxCityRank=10`
- Best performers in batch: `?batchSlug=bangalore-so-batch-2025&minGlobalRank=1&maxGlobalRank=20`

---

### **Get Student Report**

**Endpoint:** `GET /api/admin/students/{username}`

**Behavior**
Returns detailed student report including progress statistics, recent activity, and topic-wise performance.

**Request:**
```http
GET /api/admin/students/johndoe
```

**Response:**
```json
{
  "student": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "city": "Bangalore",
    "batch": {
      "batch_name": "SO-Batch-2025",
      "year": 2025
    },
    "created_at": "2025-01-01T08:00:00Z"
  },
  "stats": {
    "totalSolved": 234,
    "platforms": {
      "leetcode": { "total": 89, "easy": 45, "medium": 32, "hard": 12 },
      "gfg": { "total": 145, "easy": 78, "medium": 52, "hard": 15 }
    },
    "difficulty": { "easy": 123, "medium": 84, "hard": 27 },
    "type": { "homework": 180, "classwork": 54 },
    "topicStats": [
      { "topic": "Arrays", "totalQuestions": 25, "solvedByStudent": 22 },
      { "topic": "Linked Lists", "totalQuestions": 20, "solvedByStudent": 18 }
    ]
  },
  "recentActivity": [
    {
      "question": {
        "question_name": "Two Sum",
        "level": "EASY",
        "platform": "LEETCODE",
        "topic": { "topic_name": "Arrays" }
      },
      "sync_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**UI Usage:**
- Display student basic info from `student` object
- Show `totalSolved` as main progress metric
- Use `platforms` for platform-wise progress charts
- Use `difficulty` for difficulty breakdown
- Use `type` for homework vs classwork comparison
- Display `topicStats` as topic-wise progress bars
- Show `recentActivity` as latest solutions

---

### **Create Student**

**Endpoint:** `POST /api/admin/students`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "username": "janesmith",
  "password": "securePassword123",
  "enrollment_id": "EN2025002",
  "batch_id": 3,
  "leetcode_id": "janesmith_lc",
  "gfg_id": "janesmith_gfg"
}
```

**Response:**
```json
{
  "message": "Student created successfully",
  "data": {
    "id": 124,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "username": "janesmith"
  }
}
```

---

### **Update Student**

**Endpoint:** `PATCH /api/admin/students/{id}`

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "leetcode_id": "janesmith_new_lc"
}
```

**Response:**
```json
{
  "message": "Student updated successfully",
  "data": {
    "id": 124,
    "name": "Jane Smith Updated",
    "leetcode_id": "janesmith_new_lc"
  }
}
```

---

### **Delete Student**

**Endpoint:** `DELETE /api/admin/students/{id}`

**Response:**
```json
{
  "message": "Student deleted permanently"
}
```

---

### **Add Student Progress**

**Endpoint:** `POST /api/admin/students/progress`

**Request Body:**
```json
{
  "student_id": 123,
  "question_id": 456
}
```

**Response:**
```json
{
  "message": "Student progress added successfully",
  "data": {
    "id": 789,
    "student_id": 123,
    "question_id": 456,
    "sync_at": "2025-01-15T10:30:00Z"
  }
}
```

---

### **Manual Sync Student**

**Endpoint:** `POST /api/admin/students/sync/{id}`

**Behavior**
Manually triggers a sync of student's progress from LeetCode and GFG platforms.

**Response:**
```json
{
  "message": "Student sync completed successfully",
  "data": {
    "leetcode_synced": 89,
    "gfg_synced": 145,
    "last_synced_at": "2025-01-15T10:30:00Z"
  }
}
```

---

### **Bulk Student Upload**

**Endpoint:** `POST /api/admin/bulk-operations`

**Request:** (multipart/form-data)
- `file`: CSV file with student data

**CSV Format:**
```csv
name,email,username,password,enrollment_id,batch_id,leetcode_id,gfg_id
John Doe,john@example.com,johndoe,password123,EN2025001,3,johndoe_lc,johndoe_gfg
Jane Smith,jane@example.com,janesmith,password456,EN2025002,3,janesmith_lc,janesmith_gfg
```

**Response:**
```json
{
  "message": "Bulk upload completed",
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "errors": []
  }
}
```

---

## � Questions Library

### **Get Questions Library**

**Endpoint:** `GET /api/admin/questions`

**Behavior**
Returns all questions in the system with filtering capabilities. Admin can filter by batch, city, topic, level, platform, and solved status.

**Request:**
```http
GET /api/admin/questions?batch=3&city=1&topic=arrays&level=MEDIUM&platform=LEETCODE&solved=false
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `batch` | number | Filter by batch ID | `3` |
| `city` | number | Filter by city ID | `1` |
| `topic` | string | Filter by topic slug | `arrays` |
| `level` | string | Filter by difficulty | `MEDIUM` |
| `platform` | string | Filter by platform | `LEETCODE` |
| `solved` | boolean | Filter by solved status | `false` |
| `page` | number | Pagination page | `1` |
| `limit` | number | Results per page | `20` |

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "question_name": "Two Sum",
        "slug": "two-sum",
        "level": "MEDIUM",
        "platform": "LEETCODE",
        "question_link": "https://leetcode.com/problems/two-sum/",
        "topic": {
          "topic_name": "Arrays",
          "slug": "arrays"
        },
        "assigned_count": 3,
        "solved_count": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "totalQuestions": 95
    }
  }
}
```

**UI Usage:**
- Use `questions` array to display question list
- Use `question_name` for display text
- Use `slug` for question detail link
- Use `level` for difficulty badge/color
- Use `platform` for platform icon/badge
- Use `assigned_count` for assignment status
- Use `solved_count` for progress indicator
- Use `pagination` for page controls

---

### **Assign Questions to Class**

**Endpoint:** `POST /api/admin/{batchSlug}/topics/{topicSlug}/classes/{classSlug}/questions`

**Behavior**
Assigns selected questions to a specific class within a topic and batch.

**Request:**
```http
POST /api/admin/bangalore-so-batch-2025/topics/arrays/classes/array-basics/questions
```

**Request Body:**
```json
{
  "questionIds": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "message": "5 questions assigned successfully",
  "data": {
    "assigned_count": 5,
    "class_name": "Array Basics",
    "topic_name": "Arrays"
  }
}
```

**UI Usage:**
- Show success message from `message` field
- Display `assigned_count` for confirmation
- Refresh questions list for the class
- Update assignment status indicators

---

### **Remove Questions from Class**

**Endpoint:** `DELETE /api/admin/{batchSlug}/topics/{topicSlug}/classes/{classSlug}/questions`

**Behavior**
Removes selected questions from a specific class.

**Request:**
```http
DELETE /api/admin/bangalore-so-batch-2025/topics/arrays/classes/array-basics/questions
```

**Request Body:**
```json
{
  "questionIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 questions removed successfully",
  "data": {
    "removed_count": 3,
    "remaining_count": 7
  }
}
```

**UI Usage:**
- Show success message from `message` field
- Update question count with `remaining_count`
- Refresh questions list
- Update assignment status indicators

---

## 🔍 Filters Reference

### **Student Management Filters**
| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `search` | string | Search by name, email, username, or enrollment ID | `"john"` |
| `city` | string | Filter by city name | `"Bangalore"` |
| `batchSlug` | string | Filter by batch slug | `"bangalore-so-batch-2025"` |
| `sortBy` | string | Sort field | `"created_at"`, `"totalSolved"`, `"name"` |
| `order` | string | Sort order | `"asc"`, `"desc"` |
| `page` | number | Pagination page (default: 1) | `1` |
| `limit` | number | Results per page (default: 10) | `10` |
| `minGlobalRank` | number | Minimum global rank filter | `1` |
| `maxGlobalRank` | number | Maximum global rank filter | `50` |
| `minCityRank` | number | Minimum city rank filter | `1` |
| `maxCityRank` | number | Maximum city rank filter | `20` |

### **Statistics Filters**
| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `batch_id` | number | Selected batch ID | `3` |
| `city_id` | number | Selected city ID (optional) | `1` |

### **Leaderboard Filters**
| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `batchSlug` | string | Batch slug for filtering | `"bangalore-so-batch-2025"` |
| `type` | string | Time period | `"all"`, `"weekly"`, `"monthly"` |
| `search` | string | Student name search | `"john"` |
| `page` | number | Pagination page | `1` |
| `limit` | number | Results per page | `10` |

### **Questions Library Filters**
| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `batch` | number | Filter by batch ID | `3` |
| `city` | number | Filter by city ID | `1` |
| `topic` | string | Filter by topic slug | `arrays` |
| `level` | string | Filter by difficulty | `"MEDIUM"` |
| `platform` | string | Filter by platform | `"LEETCODE"` |
| `solved` | boolean | Filter by solved status | `false` |
| `page` | number | Pagination page | `1` |
| `limit` | number | Results per page | `20` |

### **Content Management Filters**
| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `batchSlug` | string | Batch identifier in URL | `"bangalore-so-batch-2025"` |
| `topicSlug` | string | Topic identifier in URL | `"arrays"` |
| `classSlug` | string | Class identifier in URL | `"array-basics"` |

---

## 📋 Quick Reference

### **Authentication**
- Login: `POST /api/auth/admin/login`
- Token contains default batch/city context
- Use token in Authorization header
- Allow admin to switch between accessible batches/cities

### **Student Management**
- Get students: `GET /api/admin/students`
- Request: `?search=john&page=1&limit=10&minGlobalRank=1&maxGlobalRank=50`
- Response: Students with ranks and pagination
- Create: `POST /api/admin/students`
- Update: `PATCH /api/admin/students/{id}`
- Delete: `DELETE /api/admin/students/{id}`
- Student report: `GET /api/admin/students/{username}`

### **Statistics**
- Get stats: `POST /api/admin/stats`
- Request: `{ "batch_id": selectedBatchId }`
- Response: Batch analytics data

### **Leaderboard**
- Get leaderboard: `POST /api/admin/leaderboard`
- Request: `{ "batchSlug": selectedBatchSlug, "type": "all", "page": 1 }`
- Response: Ranked students list

### **Content Management**
- Get topics: `GET /api/admin/{selectedBatchSlug}/topics`
- Get classes: `GET /api/admin/{selectedBatchSlug}/topics/{topicSlug}/classes`
- Assign questions: `POST /api/admin/{selectedBatchSlug}/topics/{topicSlug}/classes/{classSlug}/questions`

---

This documentation provides simple API request/response examples and UI field usage for easy frontend integration.
