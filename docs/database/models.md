# Database Models Documentation

## 🗄️ Database Overview

The DSA Tracker uses PostgreSQL as the primary database with Prisma ORM for type-safe database operations. The database schema is designed to support multi-tenant architecture with proper data isolation and scalability.

## 📋 Entity Relationship Diagram

```
City
├── Batch (Many)
│   ├── Student (Many)
│   ├── Admin (Many)
│   └── Class (Many)
│       └── QuestionVisibility (Many)
│           └── Question (Many)
│               └── StudentProgress (Many)
├── Student (Many)
│   ├── Leaderboard (One)
│   └── StudentProgress (Many)
└── Admin (Many)

Topic
├── Question (Many)
│   ├── QuestionVisibility (Many)
│   └── StudentProgress (Many)
└── Class (Many)
    └── QuestionVisibility (Many)
```

## 🏙️ City Model

### **Purpose**
Represents geographical locations where batches operate. Cities provide organizational structure for multi-location deployments.

### **Schema Definition**
```prisma
model City {
  id         Int       @id @default(autoincrement())
  city_name  String    @unique @db.VarChar(100)
  created_at DateTime  @default(now())
  slug       String    @unique @db.VarChar(120)
  batches    Batch[]
  students   Student[]
  admins     Admin[]
}
```

### **Field Descriptions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Int | Primary Key, Auto-increment | Unique identifier for the city |
| `city_name` | String | Unique, Max 100 chars | Human-readable city name |
| `slug` | String | Unique, Max 120 chars | URL-friendly city identifier |
| `created_at` | DateTime | Default now() | City creation timestamp |

### **Relationships**
- **One-to-Many with Batch**: A city can have multiple batches
- **One-to-Many with Student**: Students belong to a city
- **One-to-Many with Admin**: Admins operate within cities

### **Example Object**
```json
{
  "id": 1,
  "city_name": "Bangalore",
  "slug": "bangalore",
  "created_at": "2025-03-01T10:00:00Z"
}
```

### **Usage Patterns**
```typescript
// Create new city
const city = await prisma.city.create({
  data: {
    city_name: "Chennai",
    slug: "chennai"
  }
});

// Get city with batches
const cityWithBatches = await prisma.city.findUnique({
  where: { id: 1 },
  include: {
    batches: {
      include: {
        _count: {
          select: { students: true }
        }
      }
    }
  }
});
```

---

## 🎓 Batch Model

### **Purpose**
Represents educational batches within cities. Batches group students for organized learning and provide administrative boundaries.

### **Schema Definition**
```prisma
model Batch {
  id         Int       @id @default(autoincrement())
  batch_name String    @db.VarChar(50)
  year       Int
  city_id    Int
  slug       String   @unique @db.VarChar(80)
  created_at DateTime @default(now())

  city     City      @relation(fields: [city_id], references: [id], onDelete: Cascade)
  students Student[]
  classes  Class[]
  admins   Admin[]

  @@unique([city_id, year, batch_name])
  @@index([city_id])
}
```

### **Field Descriptions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Int | Primary Key, Auto-increment | Unique identifier for the batch |
| `batch_name` | String | Max 50 chars | Human-readable batch name |
| `year` | Int | - | Academic/Calendar year |
| `city_id` | Int | Foreign Key | Reference to parent city |
| `slug` | String | Unique, Max 80 chars | URL-friendly batch identifier |
| `created_at` | DateTime | Default now() | Batch creation timestamp |

### **Relationships**
- **Many-to-One with City**: Batches belong to cities
- **One-to-Many with Student**: Students enroll in batches
- **One-to-Many with Class**: Classes are organized by batch
- **One-to-Many with Admin**: Admins are assigned to batches

### **Example Object**
```json
{
  "id": 1,
  "batch_name": "SO-Batch-2025",
  "year": 2025,
  "city_id": 1,
  "slug": "so-batch-2025",
  "created_at": "2025-03-01T10:00:00Z"
}
```

### **Usage Patterns**
```typescript
// Create batch in city
const batch = await prisma.batch.create({
  data: {
    batch_name: "SO-Batch-2025",
    year: 2025,
    city_id: 1,
    slug: "so-batch-2025"
  }
});

// Get batch with students and classes
const batchDetails = await prisma.batch.findUnique({
  where: { id: 1 },
  include: {
    city: true,
    students: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    classes: {
      include: {
        topic: true,
        _count: {
          select: { questionVisibility: true }
        }
      }
    }
  }
});
```

