# DSA Tracker Backend API Documentation

## Table of Contents

1. [Authentication Routes](#authentication-routes)
2. [Super Admin Routes](#super-admin-routes)
3. [Admin Routes](#admin-routes)
4. [Student Routes](#student-routes)

---

## Authentication Routes

### Student Registration
**POST** `/auth/student/register`

**Description:** Register a new student account

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "username": "string",
  "password": "string",
  "enrollment_id": "string",
  "batch_id": "number",
  "leetcode_id": "string (optional)",
  "gfg_id": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Student registered successfully",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "username": "string",
    "enrollment_id": "string",
    "batch_id": "number",
    "city_id": "number",
    "leetcode_id": "string",
    "gfg_id": "string",
    "created_at": "datetime",
    "batch": {
      "id": "number",
      "batch_name": "string",
      "slug": "string",
      "year": "number"
    },
    "city": {
      "id": "number",
      "city_name": "string"
    }
  }
}
```

### Student Login
**POST** `/auth/student/login`

**Description:** Login student with email/username and password

**Request Body:**
```json
{
  "email": "string (optional)",
  "username": "string (optional)",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "accessToken": "string",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "username": "string",
    "city": "object",
    "batch": "object",
    "leetcode_id": "string",
    "gfg_id": "string",
    "cityId": "number",
    "cityName": "string",
    "batchId": "number",
    "batchName": "string",
    "batchSlug": "string"
  }
}
```

### Student Logout
**POST** `/auth/student/logout`

**Description:** Logout student and clear refresh token

**Response:**
```json
{
  "message": "Student logout successful"
}
```

### Admin Login
**POST** `/auth/admin/login`

**Description:** Login admin with email and password

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "accessToken": "string",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

### Admin Logout
**POST** `/auth/admin/logout`

**Description:** Logout admin and clear refresh token

**Response:**
```json
{
  "message": "Admin logout successful"
}
```

### Refresh Token
**POST** `/auth/refresh-token`

**Description:** Refresh access token using refresh token

**Response:**
```json
{
  "accessToken": "string"
}
```

### Google Login
**POST** `/auth/google-login`

**Description:** Login using Google OAuth

**Request Body:**
```json
{
  "idToken": "string"
}
```

**Response:**
```json
{
  "message": "Google login successful",
  "accessToken": "string",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "username": "string",
    "city": "object",
    "batch": "object"
  }
}
```

### Forgot Password
**POST** `/auth/forgot-password`

**Description:** Send OTP to email for password reset

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email address",
  "otp": "string"
}
```

### Reset Password
**POST** `/auth/reset-password`

**Description:** Reset password using OTP

**Request Body:**
```json
{
  "email": "string",
  "otp": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

---

## Super Admin Routes

*All routes require SUPERADMIN role authentication*

### City Management

#### Create City
**POST** `/superadmin/cities`

**Request Body:**
```json
{
  "city_name": "string"
}
```

**Response:**
```json
{
  "message": "City created successfully",
  "city": {
    "id": "number",
    "city_name": "string",
    "created_at": "datetime"
  }
}
```

#### Get All Cities
**GET** `/superadmin/cities`

**Query Parameters:**
- `search` (optional): Filter cities by name

**Response:**
```json
[
  {
    "id": "number",
    "city_name": "string",
    "created_at": "datetime",
    "total_batches": "number",
    "total_students": "number"
  }
]
```

#### Delete City
**DELETE** `/superadmin/cities/:id`

**Response:**
```json
{
  "message": "City deleted successfully"
}
```

### Batch Management

#### Get All Batches
**GET** `/superadmin/batches`

**Query Parameters:**
- `city` (optional): Filter by city name
- `year` (optional): Filter by year

**Response:**
```json
[
  {
    "id": "number",
    "batch_name": "string",
    "year": "number",
    "city_id": "number",
    "slug": "string",
    "created_at": "datetime",
    "city": {
      "id": "number",
      "city_name": "string",
      "created_at": "datetime"
    },
    "_count": {
      "students": "number",
      "classes": "number"
    }
  }
]
```

#### Create Batch
**POST** `/superadmin/batches`

**Request Body:**
```json
{
  "batch_name": "string",
  "year": "number",
  "city_id": "number"
}
```

**Response:**
```json
{
  "message": "Batch created successfully",
  "batch": {
    "id": "number",
    "batch_name": "string",
    "year": "number",
    "city_id": "number",
    "created_at": "datetime"
  }
}
```

#### Update Batch
**PATCH** `/superadmin/batches/:id`

**Request Body:**
```json
{
  "batch_name": "string (optional)",
  "year": "number (optional)",
  "city_id": "number (optional)"
}
```

**Response:**
```json
{
  "message": "Batch updated successfully",
  "batch": {
    "id": "number",
    "batch_name": "string",
    "year": "number",
    "city_id": "number"
  }
}
```

#### Delete Batch
**DELETE** `/superadmin/batches/:id`

**Response:**
```json
{
  "message": "Batch deleted successfully"
}
```

### Admin Management

#### Create Admin
**POST** `/superadmin/admins`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "batch_id": "number"
}
```

