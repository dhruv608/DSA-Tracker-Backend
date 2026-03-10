# Teacher Workflow Documentation

## 👨‍🏫 Teacher Workflow Overview

This document describes the complete workflow for teachers (and interns) using the DSA Tracker system. It covers all major operations from content creation to student progress monitoring, with detailed step-by-step processes and backend interactions.

## 🎯 Teacher Responsibilities

### **Primary Responsibilities**
- Create and manage DSA topics
- Organize classes and schedules
- Assign questions to classes
- Monitor student progress
- Generate reports and analytics
- Manage batch-specific content

### **Daily Workflow**
1. **Content Preparation**: Create topics and organize questions
2. **Class Management**: Schedule classes and assign materials
3. **Progress Monitoring**: Review student completion rates
4. **Intervention**: Identify struggling students
5. **Reporting**: Generate progress reports

---

## 📚 Topic Creation Workflow

### **Step 1: Create New Topic**
```typescript
// API Call
POST /api/admin/topics
{
  "topic_name": "Binary Search Trees",
  "description": "Introduction to BST operations and traversal",
  "order": 3
}

// Backend Flow
1. Controller validates input
2. Service checks for duplicate topic names
3. Service generates unique slug
4. Prisma creates topic record
5. Response returns created topic
```

### **Step 2: Organize Topic Structure**
```typescript
// Topic Structure Planning
const topicStructure = {
  topic_name: "Binary Search Trees",
  description: "Complete BST guide with implementations",
  estimated_duration: "2 weeks",
  difficulty_progression: ["EASY", "MEDIUM", "HARD"],
  prerequisites: ["Arrays", "Trees Introduction"]
};
```

### **Step 3: Create Classes Under Topic**
```typescript
// Create Multiple Classes
POST /api/admin/classes
{
  "topic_id": 1,
  "batch_id": 1,
  "class_name": "BST Introduction",
  "slug": "bst-intro",
  "duration_minutes": 90,
  "description": "Basic BST concepts and structure",
  "class_date": "2025-03-15T14:00:00Z"
}

// Backend Processing
1. Validate topic and batch exist
2. Check for duplicate class names within batch
3. Create class with unique slug
4. Return class details
```

### **Complete Topic Creation Example**
```typescript
// Teacher creates comprehensive topic
const createCompleteTopic = async () => {
  // 1. Create main topic
  const topic = await fetch('/api/admin/topics', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      topic_name: "Dynamic Programming",
      description: "Complete DP guide from basics to advanced",
      order: 5
    })
  });

  const topicData = await topic.json();

  // 2. Create sequential classes
  const classes = [
    {
      class_name: "DP Introduction",
      duration_minutes: 90,
      description: "Basic DP concepts and memoization"
    },
    {
      class_name: "DP Patterns",
      duration_minutes: 120,
      description: "Common DP patterns and approaches"
    },
    {
      class_name: "Advanced DP",
      duration_minutes: 120,
      description: "Complex DP problems and optimizations"
    }
  ];

  // 3. Create all classes
  for (const classData of classes) {
    await fetch('/api/admin/classes', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        topic_id: topicData.id,
        batch_id: teacherBatchId,
        class_name: classData.class_name,
        slug: classData.class_name.toLowerCase().replace(/\s+/g, '-'),
        duration_minutes: classData.duration_minutes,
        description: classData.description
      })
    });
  }

  return topicData;
};
```

---

## ❓ Question Assignment Workflow

### **Step 1: Select Questions for Assignment**
```typescript
// Browse available questions
GET /api/admin/questions?topic=dynamic-programming&level=MEDIUM

// Response
{
  "questions": [
    {
      "id": 45,
      "question_name": "Fibonacci Number",
      "platform": "LEETCODE",
      "level": "EASY",
      "question_link": "https://leetcode.com/problems/fibonacci-number/"
    },
    {
      "id": 46,
      "question_name": "Climbing Stairs",
      "platform": "LEETCODE",
      "level": "EASY",
      "question_link": "https://leetcode.com/problems/climbing-stairs/"
    }
  ]
}
```