---

## 👨‍🎓 Student Model

### **Purpose**
Represents student users who solve coding problems and track their progress across different platforms.

### **Schema Definition**
```prisma
model Student {
  id                  Int               @id @default(autoincrement())
  name                String            @db.VarChar(100)
  email               String            @unique @db.VarChar(150)
  username            String            @unique @db.VarChar(100)
  password_hash       String?
  google_id           String?           @unique @db.VarChar(100)
  enrollment_id       String?           @unique @db.VarChar(100)
  city_id             Int?
  batch_id            Int?
  leetcode_id         String?           @db.VarChar(100)
  gfg_id              String?           @db.VarChar(100)
  github              String?           @db.VarChar(100)
  linkedin            String?           @db.VarChar(150)
  created_at          DateTime          @default(now())
  updated_at          DateTime          @updatedAt
  provider            String            @default("google")
  refresh_token       String?
  gfg_total_solved    Int               @default(0)
  last_synced_at      DateTime?
  lc_total_solved     Int               @default(0)
  leaderboards        Leaderboard?
  batch               Batch?            @relation(fields: [batch_id], references: [id])
  city                City?             @relation(fields: [city_id], references: [id])
  progress            StudentProgress[]

  @@index([city_id])
  @@index([batch_id])
}
```

### **Field Descriptions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Int | Primary Key, Auto-increment | Unique student identifier |
| `name` | String | Max 100 chars | Student's full name |
| `email` | String | Unique, Max 150 chars | Student's email address |
| `username` | String | Unique, Max 100 chars | Unique username |
| `password_hash` | String? | Optional | Hashed password (if not OAuth) |
| `google_id` | String? | Optional, Unique | Google OAuth ID |
| `enrollment_id` | String? | Optional, Unique | Institutional enrollment ID |
| `city_id` | Int? | Optional Foreign Key | Reference to student's city |
| `batch_id` | Int? | Optional Foreign Key | Reference to student's batch |
| `leetcode_id` | String? | Optional, Max 100 chars | LeetCode username |
| `gfg_id` | String? | Optional, Max 100 chars | GeeksforGeeks username |
| `github` | String? | Optional, Max 100 chars | GitHub username |
| `linkedin` | String? | Optional, Max 150 chars | LinkedIn profile |
| `provider` | String | Default "google" | Authentication provider |
| `refresh_token` | String? | Optional | JWT refresh token |
| `gfg_total_solved` | Int | Default 0 | Total GFG problems solved |
| `lc_total_solved` | Int | Default 0 | Total LeetCode problems solved |
| `last_synced_at` | DateTime? | Optional | Last external platform sync |

### **Relationships**
- **Many-to-One with Batch**: Students belong to batches
- **Many-to-One with City**: Students belong to cities
- **One-to-One with Leaderboard**: Student's leaderboard entry
- **One-to-Many with StudentProgress**: Student's problem-solving progress

### **Example Object**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "city_id": 1,
  "batch_id": 1,
  "leetcode_id": "johndoe_lc",
  "gfg_id": "johndoe_gfg",
  "github": "johndoe",
  "linkedin": "john-doe",
  "provider": "google",
  "gfg_total_solved": 45,
  "lc_total_solved": 67,
  "last_synced_at": "2025-03-10T15:30:00Z",
  "created_at": "2025-03-01T10:00:00Z",
  "updated_at": "2025-03-10T15:30:00Z"
}
```

### **Usage Patterns**
```typescript
// Create student with OAuth
const student = await prisma.student.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    username: "johndoe",
    google_id: "google_12345",
    city_id: 1,
    batch_id: 1
  }
});

