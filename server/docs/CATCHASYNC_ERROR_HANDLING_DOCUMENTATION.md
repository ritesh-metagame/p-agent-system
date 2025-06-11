# CatchAsync Wrapper & Error Handling System Documentation

## Table of Contents
1. [Introduction: Why Error Handling Matters](#introduction-why-error-handling-matters)
2. [Understanding Async/Await and Promises](#understanding-asyncawait-and-promises)
3. [The Problem: Unhandled Promise Rejections](#the-problem-unhandled-promise-rejections)
4. [The Solution: CatchAsync Wrapper](#the-solution-catchasync-wrapper)
5. [How CatchAsync Works Internally](#how-catchasync-works-internally)
6. [Real Examples from P-Agent System](#real-examples-from-p-agent-system)
7. [Error Flow Through the Application](#error-flow-through-the-application)
8. [Error Types and Handling Strategies](#error-types-and-handling-strategies)
9. [Error Handler Implementation](#error-handler-implementation)
10. [Best Practices and Common Pitfalls](#best-practices-and-common-pitfalls)
11. [Advanced Error Handling Patterns](#advanced-error-handling-patterns)

---

## Introduction: Why Error Handling Matters

Imagine you're building a house. What happens if you don't plan for things that might go wrong? 🏠

- The roof might leak during rain ☔
- The electrical system might short-circuit ⚡
- The plumbing might burst 💧

In programming, errors are like these unexpected problems. Without proper error handling, your application can:
- Crash unexpectedly 💥
- Lose user data 📊
- Show confusing error messages to users 😵
- Make debugging nearly impossible 🔍

The **CatchAsync wrapper** is like having a super-smart safety system that catches problems before they can crash your application.

---

## Understanding Async/Await and Promises

### What are Promises? 🤝

Think of a promise like ordering food at a restaurant:

```javascript
// You place an order (create a promise)
const foodOrder = restaurant.orderPizza();

// Three things can happen:
// 1. ✅ Success: You get your pizza
// 2. ❌ Rejection: They're out of ingredients
// 3. ⏳ Pending: Still cooking...
```

### What is Async/Await? ⏰

Async/await is like having a waiter who tells you exactly when your food is ready:

```javascript
// Without async/await (confusing callbacks)
restaurant.orderPizza()
  .then(pizza => eat(pizza))
  .then(result => payBill(result))
  .catch(error => handleError(error));

// With async/await (much cleaner!)
async function orderAndEat() {
  try {
    const pizza = await restaurant.orderPizza();
    const result = await eat(pizza);
    await payBill(result);
  } catch (error) {
    handleError(error);
  }
}
```

### The Challenge with Express Routes 🚀

In Express.js, route handlers can be async functions. Here's the problem:

```javascript
// ❌ PROBLEMATIC: Unhandled errors crash the app
app.get('/users', async (req, res) => {
  const users = await User.findAll(); // What if this fails?
  res.json(users);
});

// ✅ BETTER: Manual error handling
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

But writing `try/catch` in every route is repetitive and error-prone! 😰

---

## The Problem: Unhandled Promise Rejections

### What Happens Without Proper Error Handling? 💀

```javascript
// This route has a hidden bomb 💣
app.get('/commission/:id', async (req, res) => {
  // If this database call fails...
  const commission = await db.commission.findById(req.params.id);
  
  // And we don't catch the error...
  res.json(commission);
  
  // The entire Node.js process might crash! 💥
});
```

### Real-World Consequences 🌍

1. **Application Crashes**: Unhandled promise rejections can terminate the entire Node.js process
2. **Memory Leaks**: Uncaught errors can prevent garbage collection
3. **Silent Failures**: Errors might be swallowed without any indication
4. **Poor User Experience**: Users see generic 500 errors or hanging requests
5. **Difficult Debugging**: No proper error logs or stack traces

### Node.js Warning Example 🚨

```bash
# This scary message appears in your console:
(node:1234) UnhandledPromiseRejectionWarning: Error: Database connection failed
    at DatabaseService.connect (/app/services/database.js:45:11)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
(node:1234) UnhandledPromiseRejectionWarning: Unhandled promise rejection. 
This error originated either by throwing inside of an async function without 
a catch block, or by rejecting a promise which was not handled with .catch().
```

---

## The Solution: CatchAsync Wrapper

### The Magic Function ✨

```typescript
// src/common/lib/catchAsync.ts
const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
```

### Breaking It Down Step by Step 🔍

Let's understand this function piece by piece:

#### 1. **Higher-Order Function** 🎭
```typescript
const catchAsync = (fn: Function) => {
  // This function takes another function as input
  // and returns a new function
}
```

Think of it like a wrapper for a present 🎁:
- `fn` is your original present (route handler)
- `catchAsync` is the wrapping paper
- The return value is the wrapped present

#### 2. **Express Middleware Signature** 🎯
```typescript
return (req: Request, res: Response, next: NextFunction) => {
  // This matches Express's expected function signature
  // req: incoming HTTP request
  // res: outgoing HTTP response  
  // next: function to call the next middleware
}
```

#### 3. **The Error Catching Magic** 🪄
```typescript
fn(req, res, next).catch(next);
```

This line does four crucial things:
1. **Calls your original function**: `fn(req, res, next)`
2. **Gets the promise**: Since `fn` is async, it returns a promise
3. **Catches any rejection**: `.catch(next)`
4. **Passes error to Express**: `next` with an error triggers Express error handling

### Visual Representation 📊

```
Original Route Handler:
┌─────────────────┐
│ async function  │
│ (req, res) => { │
│   // your code  │
│ }               │
└─────────────────┘

After CatchAsync Wrapping:
┌─────────────────────────────────────┐
│ (req, res, next) => {               │
│   fn(req, res, next)                │
│     .catch(next);  ← Error Safety!  │
│ }                                   │
└─────────────────────────────────────┘
```

---

## How CatchAsync Works Internally

### Step-by-Step Execution Flow 🔄

Let's trace through what happens when a request hits a route wrapped with `catchAsync`:

#### 1. **Request Arrives** 📨
```typescript
// User makes request: GET /api/commission/123
```

#### 2. **Express Calls Wrapped Function** 🎯
```typescript
// Express calls: wrappedHandler(req, res, next)
(req, res, next) => {
  fn(req, res, next).catch(next);
}
```

#### 3. **Original Handler Executes** ⚡
```typescript
// Your actual route handler runs:
async (req, res, next) => {
  const commission = await CommissionService.getById(req.params.id);
  res.json({ success: true, data: commission });
}
```

#### 4A. **Success Path** ✅
```typescript
// If everything works:
// 1. Database query succeeds
// 2. Response is sent to client
// 3. Promise resolves successfully
// 4. .catch(next) never executes
```

#### 4B. **Error Path** ❌
```typescript
// If something fails:
// 1. Database query throws error
// 2. Promise rejects
// 3. .catch(next) executes
// 4. next(error) is called
// 5. Express error middleware takes over
```

### Memory and Performance Impact 📈

#### Memory Usage 🧠
```typescript
// Each catchAsync wrapper creates a closure
const wrappedHandler = catchAsync(originalHandler);

// Memory footprint:
// - Original function: ~100 bytes
// - Wrapper closure: ~50 bytes  
// - Total overhead: ~150 bytes per route
```

#### Performance Characteristics ⚡
- **Execution overhead**: ~0.001ms per request (negligible)
- **Error handling**: ~10-50ms when errors occur
- **Memory leaks**: Prevented by proper error handling
- **CPU usage**: Minimal impact on normal operations

---

## Real Examples from P-Agent System

### Example 1: Commission Route Handler 💰

#### Without CatchAsync (Dangerous) ❌
```typescript
// commission.route.ts - DON'T DO THIS!
route.get('/settlements/:id', async (req, res) => {
  // Multiple potential failure points:
  const { id } = req.params;
  const settlement = await CommissionService.getSettlementById(id); // Database error?
  const formatted = await SettlementFormatter.format(settlement);    // Processing error?
  const validated = await SettlementValidator.validate(formatted);   // Validation error?
  
  res.json({ success: true, data: validated });
  // If ANY of these fail, the app might crash! 💥
});
```

#### With CatchAsync (Safe) ✅
```typescript
// commission.route.ts - ACTUAL P-AGENT CODE
route.get('/settlements/:id', 
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required()
    }
  }),
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const settlement = await CommissionService.getSettlementById(id);
    const formatted = await SettlementFormatter.format(settlement);
    const validated = await SettlementValidator.validate(formatted);
    
    res.json({ success: true, data: validated });
    // Any error automatically flows to Express error handler! 🛡️
  })
);
```

### Example 2: User Authentication Route 🔐

#### Real P-Agent Implementation
```typescript
// auth.route.ts
route.post('/login', 
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    }
  }),
  catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    // Multiple async operations that could fail:
    const user = await AuthService.validateCredentials(email, password);
    const token = await JWTService.generateToken(user);
    const sessionData = await SessionService.createSession(user.id, token);
    
    res.json({
      success: true,
      token,
      user: user.toPublicJSON(),
      session: sessionData
    });
  })
);
```

### Example 3: Complex Commission Calculation 🧮

```typescript
// commission.route.ts
route.post('/calculate-monthly', 
  authenticate,
  authorize(['super_admin', 'operator']),
  celebrate({
    [Segments.BODY]: {
      month: Joi.number().min(1).max(12).required(),
      year: Joi.number().min(2020).required(),
      operatorIds: Joi.array().items(Joi.string()).optional()
    }
  }),
  catchAsync(async (req: Request, res: Response) => {
    const { month, year, operatorIds } = req.body;
    const requestingUser = req.user;
    
    // Complex business logic with multiple failure points:
    const dateRange = await DateCycleService.getMonthlyRange(month, year);
    const operators = await OperatorService.getByIds(operatorIds, requestingUser);
    const transactions = await TransactionService.getByDateRange(dateRange, operators);
    const calculations = await CommissionService.calculateBulkCommissions(transactions);
    const settlements = await SettlementService.processCalculations(calculations);
    const notifications = await NotificationService.sendCalculationComplete(settlements);
    
    res.json({
      success: true,
      data: {
        settlements,
        calculatedAt: new Date().toISOString(),
        processedTransactions: transactions.length,
        totalCommission: settlements.reduce((sum, s) => sum + s.amount, 0)
      }
    });
  })
);
```

### What Could Go Wrong? 🚨

In the above example, any of these could fail:
1. **DateCycleService.getMonthlyRange()**: Invalid date logic
2. **OperatorService.getByIds()**: Database connection issues
3. **TransactionService.getByDateRange()**: Query timeout
4. **CommissionService.calculateBulkCommissions()**: Mathematical overflow
5. **SettlementService.processCalculations()**: Payment gateway errors
6. **NotificationService.sendCalculationComplete()**: Email service down

Without `catchAsync`, any failure would potentially crash the server. With `catchAsync`, all errors are safely caught and handled! 🛡️

---

## Error Flow Through the Application

### The Complete Error Journey 🗺️

```
1. Request Arrives
   ↓
2. Route Handler (wrapped with catchAsync)
   ↓
3. Controller Method
   ↓
4. Service Layer
   ↓
5. Data Access Layer (DAO)
   ↓
6. Database/External API
   
   💥 ERROR OCCURS HERE
   
7. Error bubbles up through Promise chain
   ↓
8. catchAsync.catch(next) catches it
   ↓
9. Express Error Middleware
   ↓
10. Error Response sent to client
```

### Detailed Flow Diagram 📊

```
┌─────────────────────────────────────────┐
│ 1. HTTP Request                         │
│    GET /api/commission/settlements/123  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 2. Express Router                       │
│    • Route matching                     │
│    • Middleware execution               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 3. CatchAsync Wrapper                   │
│    (req, res, next) => {                │
│      fn(req, res, next).catch(next)     │
│    }                                    │ 
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 4. Route Handler                        │
│    async (req, res) => {                │
│      const data = await service.get();  │ 
│      res.json(data);                    │
│    }                                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 5. Service Layer                        │
│    CommissionService.getSettlementById()│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 6. Database Access                      │
│    await Settlement.findById(id)        │
│                                         │
│    💥DATABASE ERROR OCCURS HERE!       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 7. Error Propagation                    │
│    Promise rejects with error           │
│    Bubbles back up the chain            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 8. CatchAsync Catches Error             │
│    .catch(next) executes                │
│    next(error) called                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 9. Express Error Middleware             │
│    • Error logging                      │
│    • Error formatting                   │
│    • Response generation                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 10. HTTP Error Response                 │
│     {                                   │
│       "success": false,                 │
│       "error": "Settlement not found",  │
│       "statusCode": 404                 │
│     }                                   │
└─────────────────────────────────────────┘
```

### Express Error Middleware Stack 🏗️

```typescript
// src/common/loaders/express.ts
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // 1. Log the error
  logger.error('Express Error Handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // 2. Determine error type and response
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  
  // 3. Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

---

## Error Types and Handling Strategies

### 1. Database Errors 🗄️

#### Common Database Errors
```typescript
// Connection errors
await User.findById(id); 
// Possible errors:
// - MongoServerError: Connection timeout
// - MongoNetworkError: Server unreachable  
// - CastError: Invalid ObjectId format

// Query errors
await User.aggregate(complexPipeline);
// Possible errors:
// - MongoServerError: Pipeline syntax error
// - MongoTimeoutError: Query took too long
// - MemoryError: Result set too large
```

#### P-Agent Error Handling
```typescript
// commission.service.ts
async getSettlementById(id: string): Promise<Settlement> {
  try {
    const settlement = await Settlement.findById(id);
    if (!settlement) {
      throw new ApiError('Settlement not found', 404);
    }
    return settlement;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Re-throw our custom errors
    }
    
    // Handle database-specific errors
    if (error.name === 'CastError') {
      throw new ApiError('Invalid settlement ID format', 400);
    }
    
    if (error.name === 'MongoTimeoutError') {
      throw new ApiError('Database query timeout', 503);
    }
    
    // Generic database error
    throw new ApiError('Database operation failed', 500);
  }
}
```

### 2. Validation Errors 📋

#### Celebrate/Joi Validation
```typescript
// Automatic validation error handling
route.post('/create-settlement',
  celebrate({
    [Segments.BODY]: {
      operatorId: Joi.string().required(),
      amount: Joi.number().positive().required(),
      commissionType: Joi.string().valid('GGR', 'TURNOVER').required(),
      dateRange: Joi.object({
        start: Joi.date().required(),
        end: Joi.date().min(Joi.ref('start')).required()
      }).required()
    }
  }),
  catchAsync(async (req, res) => {
    // If validation fails, celebrate automatically throws error
    // catchAsync catches it and passes to error middleware
    const settlement = await CommissionService.createSettlement(req.body);
    res.json({ success: true, data: settlement });
  })
);
```

#### Custom Business Logic Validation
```typescript
// commission.service.ts
async createSettlement(data: CreateSettlementDTO): Promise<Settlement> {
  // Business rule validation
  if (data.amount <= 0) {
    throw new ApiError('Settlement amount must be positive', 400);
  }
  
  if (data.dateRange.end <= data.dateRange.start) {
    throw new ApiError('End date must be after start date', 400);
  }
  
  // Check if operator exists
  const operator = await Operator.findById(data.operatorId);
  if (!operator) {
    throw new ApiError('Operator not found', 404);
  }
  
  // Check for duplicate settlements
  const existing = await Settlement.findOne({
    operatorId: data.operatorId,
    'dateRange.start': data.dateRange.start,
    'dateRange.end': data.dateRange.end
  });
  
  if (existing) {
    throw new ApiError('Settlement already exists for this period', 409);
  }
  
  return await Settlement.create(data);
}
```

### 3. Authentication & Authorization Errors 🔐

#### JWT Token Errors
```typescript
// middleware/authenticate.ts
export const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new ApiError('Access token required', 401);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new ApiError('Invalid token - user not found', 401);
    }
    
    if (user.tokenVersion !== decoded.tokenVersion) {
      throw new ApiError('Token has been revoked', 401);
    }
    
    req.user = user;
    next();
  } catch (jwtError) {
    if (jwtError.name === 'TokenExpiredError') {
      throw new ApiError('Token has expired', 401);
    }
    
    if (jwtError.name === 'JsonWebTokenError') {
      throw new ApiError('Invalid token format', 401);
    }
    
    throw new ApiError('Token verification failed', 401);
  }
});
```

#### Role-Based Authorization
```typescript
// middleware/authorize.ts
export const authorize = (roles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError('Authentication required', 401);
    }
    
    if (!roles.includes(req.user.role)) {
      throw new ApiError('Insufficient permissions', 403);
    }
    
    // Additional role hierarchy checking
    if (req.user.role === 'operator' && req.params.operatorId !== req.user.id) {
      throw new ApiError('Access denied - can only access own data', 403);
    }
    
    next();
  });
};
```

### 4. External API Errors 🌐

#### Payment Gateway Integration
```typescript
// services/payment.service.ts
async processPayment(settlementId: string, amount: number): Promise<PaymentResult> {
  try {
    const response = await axios.post('https://payment-gateway.com/api/payments', {
      amount,
      currency: 'USD',
      reference: settlementId
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PAYMENT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // API returned error response
      const { status, data } = error.response;
      
      if (status === 400) {
        throw new ApiError(`Payment validation error: ${data.message}`, 400);
      }
      
      if (status === 401) {
        throw new ApiError('Payment gateway authentication failed', 502);
      }
      
      if (status === 429) {
        throw new ApiError('Payment gateway rate limit exceeded', 429);
      }
      
      throw new ApiError('Payment gateway error', 502);
    } else if (error.code === 'ECONNREFUSED') {
      throw new ApiError('Payment gateway unavailable', 503);
    } else if (error.code === 'ETIMEDOUT') {
      throw new ApiError('Payment gateway timeout', 504);
    } else {
      throw new ApiError('Payment processing failed', 500);
    }
  }
}
```

### 5. File System & Upload Errors 📁

```typescript
// services/file.service.ts
async uploadCommissionReport(file: Express.Multer.File): Promise<string> {
  try {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ApiError('Invalid file type. Only PDF and Excel files allowed', 400);
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new ApiError('File too large. Maximum size is 10MB', 400);
    }
    
    // Generate unique filename
    const filename = `commission-report-${Date.now()}-${file.originalname}`;
    const filePath = path.join(process.env.UPLOAD_DIR!, filename);
    
    // Save file
    await fs.writeFile(filePath, file.buffer);
    
    return filename;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error.code === 'ENOSPC') {
      throw new ApiError('Insufficient disk space', 507);
    }
    
    if (error.code === 'EACCES') {
      throw new ApiError('File permission denied', 500);
    }
    
    throw new ApiError('File upload failed', 500);
  }
}
```

---

## Error Handler Implementation

### ApiError Class 🎯

```typescript
// src/common/lib/appError.ts
class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly path?: string;

  constructor(
    message: string, 
    statusCode: number = 500, 
    isOperational: boolean = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Set error name
    this.name = this.constructor.name;
  }
  
  /**
   * Create a 400 Bad Request error
   */
  static badRequest(message: string): ApiError {
    return new ApiError(message, 400);
  }
  
  /**
   * Create a 401 Unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(message, 401);
  }
  
  /**
   * Create a 403 Forbidden error
   */
  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(message, 403);
  }
  
  /**
   * Create a 404 Not Found error
   */
  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, 404);
  }
  
  /**
   * Create a 409 Conflict error
   */
  static conflict(message: string): ApiError {
    return new ApiError(message, 409);
  }
  
  /**
   * Create a 500 Internal Server Error
   */
  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(message, 500);
  }
  
  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(this.path && { path: this.path })
      }
    };
  }
}
```

### Express Error Handler 🏗️

```typescript
// src/common/lib/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './appError';
import { logger } from './logger';

/**
 * Development error handler - includes stack traces
 */
const sendErrorDev = (err: Error, res: Response) => {
  const statusCode = (err as any).statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      name: err.name,
      message: err.message,
      statusCode,
      stack: err.stack,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Production error handler - minimal error details
 */
const sendErrorProd = (err: Error, res: Response) => {
  const statusCode = (err as any).statusCode || 500;
  
  // Only send error details for operational errors
  if (err instanceof ApiError && err.isOperational) {
    res.status(statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode,
        timestamp: new Date().toISOString()
      }
    });
  } else {
    // Programming errors - don't leak details
    res.status(500).json({
      success: false,
      error: {
        message: 'Something went wrong!',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Handle MongoDB CastError (invalid ObjectId)
 */
const handleCastErrorDB = (err: any): ApiError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(message, 400);
};

/**
 * Handle MongoDB duplicate key error
 */
const handleDuplicateFieldsDB = (err: any): ApiError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ApiError(message, 400);
};

/**
 * Handle MongoDB validation error
 */
const handleValidationErrorDB = (err: any): ApiError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ApiError(message, 400);
};

/**
 * Handle JWT token errors
 */
const handleJWTError = (): ApiError => {
  return new ApiError('Invalid token. Please log in again!', 401);
};

/**
 * Handle JWT token expired error
 */
const handleJWTExpiredError = (): ApiError => {
  return new ApiError('Your token has expired! Please log in again.', 401);
};

/**
 * Main error handling middleware
 */
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  logger.error('Global Error Handler:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString()
  });

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};
```

### Celebrate Validation Error Handler 📋

```typescript
// src/common/middleware/celebrateErrorHandler.ts
import { errors } from 'celebrate';
import { Request, Response, NextFunction } from 'express';

/**
 * Custom celebrate error handler
 */
export const celebrateErrorHandler = () => {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.joi) {
      // Extract validation details
      const errorDetails = err.joi.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation Error',
          statusCode: 400,
          details: errorDetails,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    next(err);
  };
};
```

---

## Best Practices and Common Pitfalls

### ✅ Best Practices

#### 1. **Always Use CatchAsync for Async Routes**
```typescript
// ✅ GOOD
route.get('/users', catchAsync(async (req, res) => {
  const users = await UserService.getAll();
  res.json(users);
}));

// ❌ BAD  
route.get('/users', async (req, res) => {
  const users = await UserService.getAll(); // Unhandled promise rejection!
  res.json(users);
});
```

#### 2. **Create Specific Error Types**
```typescript
// ✅ GOOD - Specific error with context
if (!user) {
  throw new ApiError('User not found', 404);
}

if (user.status === 'banned') {
  throw new ApiError('User account has been suspended', 403);
}

// ❌ BAD - Generic error
if (!user) {
  throw new Error('Something went wrong');
}
```

#### 3. **Log Errors with Context**
```typescript
// ✅ GOOD - Rich logging context
logger.error('Commission calculation failed', {
  operatorId: req.params.operatorId,
  userId: req.user.id,
  dateRange: req.body.dateRange,
  error: err.message,
  stack: err.stack,
  timestamp: new Date().toISOString()
});

// ❌ BAD - No context
logger.error(err.message);
```

#### 4. **Handle Different Error Types Appropriately**
```typescript
// ✅ GOOD - Specific handling for different scenarios
try {
  const result = await ExternalAPI.call();
} catch (error) {
  if (error.response?.status === 401) {
    throw new ApiError('External API authentication failed', 502);
  } else if (error.code === 'ECONNREFUSED') {
    throw new ApiError('External service unavailable', 503);
  } else {
    throw new ApiError('External API error', 502);
  }
}
```

#### 5. **Use Error Boundaries for Different Layers**
```typescript
// Service layer - business logic errors
class CommissionService {
  async calculateCommission(data: CommissionData) {
    if (data.amount <= 0) {
      throw new ApiError('Invalid commission amount', 400);
    }
    
    try {
      return await this.performCalculation(data);
    } catch (error) {
      throw new ApiError('Commission calculation failed', 500);
    }
  }
}

// Controller layer - request/response handling
export const calculateCommission = catchAsync(async (req, res) => {
  const commission = await CommissionService.calculateCommission(req.body);
  res.json({ success: true, data: commission });
});
```

### ❌ Common Pitfalls

#### 1. **Forgetting to Use CatchAsync**
```typescript
// ❌ DANGEROUS - Will crash the app if UserService.getById throws
route.get('/users/:id', async (req, res) => {
  const user = await UserService.getById(req.params.id);
  res.json(user);
});

// ✅ SAFE
route.get('/users/:id', catchAsync(async (req, res) => {
  const user = await UserService.getById(req.params.id);
  res.json(user);
}));
```

#### 2. **Swallowing Errors Silently**
```typescript
// ❌ BAD - Error is lost
try {
  await riskyOperation();
} catch (error) {
  // Silent failure - no logging, no handling
}

// ✅ GOOD - Proper error handling
try {
  await riskyOperation();
} catch (error) {
  logger.error('Risky operation failed', error);
  throw new ApiError('Operation failed', 500);
}
```

#### 3. **Exposing Sensitive Error Information**
```typescript
// ❌ BAD - Exposes internal details
catch (error) {
  res.status(500).json({
    error: error.message, // Might contain database connection strings!
    stack: error.stack    // Exposes file paths and internal structure
  });
}

// ✅ GOOD - Safe error response
catch (error) {
  logger.error('Internal error', error); // Log internally
  
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message // Safe, controlled message
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Internal server error' // Generic message
    });
  }
}
```

#### 4. **Not Handling Promise Chains Properly**
```typescript
// ❌ BAD - Unhandled promise rejection
route.post('/process', catchAsync(async (req, res) => {
  const result = await step1();
  
  // This promise is not awaited!
  step2(result).then(data => {
    // If this fails, it won't be caught by catchAsync
    logger.info('Step 2 completed');
  });
  
  res.json({ success: true });
}));

// ✅ GOOD - All promises are properly awaited
route.post('/process', catchAsync(async (req, res) => {
  const result = await step1();
  const data = await step2(result);
  
  logger.info('Step 2 completed');
  res.json({ success: true, data });
}));
```

#### 5. **Throwing Errors in Synchronous Code Without Return**
```typescript
// ❌ BAD - Code continues executing after throw
function validateUser(user) {
  if (!user.email) {
    throw new ApiError('Email is required', 400);
    console.log('This will never execute'); // Dead code
  }
  
  if (!user.password) {
    throw new ApiError('Password is required', 400);
    console.log('This will never execute either'); // Dead code
  }
  
  return true;
}
```

### 🛡️ Error Handling Checklist

Before deploying any route, ensure:

- [ ] **CatchAsync Usage**: All async route handlers are wrapped with `catchAsync`
- [ ] **Error Types**: Custom `ApiError` instances are used for business logic errors
- [ ] **Logging**: Errors are logged with sufficient context for debugging
- [ ] **Security**: Error responses don't expose sensitive information
- [ ] **Status Codes**: Appropriate HTTP status codes are used
- [ ] **Validation**: Input validation errors are handled gracefully
- [ ] **External APIs**: Third-party service errors are caught and handled
- [ ] **Database Errors**: Database connection and query errors are handled
- [ ] **Testing**: Error scenarios are covered in tests

---

## Advanced Error Handling Patterns

### 1. Circuit Breaker Pattern 🔌

For handling external service failures:

```typescript
// services/circuitBreaker.service.ts
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000 // 1 minute
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new ApiError('Service temporarily unavailable', 503);
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage in service
const paymentGatewayCircuit = new CircuitBreaker(3, 30000);

async processPayment(data: PaymentData): Promise<PaymentResult> {
  return await paymentGatewayCircuit.execute(async () => {
    return await PaymentGateway.charge(data);
  });
}
```

### 2. Retry Pattern with Exponential Backoff ⏰

```typescript
// utils/retry.ts
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error instanceof ApiError && error.statusCode < 500) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} for operation`, {
        error: error.message,
        delay
      });
    }
  }
  
  throw new ApiError(`Operation failed after ${maxRetries} retries: ${lastError.message}`, 500);
}