### **Step 2: Assign Questions to Classes**
```typescript
// Bulk assignment endpoint
POST /api/admin/assign-questions
{
  "class_id": 15,
  "question_ids": [45, 46, 47, 48, 49],
  "assignment_type": "HOMEWORK"
}

// Backend Processing
1. Validate class exists and belongs to teacher's batch
2. Validate all question IDs exist
3. Create QuestionVisibility records
4. Update assignment metadata
5. Return assignment summary
```

### **Step 3: Organize by Difficulty and Type**
```typescript
// Strategic assignment strategy
const assignmentStrategy = {
  "DP Introduction": {
    "HOMEWORK": [45, 46], // Easy problems for practice
    "CLASSWORK": [47]     // Demo problem for class
  },
  "DP Patterns": {
    "HOMEWORK": [48, 49], // Medium difficulty
    "CLASSWORK": [50]     // Pattern demonstration
  },
  "Advanced DP": {
    "HOMEWORK": [51, 52], // Hard problems
    "CLASSWORK": [53]     // Complex example
  }
};
```

### **Complete Assignment Workflow**
```typescript
const assignQuestionsToClass = async (classId: number, questions: number[]) => {
  try {
    // 1. Validate class access
    const classInfo = await fetch(`/api/admin/classes/${classId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // 2. Assign questions
    const assignment = await fetch('/api/admin/assign-questions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        class_id: classId,
        question_ids: questions
      })
    });

    const result = await assignment.json();

    // 3. Update local state
    updateClassQuestions(classId, questions);

    return result;
  } catch (error) {
    console.error('Assignment failed:', error);
    throw error;
  }
};
```

---

## 📊 Progress Monitoring Workflow

### **Step 1: View Batch Progress Overview**
```typescript
// Get batch progress
GET /api/admin/progress?batch_id=1

// Response Structure
{
  "batchOverview": {
    "totalStudents": 45,
    "totalQuestions": 150,
    "averageProgress": 67.5,
    "completionRate": 0.75
  },
  "topicProgress": [
    {
      "topic_id": 1,
      "topic_name": "Arrays and Strings",
      "totalQuestions": 30,
      "averageSolved": 25,
      "strugglingStudents": [3, 7, 12]
    }
  ],
  "classProgress": [
    {
      "class_id": 1,
      "class_name": "Array Basics",
      "completionRate": 0.85,
      "averageTime": 45.5
    }
  ]
}
```

### **Step 2: Identify Struggling Students**
```typescript
// Get detailed student progress
GET /api/admin/students/progress?class_id=1&filter=struggling

// Response
{
  "students": [
    {
      "id": 7,
      "name": "John Doe",
      "email": "john@example.com",
      "progress": {
        "solvedQuestions": 8,
        "totalQuestions": 30,
        "completionRate": 0.27,
        "lastActivity": "2025-03-08T10:30:00Z",
        "streakDays": 2
      },
      "strugglingAreas": ["Arrays", "String Manipulation"]
    }
  ]
}
```

### **Step 3: Generate Progress Reports**
```typescript
// Generate batch report
POST /api/admin/reports/generate
{
  "batch_id": 1,
  "report_type": "weekly",
  "include_details": true,
  "format": "json"
}

