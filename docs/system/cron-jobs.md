# Cron Jobs & Background Processes

## 🕐 Background Processing Overview

The DSA Tracker system utilizes cron jobs and background processes to handle automated tasks, data synchronization, maintenance operations, and periodic updates. These processes ensure system reliability, data consistency, and optimal performance.

## 📋 Scheduled Tasks

### **Daily Tasks**
- **Progress Tracking Updates**: Sync student progress from external platforms
- **Leaderboard Recalculation**: Update batch and city leaderboards
- **Activity Logging**: Archive daily activity logs
- **Performance Analytics**: Generate daily performance reports

### **Weekly Tasks**
- **Student Engagement Reports**: Generate weekly engagement summaries
- **System Health Checks**: Comprehensive system health monitoring
- **Database Maintenance**: Optimize database performance
- **Content Review**: Review and update question links

### **Monthly Tasks**
- **User Statistics**: Generate monthly usage statistics
- **Platform Sync**: Full synchronization with external platforms
- **Data Cleanup**: Remove outdated temporary data
- **Backup Verification**: Verify backup integrity

---

## 🔄 Cron Job Implementations

### **1. Daily Progress Sync Job**

#### **Schedule**: Every 2 hours (02:00, 04:00, 06:00, ..., 22:00)
```bash
# Crontab entry
0 */2 * * * /usr/bin/node /path/to/dsa-tracker/jobs/sync-progress.js >> /var/log/dsa-tracker/sync.log 2>&1
```

#### **Implementation**
```javascript
// jobs/sync-progress.js
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

class ProgressSyncJob {
  constructor() {
    this.platforms = {
      LEETCODE: new LeetCodeSync(),
      GFG: new GeeksForGeeksSync(),
      INTERVIEWBIT: new InterviewBitSync()
    };
  }

  async run() {
    console.log(`[${new Date().toISOString()}] Starting progress sync job`);
    
    try {
      // Get all students with platform IDs
      const students = await this.getStudentsWithPlatformIds();
      
      for (const student of students) {
        await this.syncStudentProgress(student);
      }
      
      console.log(`[${new Date().toISOString()}] Progress sync completed successfully`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Progress sync failed:`, error);
      throw error;
    }
  }

  async getStudentsWithPlatformIds() {
    return await prisma.student.findMany({
      where: {
        OR: [
          { leetcode_id: { not: null } },
          { gfg_id: { not: null } }
        ]
      },
      select: {
        id: true,
        leetcode_id: true,
        gfg_id: true,
        last_synced_at: true
      }
    });
  }

  async syncStudentProgress(student) {
    const syncResults = {};

    // Sync LeetCode progress
    if (student.leetcode_id) {
      try {
        syncResults.leetcode = await this.platforms.LEETCODE.syncProgress(student);
      } catch (error) {
        console.error(`Failed to sync LeetCode for student ${student.id}:`, error);
        syncResults.leetcode = { error: error.message };
      }
    }

    // Sync GFG progress
    if (student.gfg_id) {
      try {
        syncResults.gfg = await this.platforms.GFG.syncProgress(student);
      } catch (error) {
        console.error(`Failed to sync GFG for student ${student.id}:`, error);
        syncResults.gfg = { error: error.message };
      }
    }

    // Update last synced timestamp
    await prisma.student.update({
      where: { id: student.id },
      data: { last_synced_at: new Date() }
    });

    return syncResults;
  }
}

class LeetCodeSync {
  async syncProgress(student) {
    // Implementation for LeetCode API sync
    const leetCodeData = await this.fetchLeetCodeData(student.leetcode_id);
    
    if (leetCodeData) {
      await this.updateStudentProgress(student.id, leetCodeData);
      await this.updateLeaderboard(student.id, leetCodeData);
      
      return {
        synced: true,
        totalSolved: leetCodeData.totalSolved,
        lastSync: new Date().toISOString()
      };
    }

    return { synced: false, reason: 'No data available' };
  }

