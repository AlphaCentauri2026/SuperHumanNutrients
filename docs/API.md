# Superhuman Nutrition API Documentation

## Overview

The Superhuman Nutrition API provides comprehensive endpoints for managing food groups, meal planning, user preferences, and health monitoring. Built with Next.js 15, TypeScript, and Firebase, the API includes advanced security features, rate limiting, and comprehensive monitoring.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Staging**: `https://staging.your-domain.com/api`
- **Production**: `https://your-domain.com/api`

## Authentication

The API uses Firebase Authentication with Google Sign-In. Include the Firebase ID token in the Authorization header:

```http
Authorization: Bearer <firebase_id_token>
```

## Rate Limiting

All endpoints are protected by rate limiting:

- **Window**: 15 minutes (900,000 ms)
- **Max Requests**: 100 per window
- **Headers**: Rate limit information is included in response headers

## Common Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}
```

## Error Handling

The API returns appropriate HTTP status codes and detailed error messages:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error (server-side error)

---

## Food Groups API

### Get All Food Groups

```http
GET /api/food-groups
```

**Query Parameters:**

- `category` (optional): Filter by food category
- `search` (optional): Search by name, nutrients, or benefits

**Response:**

```typescript
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "category": "fruits" | "vegetables" | "grains" | "proteins" | "dairy" | "nuts" | "herbs" | "spices",
      "subcategory": "string",
      "nutrients": ["string"],
      "benefits": ["string"],
      "seasonality": "spring" | "summer" | "fall" | "winter" | "year-round",
      "glycemicIndex": number,
      "caloriesPer100g": number,
      "proteinPer100g": number,
      "carbsPer100g": number,
      "fatPer100g": number,
      "fiberPer100g": number,
      "isActive": boolean,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "count": number,
  "fallback": boolean
}
```

### Create Food Group

```http
POST /api/food-groups
```

**Request Body:**

```typescript
{
  "name": "string",
  "category": "fruits" | "vegetables" | "grains" | "proteins" | "dairy" | "nuts" | "herbs" | "spices",
  "subcategory": "string",
  "nutrients": ["string"],
  "benefits": ["string"],
  "seasonality": "spring" | "summer" | "fall" | "winter" | "year-round",
  "glycemicIndex": number,
  "caloriesPer100g": number,
  "proteinPer100g": number,
  "carbsPer100g": number,
  "fatPer100g": number,
  "fiberPer100g": number
}
```

**Response:**

```typescript
{
  "success": true,
  "message": "Food group created successfully",
  "id": "string"
}
```

---

## Meal Planning API

### Generate Meal Plan

```http
POST /api/meal-plan
```

**Request Body:**

```typescript
{
  "dietaryRestrictions": ["string"],
  "allergies": ["string"],
  "healthGoals": ["string"],
  "preferredCuisines": ["string"],
  "cookingSkill": "beginner" | "intermediate" | "advanced",
  "mealPrepTime": "quick" | "moderate" | "extensive",
  "servingSize": "small" | "medium" | "large",
  "spiceTolerance": "mild" | "medium" | "hot"
}
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "mealPlan": {
      "breakfast": "string",
      "lunch": "string",
      "dinner": "string",
      "snacks": ["string"]
    },
    "nutritionalInfo": {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number
    },
    "shoppingList": ["string"],
    "preparationTime": number,
    "difficulty": "beginner" | "intermediate" | "advanced"
  }
}
```

---

## User Preferences API

### Get User Preferences

```http
GET /api/user/preferences
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "userId": "string",
    "dietaryRestrictions": ["string"],
    "allergies": ["string"],
    "healthGoals": ["string"],
    "preferredCuisines": ["string"],
    "cookingSkill": "beginner" | "intermediate" | "advanced",
    "mealPrepTime": "quick" | "moderate" | "extensive",
    "servingSize": "small" | "medium" | "large",
    "spiceTolerance": "mild" | "medium" | "hot",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Update User Preferences

```http
PUT /api/user/preferences
```