// Backend Processing
1. Collect student progress data
2. Calculate statistics and trends
3. Identify patterns and anomalies
4. Generate comprehensive report
5. Return report data
```

### **Progress Monitoring Dashboard**
```typescript
const ProgressDashboard = () => {
  const [batchProgress, setBatchProgress] = useState(null);
  const [strugglingStudents, setStrugglingStudents] = useState([]);
  const [selectedTimeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchBatchProgress();
    fetchStrugglingStudents();
  }, [selectedTimeRange]);

  const fetchBatchProgress = async () => {
    const response = await fetch(`/api/admin/progress?batch_id=${batchId}&range=${selectedTimeRange}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setBatchProgress(data);
  };

  const fetchStrugglingStudents = async () => {
    const response = await fetch(`/api/admin/students/progress?filter=struggling&batch_id=${batchId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setStrugglingStudents(data.students);
  };

  return (
    <div className="progress-dashboard">
      {/* Batch Overview Cards */}
      <BatchOverviewCards data={batchProgress?.batchOverview} />
      
      {/* Topic Progress Chart */}
      <TopicProgressChart topics={batchProgress?.topicProgress} />
      
      {/* Struggling Students List */}
      <StrugglingStudentsList students={strugglingStudents} />
      
      {/* Class Performance */}
      <ClassPerformanceTable classes={batchProgress?.classProgress} />
    </div>
  );
};
```

---

## 📈 Analytics and Reporting Workflow

### **Step 1: Access Analytics Dashboard**
```typescript
// Get comprehensive analytics
GET /api/admin/analytics?batch_id=1&time_range=month

// Response Structure
{
  "overview": {
    "totalStudents": 45,
    "activeStudents": 42,
    "totalQuestionsSolved": 1250,
    "averageSolveTime": 45.5
  },
  "trends": {
    "dailyProgress": [
      { "date": "2025-03-01", "questionsSolved": 45 },
      { "date": "2025-03-02", "questionsSolved": 52 }
    ],
    "difficultyDistribution": {
      "EASY": 450,
      "MEDIUM": 600,
      "HARD": 200
    },
    "platformUsage": {
      "LEETCODE": 800,
      "GFG": 350,
      "INTERVIEWBIT": 100
    }
  },
  "insights": {
    "mostChallengingTopic": "Dynamic Programming",
    "mostProductiveDay": "Tuesday",
    "averageStreak": 12.5
  }
}
```

### **Step 2: Generate Custom Reports**
```typescript
// Create custom report
POST /api/admin/reports/custom
{
  "batch_id": 1,
  "metrics": ["progress", "engagement", "performance"],
  "filters": {
    "date_range": "last_30_days",
    "difficulty_levels": ["MEDIUM", "HARD"],
    "platforms": ["LEETCODE"]
  },
  "format": "detailed"
}
```

### **Step 3: Export Reports**
```typescript
// Export report to different formats
GET /api/admin/reports/export?report_id=123&format=csv

// Available formats
- CSV (Excel compatible)
- PDF (Printable report)
- JSON (API response)
- HTML (Web report)
```

---

## 🔄 Daily Teaching Workflow

### **Morning Routine (30 minutes)**
```typescript
const morningRoutine = async () => {
  // 1. Check overnight progress
  const overnightProgress = await fetch('/api/admin/progress/overnight', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // 2. Review upcoming classes
  const upcomingClasses = await fetch('/api/admin/classes/upcoming', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // 3. Check for struggling students
  const alerts = await fetch('/api/admin/alerts/students', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // 4. Prepare daily targets
  return {
    progress: overnightProgress,
    classes: upcomingClasses,
    alerts: alerts
  };
};
```

### **Class Preparation (45 minutes)**
```typescript
const prepareClass = async (classId: number) => {
  // 1. Review student preparation
  const preparation = await fetch(`/api/admin/classes/${classId}/preparation`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // 2. Check assigned questions completion
  const questionProgress = await fetch(`/api/admin/classes/${classId}/questions/progress`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // 3. Identify discussion points
  const discussionPoints = await fetch(`/api/admin/classes/${classId}/discussion-points`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return {
    preparation: preparation.data,
    progress: questionProgress.data,
    discussion: discussionPoints.data
  };
};
```

### **Evening Review (20 minutes)**
```typescript
const eveningReview = async () => {
  // 1. Review day's progress
  const dailyProgress = await fetch('/api/admin/progress/daily', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // 2. Update class notes
  const updateNotes = await fetch('/api/admin/classes/notes', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      date: new Date().toISOString(),
      notes: "Good progress on arrays, need more practice on DP"
    })
  });

  // 3. Plan next day's activities
  const planning = await fetch('/api/admin/planning/next-day', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return dailyProgress;
};
```

---

## 📱 Mobile Workflow Considerations

### **Mobile-First Progress Monitoring**
```typescript
// Mobile-optimized progress checking
const mobileProgressCheck = () => {
  return {
    // Quick stats
    quickStats: useQuickStats(),
    
    // Recent activity
    recentActivity: useRecentActivity(),
    
    // Urgent alerts
    urgentAlerts: useUrgentAlerts(),
    
    // Quick actions
    quickActions: [
      "Mark Attendance",
      "Send Reminder",
      "Update Progress"
    ]
  };
};
```

### **Push Notifications**
```typescript
// Notification settings
const notificationPreferences = {
  "progress_alerts": true,
  "struggling_students": true,
  "class_reminders": true,
  "deadline_alerts": true
};

// Send notification to teacher
const sendTeacherNotification = async (teacherId: number, message: string) => {
  await fetch('/api/admin/notifications/send', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      teacher_id: teacherId,
      message: message,
      type: 'progress_alert',
      priority: 'high'
    })
  });
};
```

---

## 🎯 Best Practices

### **Content Organization**
```typescript
// Best practice for topic structure
const topicBestPractices = {
  "logical_progression": "Start with basics, move to complex",
  "balanced_difficulty": "Mix of easy, medium, hard problems",
  "varied_platforms": "Include LEETCODE, GFG, InterviewBit",
  "clear_objectives": "Specific learning outcomes for each class",
  "adequate_practice": "Sufficient problems for mastery"
};
```

### **Student Engagement**
```typescript
// Engagement strategies
const engagementStrategies = {
  "regular_checkins": "Monitor progress every 2-3 days",
  "personalized_feedback": "Provide specific, actionable feedback",
  "recognition": "Acknowledge achievements and improvements",
  "early_intervention": "Help struggling students early",
  "peer_learning": "Encourage student collaboration"
};
```

### **Data-Driven Teaching**
```typescript
// Analytics-driven decisions
const dataDrivenTeaching = {
  "identify_patterns": "Look for common mistakes and trends",
  "adjust_difficulty": "Modify question difficulty based on performance",
  "optimize_schedule": "Adjust class timing based on engagement",
  "personalize_content": "Tailor content to student needs",
  "measure_effectiveness": "Track teaching methods' impact"
};
```

---

## 🚀 Advanced Features

### **AI-Powered Recommendations**
```typescript
// Future enhancement: AI recommendations
const aiRecommendations = {
  "question_suggestions": "Suggest questions based on student performance",
  "difficulty_adjustment": "Automatically adjust question difficulty",
  "personalized_paths": "Create individualized learning paths",
  "predictive_analytics": "Predict student success rates"
};
```

### **Automated Reporting**
```typescript
// Automated report generation
const automatedReports = {
  "weekly_summaries": "Generate weekly progress summaries",
  "parent_reports": "Create reports for parents/guardians",
  "administration_reports": "Generate reports for school administration",
  "performance_reviews": "Create student performance reviews"
};
```

---

## 📊 Workflow Metrics

### **Teacher Efficiency Metrics**
```typescript
const teacherMetrics = {
  "content_preparation_time": "Average time to prepare topics",
  "student_engagement_rate": "Percentage of active students",
  "question_completion_rate": "Average question completion rate",
  "intervention_effectiveness": "Success rate of interventions",
  "report_generation_frequency": "How often reports are generated"
};
```

### **Quality Indicators**
```typescript
const qualityIndicators = {
  "student_satisfaction": "Student feedback scores",
  "learning_outcomes": "Assessment results",
  "retention_rates": "Student retention in topics",
  "skill_improvement": "Measured skill progression",
  "peer_collaboration": "Student collaboration metrics"
};
```

This comprehensive teacher workflow documentation provides a complete guide for educators to effectively use the DSA Tracker system, from content creation to student progress monitoring and reporting.