**Response:**
```json
{
  "message": "Admin created successfully",
  "data": {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "string",
    "batch_id": "number",
    "created_at": "datetime"
  }
}
```

#### Get All Admins
**GET** `/superadmin/admins`

**Query Parameters:**
- `role` (optional): Filter by role (default: TEACHER)
- `batch_id` (optional): Filter by batch ID
- `city` (optional): Filter by city name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "name": "string",
      "email": "string",
      "role": "string",
      "batch_id": "number",
      "batch": {
        "id": "number",
        "batch_name": "string",
        "year": "number",
        "city": {
          "city_name": "string"
        }
      },
      "created_at": "datetime"
    }
  ]
}
```

#### Update Admin
**PATCH** `/superadmin/admins/:id`

**Request Body:**
```json
{
  "role": "string (optional)",
  "batch_id": "number (optional)"
}
```

**Response:**
```json
{
  "message": "Admin updated successfully",
  "data": {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "string",
    "batch_id": "number"
  }
}
```

#### Delete Admin
**DELETE** `/superadmin/admins/:id`

**Response:**
```json
{
  "message": "Admin deleted successfully"
}
```

### System Statistics

#### Get System Stats
**GET** `/superadmin/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCities": "number",
    "totalBatches": "number",
    "totalAdmins": "number"
  }
}
```

---

## Admin Routes

*All routes require ADMIN role authentication*

### Global Routes (No Batch Context)

#### Get Cities
**GET** `/admin/cities`

**Response:**
```json
[
  {
    "id": "number",
    "city_name": "string",
    "created_at": "datetime",
    "total_batches": "number",
    "total_students": "number"
  }
]
```

#### Get Batches
**GET** `/admin/batches`

**Query Parameters:**
- `city` (optional): Filter by city name
- `year` (optional): Filter by year

**Response:**
```json
[
  {
    "id": "number",
    "batch_name": "string",
    "year": "number",
    "city_id": "number",
    "slug": "string",
    "created_at": "datetime",
    "city": {
      "id": "number",
      "city_name": "string",
      "created_at": "datetime"
    },
    "_count": {
      "students": "number",
      "classes": "number"
    }
  }
]
```

### Topic Management

#### Get All Topics
**GET** `/admin/topics`

**Response:**
```json
[
  {
    "id": "number",
    "topic_name": "string",
    "slug": "string",
    "created_at": "datetime"
  }
]
```

#### Create Topic
**POST** `/admin/topics`

*Requires TEACHER or above role*

**Request Body:**
```json
{
  "topic_name": "string"
}
```

**Response:**
```json
{
  "message": "Topic created successfully",
  "topic": {
    "id": "number",
    "topic_name": "string",
    "slug": "string",
    "created_at": "datetime"
  }
}
```

#### Update Topic
**PATCH** `/admin/topics/:id`

*Requires TEACHER or above role*

**Request Body:**
```json
{
  "topic_name": "string"
}
```

**Response:**
```json
{
  "message": "Topic updated successfully",
  "topic": {
    "id": "number",
    "topic_name": "string",
    "slug": "string"
  }
}
```

#### Delete Topic
**DELETE** `/admin/topics/:id`

*Requires TEACHER or above role*

**Response:**
```json
{
  "message": "Topic deleted successfully"
}
```

### Question Management

#### Get All Questions
**GET** `/admin/questions`

**Query Parameters:**
- `topicSlug` (optional): Filter by topic slug
- `level` (optional): Filter by difficulty level (EASY, MEDIUM, HARD)
- `platform` (optional): Filter by platform (LEETCODE, GFG, OTHER, INTERVIEWBIT)
- `type` (optional): Filter by type (HOMEWORK, CLASSWORK)
- `search` (optional): Search in question name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "questions": [
    {
      "id": "number",
      "question_name": "string",
      "question_link": "string",
      "level": "string",
      "platform": "string",
      "type": "string",
      "topic": {
        "id": "number",
        "topic_name": "string",
        "slug": "string"
      },
      "created_at": "datetime"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

#### Create Question
**POST** `/admin/questions`

*Requires TEACHER or above role*

**Request Body:**
```json
{
  "question_name": "string",
  "question_link": "string",
  "level": "string",
  "platform": "string",
  "type": "string",
  "topic_id": "number"
}
```

**Response:**
```json
{
  "message": "Question created successfully",
  "question": {
    "id": "number",
    "question_name": "string",
    "question_link": "string",
    "level": "string",
    "platform": "string",
    "type": "string",
    "topic_id": "number",
    "created_at": "datetime"
  }
}
```

#### Update Question
**PATCH** `/admin/questions/:id`

*Requires TEACHER or above role*

**Request Body:**
```json
{
  "question_name": "string (optional)",
  "question_link": "string (optional)",
  "level": "string (optional)",
  "platform": "string (optional)",
  "type": "string (optional)",
  "topic_id": "number (optional)"
}
```

**Response:**
```json
{
  "message": "Question updated successfully",
  "question": {
    "id": "number",
    "question_name": "string",
    "question_link": "string",
    "level": "string",
    "platform": "string",
    "type": "string",
    "topic_id": "number"
  }
}
```

#### Delete Question
**DELETE** `/admin/questions/:id`

*Requires TEACHER or above role*

**Response:**
```json
{
  "message": "Question deleted successfully"
}
```

#### Bulk Upload Questions
**POST** `/admin/questions/bulk-upload`

*Requires TEACHER or above role*

**Request:** `multipart/form-data`
- `file`: CSV file with questions data

**Response:**
```json
{
  "message": "Questions uploaded successfully",
  "uploaded": "number",
  "failed": "number",
  "errors": ["string"]
}
```

### Student Management

#### Get All Students
**GET** `/admin/students`

**Query Parameters:**
- `batch_id` (optional): Filter by batch ID
- `search` (optional): Search by name, username, or email
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "students": [
    {
      "id": "number",
      "name": "string",
      "email": "string",
      "username": "string",
      "enrollment_id": "string",
      "batch_id": "number",
      "city_id": "number",
      "leetcode_id": "string",
      "gfg_id": "string",
      "batch": {
        "id": "number",
        "batch_name": "string",
        "year": "number"
      },
      "city": {
        "id": "number",
        "city_name": "string"
      },
      "created_at": "datetime"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

#### Create Student
**POST** `/admin/students`

*Requires TEACHER or above role*

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "username": "string",
  "password": "string",
  "enrollment_id": "string",
  "batch_id": "number",
  "leetcode_id": "string (optional)",
  "gfg_id": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Student created successfully",
  "data": {
    "id": "number",
    "name": "string",
    "email": "string",
    "username": "string",
    "enrollment_id": "string",
    "batch_id": "number",
    "city_id": "number",
    "leetcode_id": "string",
    "gfg_id": "string",
    "created_at": "datetime"
  }
}
```

