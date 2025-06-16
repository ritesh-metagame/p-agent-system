# P-Agent System API Architecture & Data Flow Documentation

## Overview

This document provides a comprehensive guide to understanding how the P-Agent System API is structured and how data flows through different layers of the application. The system follows a layered architecture pattern with clear separation of concerns.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Directory Structure & Responsibilities](#directory-structure--responsibilities)
3. [Request-Response Flow](#request-response-flow)
4. [Layer-by-Layer Breakdown](#layer-by-layer-breakdown)
5. [Authentication & Authorization Flow](#authentication--authorization-flow)
6. [Data Access Patterns](#data-access-patterns)
7. [Error Handling Strategy](#error-handling-strategy)
8. [Configuration Management](#configuration-management)
9. [Commission API Example Flow](#commission-api-example-flow)
10. [Best Practices & Patterns](#best-practices--patterns)

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  (Next.js Frontend + Mobile Apps + External Integrations)   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/HTTPS Requests
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                       │
│        (Express.js Server + Middleware Stack)               │
├─────────────────────────────────────────────────────────────┤
│  • CORS Handler                                             │
│  • Request Logging (Morgan)                                 │
│  • Body Parser & Compression                                │
│  • JWT Authentication Middleware                            │
│  • User Attachment Middleware                               │
│  • Error Handling Middleware                                │
└─────────────────────┬───────────────────────────────────────┘
                      │ Processed Requests
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      ROUTING LAYER                          │
│             (Express Router + Route Handlers)               │
├─────────────────────────────────────────────────────────────┤
│  /api/v1/auth/*             │  /api/v1/commission/*         │
│  /api/v1/user/*             │  /api/v1/category/*           │
│  /api/v1/site/*             │  /api/v1/role/*               │
│  /api/v1/player/*           │  /api/v1/transactions/*       │
│  /api/v1/network-statistics/*  │  /api/v1/top-performers/*  │
└─────────────────────┬───────────────────────────────────────┘
                      │ Route-specific Requests
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                         │
│           (Request/Response Handling & Validation)          │
├─────────────────────────────────────────────────────────────┤
│  • Request Parameter Extraction                             │
│  • Input Validation (Celebrate/Joi)                         │
│  • User Authentication Verification                         │
│  • Role-based Authorization                                 │
│  • Service Layer Orchestration                              │
│  • Response Formatting                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ Validated Business Requests
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                           │
│              (Business Logic & Orchestration)               │
├─────────────────────────────────────────────────────────────┤
│  • Business Rule Implementation                             │
│  • Complex Calculations (Commission, Settlements)           │
│  • Data Transformation & Aggregation                        │
│  • Cross-Entity Operations                                  │
│  • External Service Integration                             │
│  • Transaction Management                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Data Operations
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                         │
│              (DAO Pattern + Database Operations)            │
├─────────────────────────────────────────────────────────────┤
│  • Database Query Construction                              │
│  • Data Persistence Operations                              │
│  • Complex Query Optimization                               │
│  • Raw SQL for Performance-Critical Operations              │
│  • Data Validation & Sanitization                           │
└─────────────────────┬───────────────────────────────────────┘
                      │ Database Queries
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│              (PostgreSQL + Prisma ORM)                      │
├─────────────────────────────────────────────────────────────┤
│  • Data Storage & Retrieval                                 │
│  • ACID Transaction Support                                 │
│  • Query Optimization                                       │
│  • Database Schema Management                               │
│  • Connection Pooling                                       │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure & Responsibilities

### Root Server Structure

```
server/
├── src/                          # Source code directory
│   ├── main.ts                   # Application entry point
│   ├── server.ts                 # Express server setup & configuration
│   ├── commission-cron.ts        # Scheduled commission calculations
│   ├── seed-transactions.ts      # Database seeding utilities
│   │
│   ├── routes/                   # API Route Definitions
│   ├── controllers/              # Request/Response Controllers  
│   ├── services/                 # Business Logic Layer
│   ├── daos/                     # Data Access Objects
│   ├── common/                   # Shared Utilities & Configuration
│   └── data/                     # Static Data & Constants
│
├── prisma/                       # Database Schema & Migrations
├── docs/                         # API Documentation
├── logs/                         # Application Logs
├── package.json                  # Dependencies & Scripts
└── tsconfig.json                 # TypeScript Configuration
```

### Detailed Folder Responsibilities

#### 1. `/src/routes/` - Routing Layer
**Purpose**: Define API endpoints and map them to controller methods

**Key Files**:
- `index.ts` - Main router that aggregates all route modules
- `commission.route.ts` - Commission-related endpoints
- `user.route.ts` - User management endpoints
- `auth.route.ts` - Authentication endpoints
- `transaction.route.ts` - Transaction endpoints
- `site.route.ts` - Site management endpoints
- `category.route.ts` - Category management endpoints
- `role.route.ts` - Role management endpoints
- `player.route.ts` - Player-related endpoints
- `network-statistics.routes.ts` - Network statistics endpoints
- `top-performer.routes.ts` - Top performer analytics endpoints

**Responsibilities**:
- HTTP method and path mapping
- Route-specific middleware application
- Parameter extraction from URL/query/body
- Async error handling with `catchAsync` wrapper
- Input validation using Celebrate/Joi schemas

**Example Structure**:
```typescript
// commission.route.ts
export default (app: Router) => {
  app.use("/commission", route);
  
  route.post("/create", 
    catchAsync(async (req, res, next) => {
      const response = await CommissionController.createCommission(req, res, next);
      res.status(200).json(response);
    })
  );
  
  route.get("/summaries",
    catchAsync(async (req, res, next) => {
      const response = await CommissionController.getCommissionSummaries(req, res, next);
      res.status(200).json(response);
    })
  );
};
```

#### 2. `/src/controllers/` - Controller Layer
**Purpose**: Handle HTTP requests, validate input, and orchestrate service calls

**Key Files**:
- `commission.controller.ts` - Commission business operations
- `user.controller.ts` - User management operations
- `auth.controller.ts` - Authentication operations
- `transaction.controller.ts` - Transaction operations
- `site.controller.ts` - Site management operations
- `category.controller.ts` - Category management operations
- `role.controller.ts` - Role management operations
- `player.controller.ts` - Player-related operations
- `network-statistics.controller.ts` - Network statistics operations
- `top-performer.controller.ts` - Top performer analytics operations

**Responsibilities**:
- Request parameter extraction and validation
- User authentication and authorization checks
- Service layer method invocation
- Response formatting and HTTP status code setting
- Error handling and propagation

**Example Structure**:
```typescript
// commission.controller.ts
class CommissionController {
  public static async getCommissionSummaries(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      
      // Authentication validation
      if (!user || !user.roleId) {
        return new ApiResponse(
          ResponseCodes.UNAUTHORIZED.code,
          "Unauthorized - User details not found",
          null
        );
      }

      // Get user with role details
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });

      // Service layer call
      const commissionService = Container.get(CommissionService);
      const summaries = await commissionService.getCommissionSummaries({
        id: userWithRole.id,
        role: { name: userWithRole.role.name },
      });

      // Response formatting
      return new ApiResponse(
        ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.message,
        summaries
      );
    } catch (error) {
      next(error);
    }
  }
}
```

#### 3. `/src/services/` - Service Layer
**Purpose**: Implement business logic, calculations, and coordinate multiple data operations

**Key Files**:
- `commission.service.ts` - Commission calculations and business rules
- `auth.service.ts` - Authentication and JWT handling
- `user.service.ts` - User management business logic
- `site.service.ts` - Site management business logic
- `category.service.ts` - Category management business logic
- `role.service.ts` - Role management business logic
- `player.service.ts` - Player-related business logic
- `network-statistics.service.ts` - Network statistics calculations
- `top-performer.service.ts` - Top performer analytics business logic
- `transaction.service.ts` - Transaction processing business logic

**Responsibilities**:
- Complex business rule implementation
- Data transformation and aggregation
- Commission calculations and settlement logic
- Cross-entity operations and transactions
- Integration with external services
- Caching and performance optimization

**Example Structure**:
```typescript
// commission.service.ts
@Service()
class CommissionService {
  private commissionDao: CommissionDao;
  private roleDao: RoleDao;
  private commissionSummaryDao: GenerateCommission;
  private userDao: UserDao;

  constructor() {
    this.commissionDao = new CommissionDao();
    this.roleDao = new RoleDao();
    this.commissionSummaryDao = new GenerateCommission();
    this.userDao = new UserDao();
  }

  public async getCommissionSummaries(user: { id: string; role: { name: string }; }) {
    const roleName = user.role.name.toLowerCase() as UserRole;
    
    // Business logic for different user roles
    switch (roleName) {
      case UserRole.SUPER_ADMIN:
        return await this.getSuperAdminCommissionSummaries(user.id);
      case UserRole.OPERATOR:
        return await this.getOperatorCommissionSummaries(user.id);
      case UserRole.PLATINUM:
        return await this.getPlatinumCommissionSummaries(user.id);
      case UserRole.GOLDEN:
        return await this.getGoldenCommissionSummaries(user.id);
      default:
        throw new Error("Invalid user role");
    }
  }
}
```

#### 4. `/src/daos/` - Data Access Layer
**Purpose**: Handle all database operations and data persistence

**Key Files**:
- `commission.dao.ts` - Commission data operations
- `user.dao.ts` - User data operations
- `transaction.dao.ts` - Transaction data operations
- `generateCommission.ts` - Commission calculation utilities
- `site.dao.ts` - Site data operations
- `category.dao.ts` - Category data operations
- `role.dao.ts` - Role data operations
- `network-statistics.dao.ts` - Network statistics data operations

**Responsibilities**:
- Database query construction and execution
- Data validation before persistence
- Complex query optimization
- Raw SQL for performance-critical operations
- Transaction management for data consistency

**Example Structure**:
```typescript
// commission.dao.ts
class CommissionDao {
  public async createCommission(commission: any): Promise<Commission> {
    try {
      const newCommission = await prisma.commission.create({
        data: commission,
      });
      return newCommission;
    } catch (error) {
      throw new Error(`Error creating commission: ${error}`);
    }
  }

  public async getCommissionByUserId(userId: string): Promise<Commission[]> {
    try {
      const commissions = await prisma.commission.findMany({
        where: { userId },
        include: {
          user: true,
          role: true,
          site: true,
          category: true,
        },
      });
      return commissions;
    } catch (error) {
      throw new Error(`Error fetching commission by user ID: ${error}`);
    }
  }
}
```

#### 5. `/src/common/` - Shared Utilities
**Purpose**: Provide shared functionality across all layers

**Subdirectories**:

##### `/src/common/config/`
- `index.ts` - Main configuration aggregation
- `envConfig.ts` - Environment-specific configuration
- `constants.ts` - Application constants and enums
- `response.ts` - Standardized response structure
- `responseCodes.ts` - Response code definitions

##### `/src/common/middlewares/`
- `checkAuthAndAttachCurrentUser.ts` - JWT authentication middleware
- `attachCurrentUser.ts` - User context attachment
- `isAuth.ts` - Basic authentication check
- `index.ts` - Middleware aggregation

##### `/src/common/lib/`
- `catchAsync.ts` - Async error handling wrapper
- `errorHandler.ts` - Global error handling
- `jwtHelper.ts` - JWT token utilities
- `bcryptHelper.ts` - Password hashing utilities

##### `/src/common/logger/`
- `index.ts` - Logger configuration
- `morgan.ts` - HTTP request logging

##### `/src/common/loaders/`
- `index.ts` - Application loader orchestration
- `express.ts` - Express server configuration

#### 6. `/src/data/` - Static Data
**Purpose**: Store static configuration data and constants

**Responsibilities**:
- Static lookup data
- Configuration templates
- Default values and constants

## Request-Response Flow

### Detailed Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │───▶│  Load Balancer  │───▶│  Express App    │
│  (Frontend/API) │    │    (Optional)   │    │   (server.ts)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │   Middleware    │
                                              │     Stack       │
                                              │                 │
                                              │ 1. CORS         │
                                              │ 2. Body Parser  │
                                              │ 3. Compression  │
                                              │ 4. Morgan Log   │
                                              │ 5. JWT Auth     │
                                              │ 6. User Attach  │
                                              └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  Route Handler  │
                                              │                 │
                                              │ /api/v1/*       │
                                              │ Pattern Match   │
                                              │ Method Check    │
                                              └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │   Controller    │
                                              │                 │
                                              │ • Validation    │
                                              │ • Auth Check    │
                                              │ • Service Call  │
                                              └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │    Service      │
                                              │                 │
                                              │ • Business      │
                                              │   Logic         │
                                              │ • Calculations  │
                                              │ • DAO Calls     │
                                              └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │      DAO        │
                                              │                 │
                                              │ • Query Build   │
                                              │ • DB Execute    │
                                              │ • Data Map      │
                                              └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │   Database      │
                                              │ (PostgreSQL)    │
                                              │                 │
                                              │ • Query Exec    │
                                              │ • Result Set    │
                                              └─────────────────┘
```

### Step-by-Step Request Processing

#### 1. **Request Initiation**
```typescript
// Client makes HTTP request
fetch('/api/v1/commission/summaries', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer jwt_token_here',
    'Content-Type': 'application/json'
  }
})
```

#### 2. **Middleware Processing**
```typescript
// server.ts - Express server setup
class Server {
  private async start(): Promise<void> {
    const appLoader = new AppLoader(this.app);
    await appLoader.load(); // Loads all middleware
  }
}

// express.ts - Middleware stack
public async load(): Promise<void> {
  this.app.enable("trust proxy");
  this.app.use(cors());                           // CORS handling
  this.app.use(express.json());                  // Body parsing
  this.app.use(express.urlencoded({ extended: false }));
  this.app.use(compression());                   // Response compression
  this.app.use(morganMiddleware);                // Request logging
  this.app.use(checkAuthAndAttachCurrentUser);   // JWT authentication
  this.app.use("/api/v1", routes.getRouter());   // Route mounting
}
```

#### 3. **Route Resolution**
```typescript
// routes/index.ts - Route aggregation
class Routes {
  private initializeRoutes() {
    authRoute(this.router);
    userRoute(this.router);
    commissionRoute(this.router);        // Our target route
    // ... other routes
  }
}

// routes/commission.route.ts - Specific route handling
export default (app: Router) => {
  app.use("/commission", route);
  
  route.get("/summaries",                // Matches our request
    catchAsync(async (req, res, next) => {
      const response = await CommissionController.getCommissionSummaries(req, res, next);
      res.status(200).json(response);
    })
  );
};
```

#### 4. **Controller Processing**
```typescript
// controllers/commission.controller.ts
class CommissionController {
  public static async getCommissionSummaries(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extract user from middleware-attached context
      const user = req.user;
      
      // 2. Validate authentication
      if (!user || !user.roleId) {
        return new ApiResponse(ResponseCodes.UNAUTHORIZED.code, "Unauthorized", null);
      }

      // 3. Get user with role details
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });

      // 4. Delegate to service layer
      const commissionService = Container.get(CommissionService);
      const summaries = await commissionService.getCommissionSummaries({
        id: userWithRole.id,
        role: { name: userWithRole.role.name },
      });

      // 5. Format and return response
      return new ApiResponse(
        ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.message,
        summaries
      );
    } catch (error) {
      next(error); // Pass to error handling middleware
    }
  }
}
```

#### 5. **Service Layer Processing**
```typescript
// services/commission.service.ts
@Service()
class CommissionService {
  public async getCommissionSummaries(user: { id: string; role: { name: string }; }) {
    const roleName = user.role.name.toLowerCase() as UserRole;
    
    // Business logic based on user role
    switch (roleName) {
      case UserRole.SUPER_ADMIN:
        return await this.getSuperAdminSummaries(user.id);
      case UserRole.OPERATOR:
        return await this.getOperatorSummaries(user.id);
      // ... other roles
    }
  }

  private async getSuperAdminSummaries(userId: string) {
    // 1. Get date ranges for commission cycles
    const { cycleStartDate, cycleEndDate } = await this.getPreviousCompletedCycleDates();
    
    // 2. Delegate to DAO for data retrieval
    const summaries = await this.commissionDao.getCommissionSummariesForSuperAdmin();
    
    // 3. Process and transform data
    const processedSummaries = this.processCommissionData(summaries);
    
    // 4. Apply business rules and calculations
    const enrichedSummaries = await this.enrichWithCalculations(processedSummaries);
    
    return enrichedSummaries;
  }
}
```

#### 6. **Data Access Layer Processing**
```typescript
// daos/commission.dao.ts
class CommissionDao {
  public async getCommissionSummariesForSuperAdmin() {
    try {
      const summaries = await prisma.commissionSummary.findMany({
        where: {
          // Complex filtering logic
          role: { name: UserRole.OPERATOR },
          settledBySuperadmin: false,
        },
        include: {
          user: {
            include: {
              role: true,
              children: { include: { role: true } }
            }
          },
          category: true,
          Site: true,
        },
        orderBy: [
          { createdAt: 'desc' },
          { categoryName: 'asc' }
        ]
      });
      
      return summaries;
    } catch (error) {
      throw new Error(`Error fetching commission summaries: ${error}`);
    }
  }
}
```

#### 7. **Database Query Execution**
```sql
-- Generated Prisma query (simplified)
SELECT 
  cs.*,
  u.id as user_id, u.username, u.firstName, u.lastName,
  r.id as role_id, r.name as role_name,
  c.id as category_id, c.name as category_name,
  s.id as site_id, s.name as site_name
FROM commission_summaries cs
LEFT JOIN users u ON cs.userId = u.id
LEFT JOIN roles r ON u.roleId = r.id
LEFT JOIN categories c ON cs.categoryId = c.id
LEFT JOIN sites s ON cs.siteId = s.id
WHERE r.name = 'operator' 
  AND cs.settledBySuperadmin = false
ORDER BY cs.createdAt DESC, cs.categoryName ASC;
```

#### 8. **Response Processing & Return**
```typescript
// Data flows back through the layers:
// Database → DAO → Service → Controller → Route → Middleware → Client

// Final response format:
{
  "code": "2003",
  "message": "Commission summaries fetched successfully",
  "data": {
    "userId": "user_id_here",
    "roleName": "superadmin",
    "summaries": [
      {
        "date": "2024-01-15",
        "categoryId": "cat_id",
        "categoryName": "E-Games",
        "totalCommission": 15000.00,
        "netCommission": 14250.00,
        "pgFees": 750.00,
        "transactionCount": 1250,
        "status": "pending"
      }
    ],
    "totalAmount": 145000.00,
    "totalPgFees": 7250.00
  }
}
```

## Authentication & Authorization Flow

### JWT Authentication Middleware

```typescript
// middleware/checkAuthAndAttachCurrentUser.ts
export default async (req: JWTRequest, res: Response, next: NextFunction) => {
  try {
    // Skip authentication for excluded paths
    if (isExcludedPath(req.path)) {
      return next();
    }

    // JWT validation and user attachment
    await authAndAttachUser(req, res, async (err: any) => {
      if (err) {
        return next(err);
      }

      // Get user details from database
      const userDao = new UserDao();
      const user = await userDao.getUserByUsername(req.auth!.username);
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Attach user to request context
      req.user = user;
      req.role = user.roleId;
      
      return next();
    });
  } catch (e) {
    return next(e);
  }
};
```

### Role-Based Authorization

```typescript
// Example controller authorization check
public static async getCommissionSummaries(req: Request, res: Response, next: NextFunction) {
  // User is already attached by middleware
  const user = req.user;
  
  // Get role details
  const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true },
  });

  // Role-specific business logic
  const roleName = userWithRole.role.name.toLowerCase();
  
  switch (roleName) {
    case UserRole.SUPER_ADMIN:
      // Full access to all data
      break;
    case UserRole.OPERATOR:
      // Access to operator-level data only
      break;
    case UserRole.PLATINUM:
      // Access to platinum and below
      break;
    case UserRole.GOLDEN:
      // Access to own data only
      break;
    default:
      return new ApiResponse("4003", "Forbidden", null);
  }
}
```

## Data Access Patterns

### Prisma ORM Integration

```typescript
// Database connection setup (server.ts)
import { PrismaClient } from "./../prisma/generated/prisma";
const prisma = new PrismaClient();
export { prisma };

// Usage in DAOs
class CommissionDao {
  // Simple query
  public async getCommissionByUserId(userId: string): Promise<Commission[]> {
    return await prisma.commission.findMany({
      where: { userId },
      include: {
        user: true,
        role: true,
        site: true,
        category: true,
      },
    });
  }

  // Complex query with relations
  public async getCommissionSummariesWithFilters(filters: any) {
    return await prisma.commissionSummary.findMany({
      where: {
        AND: [
          { createdAt: { gte: filters.startDate } },
          { createdAt: { lte: filters.endDate } },
          { categoryName: filters.category || undefined },
        ]
      },
      include: {
        user: {
          include: {
            role: true,
            children: {
              include: {
                role: true,
                children: true
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { totalCommission: 'desc' }
      ]
    });
  }

  // Raw SQL for complex operations
  public async getComplexCommissionReport(params: any) {
    return await prisma.$queryRaw`
      SELECT 
        u.username,
        r.name as role,
        SUM(cs.totalCommission) as total,
        COUNT(*) as transaction_count
      FROM commission_summaries cs
      JOIN users u ON cs.userId = u.id
      JOIN roles r ON u.roleId = r.id
      WHERE cs.createdAt BETWEEN ${params.startDate} AND ${params.endDate}
      GROUP BY u.id, u.username, r.name
      ORDER BY total DESC
    `;
  }
}
```

## Error Handling Strategy

### Global Error Handler

```typescript
// common/lib/errorHandler.ts
class ErrorHandler {
  public static errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.error('Error stack:', err.stack);

    // Handle different error types
    if (err.isOperational) {
      return res.status(err.statusCode || 500).json({
        code: err.customErrorCode || "5001",
        message: err.message || "Internal Server Error",
        data: null
      });
    }

    // Handle Prisma errors
    if (err.code === 'P2002') {
      return res.status(409).json({
        code: "4009",
        message: "Duplicate entry",
        data: null
      });
    }

    // Default error response
    return res.status(500).json({
      code: "5001",
      message: "Internal Server Error",
      data: null
    });
  }
}

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
```

### Error Usage in Layers

```typescript
// In Controllers
route.get("/summaries",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await CommissionController.getCommissionSummaries(req, res, next);
      res.status(200).json(response);
    } catch (error) {
      next(error); // Passes to global error handler
    }
  })
);

// In Services
public async getCommissionSummaries(user: any) {
  try {
    // Business logic
    return result;
  } catch (error) {
    throw new Error(`Error in commission service: ${error.message}`);
  }
}

// In DAOs
public async getCommissionByUserId(userId: string) {
  try {
    return await prisma.commission.findMany({ where: { userId } });
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}
```

## Configuration Management

### Environment Configuration

```typescript
// common/config/index.ts
export default {
  port: parseInt(process.env.PORT || '8080', 10),
  isDev: process.env.IS_DEV == 'true',
  
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
  
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: '2592000s',
  
  mongo: {
    URL: process.env.MONGO_URL,
    user: process.env.MONGO_USERNAME,
    pass: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DB,
  },
  
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
  }
};
```

### Response Code Management

```typescript
// common/config/responseCodes.ts
export const ResponseCodes = {
  // Success codes
  COMMISSION_CREATED_SUCCESSFULLY: {
    code: "2001",
    message: "Commission created successfully"
  },
  COMMISSION_FETCHED_SUCCESSFULLY: {
    code: "2003",
    message: "Commission summaries fetched successfully"
  },
  
  // Error codes
  UNAUTHORIZED: {
    code: "4001",
    message: "Unauthorized"
  },
  INVALID_USERNAME_OR_PASSWORD: {
    code: "4002",
    message: "Invalid username or password"
  },
  
  // Server errors
  INTERNAL_SERVER_ERROR: {
    code: "5001",
    message: "Internal server error"
  }
};
```

## Commission API Example Flow

Let's trace a complete commission API request through all layers:

### Request: `GET /api/v1/commission/summaries`

#### 1. **Server Entry Point**
```typescript
// server.ts
const server = new Server();
server.initialize(); // Starts Express server on port 8080
```

#### 2. **Middleware Stack Processing**
```typescript
// common/loaders/express.ts
this.app.use(cors());                           // Enable CORS
this.app.use(express.json());                  // Parse JSON bodies
this.app.use(morganMiddleware);                // Log requests
this.app.use(checkAuthAndAttachCurrentUser);   // Authenticate & attach user
this.app.use("/api/v1", routes.getRouter());   // Mount API routes
```

#### 3. **Route Resolution**
```typescript
// routes/commission.route.ts
app.use("/commission", route);

route.get("/summaries",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const response = await CommissionController.getCommissionSummaries(req, res, next);
    if (!res.headersSent && response) {
      return res.status(200).json(response);
    }
  })
);
```

#### 4. **Controller Processing**
```typescript
// controllers/commission.controller.ts
public static async getCommissionSummaries(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Validate user authentication (done by middleware)
    const user = req.user;
    if (!user || !user.roleId) {
      return new ApiResponse(ResponseCodes.UNAUTHORIZED.code, "Unauthorized", null);
    }

    // 2. Get user with role details
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    // 3. Call service layer
    const commissionService = Container.get(CommissionService);
    const summaries = await commissionService.getCommissionSummaries({
      id: userWithRole.id,
      role: { name: userWithRole.role.name },
    });

    // 4. Return formatted response
    return new ApiResponse(
      ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.code,
      ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.message,
      summaries
    );
  } catch (error) {
    next(error);
  }
}
```

#### 5. **Service Layer Processing**
```typescript
// services/commission.service.ts
@Service()
class CommissionService {
  public async getCommissionSummaries(user: { id: string; role: { name: string }; }) {
    const roleName = user.role.name.toLowerCase() as UserRole;
    
    // Get commission cycle dates
    const { cycleStartDate, cycleEndDate } = await this.getPreviousCompletedCycleDates();
    
    // Role-based business logic
    switch (roleName) {
      case UserRole.SUPER_ADMIN:
        return await this.getSuperAdminCommissionSummaries(user.id, cycleStartDate, cycleEndDate);
      case UserRole.OPERATOR:
        return await this.getOperatorCommissionSummaries(user.id, cycleStartDate, cycleEndDate);
      // ... other roles
    }
  }

  private async getSuperAdminCommissionSummaries(userId: string, startDate: Date, endDate: Date) {
    // 1. Get all operator summaries
    const operatorSummaries = await this.commissionDao.getCommissionSummariesForSuperAdmin();
    
    // 2. Calculate payment gateway fees
    const pgFees = await this.getPaymentGatewayFee([userId], false, startDate, endDate);
    
    // 3. Group and aggregate data by platform
    const groupedData = this.groupSummariesByPlatform(operatorSummaries);
    
    // 4. Apply commission calculations
    const calculatedData = await this.applyCommissionCalculations(groupedData);
    
    return {
      userId,
      roleName: UserRole.SUPER_ADMIN,
      summaries: calculatedData,
      totalPgFees: pgFees,
      totalAmount: calculatedData.reduce((sum, item) => sum + item.totalCommission, 0)
    };
  }
}
```

#### 6. **DAO Layer Processing**
```typescript
// daos/commission.dao.ts
public async getCommissionSummariesForSuperAdmin() {
  try {
    const summaries = await prisma.commissionSummary.findMany({
      where: {
        role: { name: UserRole.OPERATOR },
        settledBySuperadmin: false,
      },
      include: {
        user: {
          include: {
            role: true,
            children: {
              include: {
                role: true,
                children: {
                  include: { role: true }
                }
              }
            }
          }
        },
        category: true,
        Site: true,
      },
      orderBy: [
        { createdAt: 'desc' },
        { categoryName: 'asc' }
      ]
    });
    
    return summaries;
  } catch (error) {
    throw new Error(`Error fetching super admin commission summaries: ${error}`);
  }
}
```

#### 7. **Database Query & Response**
```sql
-- Generated Prisma query
SELECT 
  cs.id, cs.userId, cs.categoryName, cs.totalCommission, 
  cs.netCommissionAvailablePayout, cs.paymentGatewayFee,
  cs.settledBySuperadmin, cs.createdAt,
  u.id as user_id, u.username, u.firstName, u.lastName,
  r.name as role_name,
  c.name as category_name,
  s.name as site_name
FROM commission_summaries cs
JOIN users u ON cs.userId = u.id
JOIN roles r ON u.roleId = r.id
JOIN categories c ON cs.categoryId = c.id
JOIN sites s ON cs.siteId = s.id
WHERE r.name = 'operator' AND cs.settledBySuperadmin = false
ORDER BY cs.createdAt DESC, cs.categoryName ASC;
```

#### 8. **Response Flow Back to Client**
```typescript
// Final response structure
{
  "code": "2003",
  "message": "Commission summaries fetched successfully",
  "data": {
    "userId": "cm9cjseyd0005iob9kv4hj608",
    "roleName": "superadmin",
    "summaries": {
      "E-Games": {
        "ALL OPERATORS": {
          "totalDeposit": 1250000.00,
          "totalWithdrawals": 875000.00,
          "totalBetAmount": 2100000.00,
          "netGGR": 315000.00,
          "grossCommission": 94500.00,
          "netCommissionAvailablePayout": 89775.00,
          "operators": [
            {
              "operatorId": "op_001",
              "operatorName": "Operator One",
              "totalCommission": 45000.00,
              "transactionCount": 1250
            }
          ]
        }
      },
      "Sports Betting": {
        "ALL OPERATORS": {
          "totalBetAmount": 850000.00,
          "netGGR": 42500.00,
          "grossCommission": 8500.00,
          "netCommissionAvailablePayout": 8075.00,
          "operators": [
            {
              "operatorId": "op_001",
              "operatorName": "Operator One",
              "totalCommission": 4250.00,
              "transactionCount": 450
            }
          ]
        }
      }
    },
    "totalAmount": 89775.00,
    "totalPgFees": 4725.00
  }
}
```

## Best Practices & Patterns

### 1. **Dependency Injection with TypeDI**
```typescript
// Service registration
@Service()
class CommissionService {
  // Automatic dependency injection
}

// Service consumption
const commissionService = Container.get(CommissionService);
```

### 2. **Error Handling Pattern**
```typescript
// Consistent error handling across all layers
try {
  // Operation
} catch (error) {
  // Log error
  logger.error(`Operation failed: ${error.message}`);
  // Throw with context
  throw new Error(`Context-specific error: ${error.message}`);
}
```

### 3. **Response Standardization**
```typescript
// Consistent response structure
class ApiResponse {
  constructor(
    public code: string,
    public message: string,
    public data: any = null
  ) {}
}

// Usage
return new ApiResponse(
  ResponseCodes.SUCCESS.code,
  ResponseCodes.SUCCESS.message,
  responseData
);
```

### 4. **Async Wrapper Pattern**
```typescript
// Automatic error handling for async routes
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Usage
route.get("/endpoint", catchAsync(async (req, res, next) => {
  // No try/catch needed - errors automatically passed to error handler
  const result = await someAsyncOperation();
  res.json(result);
}));
```

### 5. **Input Validation Pattern**
```typescript
// Schema-based validation with Celebrate/Joi
const createCommissionSchema = Joi.object({
  roleId: Joi.string().required(),
  siteId: Joi.string().required(),
  userId: Joi.string().required(),
  categoryId: Joi.string().required(),
  commissionPercentage: Joi.number().min(0).max(100).required()
});

// Route with validation
route.post("/create",
  celebrate({ [Segments.BODY]: createCommissionSchema }),
  catchAsync(controllerMethod)
);
```

### 6. **Database Transaction Pattern**
```typescript
// Transactional operations
async function createCommissionWithHistory(commissionData: any) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create commission
    const commission = await tx.commission.create({
      data: commissionData
    });
    
    // 2. Create audit log
    await tx.auditLog.create({
      data: {
        action: 'CREATE_COMMISSION',
        entityId: commission.id,
        userId: commissionData.userId
      }
    });
    
    return commission;
  });
}
```

## Recent Enhancements & New Features

### Network Statistics Module

The system now includes comprehensive network statistics tracking to monitor user hierarchies and performance metrics across different user roles.

#### Network Statistics Architecture

```typescript
// network-statistics.routes.ts
export default (app: Router) => {
  app.use("/network-statistics", router);
  
  router.get("/", networkStatisticsController.getNetworkStatistics);
  router.post("/calculate", networkStatisticsController.calculateAndUpdateNetworkStatistics);
};

// network-statistics.controller.ts
class NetworkStatisticsController {
  async getNetworkStatistics(req: Request, res: Response, next: NextFunction) {
    // Retrieves network statistics based on user role and hierarchy
  }
  
  async calculateAndUpdateNetworkStatistics(req: Request, res: Response, next: NextFunction) {
    // Calculates and updates network statistics for all user roles
  }
}

// network-statistics.dao.ts
export class NetworkStatisticsDao {
  async calculateAndUpdateNetworkStatistics(): Promise<void> {
    // Complex algorithm to calculate user counts by role and status
    // Handles hierarchical user relationships (Super Admin -> Operator -> Platinum -> Golden)
  }
}
```

#### Key Features:
- **Hierarchical User Counting**: Tracks approved, pending, declined, and suspended users across all roles
- **Role-based Statistics**: Separate calculations for Super Admin, Operator, Platinum, and Golden users
- **Parent-Child Relationship Tracking**: Maintains network structure integrity
- **Real-time Updates**: Provides current network statistics and performance metrics

### Top Performer Module

Enhanced analytics module to track and identify top performing users across different metrics.

#### Top Performer Architecture

```typescript
// top-performer.routes.ts
export default (app: Router) => {
  app.use("/top-performers", router);
  
  router.post("/calculate", topPerformerController.calculateTopPerformers);
};

// top-performer.controller.ts
class TopPerformerController {
  async calculateTopPerformers(req: Request, res: Response, next: NextFunction) {
    // Analyzes user performance metrics and identifies top performers
  }
}
```

#### Key Features:
- **Performance Analytics**: Comprehensive analysis of user performance metrics
- **Ranking System**: Dynamic ranking based on various performance indicators
- **Data-driven Insights**: Provides actionable insights for network optimization

### Enhanced Commission Features

Recent enhancements to the commission system include:

#### New Commission Endpoints:
- `/api/v1/commission/unsettled-commission` - Retrieve unsettled commission data
- `/api/v1/commission/payment-gateway-fees` - Get payment gateway fee information
- `/api/v1/commission/commissionByCategory` - Category-based commission analysis
- `/api/v1/commission/running-tally` - Real-time commission tallies
- `/api/v1/commission/pending-settlements` - Settlement management
- `/api/v1/commission/total-breakdown` - Comprehensive commission breakdowns

#### Enhanced Error Handling:
```typescript
// Improved error handling in commission routes
route.get("/summaries",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await CommissionController.getCommissionSummaries(req, res, next);
      if (!res.headersSent && response) {
        return res.status(200).json(response);
      }
    } catch (error) {
      if (!res.headersSent) {
        next(error);
      }
    }
  })
);
```

### Enhanced User Management

Additional user management capabilities:

#### New User Endpoints:
- `/api/v1/user/partner/register` - Partner registration
- `/api/v1/user/partner/approval-list` - Partner approval workflow
- `/api/v1/user/partner/approve` - Partner approval actions
- `/api/v1/user/payoutAndWalletBalance` - Financial balance tracking
- `/api/v1/user/download-report` - Report generation and download

### Configuration Enhancements

Extended configuration support for external integrations:

```typescript
// Enhanced configuration management
export default {
  skillzLive: {
    apiKey: process.env.SKILLZLIVE_API_KEY,
    salt: process.env.SKILLZLIVE_SALT,
    redirectUrl: process.env.SKILLZLIVE_REDIRECT_URL,
  },
  
  pokerServer: {
    secretKey: process.env.POKERSERVER_SECRET_KEY,
    baseUrl: process.env.POKERSERVER_BASE_URL,
    clientId: process.env.POKERSERVER_CLIENTID,
  },
  
  trackierConfig: {
    trackier_baseUrl: process.env.TRACKIER_BASE_URL,
    trackier_clientId: process.env.TRACKIER_CLIENT_ID,
    trackier_customerId: process.env.TRACKIER_CUSTOMER_ID,
  }
};
```

This comprehensive documentation provides a complete understanding of how the P-Agent System API is structured and how data flows through each layer from the initial HTTP request to the final database query and back to the client response. The system continues to evolve with new features and enhancements while maintaining architectural consistency and best practices.