// Usage
const user = await withRetry(
  () => UserService.getById(userId),
  3,
  1000
);
```

### 3. Graceful Shutdown Handling 🏁

```typescript
// server.ts
class GracefulServer {
  private server?: Server;
  private isShuttingDown = false;
  
  start(app: Express, port: number) {
    this.server = app.listen(port, () => {
      logger.info(`Server started on port ${port}`);
    });
    
    this.setupGracefulShutdown();
  }
  
  private setupGracefulShutdown() {
    // Handle different shutdown signals
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.shutdown('uncaughtException', 1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', { promise, reason });
      this.shutdown('unhandledRejection', 1);
    });
  }
  
  private async shutdown(signal: string, exitCode = 0) {
    if (this.isShuttingDown) {
      return;
    }
    
    this.isShuttingDown = true;
    logger.info(`Received ${signal}, starting graceful shutdown...`);
    
    // Stop accepting new connections
    this.server?.close(async (error) => {
      if (error) {
        logger.error('Error during server shutdown:', error);
        process.exit(1);
      }
      
      try {
        // Close database connections
        await mongoose.connection.close();
        logger.info('Database connections closed');
        
        // Close Redis connections
        await redisClient.quit();
        logger.info('Redis connections closed');
        
        logger.info('Graceful shutdown completed');
        process.exit(exitCode);
      } catch (shutdownError) {
        logger.error('Error during graceful shutdown:', shutdownError);
        process.exit(1);
      }
    });
    
    // Force shutdown after timeout
    setTimeout(() => {
      logger.error('Forceful shutdown after timeout');
      process.exit(1);
    }, 10000); // 10 seconds
  }
}
```

### 4. Error Aggregation and Monitoring 📊

```typescript
// services/errorTracking.service.ts
class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private errorCounts = new Map<string, number>();
  private errorPatterns = new Map<string, string[]>();
  
  static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }
  
  trackError(error: Error, context: any = {}) {
    const errorKey = `${error.name}:${error.message}`;
    
    // Increment error count
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);
    
    // Track error patterns
    const contextKey = JSON.stringify({
      url: context.url,
      method: context.method,
      userId: context.userId
    });
    
    if (!this.errorPatterns.has(errorKey)) {
      this.errorPatterns.set(errorKey, []);
    }
    this.errorPatterns.get(errorKey)!.push(contextKey);
    
    // Alert if error threshold exceeded
    if (currentCount + 1 >= 10) {
      this.sendAlert(errorKey, currentCount + 1);
    }
  }
  
  private async sendAlert(errorKey: string, count: number) {
    logger.error('High error frequency detected', {
      errorKey,
      count,
      patterns: this.errorPatterns.get(errorKey)
    });
    
    // Send to monitoring service (e.g., Sentry, DataDog)
    // await MonitoringService.sendAlert({
    //   type: 'HIGH_ERROR_FREQUENCY',
    //   errorKey,
    //   count
    // });
  }
  
  getErrorStats() {
    return {
      totalUniqueErrors: this.errorCounts.size,
      errorCounts: Object.fromEntries(this.errorCounts),
      topErrors: Array.from(this.errorCounts.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    };
  }
}

