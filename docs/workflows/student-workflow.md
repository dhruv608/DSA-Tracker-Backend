# Student Workflow Documentation

## 👨‍🎓 Student Workflow Overview

This document describes the complete workflow for students using the DSA Tracker system. It covers the entire learning journey from onboarding to problem solving, progress tracking, and competitive engagement.

## 🎯 Student Journey

### **Learning Path**
1. **Onboarding**: Registration and profile setup
2. **Orientation**: Understanding assigned topics and questions
3. **Learning**: Solving assigned problems systematically
4. **Tracking**: Monitoring personal progress and performance
5. **Competing**: Participating in leaderboards and challenges
6. **Improving**: Identifying weak areas and focusing on improvement

### **Daily Learning Routine**
- **Morning**: Review assigned questions and topics
- **Practice**: Solve problems on external platforms
- **Sync**: Update progress in DSA Tracker
- **Review**: Check leaderboard and progress
- **Plan**: Prepare for next learning session

---

## 🚀 Student Onboarding Workflow

### **Step 1: Registration**
```typescript
// Student registration API call
POST /api/auth/student/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "password123",
  "enrollment_id": "ENR2025001",
  "batch_id": 1,
  "leetcode_id": "johndoe_lc",
  "gfg_id": "johndoe_gfg",
  "github": "johndoe",
  "linkedin": "john-doe"
}

// Backend Processing
1. Validate input data and batch existence
2. Check for email/username uniqueness
3. Hash password securely
4. Create student record with batch assignment
5. Initialize leaderboard entry
6. Return success response with user data
```

### **Step 2: Initial Login**
```typescript
// Student login
POST /api/auth/student/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Response includes
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "batch": {
      "id": 1,
      "batch_name": "SO-Batch-2025",
      "slug": "so-batch-2025"
    },
    "city": {
      "id": 1,
      "city_name": "Bangalore",
      "slug": "bangalore"
    }
  }
}
```

### **Step 3: Profile Setup**
```typescript
// Complete profile setup
const completeProfile = async () => {
  // 1. Link external platform accounts
  await linkPlatforms({
    leetcode_id: "johndoe_lc",
    gfg_id: "johndoe_gfg",
    github: "johndoe",
    linkedin: "john-doe"
  });

  // 2. Set learning preferences
  await setPreferences({
    difficulty_preference: "progressive",
    platform_preference: "leetcode",
    daily_target: 5,
    reminder_time: "19:00"
  });

  // 3. View initial dashboard
  const dashboard = await fetchDashboard();
  return dashboard;
};
```

---

## 📚 Learning Workflow

### **Step 1: View Assigned Topics**
```typescript
// Get topics with batch progress
GET /api/students/topics

// Response Structure
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

// Frontend Processing
const processTopics = (topics) => {
  return topics.map(topic => ({
    ...topic,
    progressPercentage: (topic.batchSpecificData.solvedQuestions / topic.batchSpecificData.totalQuestions) * 100,
    status: topic.batchSpecificData.solvedQuestions === topic.batchSpecificData.totalQuestions ? 'completed' : 'in-progress',
    nextAction: topic.batchSpecificData.solvedQuestions === 0 ? 'start' : 'continue'
  }));
};
```

### **Step 2: Explore Topic Details**
```typescript
// Get topic overview with classes
GET /api/students/topics/arrays-strings

// Response Structure
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
      "solvedQuestions": 3,
      "status": "in-progress"
    },
    {
      "id": 2,
      "class_name": "Advanced Array Problems",
      "slug": "advanced-arrays",
      "duration_minutes": 120,
      "totalQuestions": 8,
      "solvedQuestions": 4,
      "status": "in-progress"
    }
  ],
  "overallProgress": {
    "totalClasses": 2,
    "totalQuestions": 13,
    "solvedQuestions": 7,
    "progressPercentage": 53.8
  }
}
```