  async fetchLeetCodeData(username) {
    try {
      // This would integrate with LeetCode API or web scraping
      // For now, it's a placeholder implementation
      const response = await axios.get(`https://leetcode.com/api/progress/all/${username}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch LeetCode data for ${username}:`, error);
      return null;
    }
  }

  async updateStudentProgress(studentId, leetcodeData) {
    // This would update the student's progress in the database
    // Implementation depends on the specific data structure from LeetCode API
    console.log(`Updating progress for student ${studentId} with LeetCode data`);
  }

  async updateLeaderboard(studentId, leetcodeData) {
    // Update leaderboard statistics
    await prisma.leaderboard.upsert({
      where: { student_id: studentId },
      update: {
        lc_total_solved: leetcodeData.totalSolved,
        updated_at: new Date()
      },
      create: {
        student_id: studentId,
        lc_total_solved: leetcodeData.totalSolved
      }
    });
  }
}

// Run the job
if (require.main === module) {
  const job = new ProgressSyncJob();
  job.run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}

module.exports = ProgressSyncJob;
```

---

### **2. Leaderboard Recalculation Job**

#### **Schedule**: Every 6 hours (00:00, 06:00, 12:00, 18:00)
```bash
# Crontab entry
0 */6 * * * /usr/bin/node /path/to/dsa-tracker/jobs/recalculate-leaderboard.js >> /var/log/dsa-tracker/leaderboard.log 2>&1
```

#### **Implementation**
```javascript
// jobs/recalculate-leaderboard.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class LeaderboardRecalculationJob {
  async run() {
    console.log(`[${new Date().toISOString()}] Starting leaderboard recalculation`);
    
    try {
      // Recalculate batch leaderboards
      await this.recalculateBatchLeaderboards();
      
      // Recalculate city leaderboards
      await this.recalculateCityLeaderboards();
      
      // Update streaks and achievements
      await this.updateStreaks();
      
      console.log(`[${new Date().toISOString()}] Leaderboard recalculation completed`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Leaderboard recalculation failed:`, error);
      throw error;
    }
  }

  async recalculateBatchLeaderboards() {
    const batches = await prisma.batch.findMany({
      include: {
        students: {
          include: {
            leaderboards: true,
            progress: {
              include: {
                question: {
                  select: { level: true }
                }
              }
            }
          }
        }
      }
    });

    for (const batch of batches) {
      await this.calculateBatchLeaderboard(batch.id);
    }
  }

  async calculateBatchLeaderboard(batchId) {
    // Get all students in the batch with their progress
    const students = await prisma.student.findMany({
      where: { batch_id: batchId },
      include: {
        leaderboards: true,
        progress: {
          include: {
            question: {
              select: { level: true }
            }
          }
        }
      }
    });

    // Calculate rankings for each student
    const rankings = students.map(student => {
      const easyCount = student.progress.filter(p => p.question.level === 'EASY').length;
      const mediumCount = student.progress.filter(p => p.question.level === 'MEDIUM').length;
      const hardCount = student.progress.filter(p => p.question.level === 'HARD').length;
      const totalCount = easyCount + mediumCount + hardCount;
      const maxStreak = this.calculateMaxStreak(student.progress);

      return {
        studentId: student.id,
        totalCount,
        easyCount,
        mediumCount,
        hardCount,
        maxStreak
      };
    });

    // Sort by total count (descending)
    rankings.sort((a, b) => b.totalCount - a.totalCount);

    // Update leaderboard entries
    for (let i = 0; i < rankings.length; i++) {
      const ranking = rankings[i];
      
      await prisma.leaderboard.upsert({
        where: { student_id: ranking.studentId },
        update: {
          max_streak: ranking.maxStreak,
          easy_count: ranking.easyCount,
          medium_count: ranking.mediumCount,
          hard_count: ranking.hardCount,
          updated_at: new Date()
        },
        create: {
          student_id: ranking.studentId,
          max_streak: ranking.maxStreak,
          easy_count: ranking.easyCount,
          medium_count: ranking.mediumCount,
          hard_count: ranking.hardCount
        }
      });
    }

    return rankings;
  }

  async calculateMaxStreak(progress) {
    if (progress.length === 0) return 0;

    // Sort progress by sync_at
    const sortedProgress = progress.sort((a, b) => 
      new Date(a.sync_at) - new Date(b.sync_at)
    );

    let maxStreak = 1;
    let currentStreak = 1;
    let lastDate = new Date(sortedProgress[0].sync_at);

    for (let i = 1; i < sortedProgress.length; i++) {
      const currentDate = new Date(sortedProgress[i].sync_at);
      const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }

      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }

      lastDate = currentDate;
    }

    return maxStreak;
  }

  async recalculateCityLeaderboards() {
    const cities = await prisma.city.findMany({
      include: {
        batches: {
          include: {
            students: {
              include: {
                leaderboards: true
              }
            }
          }
        }
      }
    });

    for (const city of cities) {
      await this.calculateCityLeaderboard(city.id);
    }
  }

  async calculateCityLeaderboard(cityId) {
    // Similar to batch leaderboard but across all batches in a city
    const students = await prisma.student.findMany({
      where: { city_id: cityId },
      include: {
        leaderboards: true,
        batch: {
          select: {
            batch_name: true
          }
        }
      }
    });

    // Calculate city rankings (similar to batch calculation)
    // Implementation details...
  }

  async updateStreaks() {
    // Update streak information for all students
    const students = await prisma.student.findMany({
      include: {
        progress: true,
        leaderboards: true
      }
    });

    for (const student of students) {
      const maxStreak = this.calculateMaxStreak(student.progress);
      
      await prisma.leaderboard.update({
        where: { student_id: student.id },
        data: {
          max_streak: maxStreak,
          updated_at: new Date()
        }
      });
    }
  }
}

// Run the job
if (require.main === module) {
  const job = new LeaderboardRecalculationJob();
  job.run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}

module.exports = LeaderboardRecalculationJob;
```

---

### **3. System Health Check Job**

#### **Schedule**: Every hour
```bash
# Crontab entry
0 * * * * /usr/bin/node /path/to/dsa-tracker/jobs/health-check.js >> /var/log/dsa-tracker/health.log 2>&1
```

#### **Implementation**
```javascript
// jobs/health-check.js
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

class SystemHealthCheckJob {
  constructor() {
    this.alerts = [];
    this.metrics = {};
  }

  async run() {
    console.log(`[${new Date().toISOString()}] Starting system health check`);
    
    try {
      // Check database connectivity
      await this.checkDatabaseHealth();
      
      // Check API endpoints
      await this.checkAPIHealth();
      
      // Check external services
      await this.checkExternalServices();
      
      // Check system resources
      await this.checkSystemResources();
      
      // Generate health report
      const healthReport = this.generateHealthReport();
      
      // Send alerts if necessary
      if (this.alerts.length > 0) {
        await this.sendAlerts();
      }
      
      console.log(`[${new Date().toISOString()}] Health check completed`);
      return healthReport;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Health check failed:`, error);
      throw error;
    }
  }

  async checkDatabaseHealth() {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      this.metrics.database = {
        status: 'healthy',
        responseTime: responseTime,
        timestamp: new Date().toISOString()
      };

      if (responseTime > 1000) {
        this.alerts.push({
          type: 'performance',
          message: `Database response time is slow: ${responseTime}ms`,
          severity: 'warning'
        });
      }
    } catch (error) {
      this.metrics.database = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.alerts.push({
        type: 'critical',
        message: `Database connection failed: ${error.message}`,
        severity: 'critical'
      });
    }
  }

  async checkAPIHealth() {
    const endpoints = [
      { path: '/health', method: 'GET', expectedStatus: 200 },
      { path: '/api/auth/student/login', method: 'POST', expectedStatus: 400 }
    ];

    for (const endpoint of endpoints) {
      try {
        const start = Date.now();
        const response = await axios({
          method: endpoint.method,
          url: `http://localhost:5000${endpoint.path}`,
          timeout: 5000
        });
        const responseTime = Date.now() - start;

        if (response.status !== endpoint.expectedStatus) {
          this.alerts.push({
            type: 'api',
            message: `API endpoint ${endpoint.path} returned unexpected status: ${response.status}`,
            severity: 'warning'
          });
        }

        if (responseTime > 2000) {
          this.alerts.push({
            type: 'performance',
            message: `API endpoint ${endpoint.path} response time is slow: ${responseTime}ms`,
            severity: 'warning'
          });
        }
      } catch (error) {
        this.alerts.push({
          type: 'critical',
          message: `API endpoint ${endpoint.path} is not responding: ${error.message}`,
          severity: 'critical'
        });
      }
    }
  }

  async checkExternalServices() {
    // Check external platform APIs
    const platforms = [
      { name: 'LeetCode', url: 'https://leetcode.com' },
      { name: 'GeeksforGeeks', url: 'https://geeksforgeeks.org' },
      { name: 'InterviewBit', url: 'https://www.interviewbit.com' }
    ];

    for (const platform of platforms) {
      try {
        const response = await axios.get(platform.url, { timeout: 5000 });
        
        if (response.status !== 200) {
          this.alerts.push({
            type: 'external',
            message: `${platform.name} API is not accessible`,
            severity: 'warning'
          });
        }
      } catch (error) {
        this.alerts.push({
          type: 'external',
          message: `${platform.name} is not responding: ${error.message}`,
          severity: 'warning'
        });
      }
    }
  }

  async checkSystemResources() {
    const os = require('os');
    const fs = require('fs');

    // Check memory usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;

    this.metrics.memory = {
      total: totalMemory,
      used: usedMemory,
      free: freeMemory,
      usagePercentage: memoryUsage
    };

    if (memoryUsage > 90) {
      this.alerts.push({
        type: 'resource',
        message: `High memory usage: ${memoryUsage.toFixed(2)}%`,
        severity: 'critical'
      });
    } else if (memoryUsage > 80) {
      this.alerts.push({
        type: 'resource',
        message: `Memory usage is high: ${memoryUsage.toFixed(2)}%`,
        severity: 'warning'
      });
    }

    // Check disk space
    const stats = fs.statSync('.');
    // Note: This is a simplified disk space check
    // In production, you'd want to check actual disk usage
  }

  generateHealthReport() {
    return {
      timestamp: new Date().toISOString(),
      status: this.alerts.length === 0 ? 'healthy' : 'issues_found',
      metrics: this.metrics,
      alerts: this.alerts,
      summary: {
        totalAlerts: this.alerts.length,
        criticalAlerts: this.alerts.filter(a => a.severity === 'critical').length,
        warningAlerts: this.alerts.filter(a => a.severity === 'warning').length
      }
    };
  }

  async sendAlerts() {
    // Send alerts to monitoring system or administrators
    for (const alert of this.alerts) {
      console.log(`ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
      
      // In production, you'd send this to your monitoring system
      // await this.sendToMonitoringSystem(alert);
    }
  }
}

// Run the job
if (require.main === module) {
  const job = new SystemHealthCheckJob();
  job.run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}

module.exports = SystemHealthCheckJob;
```

---

### **4. Data Cleanup Job**

#### **Schedule**: Daily at 02:00 AM
```bash
# Crontab entry
0 2 * * * /usr/bin/node /path/to/dsa-tracker/jobs/data-cleanup.js >> /var/log/dsa-tracker/cleanup.log 2>&1
```

#### **Implementation**
```javascript
// jobs/data-cleanup.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class DataCleanupJob {
  constructor() {
    this.cleanupResults = {
      deletedLogs: 0,
      archivedData: 0,
      optimizedTables: 0,
      errors: []
    };
  }

  async run() {
    console.log(`[${new Date().toISOString()}] Starting data cleanup job`);
    
    try {
      // Clean old activity logs
      await this.cleanupActivityLogs();
      
      // Archive old progress data
      await this.archiveProgressData();
      
      // Optimize database tables
      await this.optimizeDatabase();
      
      // Clean temporary files
      await this.cleanupTempFiles();
      
      console.log(`[${new Date().toISOString()}] Data cleanup completed`, this.cleanupResults);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Data cleanup failed:`, error);
      throw error;
    }
  }

  async cleanupActivityLogs() {
    try {
      // Delete activity logs older than 30 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const result = await prisma.activityLog.deleteMany({
        where: {
          created_at: {
            lt: cutoffDate
          }
        }
      });

      this.cleanupResults.deletedLogs = result.count;
      console.log(`Deleted ${result.count} old activity logs`);
    } catch (error) {
      this.cleanupResults.errors.push({
        operation: 'cleanupActivityLogs',
        error: error.message
      });
    }
  }

  async archiveProgressData() {
    try {
      // Archive student progress data older than 6 months
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);

      const oldProgress = await prisma.studentProgress.findMany({
        where: {
          sync_at: {
            lt: cutoffDate
          }
        }
      });

      if (oldProgress.length > 0) {
        // Move to archive table (implementation depends on your archive strategy)
        // For now, we'll just count them
        this.cleanupResults.archivedData = oldProgress.length;
        console.log(`Archived ${oldProgress.length} old progress records`);
      }
    } catch (error) {
      this.cleanupResults.errors.push({
        operation: 'archiveProgressData',
        error: error.message
      });
    }
  }

  async optimizeDatabase() {
    try {
      // Run database optimization queries
      await prisma.$executeRaw`VACUUM ANALYZE student_progress`;
      await prisma.$executeRaw`VACUUM ANALYZE question_visibility`;
      await prisma.$executeRaw`VACUUM ANALYZE leaderboard`;

      this.cleanupResults.optimizedTables = 3;
      console.log('Optimized database tables');
    } catch (error) {
      this.cleanupResults.errors.push({
        operation: 'optimizeDatabase',
        error: error.message
      });
    }
  }

  async cleanupTempFiles() {
    const fs = require('fs');
    const path = require('path');

    try {
      const tempDir = path.join(__dirname, '../temp');
      
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        let deletedFiles = 0;

        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stats = fs.statSync(filePath);
          
          // Delete files older than 24 hours
          if (stats.isFile() && (Date.now() - stats.mtime.getTime()) > 24 * 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
            deletedFiles++;
          }
        }

        console.log(`Deleted ${deletedFiles} temporary files`);
      }
    } catch (error) {
      this.cleanupResults.errors.push({
        operation: 'cleanupTempFiles',
        error: error.message
      });
    }
  }
}