// Usage in error handler
export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Track error
  ErrorTrackingService.getInstance().trackError(err, {
    url: req.originalUrl,
    method: req.method,
    userId: (req as any).user?.id
  });
  
  // ... rest of error handling
};
```

---

## Conclusion

The `catchAsync` wrapper is a powerful yet simple tool that makes error handling in async Express routes safe, consistent, and maintainable. By understanding how it works and following the patterns shown in this documentation, you can build robust applications that handle errors gracefully and provide great user experiences.

### Key Takeaways 🎯

1. **Always wrap async route handlers** with `catchAsync` to prevent unhandled promise rejections
2. **Use specific error types** (like `ApiError`) to provide meaningful error responses
3. **Log errors with context** to enable effective debugging and monitoring
4. **Handle different error types appropriately** with specific error handling strategies
5. **Follow security best practices** by not exposing sensitive information in error responses
6. **Test error scenarios** to ensure your error handling works correctly
7. **Monitor error patterns** to identify and fix recurring issues

### Error Handling Evolution 📈

```
Basic Error Handling → CatchAsync Wrapper → Comprehensive Error Strategy
        ↓                      ↓                         ↓
   Manual try/catch      Automatic catching        Error monitoring,
   in every route       with Express pipeline      circuit breakers,
                                                  graceful shutdowns
```

Remember: Good error handling is not about preventing errors (which is impossible), but about handling them gracefully when they occur. The `catchAsync` wrapper is your first line of defense in building resilient Node.js applications! 🛡️

---

*Happy coding, and may your applications never crash unexpectedly!* 🚀