// Get student with progress
const studentWithProgress = await prisma.student.findUnique({
  where: { id: 1 },
  include: {
    batch: true,
    city: true,
    progress: {
      include: {
        question: {
          select: {
            question_name: true,
            platform: true,
            level: true,
            topic: {
              select: { topic_name: true }
            }
          }
        }
      }
    },
    leaderboards: true
  }
});
```

---

## 👨‍💼 Admin Model

### **Purpose**
Represents administrative users (teachers, interns, superadmins) who manage content and monitor student progress.

### **Schema Definition**
```prisma
model Admin {
  id            Int       @id @default(autoincrement())
  name          String    @db.VarChar(100)
  email         String    @unique @db.VarChar(150)
  username      String    @unique @db.VarChar(100)
  password_hash String
  role          AdminRole @default(INTERN)
  city_id       Int?
  batch_id      Int?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  refresh_token String?

  city  City?   @relation(fields: [city_id], references: [id])
  batch Batch?  @relation(fields: [batch_id], references: [id])

  @@index([city_id])
  @@index([batch_id])
}
```

### **Field Descriptions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Int | Primary Key, Auto-increment | Unique admin identifier |
| `name` | String | Max 100 chars | Admin's full name |
| `email` | String | Unique, Max 150 chars | Admin's email address |
| `username` | String | Unique, Max 100 chars | Unique username |
| `password_hash` | String | Required | Hashed password |
| `role` | AdminRole | Default INTERN | Admin role (SUPERADMIN, TEACHER, INTERN) |
| `city_id` | Int? | Optional Foreign Key | Reference to admin's city |
| `batch_id` | Int? | Optional Foreign Key | Reference to admin's batch |
| `refresh_token` | String? | Optional | JWT refresh token |

### **AdminRole Enum**
```prisma
enum AdminRole {
  SUPERADMIN
  TEACHER
  INTERN
}
```

### **Relationships**
- **Many-to-One with City**: Admins operate within cities
- **Many-to-One with Batch**: Admins are assigned to batches

### **Example Object**
```json
{
  "id": 1,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "username": "janesmith",
  "role": "TEACHER",
  "city_id": 1,
  "batch_id": 1,
  "created_at": "2025-03-01T10:00:00Z",
  "updated_at": "2025-03-01T10:00:00Z"
}
```

### **Usage Patterns**
```typescript
// Create teacher admin
const teacher = await prisma.admin.create({
  data: {
    name: "Jane Smith",
    email: "jane@example.com",
    username: "janesmith",
    password_hash: hashedPassword,
    role: "TEACHER",
    city_id: 1,
    batch_id: 1
  }
});

// Get admin with permissions context
const adminWithContext = await prisma.admin.findUnique({
  where: { id: 1 },
  include: {
    city: true,
    batch: {
      include: {
        students: {
          select: { id: true, name: true }
        }
      }
    }
  }
});
```

---

## 📚 Topic Model

### **Purpose**
Represents DSA topics that organize related coding questions and classes.

### **Schema Definition**
```prisma
model Topic {
  id          Int      @id @default(autoincrement())
  topic_name  String   @unique @db.VarChar(150)
  slug        String   @unique @db.VarChar(80)
  description String?  @db.Text
  order       Int      @default(0)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  classes     Class[]
  questions   Question[]
}
```

### **Field Descriptions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Int | Primary Key, Auto-increment | Unique topic identifier |
| `topic_name` | String | Unique, Max 150 chars | Human-readable topic name |
| `slug` | String | Unique, Max 80 chars | URL-friendly topic identifier |
| `description` | String? | Optional, Text | Topic description |
| `order` | Int | Default 0 | Display order for topics |

### **Relationships**
- **One-to-Many with Class**: Classes are organized under topics
- **One-to-Many with Question**: Questions belong to topics

### **Example Object**
```json
{
  "id": 1,
  "topic_name": "Arrays and Strings",
  "slug": "arrays-strings",
  "description": "Fundamental data structures and string manipulation",
  "order": 1,
  "created_at": "2025-03-01T10:00:00Z",
  "updated_at": "2025-03-01T10:00:00Z"
}
```

### **Usage Patterns**
```typescript
// Create topic
const topic = await prisma.topic.create({
  data: {
    topic_name: "Arrays and Strings",
    slug: "arrays-strings",
    description: "Fundamental data structures",
    order: 1
  }
});

