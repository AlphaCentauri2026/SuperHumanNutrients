# Superhuman Nutrition - Deployment Guide

## Overview

This guide covers deploying the Superhuman Nutrition application to production environments, including Vercel, environment configuration, and monitoring setup.

## Prerequisites

- Node.js 18+ and npm 9+
- Firebase project with authentication enabled
- Google AI API key
- Redis instance (optional, for production caching)
- Vercel account (or alternative hosting platform)

## Environment Setup

### 1. Production Environment Variables

Copy the production environment template and configure:

```bash
cp env.production.example .env.production
```

Fill in all required values:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config

# AI Service
NEXT_PUBLIC_AI_API_KEY=your_google_ai_key

# Redis (if using)
REDIS_URL=redis://your-redis-host:6379
```

### 2. Firebase Configuration

1. **Enable Authentication**:
   - Go to Firebase Console > Authentication
   - Enable Google Sign-In
   - Add your production domain to authorized domains

2. **Security Rules**:

   ```javascript
   // Firestore rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Food groups - read-only for authenticated users
       match /foodGroups/{document} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.token.admin == true;
       }

       // User preferences - users can only access their own
       match /userPreferences/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }

       // Saved combinations - users can only access their own
       match /savedCombinations/{document} {
         allow read, write: if request.auth != null &&
           request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

## Deployment Options

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

#### 4. Configure Environment Variables

In Vercel dashboard:

1. Go to your project
2. Settings > Environment Variables
3. Add all production environment variables
4. Deploy again to apply changes

### Option 2: Self-Hosted

#### 1. Build the Application

```bash
npm run build:production
```

#### 2. Start Production Server

```bash
npm run start:production
```

#### 3. Use PM2 for Process Management

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "superhuman-nutrition" -- run start:production

# Save PM2 configuration
pm2 save
pm2 startup
```

## CI/CD Pipeline Setup

### 1. GitHub Secrets

Configure these secrets in your GitHub repository:

```bash
# Vercel
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Security
SNYK_TOKEN=your_snyk_token
SLACK_WEBHOOK_URL=your_slack_webhook

# Monitoring
SENTRY_DSN=your_sentry_dsn
DATADOG_API_KEY=your_datadog_key
```

### 2. Branch Strategy

- `main` → Production deployment
- `develop` → Staging deployment
- Feature branches → Pull request reviews

### 3. Automated Workflows

The CI/CD pipeline automatically:

- Runs tests and linting
- Performs security scans
- Deploys to staging (develop branch)
- Deploys to production (main branch)
- Runs health checks
- Sends notifications

## Monitoring & Observability

### 1. Health Checks

Monitor these endpoints:

```bash
# Overall health
curl https://your-domain.com/api/health

# Detailed metrics
curl https://your-domain.com/api/metrics
```

### 2. External Monitoring

#### Sentry (Error Tracking)

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.ts
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = withSentryConfig({
  // your existing config
}, {
  silent: true,
  org: "your-org",
  project: "superhuman-nutrition",
});
```

#### Datadog (APM)

```bash
# Install Datadog
npm install dd-trace

# Configure in your application
require('dd-trace').init({
  service: 'superhuman-nutrition',
  env: process.env.NODE_ENV,
});
```

### 3. Logging

Configure structured logging:

```typescript
// In your monitoring configuration
export const logger = {
  info: (message: string, metadata?: object) => {
    console.log(
      JSON.stringify({
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
        ...metadata,
      })
    );
  },
  // ... other levels
};
```

## Performance Optimization

### 1. Bundle Analysis

```bash
# Analyze bundle size
npm run analyze
```

### 2. Image Optimization

```typescript
// In next.config.ts
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

### 3. Caching Strategy

```typescript
// Cache configuration
export const cacheConfig = {
  // Browser cache
  browser: {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    staleWhileRevalidate: 60 * 60 * 24, // 1 day
  },
  // CDN cache
  cdn: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
```

## Security Hardening

### 1. Content Security Policy

```typescript
// In next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https://firebase.googleapis.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

### 2. Rate Limiting

```typescript
// Configure rate limiting
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
};
```

### 3. Input Validation

```typescript
// Use Zod schemas for all inputs
import { z } from 'zod';

const UserInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

// Validate all inputs
const validatedData = UserInputSchema.parse(requestBody);
```

## Database Setup

### 1. Firebase Production Rules

```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rate limiting
    function isNotRateLimited() {
      return request.time > resource.data.lastRequest + duration.value(1, 'm');
    }

    // Admin access
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    // User access to own data
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Apply rules
    match /foodGroups/{document} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    match /userPreferences/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

### 2. Backup Strategy

```bash
# Firebase backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_ID="your-project-id"

# Export Firestore data
gcloud firestore export gs://your-backup-bucket/$DATE \
  --project=$PROJECT_ID \
  --collection-ids=foodGroups,userPreferences,savedCombinations
```

## SSL & Domain Configuration

### 1. Custom Domain

1. **Add Domain in Vercel**:
   - Go to project settings
   - Domains > Add domain
   - Enter your domain

2. **Configure DNS**:

   ```bash
   # Add these records to your DNS provider
   Type: A
   Name: @
   Value: 76.76.19.19

   Type: CNAME
   Name: www
   Value: your-domain.com
   ```

### 2. SSL Certificate

Vercel automatically provides SSL certificates. For self-hosted:

```bash
# Using Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Post-Deployment Checklist

### 1. Health Checks

```bash
# Verify all endpoints
curl -f https://your-domain.com/api/health
curl -f https://your-domain.com/api/metrics
curl -f https://your-domain.com/api/food-groups
```

### 2. Performance Testing

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run performance audit
lhci autorun
```

### 3. Security Testing

```bash
# Run security audit
npm run security-audit

# Check for vulnerabilities
npm audit
```

### 4. Monitoring Setup

1. **Set up alerts** for:
   - Response time > 2 seconds
   - Error rate > 5%
   - Health check failures
   - Memory usage > 80%

2. **Configure dashboards** for:
   - Real-time performance metrics
   - Error tracking
   - User activity
   - System health

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

#### 2. Environment Variables

```bash
# Verify environment variables
vercel env ls

# Set missing variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
```

#### 3. Performance Issues

```bash
# Analyze bundle
npm run analyze

# Check for memory leaks
npm run start:production
# Monitor with process manager
```

### Support Resources

- **Documentation**: [docs.your-domain.com](https://docs.your-domain.com)
- **GitHub Issues**: [github.com/your-org/superhuman-nutrition/issues](https://github.com/your-org/superhuman-nutrition/issues)
- **Status Page**: [status.your-domain.com](https://status.your-domain.com)
- **Email Support**: deploy-support@your-domain.com

## Maintenance

### 1. Regular Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Update to latest LTS Node.js
nvm install --lts
nvm use --lts
```

### 2. Backup Schedule

- **Daily**: Automated Firebase exports
- **Weekly**: Full system backup
- **Monthly**: Configuration backup

### 3. Performance Monitoring

- **Weekly**: Performance metrics review
- **Monthly**: Bundle size analysis
- **Quarterly**: Security audit

---

## Quick Deploy Commands

```bash
# Full production deployment
npm run build:production
vercel --prod

# Staging deployment
npm run build:staging
vercel

# Health check
curl -f https://your-domain.com/api/health

# Metrics
curl -f https://your-domain.com/api/metrics
```

---

_Last updated: January 2024_
_Version: 1.0.0_
