# DSA Tracker Backend API Documentation

## Authentication

### Base URL: `/api/auth`

#### Student Registration
**Endpoint:** `POST /api/auth/student/register`
Register a new student account.

**Request:**
```json
{
  "name": "string",
  "email": "string", 
  "username": "string",
  "password": "string",
  "batch_id": "number",
  "leetcode_id": "string (optional)",
  "gfg_id": "string (optional)",
  "github": "string (optional)",
  "linkedin": "string (optional)",
  "enrollment_id": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Student registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "batch_id": 1,
    "city_id": 1,
    "leetcode_id": "john123",
    "gfg_id": "john456",
    "github": "johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "enrollment_id": "ENR123"
  }
}
```

#### Student Login
**Endpoint:** `POST /api/auth/student/login`
Authenticate student and receive JWT tokens.

**Request:**
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
  "user": {
    "id": 1,
    "email": "john@example.com",
    "username": "johndoe",
    "role": "STUDENT",
    "userType": "student",
    "batchId": 1,
    "batchSlug": "batch-2024",
    "cityId": 1
  },
  "tokens": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### Student Logout
**Endpoint:** `POST /api/auth/student/logout`
Logout student and invalidate refresh token.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "message": "Logout successful"
}
```

#### Admin Login
**Endpoint:** `POST /api/auth/admin/login`
Authenticate admin (SuperAdmin, Teacher, Intern) and receive JWT tokens.

**Request:**
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
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "username": "admin",
    "role": "SUPERADMIN|TEACHER|INTERN",
    "userType": "admin",
    "batchId": 1,
    "batchSlug": "batch-2024",
    "cityId": 1
  },
  "tokens": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### Admin Logout
**Endpoint:** `POST /api/auth/admin/logout`
Logout admin and invalidate refresh token.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

## Student APIs

### Base URL: `/api/students`

All endpoints require `Authorization: Bearer <access_token>` header.

#### Get Topics with Batch Progress
**Endpoint:** `GET /api/students/topics`
Get all topics with batch-specific classes and progress information.

**Response:**
```json
{
  "topics": [
    {
      "id": 1,
      "topic_name": "Arrays",
      "slug": "arrays",
      "description": "Array data structures and algorithms",
      "classes": [
        {
          "id": 1,
          "class_name": "Basic Arrays",
          "slug": "basic-arrays",
          "duration": "2 hours",
          "totalQuestions": 10,
          "solvedQuestions": 7
        }
      ],
      "totalQuestions": 25,
      "solvedQuestions": 15
    }
  ]
}
```

#### Get Topic Overview
**Endpoint:** `GET /api/students/topics/:topicSlug`
Get detailed overview of a specific topic with classes summary.

**Response:**
```json
{
  "topic": {
    "id": 1,
    "topic_name": "Arrays",
    "slug": "arrays",
    "description": "Array data structures and algorithms",
    "totalQuestions": 25,
    "solvedQuestions": 15
  },
  "classes": [
    {
      "id": 1,
      "class_name": "Basic Arrays",
      "slug": "basic-arrays",
      "duration": "2 hours",
      "totalQuestions": 10,
      "solvedQuestions": 7
    }
  ]
}
```

#### Get Class Details with Questions
**Endpoint:** `GET /api/students/topics/:topicSlug/classes/:classSlug`
Get detailed class information with all questions and progress.

**Response:**
```json
{
  "class": {
    "id": 1,
    "class_name": "Basic Arrays",
    "slug": "basic-arrays",
    "duration": "2 hours",
    "description": "Introduction to arrays"
  },
  "questions": [
    {
      "id": 1,
      "question_name": "Two Sum",
      "level": "EASY",
      "platform": "LEETCODE",
      "platform_question_id": "1",
      "link": "https://leetcode.com/problems/two-sum/",
      "isSolved": true,
      "solvedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "progress": {
    "totalQuestions": 10,
    "solvedQuestions": 7,
    "completionPercentage": 70
  }
}
```

#### Get All Questions with Filters
**Endpoint:** `GET /api/students/addedQuestions`
Get all questions with filtering options and solved status.

**Query Parameters:**
- `level`: Filter by difficulty (EASY, MEDIUM, HARD)
- `platform`: Filter by platform (LEETCODE, GFG, CODESTUDIO)
- `topic`: Filter by topic name
- `solved`: Filter by solved status (true/false)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Example:** `GET /api/students/addedQuestions?level=EASY&solved=true&page=1&limit=10`

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "question_name": "Two Sum",
      "level": "EASY",
      "platform": "LEETCODE",
      "platform_question_id": "1",
      "link": "https://leetcode.com/problems/two-sum/",
      "topic": {
        "id": 1,
        "topic_name": "Arrays",
        "slug": "arrays"
      },
      "isSolved": true,
      "solvedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Get Student Leaderboard
**Endpoint:** `POST /api/students/leaderboard`
Get leaderboard with top 10 students and student's personal rank.

**Request:**
```json
{
  "city": "all|city_name",
  "type": "weekly|monthly|all",
  "year": 2024
}
```

**Response:**
```json
{
  "top10": [
    {
      "student_id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "batch_year": 2024,
      "city_name": "New York",
      "max_streak": 5,
      "easy_solved": 85.5,
      "medium_solved": 72.3,
      "hard_solved": 45.8,
      "total_solved": 67.87,
      "rank": 1
    }
  ],
  "yourRank": {
    "rank": 15,
    "student_id": 15,
    "name": "Jane Smith",
    "username": "janesmith",
    "batch_year": 2024,
    "city_name": "New York",
    "max_streak": 3,
    "easy_solved": 65.2,
    "medium_solved": 58.9,
    "hard_solved": 32.1,
    "total_solved": 52.07
  },
  "filters": {
    "city": "all",
    "year": 2024,
    "type": "all"
  }
}
```

#### Get Student Profile
**Endpoint:** `GET /api/students/profile`
Get complete student profile with all sections.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "student": {
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "enrollmentId": "ENR123",
    "city": "New York",
    "batch": "Batch 2024",
    "year": 2024,
    "github": "johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "leetcode": "john123",
    "gfg": "john456"
  },
  "codingStats": {
    "totalSolved": 243,
    "totalAssigned": 741,
    "easy": {
      "assigned": 215,
      "solved": 118
    },
    "medium": {
      "assigned": 388,
      "solved": 104
    },
    "hard": {
      "assigned": 138,
      "solved": 21
    }
  },
  "streak": {
    "currentStreak": 1,
    "maxStreak": 5
  },
  "leaderboard": {
    "globalRank": 15,
    "cityRank": 3
  },
  "heatmap": [
    {
      "date": "2024-01-01T00:00:00.000Z",
      "count": 5
    }
  ],
  "recentActivity": [
    {
      "problemTitle": "Two Sum",
      "difficulty": "EASY",
      "solvedAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

#### Get Public Student Profile
**Endpoint:** `GET /api/students/profile/:username`
Get public student profile by username (no authentication required).

**Response:**
```json
{
  "student": {
    "name": "John Doe",
    "username": "johndoe",
    "city": "New York",
    "batch": "Batch 2024",
    "year": 2024,
    "github": "johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "leetcode": "john123",
    "gfg": "john456"
  },
  "codingStats": {
    "totalSolved": 243,
    "totalAssigned": 741,
    "easy": {
      "assigned": 215,
      "solved": 118
    },
    "medium": {
      "assigned": 388,
      "solved": 104
    },
    "hard": {
      "assigned": 138,
      "solved": 21
    }
  },
  "leaderboard": {
    "globalRank": 15,
    "cityRank": 3
  },
  "recentActivity": [
    {
      "problemTitle": "Two Sum",
      "difficulty": "EASY",
      "solvedAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

## Admin APIs

### Base URL: `/api/admin`

All endpoints require `Authorization: Bearer <access_token>` header and ADMIN role.

#### Get Cities
**Endpoint:** `GET /api/admin/cities`
Get all available cities.

**Response:**
```json
{
  "cities": [
    {
      "id": 1,
      "city_name": "New York",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Batches
**Endpoint:** `GET /api/admin/batches`
Get all batches with optional filters.

**Query Parameters:**
- `city_id`: Filter by city ID
- `year`: Filter by batch year

**Response:**
```json
{
  "batches": [
    {
      "id": 1,
      "batch_name": "Batch 2024",
      "slug": "batch-2024",
      "year": 2024,
      "city_id": 1,
      "city": {
        "city_name": "New York"
      },
      "easy_assigned": 215,
      "medium_assigned": 388,
      "hard_assigned": 138,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Topics
**Endpoint:** `GET /api/admin/topics`
Get all topics.

**Response:**
```json
{
  "topics": [
    {
      "id": 1,
      "topic_name": "Arrays",
      "slug": "arrays",
      "description": "Array data structures and algorithms",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Topic (Teacher+)
**Endpoint:** `POST /api/admin/topics`
Create a new topic (Teacher and SuperAdmin only).

**Request:**
```json
{
  "topic_name": "String Manipulation",
  "slug": "string-manipulation",
  "description": "String processing algorithms"
}
```

**Response:**
```json
{
  "message": "Topic created successfully",
  "topic": {
    "id": 2,
    "topic_name": "String Manipulation",
    "slug": "string-manipulation",
    "description": "String processing algorithms"
  }
}
```

#### Update Topic (Teacher+)
**Endpoint:** `PATCH /api/admin/topics/:id`
Update an existing topic (Teacher and SuperAdmin only).

**Request:**
```json
{
  "topic_name": "Advanced String Manipulation",
  "description": "Advanced string processing algorithms"
}
```

**Response:**
```json
{
  "message": "Topic updated successfully",
  "topic": {
    "id": 1,
    "topic_name": "Advanced String Manipulation",
    "slug": "string-manipulation",
    "description": "Advanced string processing algorithms"
  }
}
```

#### Delete Topic (Teacher+)
**Endpoint:** `DELETE /api/admin/topics/:id`
Delete a topic (Teacher and SuperAdmin only).

**Response:**
```json
{
  "message": "Topic deleted successfully"
}
```

#### Get Questions
**Endpoint:** `GET /api/admin/questions`
Get all questions with optional filters.

**Query Parameters:**
- `level`: Filter by difficulty (EASY, MEDIUM, HARD)
- `platform`: Filter by platform (LEETCODE, GFG, CODESTUDIO)
- `topic_id`: Filter by topic ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "question_name": "Two Sum",
      "level": "EASY",
      "platform": "LEETCODE",
      "platform_question_id": "1",
      "link": "https://leetcode.com/problems/two-sum/",
      "topic": {
        "id": 1,
        "topic_name": "Arrays",
        "slug": "arrays"
      },
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Create Question (Teacher+)
**Endpoint:** `POST /api/admin/questions`
Create a new question (Teacher and SuperAdmin only).

**Request:**
```json
{
  "question_name": "Three Sum",
  "level": "MEDIUM",
  "platform": "LEETCODE",
  "platform_question_id": "15",
  "link": "https://leetcode.com/problems/3sum/",
  "topic_id": 1
}
```

**Response:**
```json
{
  "message": "Question created successfully",
  "question": {
    "id": 2,
    "question_name": "Three Sum",
    "level": "MEDIUM",
    "platform": "LEETCODE",
    "platform_question_id": "15",
    "link": "https://leetcode.com/problems/3sum/",
    "topic_id": 1
  }
}
```

#### Update Question (Teacher+)
**Endpoint:** `PATCH /api/admin/questions/:id`
Update an existing question (Teacher and SuperAdmin only).

**Response:**
```json
{
  "message": "Question updated successfully",
  "question": {
    "id": 2,
    "question_name": "Updated Three Sum",
    "level": "HARD",
    "platform": "LEETCODE",
    "platform_question_id": "15",
    "link": "https://leetcode.com/problems/3sum/",
    "topic_id": 1
  }
}
```

#### Delete Question (Teacher+)
**Endpoint:** `DELETE /api/admin/questions/:id`
Delete a question (Teacher and SuperAdmin only).

**Response:**
```json
{
  "message": "Question deleted successfully"
}
```

#### Bulk Upload Questions (Teacher+)
**Endpoint:** `POST /api/admin/questions/bulk-upload`
Upload multiple questions via CSV file (Teacher and SuperAdmin only).

**Request:** `multipart/form-data` with `file` (CSV)

**CSV Format:**
```csv
question_name,level,platform,platform_question_id,link,topic_slug
Two Sum,EASY,LEETCODE,1,https://leetcode.com/problems/two-sum/,arrays
```

**Response:**
```json
{
  "message": "Questions uploaded successfully",
  "results": {
    "totalProcessed": 10,
    "successCount": 8,
    "failureCount": 2,
    "failures": [
      {
        "row": 3,
        "error": "Invalid topic slug"
      }
    ]
  }
}
```

#### Get Admin Stats
**Endpoint:** `POST /api/admin/stats`
Get comprehensive admin statistics.

**Request:**
```json
{
  "batch_id": 1,
  "city_id": 1
}
```

**Response:**
```json
{
  "stats": {
    "totalStudents": 150,
    "activeStudents": 120,
    "totalQuestions": 500,
    "averageProgress": 65.5,
    "topPerformers": [
      {
        "student_id": 1,
        "name": "John Doe",
        "totalSolved": 245,
        "completionPercentage": 85.2
      }
    ],
    "batchStats": {
      "totalStudents": 150,
      "averageProgress": 65.5,
      "easyCompletion": 75.3,
      "mediumCompletion": 60.8,
      "hardCompletion": 45.2
    }
  }
}
```

#### Get Admin Leaderboard
**Endpoint:** `POST /api/admin/leaderboard`
Get admin leaderboard with pagination and search.

**Request:**
```json
{
  "city": "all|city_name",
  "type": "weekly|monthly|all",
  "year": 2024,
  "page": 1,
  "limit": 20,
  "search": "john"
}
```

**Response:**
```json
{
  "leaderboard": [
    {
      "student_id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "batch_year": 2024,
      "city_name": "New York",
      "max_streak": 5,
      "easy_solved": 85.5,
      "medium_solved": 72.3,
      "hard_solved": 45.8,
      "total_solved": 67.87,
      "rank": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### Get Students
**Endpoint:** `GET /api/admin/students`
Get all students with optional filters.

**Query Parameters:**
- `batch_id`: Filter by batch ID
- `city_id`: Filter by city ID
- `search`: Search by name or username
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "students": [
    {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "enrollment_id": "ENR123",
      "batch": {
        "id": 1,
        "batch_name": "Batch 2024",
        "year": 2024
      },
      "city": {
        "id": 1,
        "city_name": "New York"
      },
      "leetcode_id": "john123",
      "gfg_id": "john456",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### Create Student (Teacher+)
**Endpoint:** `POST /api/admin/students`
Create a new student (Teacher and SuperAdmin only).

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "username": "janesmith",
  "password": "password123",
  "batch_id": 1,
  "leetcode_id": "jane456",
  "gfg_id": "jane789",
  "github": "janesmith",
  "linkedin": "https://linkedin.com/in/janesmith",
  "enrollment_id": "ENR456"
}
```

**Response:**
```json
{
  "message": "Student created successfully",
  "student": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "username": "janesmith",
    "batch_id": 1,
    "city_id": 1,
    "leetcode_id": "jane456",
    "gfg_id": "jane789",
    "github": "janesmith",
    "linkedin": "https://linkedin.com/in/janesmith",
    "enrollment_id": "ENR456"
  }
}
```

#### Update Student (Teacher+)
**Endpoint:** `PATCH /api/admin/students/:id`
Update student details (Teacher and SuperAdmin only).

**Response:**
```json
{
  "message": "Student updated successfully",
  "student": {
    "id": 2,
    "name": "Jane Updated",
    "email": "jane.updated@example.com",
    "username": "janesmith",
    "batch_id": 1,
    "city_id": 1,
    "leetcode_id": "jane456",
    "gfg_id": "jane789",
    "github": "janeupdated",
    "linkedin": "https://linkedin.com/in/janeupdated",
    "enrollment_id": "ENR456"
  }
}
```

#### Delete Student (Teacher+)
**Endpoint:** `DELETE /api/admin/students/:id`
Delete a student (Teacher and SuperAdmin only).

**Response:**
```json
{
  "message": "Student deleted successfully"
}
```

#### Add Student Progress (Teacher+)
**Endpoint:** `POST /api/admin/students/progress`
Manually add/update student progress (Teacher and SuperAdmin only).

**Request:**
```json
{
  "student_id": 1,
  "question_id": 1,
  "status": "SOLVED",
  "solved_at": "2024-01-01T10:00:00.000Z"
}
```

**Response:**
```json
{
  "message": "Student progress updated successfully",
  "progress": {
    "id": 123,
    "student_id": 1,
    "question_id": 1,
    "status": "SOLVED",
    "solved_at": "2024-01-01T10:00:00.000Z",
    "sync_at": "2024-01-01T10:00:00.000Z"
  }
}
```

#### Manual Sync Student
**Endpoint:** `POST /api/admin/students/sync/:id`
Manually sync student progress from external platforms.

**Response:**
```json
{
  "message": "Student sync completed successfully",
  "results": {
    "leetcode": {
      "synced": 15,
      "updated": 12,
      "failed": 3
    },
    "gfg": {
      "synced": 10,
      "updated": 8,
      "failed": 2
    },
    "totalProgress": 25
  }
}
```

#### Bulk Student Upload
**Endpoint:** `POST /api/admin/bulk-operations`
Bulk upload students via CSV file.

**Request:** `multipart/form-data` with `file` (CSV)

**CSV Format:**
```csv
name,email,username,password,batch_id,leetcode_id,gfg_id,github,linkedin,enrollment_id
John Doe,john@example.com,johndoe,password123,1,john123,john456,johndoe,https://linkedin.com/in/johndoe,ENR123
```

**Response:**
```json
{
  "message": "Students uploaded successfully",
  "results": {
    "totalProcessed": 50,
    "successCount": 45,
    "failureCount": 5,
    "failures": [
      {
        "row": 3,
        "error": "Email already exists"
      }
    ]
  }
}
```

#### Download Batch Report
**Endpoint:** `POST /api/admin/student/reportdownload`
Download batch report in CSV format.

**Request:**
```json
{
  "batch_id": 1,
  "format": "csv"
}
```

**Response:** CSV file download with headers:
```
Content-Type: text/csv
Content-Disposition: attachment; filename="batch_report_2024-01-01.csv"
```

**CSV Content:**
```csv
student_id,name,email,username,total_solved,easy_solved,medium_solved,hard_solved,completion_percentage
1,John Doe,john@example.com,johndoe,245,118,104,21,65.5
2,Jane Smith,jane@example.com,janesmith,189,95,72,22,50.8
```

---

## SuperAdmin APIs

### Base URL: `/api/superadmin`

All endpoints require `Authorization: Bearer <access_token>` header and SUPERADMIN role.

#### Create City
**Endpoint:** `POST /api/superadmin/cities`
Create a new city.

**Request:**
```json
{
  "city_name": "Boston"
}
```

**Response:**
```json
{
  "message": "City created successfully",
  "city": {
    "id": 2,
    "city_name": "Boston"
  }
}
```

#### Get All Cities
**Endpoint:** `GET /api/superadmin/cities`
Get all cities.

**Response:**
```json
{
  "cities": [
    {
      "id": 1,
      "city_name": "New York"
    },
    {
      "id": 2,
      "city_name": "Boston"
    }
  ]
}
```

#### Delete City
**Endpoint:** `DELETE /api/superadmin/cities/:id`
Delete a city.

**Response:**
```json
{
  "message": "City deleted successfully"
}
```

#### Create Batch
**Endpoint:** `POST /api/superadmin/batches`
Create a new batch.

**Request:**
```json
{
  "batch_name": "Batch 2025",
  "slug": "batch-2025",
  "year": 2025,
  "city_id": 1,
  "easy_assigned": 250,
  "medium_assigned": 400,
  "hard_assigned": 150
}
```

**Response:**
```json
{
  "message": "Batch created successfully",
  "batch": {
    "id": 2,
    "batch_name": "Batch 2025",
    "slug": "batch-2025",
    "year": 2025,
    "city_id": 1,
    "easy_assigned": 250,
    "medium_assigned": 400,
    "hard_assigned": 150
  }
}
```

#### Get All Batches
**Endpoint:** `GET /api/superadmin/batches`
Get all batches.

**Response:**
```json
{
  "batches": [
    {
      "id": 1,
      "batch_name": "Batch 2024",
      "slug": "batch-2024",
      "year": 2024,
      "city_id": 1,
      "city": {
        "city_name": "New York"
      },
      "easy_assigned": 215,
      "medium_assigned": 388,
      "hard_assigned": 138
    }
  ]
}
```

#### Update Batch
**Endpoint:** `PATCH /api/superadmin/batches/:id`
Update batch details.

**Response:**
```json
{
  "message": "Batch updated successfully",
  "batch": {
    "id": 1,
    "batch_name": "Updated Batch 2024",
    "slug": "batch-2024",
    "year": 2024,
    "city_id": 1,
    "easy_assigned": 220,
    "medium_assigned": 390,
    "hard_assigned": 138
  }
}
```

#### Delete Batch
**Endpoint:** `DELETE /api/superadmin/batches/:id`
Delete a batch.

**Response:**
```json
{
  "message": "Batch deleted successfully"
}
```

#### Create Admin
**Endpoint:** `POST /api/superadmin/admins`
Create a new admin (SuperAdmin role auto-assigned).

**Request:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "username": "adminuser",
  "password": "password123",
  "batch_id": 1
}
```

**Response:**
```json
{
  "message": "Admin created successfully",
  "admin": {
    "id": 2,
    "name": "Admin User",
    "email": "admin@example.com",
    "username": "adminuser",
    "role": "SUPERADMIN",
    "batch_id": 1,
    "city_id": 1
  }
}
```

#### Get All Admins
**Endpoint:** `GET /api/superadmin/admins`
Get all admins with optional filters.

**Query Parameters:**
- `role`: Filter by role (SUPERADMIN, TEACHER, INTERN)
- `batch_id`: Filter by batch ID
- `city_id`: Filter by city ID
- `search`: Search by name or username

**Response:**
```json
{
  "admins": [
    {
      "id": 1,
      "name": "John Admin",
      "email": "john.admin@example.com",
      "username": "johnadmin",
      "role": "TEACHER",
      "batch": {
        "id": 1,
        "batch_name": "Batch 2024",
        "year": 2024
      },
      "city": {
        "id": 1,
        "city_name": "New York"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

#### Update Admin
**Endpoint:** `PATCH /api/superadmin/admins/:id`
Update admin details (only role and batch_id allowed for SuperAdmin).

**Response:**
```json
{
  "message": "Admin updated successfully",
  "admin": {
    "id": 1,
    "name": "John Admin",
    "email": "john.admin@example.com",
    "username": "johnadmin",
    "role": "TEACHER",
    "batch_id": 2,
    "city_id": 1
  }
}
```

#### Delete Admin
**Endpoint:** `DELETE /api/superadmin/admins/:id`
Delete an admin.

**Response:**
```json
{
  "message": "Admin deleted successfully"
}
```

#### Get System Stats
**Endpoint:** `GET /api/superadmin/stats`
Get comprehensive system statistics.

**Response:**
```json
{
  "stats": {
    "totalCities": 10,
    "totalBatches": 25,
    "totalStudents": 2500,
    "totalAdmins": 50,
    "totalQuestions": 1000,
    "totalTopics": 20
  }
}
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Common Error Examples

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request data",
  "details": "Email is required"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required",
  "details": "Invalid or missing access token"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "details": "User role does not have access to this resource"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found",
  "details": "Student with ID 999 does not exist"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "error": "Resource already exists",
  "details": "Email already registered"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

### Pagination Response
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---