// Get topic with questions and classes
const topicWithContent = await prisma.topic.findUnique({
  where: { id: 1 },
  include: {
    questions: {
      select: {
        id: true,
        question_name: true,
        platform: true,
        level: true
      }
    },
    classes: {
      where: { batch_id: 1 },
      include: {
        _count: {
          select: { questionVisibility: true }
        }
      }
    }
  }
});
```

---

## ❓ Question Model

### **Purpose**
Represents individual coding problems from various platforms that students solve.

### **Schema Definition**
```prisma
model Question {
  id            Int                  @id @default(autoincrement())
  question_name String               @db.VarChar(255)
  question_link String               @unique
  platform      Platform             @default(LEETCODE)
  level         Level                @default(MEDIUM)
  type          QuestionType         @default(HOMEWORK)
  topic_id      Int
  created_at    DateTime             @default(now())
  topic         Topic                @relation(fields: [topic_id], references: [id], onDelete: Cascade)
  visibility    QuestionVisibility[]
  progress      StudentProgress[]

  @@index([topic_id])
  @@index([platform])
  @@index([level])
}
```

### **Field Descriptions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Int | Primary Key, Auto-increment | Unique question identifier |
| `question_name` | String | Max 255 chars | Human-readable question title |
| `question_link` | String | Unique | URL to the question on platform |
| `platform` | Platform | Default LEETCODE | Source platform |
| `level` | Level | Default MEDIUM | Difficulty level |
| `type` | QuestionType | Default HOMEWORK | Question type |
| `topic_id` | Int | Foreign Key | Reference to parent topic |

### **Enums**
```prisma
enum Platform {
  LEETCODE
  GFG
  OTHER
  INTERVIEWBIT
}

enum Level {
  EASY
  MEDIUM
  HARD
}

enum QuestionType {
  HOMEWORK
  CLASSWORK
}
```

### **Relationships**
- **Many-to-One with Topic**: Questions belong to topics
- **One-to-Many with QuestionVisibility**: Questions assigned to classes
- **One-to-Many with StudentProgress**: Student progress tracking

### **Example Object**
```json
{
  "id": 1,
  "question_name": "Two Sum",
  "question_link": "https://leetcode.com/problems/two-sum/",
  "platform": "LEETCODE",
  "level": "EASY",
  "type": "HOMEWORK",
  "topic_id": 1,
  "created_at": "2025-03-01T10:00:00Z"
}
```

### **Usage Patterns**
```typescript
// Create question
const question = await prisma.question.create({
  data: {
    question_name: "Two Sum",
    question_link: "https://leetcode.com/problems/two-sum/",
    platform: "LEETCODE",
    level: "EASY",
    type: "HOMEWORK",
    topic_id: 1
  }
});

// Get questions by filters
const questions = await prisma.question.findMany({
  where: {
    platform: "LEETCODE",
    level: "EASY",
    topic: {
      slug: "arrays-strings"
    }
  },
  include: {
    topic: {
      select: { topic_name: true, slug: true }
    }
  }
});
```

---

## 📝 Class Model

### **Purpose**
Represents individual class sessions within topics and batches where questions are assigned.

### **Schema Definition**
```prisma
model Class {
  id                 Int                  @id @default(autoincrement())
  topic_id           Int
  batch_id           Int
  pdf_url            String?
  description        String?
  duration_minutes   Int?
  class_date         DateTime?
  created_at         DateTime             @default(now())
  class_name         String               @db.VarChar(50)
  slug               String               @db.VarChar(150)
  batch              Batch                @relation(fields: [batch_id], references: [id], onDelete: Cascade)
  topic              Topic                @relation(fields: [topic_id], references: [id], onDelete: Cascade)
  questionVisibility QuestionVisibility[]

  @@unique([topic_id, batch_id, slug])
  @@unique([topic_id, batch_id, class_name])
  @@index([batch_id])
  @@index([topic_id])
}
```

### **Field Descriptions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Int | Primary Key, Auto-increment | Unique class identifier |
| `topic_id` | Int | Foreign Key | Reference to parent topic |
| `batch_id` | Int | Foreign Key | Reference to parent batch |
| `pdf_url` | String? | Optional | URL to class materials |
| `description` | String? | Optional | Class description |
| `duration_minutes` | Int? | Optional | Class duration in minutes |
| `class_date` | DateTime? | Optional | Scheduled class date |
| `class_name` | String | Max 50 chars | Human-readable class name |
| `slug` | String | Max 150 chars | URL-friendly class identifier |

### **Relationships**
- **Many-to-One with Batch**: Classes belong to batches
- **Many-to-One with Topic**: Classes are organized under topics
- **One-to-Many with QuestionVisibility**: Questions assigned to classes

### **Example Object**
```json
{
  "id": 1,
  "topic_id": 1,
  "batch_id": 1,
  "class_name": "Introduction to Arrays",
  "slug": "intro-arrays",
  "description": "Basic array operations and concepts",
  "duration_minutes": 90,
  "class_date": "2025-03-15T14:00:00Z",
  "created_at": "2025-03-01T10:00:00Z"
}
```

### **Usage Patterns**
```typescript
// Create class
const classSession = await prisma.class.create({
  data: {
    topic_id: 1,
    batch_id: 1,
    class_name: "Introduction to Arrays",
    slug: "intro-arrays",
    description: "Basic array operations",
    duration_minutes: 90,
    class_date: new Date("2025-03-15T14:00:00Z")
  }
});

