# 🚀 Superhuman Nutrition - Production Ready

A comprehensive, enterprise-grade nutrition application built with Next.js 15, TypeScript, and Firebase. Features AI-powered meal planning, comprehensive food database management, and advanced monitoring capabilities.

## ✨ Features

### 🍎 Core Functionality

- **AI-Powered Meal Planning** - Generate personalized meal plans using Google's Gemini AI
- **Comprehensive Food Database** - Extensive food groups with nutritional information
- **User Preferences Management** - Dietary restrictions, allergies, and health goals
- **Saved Combinations** - Store and manage favorite food combinations
- **Responsive Design** - Modern, mobile-first user interface

### 🔒 Enterprise Security

- **Multi-Layer Security** - Rate limiting, input validation, XSS protection
- **Firebase Authentication** - Secure Google Sign-In with role-based access
- **Input Sanitization** - Comprehensive protection against injection attacks
- **Security Headers** - CSP, HSTS, X-Frame-Options, and more
- **Audit Logging** - Complete request/response tracking

### 📊 Advanced Monitoring

- **Real-Time Metrics** - Performance, cache, and system monitoring
- **Health Checks** - Comprehensive application health monitoring
- **Error Tracking** - Detailed error logging and alerting
- **Performance Analytics** - Response time, throughput, and resource usage
- **Cache Performance** - Redis and in-memory cache monitoring

### 🏗️ Architecture

- **Service Layer** - Clean separation of business logic
- **State Management** - Zustand with Immer for immutable updates
- **API Client** - Centralized API management with retry logic
- **Multi-Level Caching** - Redis primary with in-memory fallback
- **Type Safety** - Full TypeScript coverage with Zod validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Firebase project with authentication enabled
- Google AI API key
- Redis instance (optional, for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/superhuman-nutrition.git
cd superhuman-nutrition

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

### Environment Configuration

```bash
# Required environment variables
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_AI_API_KEY=your_google_ai_api_key

# Optional Redis configuration
REDIS_URL=redis://localhost:6379
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests in CI mode
npm run test:ci

# Type checking
npm run type-check
```

## 🏗️ Building

```bash
# Development build
npm run build

# Production build
npm run build:production

# Staging build
npm run build:staging

# Bundle analysis
npm run analyze
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Self-Hosted

```bash
# Build for production
npm run build:production

# Start production server
npm run start:production

# Use PM2 for process management
pm2 start npm --name "superhuman-nutrition" -- run start:production
```

## 📚 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Security Guide](docs/SECURITY.md)** - Security best practices
- **[Monitoring Guide](docs/MONITORING.md)** - Observability setup

## 🏗️ Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── pages/            # Application pages
├── components/            # Shared components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Core libraries
│   ├── api/              # API client and services
│   ├── cache/            # Caching system
│   ├── monitoring/       # Performance monitoring
│   └── validation/       # Input validation
├── middleware/            # API middleware
├── store/                 # State management
└── types/                 # TypeScript types
```

## 🔒 Security Features

- **Rate Limiting** - Configurable request throttling
- **Input Validation** - Zod schema validation for all inputs
- **XSS Protection** - DOMPurify sanitization
- **CSRF Protection** - Built-in Next.js protection
- **Security Headers** - Comprehensive HTTP security headers
- **Authentication** - Firebase Auth with role-based access
- **Audit Logging** - Complete request/response tracking

## 📊 Monitoring & Observability

### Health Checks

```bash
# Overall health
GET /api/health

# Detailed metrics
GET /api/metrics
```

### Key Metrics

- Response times and throughput
- Error rates and types
- Cache hit/miss ratios
- Memory and CPU usage
- Database performance
- External service health

### Alerting

- Performance degradation
- Error rate spikes
- Health check failures
- Resource usage thresholds

## 🚀 Performance Features

- **Multi-Level Caching** - Redis + in-memory fallback
- **Bundle Optimization** - Tree shaking and code splitting
- **Image Optimization** - Next.js automatic optimization
- **CDN Ready** - Static asset optimization
- **Lazy Loading** - Component and route lazy loading

## 🔧 Development Tools

- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **TypeScript** - Type safety and IntelliSense
- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Bundle Analyzer** - Performance optimization

## 📦 Dependencies

### Core

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework

### Backend

- **Firebase** - Authentication and database
- **Redis** - Caching and session storage
- **Google AI** - Meal planning intelligence

### Development

- **Jest** - Testing framework
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Zod** - Schema validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Maintain code coverage above 80%
- Follow the established code style
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.your-domain.com](https://docs.your-domain.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/superhuman-nutrition/issues)
- **Email**: support@your-domain.com
- **Status**: [status.your-domain.com](https://status.your-domain.com)

## 🏆 Production Status

✅ **Production Ready** - Enterprise-grade security and monitoring  
✅ **Fully Tested** - Comprehensive test coverage  
✅ **Documented** - Complete API and deployment documentation  
✅ **Monitored** - Real-time performance and health monitoring  
✅ **Scalable** - Multi-level caching and performance optimization

---

**Built with ❤️ using Next.js 15, TypeScript, and Firebase**

_Last updated: January 2024_  
_Version: 1.0.0_
