# REDIS CACHING + INVALIDATION PLAN: GET /students/addedQuestions

---

## SECTION 1: API Analysis

**API Endpoint**: GET /students/addedQuestions  
**Controller**: `getAllQuestionsWithFilters` in `questionVisibility.controller.ts`  
**Service**: `getAllQuestionsWithFiltersService` in `visibility-student.service.ts`  
**Route**: `/students/addedQuestions` with `heavyLimiter` and `addedQuestionsQuerySchema` validation  

**Data Flow**:
1. Student authentication via middleware (`verifyToken`, `isStudent`, `extractStudentInfo`)
2. Query parameter validation (pagination, filters)
3. Service call with `studentId` and `batchId`
4. Complex SQL query with multiple JOINs
5. Response formatting with pagination, filters, and stats

**Query Complexity**: HIGH - Uses raw SQL with 5 table JOINs and dynamic filtering

---

## SECTION 2: Data Dependencies

### Primary Tables Used:
1. **QuestionVisibility** (main table - filters questions assigned to batch)
2. **Class** (batch_id filtering)
3. **Question** (question details, level, platform, created_at)
4. **Topic** (topic details, slug filtering)
5. **StudentProgress** (LEFT JOIN for solved status)
6. **Bookmark** (LEFT JOIN for bookmark status)

### Exact Query Structure:
```sql
FROM "QuestionVisibility" qv
JOIN "Class" c ON qv.class_id = c.id
JOIN "Question" q ON qv.question_id = q.id  
JOIN "Topic" t ON q.topic_id = t.id
LEFT JOIN "StudentProgress" sp ON q.id = sp.question_id AND sp.student_id = $studentId
LEFT JOIN "Bookmark" b ON q.id = b.question_id AND b.student_id = $studentId
WHERE c.batch_id = $batchId
```

### Filter Parameters:
- **search**: question_name OR topic_name (ILIKE)
- **level**: Question.level enum (EASY/MEDIUM/HARD)
- **platform**: Question.platform enum (LEETCODE/GFG/OTHER/INTERVIEWBIT)  
- **type**: QuestionVisibility.type (HOMEWORK/CLASSWORK)
- **topicSlug**: Topic.slug exact match
- **solved**: StudentProgress existence (true/false)
- **page/limit**: Pagination
- **sortBy/sortOrder**: Ordering (question_name, level, created_at)

### User-Specific Data:
- **studentId**: affects StudentProgress and Bookmark LEFT JOINs
- **batchId**: from student's batch, affects base WHERE clause
- **solved filter**: depends on StudentProgress for specific student

---

## SECTION 3: Caching Plan

### Should caching be applied? **YES**

**Reasons**:
1. **High Query Complexity**: 5 table JOINs with dynamic filtering
2. **Heavy Rate Limiting**: `heavyLimiter` indicates expensive operation
3. **Read-Heavy Pattern**: Questions are frequently read, rarely modified
4. **Filter Combinations**: Multiple filter combinations create repeated expensive queries
5. **User-Specific Results**: Same filters for different students need separate caching

### Cache Key Structure:
```
addedQuestions:{studentId}:{batchId}:{hash_of_filters}
```

**Filter Hash Components**:
- search (string)
- level (enum)
- platform (enum)  
- type (enum)
- topicSlug (string)
- solved (boolean)
- page (number)
- limit (number)
- sortBy (enum)
- sortOrder (enum)

**Example Keys**:
- `addedQuestions:123:45:a1b2c3d4` (student 123, batch 45, specific filters)
- `addedQuestions:123:45:e5f6g7h8` (same student/batch, different filters)

### TTL Strategy: **15 minutes**

**Reasoning**:
- Questions are assigned by admins - changes are infrequent
- StudentProgress changes when students solve problems - moderate frequency
- 15 minutes balances freshness with performance
- Short enough to prevent stale data, long enough for meaningful caching

---

## SECTION 4: Cache Key Design

### Key Components:
1. **Prefix**: `addedQuestions` (identifies cached data type)
2. **Student ID**: `{studentId}` (user-specific data isolation)
3. **Batch ID**: `{batchId}` (batch-specific questions)
4. **Filter Hash**: `{hash}` (unique combination of all filters)

### Hash Generation:
```javascript
const filterString = JSON.stringify({
  search, level, platform, type, topicSlug, 
  solved, page, limit, sortBy, sortOrder
});
const hash = crypto.createHash('md5').update(filterString).digest('hex');
```

### Key Examples:
- Default view: `addedQuestions:123:45:default_hash`
- Search filtered: `addedQuestions:123:45:search_arrays_hash`
- Solved only: `addedQuestions:123:45:solved_true_hash`
- Paginated: `addedQuestions:123:45:page_2_hash`

### Cache Value Structure:
```json
{
  "questions": [...],
  "pagination": {...},
  "filters": {...},
  "stats": {...},
  "cachedAt": "2026-04-09T20:39:00.000Z"
}
```