// Get class with questions
const classWithQuestions = await prisma.class.findUnique({
  where: { id: 1 },
  include: {
    topic: {
      select: { topic_name: true, slug: true }
    },
    batch: {
      select: { batch_name: true, slug: true }
    },
    questionVisibility: {
      include: {
        question: {
          select: {
            id: true,
            question_name: true,
            platform: true,
            level: true
          }
        }
      }
    }
  }
});
```

---

## 👁️ QuestionVisibility Model

### **Purpose**
Represents the assignment of questions to specific classes, creating the link between questions and student batches.

### **Schema Definition**
```prisma
model QuestionVisibility {
  id          Int      @id @default(autoincrement())
  class_id    Int
  question_id Int
  assigned_at DateTime @default(now())
  class       Class    @relation(fields: [class_id], references: [id], onDelete: Cascade)
  question    Question @relation(fields: [question_id], references: [id], onDelete: Cascade)

  @@unique([class_id, question_id])
  @@index([question_id])
}
```

### **Field Descriptions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Int | Primary Key, Auto-increment | Unique visibility identifier |
| `class_id` | Int | Foreign Key | Reference to class |
| `question_id` | Int | Foreign Key | Reference to question |
| `assigned_at` | DateTime | Default now() | Assignment timestamp |

### **Relationships**
- **Many-to-One with Class**: Questions assigned to classes
- **Many-to-One with Question**: Classes have assigned questions

### **Example Object**
```json
{
  "id": 1,
  "class_id": 1,
  "question_id": 1,
  "assigned_at": "2025-03-01T10:00:00Z"
}
```

### **Usage Patterns**
```typescript
// Assign question to class
const assignment = await prisma.questionVisibility.create({
  data: {
    class_id: 1,
    question_id: 1
  }
});

// Get all questions for a class
const classQuestions = await prisma.questionVisibility.findMany({
  where: { class_id: 1 },
  include: {
    question: {
      select: {
        id: true,
        question_name: true,
        platform: true,
        level: true,
        type: true
      }
    }
  }
});

// Bulk assign questions to class
const bulkAssign = await prisma.questionVisibility.createMany({
  data: [
    { class_id: 1, question_id: 1 },
    { class_id: 1, question_id: 2 },
    { class_id: 1, question_id: 3 }
  ]
});
```

---

## 📈 StudentProgress Model

### **Purpose**
Tracks individual student progress on specific questions, recording when questions are solved.

### **Schema Definition**
```prisma
model StudentProgress {
  id          Int      @id @default(autoincrement())
  student_id  Int
  question_id Int
  sync_at     DateTime @default(now())
  question    Question @relation(fields: [question_id], references: [id], onDelete: Cascade)
  student     Student  @relation(fields: [student_id], references: [id], onDelete: Cascade)

  @@unique([student_id, question_id])
  @@index([student_id])
  @@index([question_id])
}
```

### **Field Descriptions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Int | Primary Key, Auto-increment | Unique progress identifier |
| `student_id` | Int | Foreign Key | Reference to student |
| `question_id` | Int | Foreign Key | Reference to question |
| `sync_at` | DateTime | Default now() | When student solved the question |

### **Relationships**
- **Many-to-One with Student**: Progress belongs to students
- **Many-to-One with Question**: Progress for specific questions

### **Example Object**
```json
{
  "id": 1,
  "student_id": 1,
  "question_id": 1,
  "sync_at": "2025-03-10T15:30:00Z"
}
```

### **Usage Patterns**
```typescript
// Mark question as solved
const progress = await prisma.studentProgress.create({
  data: {
    student_id: 1,
    question_id: 1,
    sync_at: new Date()
  }
});