### **Step 3: Access Class Questions**
```typescript
// Get class with questions
GET /api/students/topics/arrays-strings/classes/intro-arrays

// Response Structure
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

---

## 🎯 Problem Solving Workflow

### **Step 1: Select Question to Solve**
```typescript
// Question selection logic
const selectNextQuestion = (questions, preferences) => {
  const unsolvedQuestions = questions.filter(q => !q.isSolved);
  
  // Sort by priority
  const sortedQuestions = unsolvedQuestions.sort((a, b) => {
    // Priority: CLASSWORK > HOMEWORK
    if (a.type === 'CLASSWORK' && b.type === 'HOMEWORK') return -1;
    if (a.type === 'HOMEWORK' && b.type === 'CLASSWORK') return 1;
    
    // Then by difficulty (based on preference)
    if (preferences.difficulty_preference === 'progressive') {
      const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
      return difficultyOrder[a.level] - difficultyOrder[b.level];
    }
    
    return 0;
  });
  
  return sortedQuestions[0] || null;
};
```

### **Step 2: Open External Platform**
```typescript
// Open question in external platform
const openQuestion = (question) => {
  // Track question access
  trackQuestionAccess(question.id);
  
  // Open in new tab
  window.open(question.question_link, '_blank');
  
  // Start timer for solving
  startSolvingTimer(question.id);
};

// Track question access for analytics
const trackQuestionAccess = async (questionId) => {
  await fetch('/api/students/questions/access', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question_id: questionId,
      access_time: new Date().toISOString()
    })
  });
};
```

### **Step 3: Solve and Track Progress**
```typescript
// Mark question as solved
const markQuestionSolved = async (questionId, solvingTime) => {
  try {
    // Update progress in DSA Tracker
    const response = await fetch(`/api/students/questions/${questionId}/progress`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isSolved: true,
        syncAt: new Date().toISOString(),
        solvingTime: solvingTime
      })
    });

    const result = await response.json();

    // Update local state
    updateQuestionProgress(questionId, true);

    // Show success notification
    showNotification('Question marked as solved!', 'success');

    // Update streak
    updateSolvingStreak();

    return result;
  } catch (error) {
    showNotification('Failed to update progress', 'error');
    throw error;
  }
};

