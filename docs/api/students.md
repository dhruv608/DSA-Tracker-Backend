# Student API Documentation

## 🎓 Student API Overview

The Student API provides endpoints for students to track their DSA progress, view assigned questions, monitor their performance, and engage with the learning platform. All endpoints require student authentication and return data specific to the student's batch and progress.

## 📋 Student Endpoints

| Endpoint | Method | Description | Frontend Usage |
|----------|--------|-------------|-----------------|
| `/api/students/topics` | GET | Get topics with batch progress | Dashboard |
| `/api/students/topics/:slug` | GET | Get topic overview with classes | Topic Details |
| `/api/students/topics/:topicSlug/classes/:classSlug` | GET | Get class with questions | Class Details |
| `/api/students/addedQuestions` | GET | Get all questions with filters | Questions Page |
| `/api/students/leaderboard` | POST | Get leaderboard data | Leaderboard |
| `/api/students/profile` | GET | Get complete student profile | Profile Page |

---

## 📚 Get Topics with Batch Progress

### **Endpoint**
`GET /api/students/topics`

### **Description**
Retrieves all topics with batch-specific progress information for the authenticated student. Returns topics with class counts, question counts, and solved question counts specific to the student's batch.

### **Authentication**
- **Required**: Student JWT token
- **Middleware**: verifyToken, isStudent, extractStudentInfo

### **Request Headers**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Request Parameters**
None

### **Example Request**
```bash
curl -X GET http://localhost:5000/api/students/topics \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Success Response (200)**
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
    },
    {
      "id": 2,
      "topic_name": "Binary Trees",
      "slug": "binary-trees",
      "batchSpecificData": {
        "totalClasses": 2,
        "totalQuestions": 10,
        "solvedQuestions": 3
      }
    }
  ]
}
```

### **Response Fields**
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Topic ID |
| `topic_name` | string | Topic name |
| `slug` | string | URL-friendly topic identifier |
| `batchSpecificData` | object | Batch-specific progress data |
| `totalClasses` | number | Number of classes in student's batch |
| `totalQuestions` | number | Total questions assigned to batch |
| `solvedQuestions` | number | Questions solved by student |

### **Frontend Usage**
```javascript
// Fetch topics for dashboard
const fetchTopics = async () => {
  try {
    const response = await authenticatedFetch('/api/students/topics');
    const data = await response.json();
    
    // Calculate progress percentages
    const topicsWithProgress = data.data.map(topic => ({
      ...topic,
      progressPercentage: (topic.batchSpecificData.solvedQuestions / topic.batchSpecificData.totalQuestions) * 100
    }));
    
    return topicsWithProgress;
  } catch (error) {
    console.error('Failed to fetch topics:', error);
    throw error;
  }
};
```

---

## 📖 Get Topic Overview

### **Endpoint**
`GET /api/students/topics/:slug`

### **Description**
Retrieves detailed information about a specific topic including all classes in the student's batch, with question counts and solved progress for each class.

### **Authentication**
- **Required**: Student JWT token
- **Middleware**: verifyToken, isStudent, extractStudentInfo

### **Request Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Topic slug identifier |

### **Example Request**
```bash
curl -X GET http://localhost:5000/api/students/topics/arrays-strings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Success Response (200)**
```json
{
  "id": 1,
  "topic_name": "Arrays and Strings",
  "slug": "arrays-strings",
  "description": "Fundamental data structures and string manipulation",
  "classes": [
    {
      "id": 1,
      "class_name": "Introduction to Arrays",
      "slug": "intro-arrays",
      "duration_minutes": 90,
      "totalQuestions": 5,
      "solvedQuestions": 3
    },
    {
      "id": 2,
      "class_name": "Advanced Array Problems",
      "slug": "advanced-arrays",
      "duration_minutes": 120,
      "totalQuestions": 8,
      "solvedQuestions": 4
    }
  ],
  "overallProgress": {
    "totalClasses": 2,
    "totalQuestions": 13,
    "solvedQuestions": 7
  }
}
```

### **Response Fields**
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Topic ID |
| `topic_name` | string | Topic name |
| `slug` | string | Topic slug |
| `description` | string | Topic description |
| `classes` | array | Classes in student's batch |
| `class_name` | string | Class name |
| `slug` | string | Class slug |
| `duration_minutes` | number | Class duration |
| `totalQuestions` | number | Questions in class |
| `solvedQuestions` | number | Questions solved by student |
| `overallProgress` | object | Topic-wide progress summary |

---

## 📝 Get Class Details with Questions

### **Endpoint**
`GET /api/students/topics/:topicSlug/classes/:classSlug`

### **Description**
Retrieves detailed information about a specific class including all assigned questions with the student's progress on each question.

### **Authentication**
- **Required**: Student JWT token
- **Middleware**: verifyToken, isStudent, extractStudentInfo

### **Request Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topicSlug` | string | Yes | Topic slug |
| `classSlug` | string | Yes | Class slug |