#### Update Student
**PATCH** `/admin/students/:id`

*Requires TEACHER or above role*

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "username": "string (optional)",
  "enrollment_id": "string (optional)",
  "batch_id": "number (optional)",
  "leetcode_id": "string (optional)",
  "gfg_id": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Student updated successfully",
  "data": {
    "id": "number",
    "name": "string",
    "email": "string",
    "username": "string",
    "enrollment_id": "string",
    "batch_id": "number",
    "leetcode_id": "string",
    "gfg_id": "string"
  }
}
```

#### Delete Student
**DELETE** `/admin/students/:id`

*Requires TEACHER or above role*

**Response:**
```json
{
  "message": "Student deleted permanently"
}
```

#### Add Student Progress
**POST** `/admin/students/progress`

*Requires ADMIN role*

**Request Body:**
```json
{
  "student_id": "number",
  "question_id": "number"
}
```

**Response:**
```json
{
  "message": "Student progress added successfully",
  "data": {
    "student_id": "number",
    "question_id": "number",
    "sync_at": "datetime"
  }
}
```

### Statistics and Reports

#### Get Admin Stats
**POST** `/admin/stats`

**Request Body:**
```json
{
  "batch_id": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batch_id": "number",
    "batch_name": "string",
    "city": "string",
    "year": "number",
    "total_classes": "number",
    "total_questions": "number",
    "total_students": "number",
    "questions_by_type": {
      "homework": "number",
      "classwork": "number"
    },
    "questions_by_level": {
      "easy": "number",
      "medium": "number",
      "hard": "number"
    },
    "questions_by_platform": {
      "leetcode": "number",
      "gfg": "number",
      "other": "number",
      "interviewbit": "number"
    },
    "total_topics_discussed": "number"
  }
}
```

#### Download Batch Report
**POST** `/admin/student/reportdownload`

**Request Body:**
```json
{
  "batch_id": "number"
}
```

**Response:** CSV file download

### Leaderboard

#### Get Admin Leaderboard
**POST** `/admin/leaderboard`

**Request Body:**
```json
{
  "city": "string (optional, default: all)",
  "type": "string (optional, default: all)",
  "year": "number (optional, default: current year)"
}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by username