**Request Body:** Partial UserPreferences object

---

## Health & Monitoring API

### Health Check

```http
GET /api/health
```

**Response:**

```typescript
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "ISO string",
  "checks": {
    "database": {
      "status": "healthy" | "unhealthy",
      "responseTime": number
    },
    "cache": {
      "status": "healthy" | "degraded" | "unhealthy",
      "responseTime": number
    },
    "external": {
      "status": "healthy" | "unhealthy",
      "responseTime": number
    }
  }
}
```

### Metrics Dashboard

```http
GET /api/metrics
```

**Response:**

```typescript
{
  "timestamp": "ISO string",
  "collection_time_ms": number,
  "performance": {
    "total_requests": number,
    "average_response_time_ms": number,
    "slowest_request_ms": number,
    "fastest_request_ms": number,
    "error_rate_percent": number,
    "memory_usage_mb": number
  },
  "cache": {
    "hits": number,
    "misses": number,
    "hit_rate_percent": number,
    "total_keys": number,
    "memory_usage_bytes": number,
    "performance": object
  },
  "system": {
    "process": object,
    "environment": object,
    "browser": object
  },
  "api": {
    "requests": object
  },
  "health": {
    "status": "healthy",
    "timestamp": "ISO string"
  }
}
```

---

## Database Management API

### Initialize Database

```http
POST /api/database/init
```

**Response:**

```typescript
{
  "success": true,
  "message": "Database initialized successfully"
}
```

### Populate Database

```http
POST /api/database/populate
```

**Response:**

```typescript
{
  "success": true,
  "message": "Database populated successfully",
  "count": number
}
```

---

## Optimized Endpoints

### Optimized Food Groups

```http
GET /api/food-groups/optimized
```

Enhanced version with caching and performance monitoring.

---

## Error Response Examples

### Validation Error

```typescript
{
  "success": false,
  "error": "Invalid request data",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["name"],
      "message": "Expected string, received number"
    }
  ]
}
```

### Rate Limit Exceeded

```typescript
{
  "success": false,
  "error": "Rate limit exceeded",
  "details": {
    "retryAfter": "2024-01-01T12:00:00Z"
  }
}
```

### Authentication Error

```typescript
{
  "success": false,
  "error": "Authentication required",
  "details": "Valid Firebase ID token required"
}
```

---

## Security Features

### Headers

All responses include security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Input Validation

All inputs are validated using Zod schemas and sanitized to prevent:

- XSS attacks
- SQL injection
- NoSQL injection
- Command injection

### Rate Limiting

In-memory rate limiting with configurable windows and limits.

---

## Monitoring & Observability

### Request Tracking

Every request gets a unique ID for correlation:

- `X-Request-ID` header
- Request/response logging
- Performance timing
- Error tracking

### Performance Metrics

- Response time tracking
- Error rate monitoring
- Cache hit/miss ratios
- Memory usage monitoring

### Health Checks

Comprehensive health monitoring for:

- Database connectivity
- Cache performance
- External service availability
- Overall application health

---

## SDK & Client Libraries

### TypeScript Types

```typescript
// Available for import
import type {
  FoodGroup,
  UserPreferences,
  SavedCombination,
  ApiResponse,
} from '@/lib/types';
```

### API Client

```typescript
import { api } from '@/lib/api/client';

// Usage
const response = await api.get<FoodGroup[]>('/api/food-groups');
```

---

## Support & Contact

For API support, documentation issues, or feature requests:

- **Email**: api-support@your-domain.com
- **Documentation**: https://docs.your-domain.com
- **Status Page**: https://status.your-domain.com
- **GitHub**: https://github.com/your-org/superhuman-nutrition

---

## Changelog

### v1.0.0 (2024-01-01)

- Initial API release
- Food groups management
- Meal planning with AI
- User preferences
- Comprehensive monitoring

### v1.1.0 (2024-01-15)

- Enhanced security features
- Performance optimizations
- Cache improvements
- Additional health checks