### **Example Request**
```bash
curl -X GET http://localhost:5000/api/students/topics/arrays-strings/classes/intro-arrays \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Success Response (200)**
```json
{
  "id": 1,
  "class_name": "Introduction to Arrays",
  "slug": "intro-arrays",
  "description": "Basic array operations and concepts",
  "duration_minutes": 90,
  "totalQuestions": 5,
  "solvedQuestions": 3,
  "questions": [
    {
      "id": 1,
      "question_name": "Two Sum",
      "question_link": "https://leetcode.com/problems/two-sum/",
      "platform": "LEETCODE",
      "level": "EASY",
      "type": "HOMEWORK",
      "isSolved": true,
      "syncAt": "2025-03-10T15:30:00Z"
    },
    {
      "id": 2,
      "question_name": "Best Time to Buy and Sell Stock",
      "question_link": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      "platform": "LEETCODE",
      "level": "EASY",
      "type": "CLASSWORK",
      "isSolved": false,
      "syncAt": null
    }
  ]
}
```

### **Response Fields**
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Class ID |
| `class_name` | string | Class name |
| `slug` | string | Class slug |
| `description` | string | Class description |
| `duration_minutes` | number | Class duration |
| `totalQuestions` | number | Total questions in class |
| `solvedQuestions` | number | Questions solved by student |
| `questions` | array | Question list with progress |
| `question_name` | string | Question title |
| `question_link` | string | URL to question |
| `platform` | string | Source platform |
| `level` | string | Difficulty level |
| `type` | string | Question type |
| `isSolved` | boolean | Student solved status |
| `syncAt` | string | Solve timestamp |

---

## ❓ Get Added Questions with Filters

### **Endpoint**
`GET /api/students/addedQuestions`

### **Description**
Retrieves all questions assigned to the student's batch with comprehensive filtering options and pagination. Returns questions with solve status and allows filtering by various criteria.

### **Authentication**
- **Required**: Student JWT token
- **Middleware**: verifyToken, isStudent, extractStudentInfo

### **Request Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search in question names and topics |
| `topic` | string | No | Filter by topic slug |
| `level` | string | No | Filter by difficulty (EASY/MEDIUM/HARD) |
| `platform` | string | No | Filter by platform (LEETCODE/GFG/OTHER) |
| `type` | string | No | Filter by type (HOMEWORK/CLASSWORK) |
| `solved` | string | No | Filter by solve status (true/false) |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |

### **Example Request**
```bash
curl -X GET "http://localhost:5000/api/students/addedQuestions?level=EASY&platform=LEETCODE&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Success Response (200)**
```json
{
  "questions": [
    {
      "id": 1,
      "question_name": "Two Sum",
      "question_link": "https://leetcode.com/problems/two-sum/",
      "platform": "LEETCODE",
      "level": "EASY",
      "type": "HOMEWORK",
      "isSolved": true,
      "syncAt": "2025-03-10T15:30:00Z",
      "topic": {
        "id": 1,
        "topic_name": "Arrays and Strings",
        "slug": "arrays-strings"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalQuestions": 45,
    "totalPages": 5
  },
  "filters": {
    "topics": [
      {
        "id": 1,
        "topic_name": "Arrays and Strings",
        "slug": "arrays-strings"
      }
    ],
    "levels": ["EASY", "MEDIUM", "HARD"],
    "platforms": ["LEETCODE", "GFG", "OTHER", "INTERVIEWBIT"],
    "types": ["HOMEWORK", "CLASSWORK"]
  },
  "stats": {
    "total": 45,
    "solved": 23
  }
}
```

