# Admin Dashboard API Documentation

## Overview

The **Admin Dashboard API** provides aggregated analytics about the DSA Tracker platform.
It summarizes platform activity including student participation, assigned questions, and solved question statistics.

The dashboard is designed to give administrators a **high-level overview of learning activity across batches**.

---

# Dashboard Filtering Update

Previously the dashboard supported the following filters:

* `city`
* `batch`
* `year`

This approach was replaced with a **simpler and more consistent filter using `batchSlug`**.

Since each batch slug uniquely identifies:

* the **batch**
* the **city**
* the **year**

a single filter is sufficient to derive all required context.

---

# Endpoint

```
GET /admin/dashboard
```

---

# Query Parameters

| Parameter | Type   | Description                                      |
| --------- | ------ | ------------------------------------------------ |
| batchSlug | string | Filters dashboard analytics for a specific batch |

---

# Example Requests

### Get overall dashboard analytics

```
GET /admin/dashboard
```

Returns analytics for the entire platform.

---

### Get dashboard analytics for a specific batch

```
GET /admin/dashboard?batchSlug=bangalore-sot-2024
```

This returns analytics only for the specified batch.

---

# Data Sources

The dashboard aggregates data from the following models:

* `City`
* `Batch`
* `Student`
* `Question`
* `QuestionVisibility`
* `StudentProgress`

---

# Dashboard Metrics

The response contains the following sections.

---

# 1. Platform Overview

Provides high-level statistics about the platform.

| Field                  | Description                           |
| ---------------------- | ------------------------------------- |
| totalCities            | Total cities registered in the system |
| totalStudents          | Total students in the filtered scope  |
| totalAssignedQuestions | Total questions assigned to classes   |

Important rule:

Only questions assigned through **QuestionVisibility** are counted.

Questions that exist in the **global question bank but are not assigned to any class are excluded**.

---

# 2. Assigned Question Analytics

This section analyzes questions assigned to classes.

### Platform Distribution

Shows how many assigned questions belong to each coding platform.

Supported platforms:

* LeetCode
* GeeksForGeeks

Example:

```
platforms:
{
  leetcode: 120,
  gfg: 40
}
```

---

### Difficulty Distribution

Questions are categorized by difficulty level.

* Easy
* Medium
* Hard

Example:

```
difficulty:
{
  easy: 50,
  medium: 70,
  hard: 40
}
```

---

### Question Type Distribution

Questions are also categorized by assignment type.

* Homework
* Classwork

Example:

```
type:
{
  homework: 80,
  classwork: 40
}
```

---

# 3. Solved Question Analytics

Tracks solved questions using the **StudentProgress** table.

The analytics show how many questions students have solved on each platform and difficulty level.

Example:

```
solvedQuestions:
{
  leetcode: {
    easy: 40,
    medium: 30,
    hard: 10
  },
  gfg: {
    easy: 15,
    medium: 10,
    hard: 5
  }
}
```

---

# Implementation Details

The dashboard is optimized for performance using:

### Parallel Queries

Multiple database queries are executed simultaneously using:

```
Promise.all()
```

This reduces response time and improves API performance.

---

### Batch Filtering

When `batchSlug` is provided:

1. The batch is fetched using the slug.
2. The batch ID is extracted.
3. All analytics queries are filtered using the batch ID.

Example logic:

```
BatchSlug → Batch → BatchId → Filter queries
```

---

# Benefits of Using batchSlug Filtering

Using a single `batchSlug` filter provides several advantages:

* Simplifies API usage
* Reduces query complexity
* Prevents inconsistent filter combinations
* Ensures batch context is always correct

Since batch slug uniquely represents **city + batch + year**, additional filters are unnecessary.

---

# Example Response

```
{
  "overview": {
    "totalCities": 4,
    "totalStudents": 120,
    "totalAssignedQuestions": 180
  },

  "assignedQuestions": {
    "platforms": {
      "leetcode": 120,
      "gfg": 60
    },
    "difficulty": {
      "easy": 60,
      "medium": 80,
      "hard": 40
    },
    "type": {
      "homework": 100,
      "classwork": 80
    }
  },

  "solvedQuestions": {
    "leetcode": {
      "easy": 30,
      "medium": 20,
      "hard": 10
    },
    "gfg": {
      "easy": 10,
      "medium": 5,
      "hard": 2
    }
  }
}
```

---

# Future Improvements

The dashboard can be further extended with:

* Leaderboards
* Batch performance analytics
* Coding activity heatmaps
* AI-based practice recommendations
* Student ranking system

These features will provide deeper insights into student performance and engagement.