**Response:**
```json
{
  "success": true,
  "page": "number",
  "limit": "number",
  "total": "number",
  "totalPages": "number",
  "leaderboard": [
    {
      "student_id": "number",
      "name": "string",
      "username": "string",
      "batch_year": "number",
      "city_name": "string",
      "max_streak": "number",
      "easy_solved": "number",
      "medium_solved": "number",
      "hard_solved": "number",
      "total_solved": "number",
      "rank": "number"
    }
  ]
}
```

### Batch-Specific Routes

*All routes below require valid batchSlug in URL*

#### Get Topics for Batch
**GET** `/admin/:batchSlug/topics`

**Response:**
```json
[
  {
    "id": "number",
    "topic_name": "string",
    "slug": "string",
    "classes_count": "number",
    "total_questions": "number",
    "created_at": "datetime"
  }
]
```

### Class Management (Topic Context)

#### Get Classes by Topic
**GET** `/admin/:batchSlug/topics/:topicSlug/classes`

**Response:**
```json
[
  {
    "id": "number",
    "class_name": "string",
    "slug": "string",
    "description": "string",
    "duration_minutes": "number",
    "pdf_url": "string",
    "class_date": "date",
    "questions_count": "number",
    "created_at": "datetime"
  }
]
```

#### Create Class in Topic
**POST** `/admin/:batchSlug/topics/:topicSlug/classes`

*Requires TEACHER or above role*

**Request Body:**
```json
{
  "class_name": "string",
  "description": "string (optional)",
  "pdf_url": "string (optional)",
  "duration_minutes": "number (optional)",
  "class_date": "date (optional)"
}
```

**Response:**
```json
{
  "message": "Class created successfully",
  "class": {
    "id": "number",
    "class_name": "string",
    "slug": "string",
    "description": "string",
    "duration_minutes": "number",
    "pdf_url": "string",
    "class_date": "date",
    "created_at": "datetime"
  }
}
```

#### Get Class Details
**GET** `/admin/:batchSlug/topics/:topicSlug/classes/:classSlug`

**Response:**
```json
{
  "id": "number",
  "class_name": "string",
  "slug": "string",
  "description": "string",
  "duration_minutes": "number",
  "pdf_url": "string",
  "class_date": "date",
  "topic": {
    "id": "number",
    "topic_name": "string",
    "slug": "string"
  },
  "questions": [
    {
      "id": "number",
      "question_name": "string",
      "question_link": "string",
      "level": "string",
      "platform": "string",
      "type": "string"
    }
  ],
  "created_at": "datetime"
}
```

#### Update Class
**PATCH** `/admin/:batchSlug/topics/:topicSlug/classes/:classSlug`

*Requires TEACHER or above role*

**Request Body:**
```json
{
  "class_name": "string (optional)",
  "description": "string (optional)",
  "pdf_url": "string (optional)",
  "duration_minutes": "number (optional)",
  "class_date": "date (optional)"
}
```

**Response:**
```json
{
  "message": "Class updated successfully",
  "class": {
    "id": "number",
    "class_name": "string",
    "slug": "string",
    "description": "string",
    "duration_minutes": "number",
    "pdf_url": "string",
    "class_date": "date"
  }
}
```

#### Delete Class
**DELETE** `/admin/:batchSlug/topics/:topicSlug/classes/:classSlug`

*Requires TEACHER or above role*

**Response:**
```json
{
  "message": "Class deleted successfully"
}
```

### Question Assignment