### **Response Fields**
| Field | Type | Description |
|-------|------|-------------|
| `questions` | array | Question list with progress |
| `pagination` | object | Pagination information |
| `filters` | object | Available filter options |
| `stats` | object | Question statistics |

### **Frontend Usage**
```javascript
// Fetch questions with filters
const fetchQuestions = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  
  try {
    const response = await authenticatedFetch(`/api/students/addedQuestions?${params}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    throw error;
  }
};

// Usage examples
const easyQuestions = await fetchQuestions({ level: 'EASY' });
const leetcodeQuestions = await fetchQuestions({ platform: 'LEETCODE' });
const solvedQuestions = await fetchQuestions({ solved: 'true' });
const searchResults = await fetchQuestions({ search: 'array' });
```

---

## 🏆 Get Leaderboard

### **Endpoint**
`POST /api/students/leaderboard`

### **Description**
Retrieves leaderboard data including the student's personal rank and top performers in their batch.

### **Authentication**
- **Required**: Student JWT token
- **Middleware**: verifyToken, isStudent, extractStudentInfo

### **Request Headers**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### **Request Body**
```json
{
  "limit": 10
}
```

### **Request Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of top performers to return (default: 10) |

### **Example Request**
```bash
curl -X POST http://localhost:5000/api/students/leaderboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'
```

### **Success Response (200)**
```json
{
  "personalRank": {
    "rank": 5,
    "student": {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "maxStreak": 15,
      "easyCount": 25,
      "mediumCount": 30,
      "hardCount": 12,
      "totalCount": 67
    }
  },
  "topPerformers": [
    {
      "rank": 1,
      "name": "Alice Smith",
      "username": "alicesmith",
      "maxStreak": 25,
      "totalCount": 85
    },
    {
      "rank": 2,
      "name": "Bob Johnson",
      "username": "bobjohnson",
      "maxStreak": 20,
      "totalCount": 78
    }
  ],
  "batchStats": {
    "totalStudents": 45,
    "averageCount": 52,
    "topStreak": 25
  }
}
```

### **Response Fields**
| Field | Type | Description |
|-------|------|-------------|
| `personalRank` | object | Student's personal ranking |
| `rank` | number | Student's rank in batch |
| `student` | object | Student's stats |
| `maxStreak` | number | Maximum solving streak |
| `easyCount` | number | Easy problems solved |
| `mediumCount` | number | Medium problems solved |
| `hardCount` | number | Hard problems solved |
| `totalCount` | number | Total problems solved |
| `topPerformers` | array | Top performers list |
| `batchStats` | object | Batch statistics |

---

## 👤 Get Student Profile

### **Endpoint**
`GET /api/students/profile`

### **Description**
Retrieves comprehensive student profile information including personal details, coding platform stats, progress summary, and recent activity.

### **Authentication**
- **Required**: Student JWT token
- **Middleware**: verifyToken, isStudent, extractStudentInfo

### **Request Headers**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Success Response (200)**
```json
{
  "personalInfo": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "leetcode_id": "johndoe_lc",
    "gfg_id": "johndoe_gfg",
    "github": "johndoe",
    "linkedin": "john-doe",
    "city": {
      "id": 1,
      "city_name": "Bangalore",
      "slug": "bangalore"
    },
    "batch": {
      "id": 1,
      "batch_name": "SO-Batch-2025",
      "slug": "so-batch-2025"
    }
  },
  "codingStats": {
    "leetcode": {
      "totalSolved": 67,
      "lastSynced": "2025-03-10T15:30:00Z"
    },
    "gfg": {
      "totalSolved": 45,
      "lastSynced": "2025-03-09T10:15:00Z"
    }
  },
  "progressSummary": {
    "totalQuestions": 150,
    "solvedQuestions": 67,
    "progressPercentage": 44.7,
    "currentStreak": 5,
    "maxStreak": 15
  },
  "recentActivity": [
    {
      "question_name": "Two Sum",
      "platform": "LEETCODE",
      "solvedAt": "2025-03-10T15:30:00Z"
    }
  ]
}
```

### **Response Fields**
| Field | Type | Description |
|-------|------|-------------|
| `personalInfo` | object | Personal and batch information |
| `codingStats` | object | Platform-specific statistics |
| `progressSummary` | object | Overall progress summary |
| `recentActivity` | array | Recent solved questions |

---

## 🔄 Update Question Progress

### **Endpoint**
`PUT /api/students/questions/:questionId/progress`

### **Description**
Updates the student's progress on a specific question by marking it as solved or unsolved.

### **Authentication**
- **Required**: Student JWT token
- **Middleware**: verifyToken, isStudent, extractStudentInfo

### **Request Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `questionId` | number | Yes | Question ID |

### **Request Body**
```json
{
  "isSolved": true,
  "syncAt": "2025-03-10T15:30:00Z"
}
```

### **Example Request**
```bash
curl -X PUT http://localhost:5000/api/students/questions/1/progress \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"isSolved": true}'
```

### **Success Response (200)**
```json
{
  "message": "Progress updated successfully",
  "progress": {
    "questionId": 1,
    "isSolved": true,
    "syncAt": "2025-03-10T15:30:00Z"
  }
}
```

---

## 📱 Frontend Integration Examples

### **Question Progress Update**
```javascript
// Mark question as solved
const markQuestionSolved = async (questionId) => {
  try {
    const response = await authenticatedFetch(`/api/students/questions/${questionId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ isSolved: true })
    });
    
    const data = await response.json();
    
    // Update local state
    updateQuestionProgress(questionId, true);
    
    // Refresh leaderboard if needed
    refreshLeaderboard();
    
    return data;
  } catch (error) {
    console.error('Failed to update progress:', error);
    throw error;
  }
};
```

### **Real-time Dashboard Updates**
```javascript
// Dashboard data fetching
const fetchDashboardData = async () => {
  const [topics, leaderboard, profile] = await Promise.all([
    fetchTopics(),
    fetchLeaderboard(),
    fetchProfile()
  ]);
  
  return {
    topics: topics.data,
    personalRank: leaderboard.personalRank,
    profile: profile.personalInfo
  };
};
```

---

## 🧪 Testing Examples

### **Topics API Test**
```javascript
describe('GET /api/students/topics', () => {
  it('should return topics with batch progress', async () => {
    const response = await request(app)
      .get('/api/students/topics')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);
    
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data[0]).toHaveProperty('batchSpecificData');
  });
  
  it('should require student authentication', async () => {
    await request(app)
      .get('/api/students/topics')
      .expect(401);
  });
});
```

### **Questions API Test**
```javascript
describe('GET /api/students/addedQuestions', () => {
  it('should filter questions by level', async () => {
    const response = await request(app)
      .get('/api/students/addedQuestions?level=EASY')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);
    
    response.body.questions.forEach(question => {
      expect(question.level).toBe('EASY');
    });
  });
});
```

---

## 📊 Performance Considerations

### **Optimized Queries**
```typescript
// Efficient batch-specific topic query
const topics = await prisma.topic.findMany({
  include: {
    classes: {
      where: { batch_id: studentBatchId }, // Filter at database level
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

### **Pagination Implementation**
```typescript
const skip = (page - 1) * limit;
const questions = await prisma.questionVisibility.findMany({
  where: {
    class: {
      batch_id: studentBatchId
    }
  },
  include: {
    question: {
      include: {
        topic: true,
        progress: {
          where: { student_id: studentId }
        }
      }
    }
  },
  skip,
  take: limit,
  orderBy: { assigned_at: 'desc' }
});
```

---

## 🛡️ Security & Data Isolation

### **Batch-Specific Data Access**
```typescript
// Students can only see their batch's data
const batchSpecificQuery = await prisma.class.findMany({
  where: {
    batch_id: studentBatchId // Enforced by middleware
  }
});
```

### **Progress Isolation**
```typescript
// Students can only see their own progress
const studentProgress = await prisma.studentProgress.findMany({
  where: {
    student_id: studentId // Enforced by middleware
  }
});
```

This Student API provides comprehensive functionality for students to track their learning progress, access assigned content, and engage with the DSA learning platform while maintaining proper data isolation and security.