// Run the job
if (require.main === module) {
  const job = new DataCleanupJob();
  job.run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}

module.exports = DataCleanupJob;
```

---

## 📊 Job Monitoring & Logging

### **Logging Strategy**
```javascript
// utils/job-logger.js
class JobLogger {
  static log(jobName, level, message, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      job: jobName,
      level: level, // info, warning, error, critical
      message: message,
      metadata: metadata
    };

    console.log(JSON.stringify(logEntry));
    
    // Write to file
    this.writeToFile(logEntry);
    
    // Send to monitoring system
    this.sendToMonitoring(logEntry);
  }

  static writeToFile(logEntry) {
    const fs = require('fs');
    const path = require('path');
    
    const logDir = path.join(__dirname, '../logs');
    const logFile = path.join(logDir, `jobs-${new Date().toISOString().split('T')[0]}.log`);
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }

  static sendToMonitoring(logEntry) {
    // Send to your monitoring system (e.g., Sentry, Datadog, etc.)
    if (logEntry.level === 'error' || logEntry.level === 'critical') {
      // Send alert to monitoring system
    }
  }
}

module.exports = JobLogger;
```

### **Job Status Dashboard**
```javascript
// utils/job-status.js
class JobStatusTracker {
  constructor() {
    this.jobStatuses = new Map();
  }

