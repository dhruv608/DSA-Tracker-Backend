# Frontend Integration Guide

## 🎯 Frontend Overview

This guide provides comprehensive information for frontend developers integrating with the DSA Tracker backend API. It covers authentication, API integration patterns, data handling, and best practices for building a responsive, secure frontend application.

## 🏗️ Frontend Architecture

### **Recommended Technology Stack**
- **Framework**: React.js (Next.js recommended)
- **Language**: TypeScript
- **State Management**: Redux Toolkit / Zustand
- **HTTP Client**: Axios or Fetch API
- **Styling**: Tailwind CSS / Material-UI
- **Authentication**: JWT token management

### **Project Structure**
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service functions
│   ├── store/              # State management
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   └── middleware/         # Frontend middleware
├── public/                 # Static assets
└── package.json
```

---

## 🔐 Authentication Integration

### **Token Management Strategy**

#### **Token Storage**
```typescript
// utils/auth.ts
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  batch?: {
    id: number;
    batch_name: string;
    slug: string;
  };
  city?: {
    id: number;
    city_name: string;
    slug: string;
  };
}

class AuthManager {
  private static instance: AuthManager;
  
  // Store tokens in httpOnly cookies (recommended)
  static setTokens(tokens: AuthTokens): void {
    document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=604800; secure; samesite=strict`;
    document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=604800; secure; samesite=strict`;
  }
  
  // Alternative: localStorage (less secure)
  static setTokensLocalStorage(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }
  
  static getAccessToken(): string | null {
    return this.getCookie('accessToken') || localStorage.getItem('accessToken');
  }
  
  static getRefreshToken(): string | null {
    return this.getCookie('refreshToken') || localStorage.getItem('refreshToken');
  }
  
  private static getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
  
  static clearTokens(): void {
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}
```

#### **Authentication Service**
```typescript
// services/auth.ts
import axios from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
  batch_id: number;
  enrollment_id?: string;
  leetcode_id?: string;
  gfg_id?: string;
}

export class AuthService {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  static async login(credentials: LoginCredentials, userType: 'student' | 'admin' | 'superadmin') {
    try {
      const response = await axios.post(`${this.baseURL}/auth/${userType}/login`, credentials);
      
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens
      AuthManager.setTokens({ accessToken, refreshToken });
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, tokens: { accessToken, refreshToken } };
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  static async register(data: RegisterData) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/student/register`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  static async logout() {
    try {
      const accessToken = AuthManager.getAccessToken();
      if (accessToken) {
        await axios.post(`${this.baseURL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      AuthManager.clearTokens();
      window.location.href = '/login';
    }
  }
  
  static async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = AuthManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken
      });
      
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
      
      AuthManager.setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      
      return newAccessToken;
    } catch (error) {
      // Refresh failed, clear tokens and redirect to login
      AuthManager.clearTokens();
      window.location.href = '/login';
      throw error;
    }
  }
  
  private static handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || error.message;
      return new Error(message);
    }
    return new Error('An unexpected error occurred');
  }
}
```

---

## 🌐 HTTP Client Configuration

### **Axios Instance Setup**
```typescript
// services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthService } from './auth';

class ApiClient {
  private static instance: AxiosInstance;
  
  static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Request interceptor
      this.instance.interceptors.request.use(
        (config) => {
          const token = AuthManager.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );
      
      // Response interceptor for token refresh
      this.instance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;
          
          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              const newToken = await AuthService.refreshAccessToken();
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            } catch (refreshError) {
              // Refresh failed, redirect to login
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          }
          
          return Promise.reject(error);
        }
      );
    }
    
    return this.instance;
  }
}

export const apiClient = ApiClient.getInstance();
```

### **API Service Base Class**
```typescript
// services/base.ts
import { apiClient } from './api';

export abstract class BaseApiService {
  protected client = apiClient;
  
  protected handleError(error: any): never {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || 'Server error';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error');
    } else {
      // Something else happened
      throw new Error(error.message || 'Unknown error');
    }
  }
  
  protected async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  protected async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  protected async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  protected async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}
```

---

## 📚 Student API Integration

### **Student Service**
```typescript
// services/student.ts
import { BaseApiService } from './base';

export interface Topic {
  id: number;
  topic_name: string;
  slug: string;
  batchSpecificData: {
    totalClasses: number;
    totalQuestions: number;
    solvedQuestions: number;
  };
}

export interface Question {
  id: number;
  question_name: string;
  question_link: string;
  platform: string;
  level: string;
  type: string;
  isSolved: boolean;
  syncAt: string | null;
  topic: {
    id: number;
    topic_name: string;
    slug: string;
  };
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    totalQuestions: number;
    totalPages: number;
  };
  filters: {
    topics: Array<{ id: number; topic_name: string; slug: string }>;
    levels: string[];
    platforms: string[];
    types: string[];
  };
  stats: {
    total: number;
    solved: number;
  };
}