---

## SECTION 5: Invalidation Triggers (API-wise)

### Question-Related APIs:

**1. POST /admin/questions**
- **Model**: Question (CREATE)
- **Impact**: New questions added to Question table ONLY - NOT visible until assigned via QuestionVisibility
- **Invalidation**: NONE for addedQuestions (questions not visible until assigned to classes)

**2. PATCH /admin/questions/:id**  
- **Model**: Question (UPDATE)
- **Impact**: Question details change but only affect visible questions (those with QuestionVisibility entries)
- **Invalidation**: Batch-specific keys for batches where question is assigned (`addedQuestions:*:{batchId}:*`)

**3. DELETE /admin/questions/:id**
- **Model**: Question (DELETE) 
- **Impact**: Removes question from Question table, cascades to QuestionVisibility and StudentProgress
- **Invalidation**: ALL addedQuestions cache keys (question completely removed)

**4. POST /admin/questions/bulk-upload**
- **Model**: Question (BULK CREATE)
- **Impact**: Multiple new questions added to Question table ONLY - not visible until assigned
- **Invalidation**: NONE for addedQuestions (questions not visible until assigned to classes)

### QuestionVisibility-Related APIs:

**5. POST /admin/:batchSlug/topics/:topicSlug/classes/:classSlug/questions**
- **Model**: QuestionVisibility (CREATE)
- **Impact**: Directly assigns questions to class/batch
- **Invalidation**: Batch-specific keys (`addedQuestions:*:{batchId}:*`)

**6. DELETE /admin/:batchSlug/topics/:topicSlug/classes/:classSlug/questions/:questionId**
- **Model**: QuestionVisibility (DELETE)
- **Impact**: Removes question assignment from class
- **Invalidation**: Batch-specific keys

**7. PATCH /admin/:batchSlug/topics/:topicSlug/classes/:classSlug/visibility/:visibilityId**
- **Model**: QuestionVisibility (UPDATE type)
- **Impact**: Changes HOMEWORK/CLASSWORK classification
- **Invalidation**: Batch-specific keys

### StudentProgress-Related APIs:

**8. CRON JOB - Student Sync (9:00 AM, 6:00 PM, 11:00 PM daily)**
- **Model**: StudentProgress (BULK SYNC via cron)
- **Impact**: Mass update of ALL students' solved questions from external platforms
- **Invalidation**: Student-specific keys (`addedQuestions:{studentId}:*`) for all synced students
- **Implementation**: `runStudentSyncWorker()` processes all students in batches of 5

**9. POST /admin/students/sync/:id**
- **Model**: StudentProgress (MANUAL SYNC)
- **Impact**: Manual sync of specific student's solved questions
- **Invalidation**: Student-specific keys (`addedQuestions:{studentId}:*`) for that student only

### Bookmark-Related APIs:

**10. POST /students/bookmarks**
- **Model**: Bookmark (CREATE)
- **Impact**: Changes bookmark status in response
- **Invalidation**: Student-specific keys

**11. PUT /students/bookmarks/:questionId**
- **Model**: Bookmark (UPDATE)
- **Impact**: Updates bookmark description
- **Invalidation**: Student-specific keys

**12. DELETE /students/bookmarks/:questionId**
- **Model**: Bookmark (DELETE)
- **Impact**: Removes bookmark status
- **Invalidation**: Student-specific keys

### Class-Related APIs:

**13. POST /admin/:batchSlug/topics/:topicSlug/classes**
- **Model**: Class (CREATE)
- **Impact**: New class can have questions assigned via QuestionVisibility
- **Invalidation**: Batch-specific keys

**14. DELETE /admin/:batchSlug/topics/:topicSlug/classes/:classSlug**
- **Model**: Class (DELETE)
- **Impact**: Removes all QuestionVisibility entries for class
- **Invalidation**: Batch-specific keys

---

## SECTION 6: Invalidation Strategy

### Pattern-Based Invalidation:

**Global Invalidation** (Question CRUD):
```
DELETE addedQuestions:*
```
**When**: Question CREATE/UPDATE/DELETE operations

**Batch-Specific Invalidation** (QuestionVisibility/Class operations):
```
DELETE addedQuestions:*:{batchId}:*
```
**When**: QuestionVisibility CRUD, Class CRUD operations

**Student-Specific Invalidation** (StudentProgress/Bookmark operations):
```
DELETE addedQuestions:{studentId}:*
```
**When**: StudentProgress SYNC, Bookmark CRUD operations

### Invalidation Priority:
1. **Question changes** - Global (affects all students/batches)
2. **QuestionVisibility changes** - Batch-specific (affects all students in batch)
3. **StudentProgress changes** - Student-specific (affects only that student)
4. **Bookmark changes** - Student-specific (minor UI change)

### Cache Population Strategy:
- **Cache-Aside Pattern**: Check cache first, DB query on miss
- **Write-Through**: Not needed - read-heavy pattern
- **Warm-up**: Not required - cache fills naturally on first requests