// Get student's solved questions
const solvedQuestions = await prisma.studentProgress.findMany({
  where: { student_id: 1 },
  include: {
    question: {
      select: {
        question_name: true,
        platform: true,
        level: true,
        topic: {
          select: { topic_name: true }
        }
      }
    }
  }
});

// Get progress statistics for student
const progressStats = await prisma.studentProgress.groupBy({
  by: ['question'],
  where: { student_id: 1 },
  _count: true
});
```

---

## 🏆 Leaderboard Model

### **Purpose**
Maintains leaderboard statistics for individual students, including streaks and difficulty-wise counts.

### **Schema Definition**
```prisma
model Leaderboard {
  id           Int      @id @default(autoincrement())
  student_id   Int      @unique
  max_streak   Int      @default(0)
  updated_at   DateTime @updatedAt
  easy_count   Int      @default(0)
  hard_count   Int      @default(0)
  medium_count Int      @default(0)
  student      Student  @relation(fields: [student_id], references: [id])
}
```

### **Field Descriptions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Int | Primary Key, Auto-increment | Unique leaderboard identifier |
| `student_id` | Int | Unique Foreign Key | Reference to student |
| `max_streak` | Int | Default 0 | Maximum solving streak |
| `easy_count` | Int | Default 0 | Easy problems solved |
| `medium_count` | Int | Default 0 | Medium problems solved |
| `hard_count` | Int | Default 0 | Hard problems solved |

### **Relationships**
- **One-to-One with Student**: Each student has one leaderboard entry

### **Example Object**
```json
{
  "id": 1,
  "student_id": 1,
  "max_streak": 15,
  "easy_count": 25,
  "medium_count": 30,
  "hard_count": 12,
  "updated_at": "2025-03-10T15:30:00Z"
}
```

### **Usage Patterns**
```typescript
// Create leaderboard entry
const leaderboard = await prisma.leaderboard.create({
  data: {
    student_id: 1
  }
});

// Update leaderboard after solving question
const updatedLeaderboard = await prisma.leaderboard.update({
  where: { student_id: 1 },
  data: {
    max_streak: 16,
    medium_count: {
      increment: 1
    },
    updated_at: new Date()
  }
});

// Get batch leaderboard
const batchLeaderboard = await prisma.leaderboard.findMany({
  where: {
    student: {
      batch_id: 1
    }
  },
  include: {
    student: {
      select: {
        name: true,
        username: true
      }
    }
  },
  orderBy: {
    max_streak: 'desc'
  }
});
```

---

## 🔍 Database Optimization

### **Indexing Strategy**
The database includes strategic indexes for performance:

```prisma
// Student indexes
@@index([city_id])      // Fast city-based queries
@@index([batch_id])     // Fast batch-based queries

// Question indexes
@@index([topic_id])     // Fast topic-based queries
@@index([platform])     // Fast platform filtering
@@index([level])        // Fast difficulty filtering

// QuestionVisibility indexes
@@index([question_id])  // Fast question assignment queries

// StudentProgress indexes
@@index([student_id])   // Fast student progress queries
@@index([question_id])  // Fast question progress queries
```

### **Query Optimization Examples**

```typescript
// Efficient batch-specific topic query
const batchTopics = await prisma.topic.findMany({
  include: {
    classes: {
      where: { batch_id: batchId }, // Filtered at database level
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

// Efficient progress tracking with batch filtering
const batchProgress = await prisma.studentProgress.findMany({
  where: {
    student: {
      batch_id: batchId
    },
    question: {
      topic: {
        slug: topicSlug
      }
    }
  },
  include: {
    question: {
      select: {
        level: true,
        platform: true
      }
    }
  }
});
```

This comprehensive database model documentation provides complete understanding of the DSA Tracker's data architecture, relationships, and usage patterns.