export interface LeaderboardResponse {
  personalRank: {
    rank: number;
    student: {
      id: number;
      name: string;
      username: string;
      maxStreak: number;
      totalCount: number;
    };
  };
  topPerformers: Array<{
    rank: number;
    name: string;
    username: string;
    maxStreak: number;
    totalCount: number;
  }>;
  batchStats: {
    totalStudents: number;
    averageCount: number;
    topStreak: number;
  };
}

export class StudentService extends BaseApiService {
  async getTopics(): Promise<Topic[]> {
    return this.get<Topic[]>('/students/topics');
  }
  
  async getTopic(slug: string): Promise<any> {
    return this.get(`/students/topics/${slug}`);
  }
  
  async getClass(topicSlug: string, classSlug: string): Promise<any> {
    return this.get(`/students/topics/${topicSlug}/classes/${classSlug}`);
  }
  
  async getQuestions(params: {
    search?: string;
    topic?: string;
    level?: string;
    platform?: string;
    type?: string;
    solved?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<QuestionsResponse> {
    return this.get<QuestionsResponse>('/students/addedQuestions', params);
  }
  
  async getLeaderboard(limit: number = 10): Promise<LeaderboardResponse> {
    return this.post<LeaderboardResponse>('/students/leaderboard', { limit });
  }
  
  async getProfile(): Promise<any> {
    return this.get('/students/profile');
  }
  
  async updateQuestionProgress(questionId: number, isSolved: boolean): Promise<any> {
    return this.put(`/students/questions/${questionId}/progress`, { isSolved });
  }
}
```

---

## 🎨 React Hooks Integration

### **Authentication Hook**
```typescript
// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AuthService } from '../services/auth';
import { User } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, userType: 'student' | 'admin' | 'superadmin') => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, userType: 'student' | 'admin' | 'superadmin') => {
    setIsLoading(true);
    try {
      const { user: userData } = await AuthService.login({ email, password }, userType);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      await AuthService.register(data);
      // Optionally auto-login after registration
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### **Student Data Hook**
```typescript
// hooks/useStudentData.ts
import { useState, useEffect } from 'react';
import { StudentService } from '../services/student';
import { Topic, QuestionsResponse, LeaderboardResponse } from '../services/student';

export function useStudentData() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<QuestionsResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentService = new StudentService();

  const fetchTopics = async () => {
    try {
      const data = await studentService.getTopics();
      setTopics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
    }
  };

  const fetchQuestions = async (params: any = {}) => {
    setIsLoading(true);
    try {
      const data = await studentService.getQuestions(params);
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const data = await studentService.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    }
  };

  const updateProgress = async (questionId: number, isSolved: boolean) => {
    try {
      await studentService.updateQuestionProgress(questionId, isSolved);
      
      // Refresh data to reflect changes
      if (questions) {
        fetchQuestions();
      }
      fetchLeaderboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchQuestions();
    fetchLeaderboard();
  }, []);

  return {
    topics,
    questions,
    leaderboard,
    isLoading,
    error,
    fetchTopics,
    fetchQuestions,
    fetchLeaderboard,
    updateProgress
  };
}
```

---

## 📱 Page Components

### **Dashboard Page**
```typescript
// pages/student/dashboard.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useStudentData } from '../../hooks/useStudentData';
import { ProgressCard } from '../../components/ProgressCard';
import { TopicsList } from '../../components/TopicsList';
import { LeaderboardWidget } from '../../components/LeaderboardWidget';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { topics, leaderboard, isLoading } = useStudentData();

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <div className="text-sm text-gray-600">
              {user?.batch?.batch_name} • {user?.city?.city_name}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ProgressCard
            title="Total Questions"
            value={topics.reduce((acc, topic) => acc + topic.batchSpecificData.totalQuestions, 0)}
            icon="📝"
          />
          <ProgressCard
            title="Solved Questions"
            value={topics.reduce((acc, topic) => acc + topic.batchSpecificData.solvedQuestions, 0)}
            icon="✅"
          />
          <ProgressCard
            title="Your Rank"
            value={`#${leaderboard?.personalRank.rank}`}
            icon="🏆"
          />
        </div>

        {/* Topics List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Topics</h2>
            <TopicsList topics={topics} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
            <LeaderboardWidget leaderboard={leaderboard} />
          </div>
        </div>
      </main>
    </div>
  );
}
```

### **Questions Page with Filters**
```typescript
// pages/student/questions.tsx
import React, { useState, useEffect } from 'react';
import { useStudentData } from '../../hooks/useStudentData';
import { QuestionFilters } from '../../components/QuestionFilters';
import { QuestionsList } from '../../components/QuestionsList';
import { Pagination } from '../../components/Pagination';

export default function QuestionsPage() {
  const { questions, fetchQuestions, updateProgress, isLoading } = useStudentData();
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    platform: '',
    type: '',
    solved: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchQuestions(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleQuestionSolved = async (questionId: number, isSolved: boolean) => {
    await updateProgress(questionId, isSolved);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 py-6">Questions</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <QuestionFilters
          filters={filters}
          availableFilters={questions?.filters}
          onFilterChange={handleFilterChange}
        />

        {/* Stats */}
        {questions?.stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Total Questions</span>
                <p className="text-2xl font-bold">{questions.stats.total}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Solved</span>
                <p className="text-2xl font-bold text-green-600">{questions.stats.solved}</p>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <QuestionsList
          questions={questions?.questions || []}
          onQuestionSolved={handleQuestionSolved}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {questions?.pagination && (
          <Pagination
            currentPage={questions.pagination.page}
            totalPages={questions.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
}
```

---

## 🎨 UI Components

### **Progress Card Component**
```typescript
// components/ProgressCard.tsx
import React from 'react';

interface ProgressCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function ProgressCard({ title, value, icon, color = 'blue' }: ProgressCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
```

### **Question Filters Component**
```typescript
// components/QuestionFilters.tsx
import React from 'react';

interface QuestionFiltersProps {
  filters: any;
  availableFilters?: any;
  onFilterChange: (filters: any) => void;
}

export function QuestionFilters({ filters, availableFilters, onFilterChange }: QuestionFiltersProps) {
  const handleInputChange = (field: string, value: string) => {
    onFilterChange({ [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Search questions..."
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
          />
        </div>

        {/* Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.level}
            onChange={(e) => handleInputChange('level', e.target.value)}
          >
            <option value="">All Levels</option>
            {availableFilters?.levels?.map((level: string) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Platform Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.platform}
            onChange={(e) => handleInputChange('platform', e.target.value)}
          >
            <option value="">All Platforms</option>
            {availableFilters?.platforms?.map((platform: string) => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            {availableFilters?.types?.map((type: string) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Solved Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.solved}
            onChange={(e) => handleInputChange('solved', e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Solved</option>
            <option value="false">Unsolved</option>
          </select>
        </div>

        {/* Topic Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
          >
            <option value="">All Topics</option>
            {availableFilters?.topics?.map((topic: any) => (
              <option key={topic.id} value={topic.slug}>{topic.topic_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="mt-4">
        <button
          onClick={() => onFilterChange({
            search: '',
            level: '',
            platform: '',
            type: '',
            solved: '',
            topic: ''
          })}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
```

---

## 🔄 State Management

### **Redux Store Setup (Optional)**
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import studentSlice from './slices/studentSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    student: studentSlice
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### **Auth Slice**
```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoading = false;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
```

---

## 📱 Responsive Design

### **Mobile-First Approach**
```css
/* styles/globals.css */
.container {
  max-width: 100%;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding: 0 1.5rem;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

### **Responsive Components**
```typescript
// components/ResponsiveGrid.tsx
import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function ResponsiveGrid({ children, cols = { sm: 1, md: 2, lg: 3, xl: 4 } }: ResponsiveGridProps) {
  const gridClasses = `
    grid
    grid-cols-${cols.sm || 1}
    md:grid-cols-${cols.md || 2}
    lg:grid-cols-${cols.lg || 3}
    xl:grid-cols-${cols.xl || 4}
    gap-6
  `;

  return <div className={gridClasses}>{children}</div>;
}
```

---

## 🚀 Performance Optimization

### **Code Splitting**
```typescript
// pages/student/dashboard.tsx
import dynamic from 'next/dynamic';

const LeaderboardWidget = dynamic(() => import('../../components/LeaderboardWidget'), {
  loading: () => <div>Loading leaderboard...</div>,
  ssr: false
});

export default function StudentDashboard() {
  return (
    <div>
      {/* Other content */}
      <LeaderboardWidget />
    </div>
  );
}
```

### **Image Optimization**
```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export function OptimizedImage({ src, alt, width, height }: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="rounded-lg"
      priority={false}
    />
  );
}
```

### **Memoization**
```typescript
// components/QuestionCard.tsx
import React, { memo } from 'react';

interface QuestionCardProps {
  question: any;
  onSolved: (id: number, solved: boolean) => void;
}

export const QuestionCard = memo(({ question, onSolved }: QuestionCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Question content */}
    </div>
  );
});
```

---

## 🛡️ Security Best Practices

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=DSA Tracker
NEXT_PUBLIC_VERSION=1.0.0
```

### **Content Security Policy**
```typescript
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta httpEquiv="Content-Security-Policy" content="
          default-src 'self';
          script-src 'self' 'unsafe-inline';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: https:;
          connect-src 'self' http://localhost:5000;
        " />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

---

## 🧪 Testing

### **Component Testing**
```typescript
// __tests__/components/ProgressCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProgressCard } from '../../components/ProgressCard';

describe('ProgressCard', () => {
  it('renders title and value correctly', () => {
    render(<ProgressCard title="Test Title" value={42} icon="📊" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });
});
```

### **Hook Testing**
```typescript
// __tests__/hooks/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../hooks/useAuth';

describe('useAuth', () => {
  it('should login successfully', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password', 'student');
    });

    expect(result.current.user).toBeTruthy();
  });
});
```

This comprehensive frontend integration guide provides everything needed to build a robust, secure, and performant frontend application for the DSA Tracker system.