---

## SECTION 7: Relationship Explanation

### How Question Affects addedQuestions:

**Direct Impact**:
- Question table provides core data: name, level, platform, created_at
- Question.topic_id links to Topic for topic-based filtering
- Question.id is foreign key in QuestionVisibility and StudentProgress

**IMPORTANT**: Questions are ONLY visible in addedQuestions if they have QuestionVisibility entries
- Question CREATE operations do NOT affect addedQuestions until assigned to classes
- Question UPDATE operations affect addedQuestions ONLY for questions already assigned via QuestionVisibility

**Filtering Impact**:
- `level` filter: Question.level enum (only for assigned questions)
- `platform` filter: Question.platform enum (only for assigned questions)
- `search` filter: Question.question_name text search (only for assigned questions)
- `topicSlug` filter: Question -> Topic.slug relationship (only for assigned questions)
- `sortBy`: Question.question_name, level, created_at fields (only for assigned questions)

**Invalidation Reason**:
- Question CREATE: NO invalidation (questions not visible until assigned)
- Question UPDATE: Batch-specific invalidation (only affects batches where question is assigned)
- Question DELETE: Global invalidation (question completely removed from system)

### How QuestionVisibility Affects addedQuestions:

**Direct Impact**:
- QuestionVisibility is the MAIN table - determines which questions are visible to which batch
- QuestionVisibility.class_id -> Class.batch_id filtering
- QuestionVisibility.question_id -> Question details
- QuestionVisibility.type for HOMEWORK/CLASSWORK filtering

**Access Control**:
- Only questions with QuestionVisibility entries for student's batch are shown
- This is the base WHERE clause: `c.batch_id = $batchId`

**Invalidation Reason**:
QuestionVisibility changes directly control question availability for batches, affecting all students in affected batches.

### How StudentProgress Affects addedQuestions:

**Direct Impact**:
- StudentProgress LEFT JOIN determines `isSolved` status
- StudentProgress.student_id + StudentProgress.question_id unique constraint
- `solved` filter depends on StudentProgress existence

**IMPORTANT**: StudentProgress is NOT manually updated - it's synced via CRON JOBS
- **Cron Schedule**: 9:00 AM, 6:00 PM, 11:00 PM daily
- **Sync Process**: `runStudentSyncWorker()` processes ALL students in batches of 5
- **Manual Override**: POST /admin/students/sync/:id for individual student sync

**User-Specific Data**:
- Same question appears differently for different students based on their progress
- StudentProgress.sync_at provides solve timestamp from external platforms (LeetCode, GFG)

**Invalidation Reason**:
- **Cron Job**: Student-specific invalidation for ALL synced students during cron runs
- **Manual Sync**: Student-specific invalidation for individual student only
- StudentProgress changes only affect the specific student's view, not other students

### Cascading Impact Analysis:

**Question Changes**:
```
Question (CREATE)
  -> NO immediate effect on addedQuestions (not visible until assigned)
  -> Future QuestionVisibility assignment will make it visible

Question (UPDATE)
  -> Affects addedQuestions ONLY for batches where question is assigned via QuestionVisibility
  -> Batch-specific invalidation required

Question (DELETE)
  -> Cascades to QuestionVisibility and StudentProgress
  -> Global invalidation required (question completely removed)
```

**QuestionVisibility Changes**:
```
QuestionVisibility (CREATE/UPDATE/DELETE)
  -> Controls question availability for batches
  -> Affects ALL students in affected batches
  -> Batch-specific invalidation required
```

**StudentProgress Changes**:
```
StudentProgress (CRON JOB - BULK SYNC)
  -> Updates solved status for ALL students (9 AM, 6 PM, 11 PM daily)
  -> Affects individual student views only
  -> Student-specific invalidation for all synced students

StudentProgress (MANUAL SYNC - /admin/students/sync/:id)
  -> Updates solved status for specific student
  -> Affects only that student's addedQuestions view
  -> Student-specific invalidation for that student only
```

**Bookmark Changes**:
```
Bookmark (CREATE/UPDATE/DELETE)
  -> Changes bookmark flag in response
  -> Affects only that student's view
  -> Student-specific invalidation (optional - minor UI impact)
```

---

## IMPLEMENTATION SUMMARY

**Cache Strategy**: Cache-Aside with 15-minute TTL  
**Key Pattern**: `addedQuestions:{studentId}:{batchId}:{filterHash}`  
**Invalidation**: Multi-level pattern-based (Global > Batch > Student)  
**Performance Impact**: HIGH - eliminates complex 5-table JOINs on repeated requests  
**Data Freshness**: Balanced - 15-minute TTL with immediate invalidation on changes  

**Critical Success Factors**:
1. Proper hash generation for all filter combinations
2. Correct invalidation pattern matching
3. Cache key consistency across invalidation operations
4. Proper error handling for cache failures (fallback to DB)