#### Assign Questions to Class
**POST** `/admin/:batchSlug/topics/:topicSlug/classes/:classSlug/questions`

*Requires TEACHER or above role*

**Request Body:**
```json
{
  "question_ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "message": "Questions assigned successfully",
  "assigned": "number",
  "skipped": "number",
  "duplicates": ["number"]
}
```

#### Get Assigned Questions of Class
**GET** `/admin/:batchSlug/topics/:topicSlug/classes/:classSlug/questions`

**Response:**
```json
{
  "message": "Assigned questions retrieved successfully",
  "data": [
    {
      "id": "number",
      "question_name": "string",
      "question_link": "string",
      "level": "string",
      "platform": "string",
      "type": "string",
      "topic": {
        "id": "number",
        "topic_name": "string",
        "slug": "string"
      },
      "assigned_at": "datetime"
    }
  ]
}
```

#### Remove Question from Class
**DELETE** `/admin/:batchSlug/topics/:topicSlug/classes/:classSlug/questions/:questionId`

*Requires TEACHER or above role*

**Response:**
```json
{
  "message": "Question removed successfully"
}
```

### Bulk Operations

#### Bulk Student Upload
**POST** `/admin/bulk-operations`

**Request:** `multipart/form-data`
- `file`: CSV file with student data

**Response:**
```json
{
  "message": "Students uploaded successfully",
  "uploaded": "number",
  "failed": "number",
  "errors": ["string"]
}
```

### Testing and Sync

#### Test LeetCode Sync
**GET** `/admin/test/leetcode/:username`

**Response:**
```json
{
  "message": "LeetCode test completed",
  "data": {
    "username": "string",
    "totalSolved": "number",
    "easySolved": "number",
    "mediumSolved": "number",
    "hardSolved": "number",
    "profile": "object"
  }
}
```

#### Test GFG Sync
**GET** `/admin/test/gfg/:username`

**Response:**
```json
{
  "message": "GFG test completed",
  "data": {
    "username": "string",
    "totalSolved": "number",
    "profile": "object"
  }
}
```

#### Manual Sync Student
**POST** `/admin/students/sync/:id`

**Response:**
```json
{
  "message": "Student sync completed",
  "data": {
    "leetcode_updated": "boolean",
    "gfg_updated": "boolean",
    "last_synced_at": "datetime"
  }
}
```

---

## Student Routes

### Public Routes

#### Get Public Student Profile
**GET** `/student/profile/:username`

**Response:**
```json
{
  "student_id": "number",
  "name": "string",
  "username": "string",
  "batch": {
    "batch_name": "string",
    "year": "number"
  },
  "city": {
    "city_name": "string"
  },
  "leetcode_id": "string",
  "gfg_id": "string",
  "lc_total_solved": "number",
  "gfg_total_solved": "number",
  "stats": {
    "total_solved": "number",
    "easy_solved": "number",
    "medium_solved": "number",
    "hard_solved": "number",
    "max_streak": "number"
  },
  "last_synced_at": "datetime"
}
```

### Authenticated Routes

*All routes below require STUDENT role authentication*

### Topics

#### Get Topics with Batch Progress
**GET** `/student/topics`

**Response:**
```json
[
  {
    "id": "number",
    "topic_name": "string",
    "slug": "string",
    "total_classes": "number",
    "total_questions": "number",
    "solved_questions": "number",
    "progress_percentage": "number",
    "classes": [
      {
        "id": "number",
        "class_name": "string",
        "slug": "string",
        "duration_minutes": "number",
        "questions_count": "number",
        "solved_questions": "number"
      }
    ]
  }
]
```

#### Get Topic Overview with Classes Summary
**GET** `/student/topics/:topicSlug`

**Response:**
```json
{
  "topic": {
    "id": "number",
    "topic_name": "string",
    "slug": "string"
  },
  "classes": [
    {
      "id": "number",
      "class_name": "string",
      "slug": "string",
      "description": "string",
      "duration_minutes": "number",
      "class_date": "date",
      "total_questions": "number",
      "solved_questions": "number",
      "progress_percentage": "number"
    }
  ],
  "overall_progress": {
    "total_questions": "number",
    "solved_questions": "number",
    "progress_percentage": "number"
  }
}
```

### Classes

#### Get Class Details with Full Questions
**GET** `/student/topics/:topicSlug/classes/:classSlug`