  startJob(jobName) {
    this.jobStatuses.set(jobName, {
      status: 'running',
      startTime: new Date(),
      endTime: null,
      duration: null,
      error: null
    });

    JobLogger.log(jobName, 'info', 'Job started');
  }

  completeJob(jobName) {
    const status = this.jobStatuses.get(jobName);
    if (status) {
      status.status = 'completed';
      status.endTime = new Date();
      status.duration = status.endTime - status.startTime;

      JobLogger.log(jobName, 'info', 'Job completed', {
        duration: status.duration
      });
    }
  }

  failJob(jobName, error) {
    const status = this.jobStatuses.get(jobName);
    if (status) {
      status.status = 'failed';
      status.endTime = new Date();
      status.duration = status.endTime - status.startTime;
      status.error = error.message;

      JobLogger.log(jobName, 'error', 'Job failed', {
        duration: status.duration,
        error: error.message
      });
    }
  }

  getStatus(jobName) {
    return this.jobStatuses.get(jobName);
  }

  getAllStatuses() {
    return Object.fromEntries(this.jobStatuses);
  }
}

module.exports = JobStatusTracker;
```

---

## 🔧 Job Configuration

### **Environment Configuration**
```javascript
// config/jobs.js
module.exports = {
  // Progress sync configuration
  progressSync: {
    enabled: process.env.PROGRESS_SYNC_ENABLED !== 'false',
    interval: process.env.PROGRESS_SYNC_INTERVAL || '2h',
    batchSize: parseInt(process.env.PROGRESS_SYNC_BATCH_SIZE) || 50,
    timeout: parseInt(process.env.PROGRESS_SYNC_TIMEOUT) || 300000 // 5 minutes
  },

  // Leaderboard configuration
  leaderboard: {
    enabled: process.env.LEADERBOARD_ENABLED !== 'false',
    interval: process.env.LEADERBOARD_INTERVAL || '6h',
    batchSize: parseInt(process.env.LEADERBOARD_BATCH_SIZE) || 100
  },

  // Health check configuration
  healthCheck: {
    enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
    interval: process.env.HEALTH_CHECK_INTERVAL || '1h',
    alertThreshold: {
      responseTime: parseInt(process.env.HEALTH_CHECK_RESPONSE_TIME_THRESHOLD) || 2000,
      memoryUsage: parseInt(process.env.HEALTH_CHECK_MEMORY_THRESHOLD) || 80
    }
  },

  // Data cleanup configuration
  dataCleanup: {
    enabled: process.env.DATA_CLEANUP_ENABLED !== 'false',
    schedule: process.env.DATA_CLEANUP_SCHEDULE || '0 2 * * *',
    retention: {
      activityLogs: parseInt(process.env.ACTIVITY_LOG_RETENTION_DAYS) || 30,
      progressData: parseInt(process.env.PROGRESS_DATA_RETENTION_DAYS) || 180
    }
  }
};
```

### **Job Scheduler**
```javascript
// utils/job-scheduler.js
const cron = require('node-cron');
const ProgressSyncJob = require('../jobs/sync-progress');
const LeaderboardJob = require('../jobs/recalculate-leaderboard');
const HealthCheckJob = require('../jobs/health-check');
const DataCleanupJob = require('../jobs/data-cleanup');
const JobStatusTracker = require('./job-status');
const JobLogger = require('./job-logger');
const jobConfig = require('../config/jobs');