// Solve question workflow
const solveQuestion = async (question) => {
  // 1. Start timer
  const startTime = Date.now();
  
  // 2. Open external platform
  openQuestion(question);
  
  // 3. Wait for user to solve (manual confirmation)
  const solved = await confirmSolved(question);
  
  if (solved) {
    // 4. Calculate solving time
    const solvingTime = Date.now() - startTime;
    
    // 5. Update progress
    await markQuestionSolved(question.id, solvingTime);
    
    // 6. Update dashboard
    await refreshDashboard();
    
    // 7. Suggest next question
    const nextQuestion = await getNextQuestion();
    if (nextQuestion) {
      suggestNextQuestion(nextQuestion);
    }
  }
};
```

---

## 📊 Progress Tracking Workflow

### **Step 1: Daily Progress Review**
```typescript
// Get daily progress summary
const getDailyProgress = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const response = await fetch(`/api/students/progress/daily?date=${today}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();

  return {
    questionsSolved: data.questionsSolved,
    timeSpent: data.timeSpent,
    streakDays: data.streakDays,
    topicsCompleted: data.topicsCompleted,
    rankChange: data.rankChange
  };
};
```

### **Step 2: View Comprehensive Progress**
```typescript
// Get detailed progress analytics
GET /api/students/progress/analytics

// Response Structure
{
  "overview": {
    "totalQuestions": 150,
    "solvedQuestions": 67,
    "progressPercentage": 44.7,
    "currentStreak": 5,
    "maxStreak": 15,
    "averageSolveTime": 45.5
  },
  "byDifficulty": {
    "EASY": { "solved": 25, "total": 50, "percentage": 50 },
    "MEDIUM": { "solved": 30, "total": 60, "percentage": 50 },
    "HARD": { "solved": 12, "total": 40, "percentage": 30 }
  },
  "byPlatform": {
    "LEETCODE": { "solved": 40, "total": 80, "percentage": 50 },
    "GFG": { "solved": 20, "total": 50, "percentage": 40 },
    "INTERVIEWBIT": { "solved": 7, "total": 20, "percentage": 35 }
  },
  "byTopic": [
    {
      "topic_name": "Arrays and Strings",
      "solved": 8,
      "total": 15,
      "percentage": 53.3
    }
  ],
  "timeline": [
    {
      "date": "2025-03-10",
      "questionsSolved": 3,
      "timeSpent": 120
    }
  ]
}
```

### **Step 3: Generate Personal Reports**
```typescript
// Generate personal progress report
const generateProgressReport = async (timeRange) => {
  const response = await fetch('/api/students/reports/generate', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      time_range: timeRange,
      include_details: true,
      format: 'json'
    })
  });

  const report = await response.json();

  return {
    summary: report.summary,
    achievements: report.achievements,
    recommendations: report.recommendations,
    nextSteps: report.nextSteps
  };
};
```

---

## 🏆 Competitive Engagement Workflow

### **Step 1: View Leaderboard**
```typescript
// Get leaderboard data
POST /api/students/leaderboard
{
  "limit": 10
}

// Response Structure
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
    }
  ],
  "batchStats": {
    "totalStudents": 45,
    "averageCount": 52,
    "topStreak": 25
  }
}
```

### **Step 2: Track Rank Changes**
```typescript
// Monitor rank changes over time
const trackRankProgress = async () => {
  const response = await fetch('/api/students/leaderboard/history', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const history = await response.json();

  return {
    currentRank: history.currentRank,
    previousRank: history.previousRank,
    rankChange: history.currentRank - history.previousRank,
    trend: history.trend, // 'up', 'down', 'stable'
    bestRank: history.bestRank,
    averageRank: history.averageRank
  };
};
```

### **Step 3: Participate in Challenges**
```typescript
// Join batch challenges
const joinChallenge = async (challengeId) => {
  const response = await fetch('/api/students/challenges/join', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      challenge_id: challengeId
    })
  });

  return await response.json();
};

// View challenge progress
const getChallengeProgress = async (challengeId) => {
  const response = await fetch(`/api/students/challenges/${challengeId}/progress`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
};
```

---

## 🔍 Question Discovery Workflow

### **Step 1: Browse All Questions**
```typescript
// Get questions with comprehensive filtering
GET /api/students/addedQuestions?search=array&level=EASY&platform=LEETCODE&page=1&limit=20

// Response Structure
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
    "limit": 20,
    "totalQuestions": 45,
    "totalPages": 3
  },
  "filters": {
    "topics": [...],
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

### **Step 2: Advanced Filtering**
```typescript
// Advanced filtering component
const QuestionFilters = () => {
  const [filters, setFilters] = useState({
    search: '',
    topic: '',
    level: '',
    platform: '',
    type: '',
    solved: '',
    page: 1,
    limit: 20
  });

  const applyFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      topic: '',
      level: '',
      platform: '',
      type: '',
      solved: '',
      page: 1,
      limit: 20
    });
  };

  return (
    <div className="question-filters">
      {/* Filter UI components */}
    </div>
  );
};
```

### **Step 3: Smart Recommendations**
```typescript
// Get personalized question recommendations
GET /api/students/recommendations