**Response:**
```json
{
  "class": {
    "id": "number",
    "class_name": "string",
    "slug": "string",
    "description": "string",
    "duration_minutes": "number",
    "pdf_url": "string",
    "class_date": "date"
  },
  "questions": [
    {
      "id": "number",
      "question_name": "string",
      "question_link": "string",
      "level": "string",
      "platform": "string",
      "type": "string",
      "is_solved": "boolean",
      "solved_at": "datetime (optional)"
    }
  ],
  "progress": {
    "total_questions": "number",
    "solved_questions": "number",
    "progress_percentage": "number"
  }
}
```

### Questions

#### Get All Questions with Filters
**GET** `/student/addedQuestions`

**Query Parameters:**
- `search` (optional): Search in question name
- `topic` (optional): Filter by topic slug
- `level` (optional): Filter by difficulty level
- `platform` (optional): Filter by platform
- `type` (optional): Filter by type
- `solved` (optional): Filter by solved status (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "questions": [
    {
      "id": "number",
      "question_name": "string",
      "question_link": "string",
      "level": "string",
      "platform": "string",
      "type": "string",
      "topic": {
        "id": "number",
        "topic_name": "string",
        "slug": "string"
      },
      "is_solved": "boolean",
      "solved_at": "datetime (optional)",
      "class": {
        "class_name": "string",
        "slug": "string"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  },
  "filters": {
    "search": "string",
    "topic": "string",
    "level": "string",
    "platform": "string",
    "type": "string",
    "solved": "string"
  }
}
```

### Leaderboard

#### Get Student Leaderboard
**POST** `/student/leaderboard`

**Request Body:**
```json
{
  "city": "string (optional, default: all)",
  "type": "string (optional, default: all)",
  "year": "number (optional, default: student's batch year)"
}
```

**Query Parameters:**
- `username` (optional): Search by username

**Response:**
```json
{
  "success": true,
  "top10": [
    {
      "student_id": "number",
      "name": "string",
      "username": "string",
      "batch_year": "number",
      "city_name": "string",
      "max_streak": "number",
      "easy_solved": "number",
      "medium_solved": "number",
      "hard_solved": "number",
      "total_solved": "number",
      "rank": "number"
    }
  ],
  "yourRank": {
    "rank": "number",
    "student_id": "number",
    "name": "string",
    "username": "string",
    "batch_year": "number",
    "city_name": "string",
    "max_streak": "number",
    "easy_solved": "number",
    "medium_solved": "number",
    "hard_solved": "number",
    "total_solved": "number"
  },
  "message": "string (optional)",
  "filters": {
    "city": "string",
    "year": "number",
    "type": "string"
  }
}
```

### Profile

#### Get Student Profile
**GET** `/student/profile`

**Response:**
```json
{
  "student": {
    "id": "number",
    "name": "string",
    "email": "string",
    "username": "string",
    "enrollment_id": "string",
    "leetcode_id": "string",
    "gfg_id": "string",
    "batch": {
      "id": "number",
      "batch_name": "string",
      "year": "number",
      "slug": "string"
    },
    "city": {
      "id": "number",
      "city_name": "string"
    }
  },
  "stats": {
    "total_solved": "number",
    "easy_solved": "number",
    "medium_solved": "number",
    "hard_solved": "number",
    "max_streak": "number",
    "current_streak": "number",
    "lc_total_solved": "number",
    "gfg_total_solved": "number"
  },
  "progress": {
    "total_topics": "number",
    "completed_topics": "number",
    "total_questions": "number",
    "solved_questions": "number",
    "overall_progress": "number"
  },
  "recent_activity": [
    {
      "question_name": "string",
      "level": "string",
      "platform": "string",
      "solved_at": "datetime"
    }
  ],
  "last_synced_at": "datetime"
}
```

### Profile Image

#### Upload Profile Image
**POST** `/student/profile-image`

**Request:** `multipart/form-data`
- `file`: Image file (JPEG, PNG, WebP, max 5MB)

**Response:**
```json
{
  "message": "Profile image uploaded successfully",
  "imageUrl": "string"
}
```

#### Delete Profile Image
**DELETE** `/student/profile-image`

**Response:**
```json
{
  "message": "Profile image deleted successfully"
}
```

#### Get Profile Image
**GET** `/student/profile-image`

**Response:**
```json
{
  "imageUrl": "string",
  "hasImage": "boolean"
}
```

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (optional)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Headers

For protected routes, include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

For routes that use refresh tokens, the token is automatically sent via HTTP-only cookies.