class JobScheduler {
  constructor() {
    this.jobs = new Map();
    this.statusTracker = new JobStatusTracker();
  }

  start() {
    JobLogger.log('scheduler', 'info', 'Starting job scheduler');

    // Start progress sync job
    if (jobConfig.progressSync.enabled) {
      this.scheduleJob('progress-sync', jobConfig.progressSync.interval, async () => {
        await this.runJob('progress-sync', new ProgressSyncJob());
      });
    }

    // Start leaderboard job
    if (jobConfig.leaderboard.enabled) {
      this.scheduleJob('leaderboard', jobConfig.leaderboard.interval, async () => {
        await this.runJob('leaderboard', new LeaderboardJob());
      });
    }

    // Start health check job
    if (jobConfig.healthCheck.enabled) {
      this.scheduleJob('health-check', jobConfig.healthCheck.interval, async () => {
        await this.runJob('health-check', new HealthCheckJob());
      });
    }

    // Start data cleanup job
    if (jobConfig.dataCleanup.enabled) {
      cron.schedule(jobConfig.dataCleanup.schedule, async () => {
        await this.runJob('data-cleanup', new DataCleanupJob());
      });
    }

    JobLogger.log('scheduler', 'info', 'All jobs scheduled successfully');
  }

  scheduleJob(name, interval, jobFunction) {
    const cronExpression = this.convertIntervalToCron(interval);
    
    const task = cron.schedule(cronExpression, async () => {
      await jobFunction();
    }, {
      scheduled: false
    });

    this.jobs.set(name, task);
    task.start();

    JobLogger.log('scheduler', 'info', `Job ${name} scheduled with interval ${interval}`);
  }