// Response Structure
{
  "recommendations": [
    {
      "question": {
        "id": 45,
        "question_name": "Next recommended question",
        "platform": "LEETCODE",
        "level": "MEDIUM"
      },
      "reason": "Based on your progress in Arrays",
      "confidence": 0.85
    }
  ],
  "weakAreas": [
    {
      "topic": "Dynamic Programming",
      "reason": "Low completion rate",
      "suggestedQuestions": [67, 68, 69]
    }
  ]
}
```

---

## 📱 Mobile Learning Workflow

### **Step 1: Mobile-First Interface**
```typescript
// Mobile-optimized question solving
const MobileQuestionView = ({ question }) => {
  return (
    <div className="mobile-question-view">
      <div className="question-header">
        <h3>{question.question_name}</h3>
        <div className="question-meta">
          <span className={`level ${question.level.toLowerCase()}`}>
            {question.level}
          </span>
          <span className="platform">{question.platform}</span>
        </div>
      </div>
      
      <div className="question-actions">
        <button 
          onClick={() => openQuestion(question)}
          className="solve-button"
        >
          Solve Now
        </button>
        <button 
          onClick={() => markAsSolved(question.id)}
          className="mark-solved-button"
        >
          Mark as Solved
        </button>
      </div>
    </div>
  );
};
```

### **Step 2: Offline Progress Tracking**
```typescript
// Offline progress tracking
const offlineProgressTracker = {
  // Store solved questions locally
  saveSolvedQuestion: (questionId) => {
    const solvedQuestions = JSON.parse(localStorage.getItem('solvedQuestions') || '[]');
    solvedQuestions.push({
      questionId,
      solvedAt: new Date().toISOString(),
      synced: false
    });
    localStorage.setItem('solvedQuestions', JSON.stringify(solvedQuestions));
  },

  // Sync when back online
  syncProgress: async () => {
    const solvedQuestions = JSON.parse(localStorage.getItem('solvedQuestions') || '[]');
    const unsynced = solvedQuestions.filter(q => !q.synced);

    for (const question of unsynced) {
      try {
        await fetch(`/api/students/questions/${question.questionId}/progress`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ isSolved: true, syncAt: question.solvedAt })
        });
        
        // Mark as synced
        question.synced = true;
      } catch (error) {
        console.error('Failed to sync question:', error);
      }
    }

    // Update local storage
    localStorage.setItem('solvedQuestions', JSON.stringify(solvedQuestions));
  }
};
```

---

## 🎯 Personalized Learning Workflow

### **Step 1: Learning Path Generation**
```typescript
// Generate personalized learning path
const generateLearningPath = async () => {
  const response = await fetch('/api/students/learning-path/generate', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const path = await response.json();

  return {
    currentLevel: path.currentLevel,
    recommendedTopics: path.recommendedTopics,
    difficultyProgression: path.difficultyProgression,
    estimatedTimeline: path.estimatedTimeline,
    milestones: path.milestones
  };
};
```

### **Step 2: Adaptive Learning**
```typescript
// Adaptive learning based on performance
const adaptiveLearning = {
  // Adjust difficulty based on performance
  adjustDifficulty: (performance) => {
    if (performance.successRate > 0.8) {
      return 'increase';
    } else if (performance.successRate < 0.4) {
      return 'decrease';
    }
    return 'maintain';
  },

  // Suggest practice areas
  suggestPracticeAreas: (progressData) => {
    const weakAreas = progressData.topics
      .filter(topic => topic.percentage < 50)
      .map(topic => topic.topic_name);

    return weakAreas;
  }
};
```

---

## 🔄 Daily Learning Routine

### **Morning Routine (15 minutes)**
```typescript
const morningRoutine = async () => {
  // 1. Check yesterday's progress
  const yesterdayProgress = await getYesterdayProgress();
  
  // 2. Review today's targets
  const todayTargets = await getTodayTargets();
  
  // 3. Check leaderboard position
  const leaderboard = await getLeaderboard();
  
  // 4. Plan learning session
  const plan = await generateDailyPlan();
  
  return {
    yesterday: yesterdayProgress,
    today: todayTargets,
    rank: leaderboard.personalRank.rank,
    plan: plan
  };
};
```

### **Practice Session (60-90 minutes)**
```typescript
const practiceSession = async () => {
  // 1. Select topic to focus on
  const topic = await selectTopicForToday();
  
  // 2. Get questions for topic
  const questions = await getTopicQuestions(topic.id);
  
  // 3. Solve questions sequentially
  for (const question of questions) {
    if (question.isSolved) continue;
    
    await solveQuestionWithTracking(question);
    
    // Take breaks between questions
    if (questions.indexOf(question) % 3 === 2) {
      await takeBreak(5); // 5 minutes break
    }
  }
  
  // 4. Review session performance
  const sessionReview = await reviewSessionPerformance();
  
  return sessionReview;
};
```

### **Evening Review (10 minutes)**
```typescript
const eveningReview = async () => {
  // 1. Update progress for solved questions
  await syncProgress();
  
  // 2. Check leaderboard changes
  const leaderboardUpdate = await getLeaderboardUpdate();
  
  // 3. Review achievements
  const achievements = await checkAchievements();
  
  // 4. Plan tomorrow's session
  const tomorrowPlan = await planTomorrowSession();
  
  return {
    leaderboard: leaderboardUpdate,
    achievements: achievements,
    tomorrowPlan: tomorrowPlan
  };
};
```

---

## 🎯 Gamification Elements

### **Achievement System**
```typescript
// Achievement tracking
const achievements = {
  // Streak achievements
  "week_warrior": { description: "7-day solving streak", icon: "🔥" },
  "month_master": { description: "30-day solving streak", icon: "💎" },
  
  // Progress achievements
  "centurion": { description: "100 questions solved", icon: "💯" },
  "speed_demon": { description: "Solve 10 questions in one day", icon: "⚡" },
  
  // Difficulty achievements
  "easy_crusher": { description: "Solve 50 easy questions", icon: "🥉" },
  "medium_master": { description: "Solve 30 medium questions", icon: "🥈" },
  "hard_hero": { description: "Solve 15 hard questions", icon: "🥇" },
  
  // Platform achievements
  "leetcode_legend": { description: "50 LeetCode questions", icon: "🚀" },
  "gfg_guru": { description: "30 GFG questions", icon: "🎯" }
};

// Check and award achievements
const checkAchievements = async () => {
  const progress = await getStudentProgress();
  const newAchievements = [];

  for (const [key, achievement] of Object.entries(achievements)) {
    if (meetsCriteria(progress, key) && !hasAchievement(key)) {
      newAchievements.push({ key, ...achievement });
      await awardAchievement(key);
    }
  }

  return newAchievements;
};
```

### **Challenge System**
```typescript
// Participate in challenges
const challenges = {
  // Daily challenges
  "daily_sprint": {
    description: "Solve 5 questions today",
    duration: "1 day",
    reward: "50 points"
  },
  
  // Weekly challenges
  "weekly_marathon": {
    description: "Solve 20 questions this week",
    duration: "7 days",
    reward: "200 points"
  },
  
  // Monthly challenges
  "monthly_master": {
    description: "Maintain 7-day streak for a month",
    duration: "30 days",
    reward: "1000 points"
  }
};
```

---

## 📊 Performance Analytics

### **Personal Analytics Dashboard**
```typescript
const PersonalAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchPersonalAnalytics();
  }, []);

  const fetchPersonalAnalytics = async () => {
    const response = await fetch('/api/students/analytics/personal', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setAnalytics(data);
  };

  return (
    <div className="personal-analytics">
      <ProgressChart data={analytics?.progress} />
      <DifficultyBreakdown data={analytics?.byDifficulty} />
      <PlatformUsage data={analytics?.byPlatform} />
      <TimeAnalysis data={analytics?.timeSpent} />
      <StreakAnalysis data={analytics?.streaks} />
    </div>
  );
};
```

### **Performance Insights**
```typescript
// Generate performance insights
const generateInsights = async () => {
  const response = await fetch('/api/students/insights/generate', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const insights = await response.json();

  return {
    strengths: insights.strengths,
    weaknesses: insights.weaknesses,
    recommendations: insights.recommendations,
    trends: insights.trends,
    predictions: insights.predictions
  };
};
```

---

## 🚀 Advanced Features

### **AI-Powered Recommendations**
```typescript
// Future enhancement: AI recommendations
const aiRecommendations = {
  "next_question": "Suggest optimal next question",
  "study_schedule": "Generate personalized study schedule",
  "weakness_identification": "Identify specific weakness areas",
  "performance_prediction": "Predict future performance"
};
```

### **Social Learning**
```typescript
// Social learning features
const socialFeatures = {
  "study_groups": "Join or create study groups",
  "peer_discussion": "Discuss problems with peers",
  "collaborative_solving": "Solve problems together",
  "knowledge_sharing": "Share tips and solutions"
};
```

This comprehensive student workflow documentation provides a complete guide for students to effectively use the DSA Tracker system, from onboarding to advanced learning strategies and competitive engagement.