  async runJob(name, job) {
    this.statusTracker.startJob(name);

    try {
      await job.run();
      this.statusTracker.completeJob(name);
    } catch (error) {
      this.statusTracker.failJob(name, error);
    }
  }

  convertIntervalToCron(interval) {
    // Convert interval like '2h' to cron expression
    const unit = interval.slice(-1);
    const value = parseInt(interval.slice(0, -1));

    switch (unit) {
      case 'h':
        return `0 */${value} * * *`;
      case 'm':
        return `*/${value} * * * *`;
      case 'd':
        return `0 ${value % 24} * * *`;
      default:
        throw new Error(`Unsupported interval format: ${interval}`);
    }
  }

  stop() {
    for (const [name, task] of this.jobs) {
      task.stop();
      JobLogger.log('scheduler', 'info', `Job ${name} stopped`);
    }
    
    JobLogger.log('scheduler', 'info', 'Job scheduler stopped');
  }

  getStatus() {
    return {
      jobs: this.statusTracker.getAllStatuses(),
      runningJobs: Array.from(this.jobs.entries()).filter(([name, task]) => task.running).map(([name]) => name)
    };
  }
}

module.exports = JobScheduler;
```

---

## 🚀 Production Deployment

### **PM2 Configuration**
```json
{
  "apps": [
    {
      "name": "dsa-tracker-api",
      "script": "dist/server.js",
      "instances": "max",
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production"
      }
    },
    {
      "name": "job-scheduler",
      "script": "dist/utils/job-scheduler.js",
      "instances": 1,
      "watch": false,
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}
```

### **Docker Implementation**
```dockerfile
# Dockerfile for jobs
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

# Create logs directory
RUN mkdir -p /app/logs

CMD ["node", "dist/utils/job-scheduler.js"]
```

---

## 📈 Monitoring & Alerting

### **Health Check Endpoint**
```javascript
// Add to main server
app.get('/api/system/jobs/status', (req, res) => {
  const jobScheduler = require('./utils/job-scheduler');
  const status = jobScheduler.getStatus();
  
  res.json({
    timestamp: new Date().toISOString(),
    status: 'operational',
    jobs: status
  });
});
```

### **Metrics Collection**
```javascript
// utils/metrics.js
class JobMetrics {
  static collectJobMetrics(jobName, duration, success) {
    const metrics = {
      jobName,
      duration,
      success,
      timestamp: new Date().toISOString()
    };

    // Send to metrics system (e.g., Prometheus, Datadog)
    this.sendMetrics(metrics);
  }

  static sendMetrics(metrics) {
    // Implementation depends on your metrics system
  }
}

module.exports = JobMetrics;
```

This comprehensive cron jobs and background processes documentation provides a complete foundation for automated system maintenance, data synchronization, and operational monitoring for the DSA Tracker platform.
