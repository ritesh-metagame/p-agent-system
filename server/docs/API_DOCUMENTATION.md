# Commission API Documentation

## Overview

This document provides comprehensive documentation for all commission-related API endpoints in the P-Agent system. The API handles commission calculations, reporting, settlements, and various financial breakdowns for different user roles in the platform hierarchy.

## Table of Contents

1. [API Architecture](#api-architecture)
2. [Authentication & Authorization](#authentication--authorization)
3. [Commission Management](#commission-management)
4. [Commission Reports](#commission-reports)
5. [Settlement Management](#settlement-management)
6. [Financial Breakdowns](#financial-breakdowns)
7. [Error Handling](#error-handling)
8. [Response Formats](#response-formats)
9. [Rate Limiting](#rate-limiting)
10. [API Usage Examples](#api-usage-examples)

## API Architecture

### Base URL Structure

```
Base URL: /api/commission
Router: Express.js with TypeScript
Controller: CommissionController
Authentication: JWT Bearer Token
```

### Request/Response Flow

```
Client Request → Auth Middleware → Route Handler → Controller → Service → DAO → Database
Database → DAO → Service → Controller → Response Handler → Client Response
```

## Authentication & Authorization

### Authentication Requirements

All endpoints require JWT authentication:

```javascript
Headers: {
    "Authorization": "Bearer <jwt_token>",
    "Content-Type": "application/json"
}
```

### Role-Based Access Control

The API enforces role-based access with the following hierarchy:

1. **Super Admin**: Full system access
2. **Operator**: Platform-level access
3. **Platinum**: Multi-agent management
4. **Golden**: Individual agent access

### Authorization Flow

```typescript
// User validation
const user = req.user;
if (!user || !user.roleId) {
    return new ApiResponse(
        ResponseCodes.UNAUTHORIZED.code,
        "Unauthorized - User details not found",
        null
    );
}

// Role validation
const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true },
});
```

## Commission Management

### 1. Create Commission

**Endpoint**: `POST /api/commission/create`

**Description**: Creates a new commission configuration for a user and category.

**Request Body**:
```typescript
{
    roleId: string;          // Role identifier
    siteId: string;          // Site identifier
    userId: string;          // User identifier
    categoryId: string;      // Category identifier (E-Games/Sports)
    commissionPercentage: number; // Commission percentage (0-100)
}
```

**Response**:
```typescript
{
    code: "2001",
    message: "Commission created successfully",
    data: {
        id: string,
        userId: string,
        categoryId: string,
        commissionPercentage: number,
        createdAt: Date,
        updatedAt: Date
    }
}
```

**Example Request**:
```bash
curl -X POST /api/commission/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "role-123",
    "siteId": "site-456",
    "userId": "user-789",
    "categoryId": "8a2ac3c1-202d-11f0-81af-0a951197db91",
    "commissionPercentage": 30
  }'
```

### 2. Get Commission by User ID

**Endpoint**: `GET /api/commission/:userId`

**Description**: Retrieves commission configuration for a specific user.

**Parameters**:
- `userId` (path): User identifier

**Response**:
```typescript
{
    code: "2002",
    message: "Commission fetched successfully",
    data: {
        userId: string,
        commissions: [
            {
                categoryId: string,
                categoryName: string,
                commissionPercentage: number,
                isActive: boolean
            }
        ]
    }
}
```

### 3. Commission by Category

**Endpoint**: `POST /api/commission/commissionByCategory`

**Description**: Triggers commission calculation for a specific date and category.

**Query Parameters**:
- `date` (string): Date in YYYY-MM-DD format

**Request Body**:
```typescript
{
    date: string; // "2024-01-15"
}
```

**Response**:
```typescript
{
    code: "2001",
    message: "Commission created successfully",
    data: {
        date: string,
        processedTransactions: number,
        totalCommissionAmount: number,
        categoriesProcessed: string[]
    }
}
```

## Commission Reports

### 1. Commission Summaries

**Endpoint**: `GET /api/commission/summaries`

**Description**: Retrieves commission summaries based on user role and hierarchy.

**Authorization**: Role-based access control

**Response**:
```typescript
{
    code: "2003",
    message: "Commission summaries fetched successfully",
    data: {
        userId: string,
        roleName: string,
        summaries: [
            {
                date: string,
                categoryId: string,
                categoryName: string,
                totalCommission: number,
                netCommission: number,
                pgFees: number,
                transactionCount: number,
                status: "settled" | "pending"
            }
        ],
        totalAmount: number,
        totalPgFees: number
    }
}
```

### 2. Commission Payout Report

**Endpoint**: `GET /api/commission/payout-report`

**Description**: Generates detailed payout report for commission analysis.

**Query Parameters**:
- `categoryId` (optional): Specific category filter
- `userId` (optional): Specific user filter (admins only)

**Response**:
```typescript
{
    code: "2004",
    message: "Payout report generated successfully",
    data: {
        userId: string,
        categoryBreakdown: [
            {
                categoryId: string,
                categoryName: string,
                totalEarnings: number,
                totalPaid: number,
                pendingAmount: number,
                transactionCount: number
            }
        ],
        summary: {
            totalEarnings: number,
            totalPaid: number,
            pendingAmount: number,
            lastSettlement: Date
        }
    }
}
```

### 3. Running Tally

**Endpoint**: `POST /api/commission/running-tally`

**Description**: Calculates running commission totals for real-time tracking.

**Authorization**: Requires valid role information

**Response**:
```typescript
{
    code: "2005",
    message: "Running tally calculated successfully",
    data: {
        userId: string,
        roleName: string,
        currentMonth: {
            totalCommission: number,
            settledAmount: number,
            pendingAmount: number
        },
        lastMonth: {
            totalCommission: number,
            settledAmount: number
        },
        yearToDate: {
            totalCommission: number,
            settledAmount: number
        }
    }
}
```

## Settlement Management

### 1. Get Pending Settlements

**Endpoint**: `GET /api/commission/pending-settlements`

**Description**: Retrieves all pending commission settlements for the user.

**Authorization**: Role-based filtering

**Response**:
```typescript
{
    code: "2006",
    message: "Pending settlements fetched successfully",
    data: {
        userId: string,
        pendingSettlements: [
            {
                settlementId: string,
                date: string,
                categoryId: string,
                categoryName: string,
                commissionAmount: number,
                pgFees: number,
                netAmount: number,
                status: "pending",
                daysOld: number
            }
        ],
        totalPendingAmount: number,
        oldestPendingDate: string
    }
}
```

### 2. Update Settlement Status

**Endpoint**: `PUT /api/commission/update-unsettled-commission`

**Description**: Marks commission entries as settled.

**Request Body**:
```typescript
{
    settlementIds: string[],    // Array of settlement IDs
    settlementDate: string,     // Settlement date
    paymentReference: string,   // Payment reference number
    notes?: string             // Optional settlement notes
}
```

**Response**:
```typescript
{
    code: "2007",
    message: "Commission settlements updated successfully",
    data: {
        settledCount: number,
        totalAmount: number,
        settlementDate: string,
        paymentReference: string
    }
}
```

### 3. Get Unsettled Commission

**Endpoint**: `GET /api/commission/unsettled-commission`

**Description**: Retrieves all unsettled commission entries.

**Query Parameters**:
- `fromDate` (optional): Start date filter
- `toDate` (optional): End date filter
- `categoryId` (optional): Category filter

**Response**:
```typescript
{
    code: "2008",
    message: "Unsettled commission fetched successfully",
    data: {
        unsettledCommissions: [
            {
                id: string,
                date: string,
                categoryId: string,
                commissionAmount: number,
                pgFees: number,
                netAmount: number,
                transactionCount: number
            }
        ],
        totalUnsettledAmount: number
    }
}
```

## Financial Breakdowns

### 1. Total Breakdown

**Endpoint**: `GET /api/commission/total-breakdown`

**Description**: Provides comprehensive financial breakdown by category and time period.

**Authorization**: Role-based data filtering

**Response**:
```typescript
{
    code: "2004",
    message: "Total Commission Payouts Breakdown fetched successfully",
    data: {
        userId: string,
        roleName: string,
        breakdown: {
            byCategory: [
                {
                    categoryId: string,
                    categoryName: string,
                    totalCommission: number,
                    totalPgFees: number,
                    netCommission: number,
                    transactionCount: number
                }
            ],
            byMonth: [
                {
                    month: string,
                    totalCommission: number,
                    totalPgFees: number,
                    netCommission: number
                }
            ],
            summary: {
                grandTotalCommission: number,
                grandTotalPgFees: number,
                grandNetCommission: number,
                totalTransactions: number
            }
        }
    }
}
```

### 2. Payment Gateway Fees

**Endpoint**: `GET /api/commission/payment-gateway-fees`

**Description**: Retrieves detailed payment gateway fee breakdown.

**Query Parameters**:
- `userId` (optional): User ID for admin queries

**Response**:
```typescript
{
    code: "2005",
    message: "Payment Gateway Fees Breakdown fetched successfully",
    data: {
        userId: string,
        feesBreakdown: [
            {
                date: string,
                categoryId: string,
                categoryName: string,
                grossCommission: number,
                pgFeeAmount: number,
                pgFeePercentage: number,
                netCommission: number
            }
        ],
        summary: {
            totalGrossCommission: number,
            totalPgFees: number,
            totalNetCommission: number,
            avgPgFeePercentage: number
        }
    }
}
```

### 3. License Breakdown

**Endpoint**: `GET /api/commission/license-breakdown`

**Description**: Provides commission breakdown by license/platform type.

**Response**:
```typescript
{
    code: "2009",
    message: "License breakdown fetched successfully",
    data: {
        licenses: [
            {
                licenseType: string,
                categoryId: string,
                totalCommission: number,
                transactionCount: number,
                avgCommissionPerTransaction: number
            }
        ],
        summary: {
            totalLicenses: number,
            totalCommission: number,
            mostProfitable: string
        }
    }
}
```

### 4. Unified Breakdown

**Endpoint**: `GET /api/commission/breakdown`

**Description**: Unified endpoint for various breakdown types with query parameters.

**Query Parameters**:
- `type`: breakdown type ("total" | "gateway" | "license")
- `fromDate` (optional): Start date
- `toDate` (optional): End date
- `categoryId` (optional): Category filter

**Response**: Varies based on `type` parameter

## Settlement Reports

### 1. Settled Commission Reports

**Endpoint**: `GET /api/commission/settled-reports`

**Description**: Retrieves historical settled commission reports.

**Query Parameters**:
- `page` (default: 1): Page number for pagination
- `limit` (default: 10): Results per page
- `fromDate` (optional): Start date filter
- `toDate` (optional): End date filter

**Response**:
```typescript
{
    code: "2010",
    message: "Settled commission reports fetched successfully",
    data: {
        reports: [
            {
                settlementId: string,
                settlementDate: string,
                totalAmount: number,
                commissionCount: number,
                paymentReference: string,
                categories: string[],
                status: "completed"
            }
        ],
        pagination: {
            currentPage: number,
            totalPages: number,
            totalRecords: number,
            hasNext: boolean,
            hasPrev: boolean
        }
    }
}
```

### 2. Download Settlement Report

**Endpoint**: `GET /api/commission/download-report`

**Description**: Downloads settlement report as Excel/CSV file.

**Query Parameters**:
- `settlementId`: Settlement ID to download
- `format`: File format ("excel" | "csv")

**Response**: File download (Excel/CSV)

**Headers**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="settlement-report-{settlementId}.xlsx"
```

## Error Handling

### Standard Error Response Format

```typescript
{
    code: string,           // Error code
    message: string,        // Human-readable error message
    data: null,            // Always null for errors
    timestamp: string,     // ISO timestamp
    path: string          // Request path
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| 4001 | Unauthorized | 401 |
| 4003 | Forbidden | 403 |
| 4004 | Not Found | 404 |
| 4010 | Validation Error | 400 |
| 5001 | Internal Server Error | 500 |
| 5002 | Database Error | 500 |
| 5003 | Service Unavailable | 503 |

### Error Examples

**Unauthorized Access**:
```typescript
{
    code: "4001",
    message: "Unauthorized - User details not found",
    data: null,
    timestamp: "2024-01-15T10:30:00Z",
    path: "/api/commission/summaries"
}
```

**Validation Error**:
```typescript
{
    code: "4010",
    message: "Invalid commission percentage. Must be between 0 and 100",
    data: null,
    timestamp: "2024-01-15T10:30:00Z",
    path: "/api/commission/create"
}
```

**Database Error**:
```typescript
{
    code: "5002",
    message: "Database connection failed",
    data: null,
    timestamp: "2024-01-15T10:30:00Z",
    path: "/api/commission/summaries"
}
```

## Response Formats

### Success Response Structure

```typescript
interface ApiResponse<T> {
    code: string;          // Success code
    message: string;       // Success message
    data: T;              // Response data
    timestamp?: string;    // Response timestamp
    meta?: {              // Optional metadata
        pagination?: PaginationInfo;
        filters?: FilterInfo;
        summary?: SummaryInfo;
    };
}
```

### Pagination Format

```typescript
interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrev: boolean;
    pageSize: number;
}
```

### Filter Format

```typescript
interface FilterInfo {
    fromDate?: string;
    toDate?: string;
    categoryId?: string;
    status?: string;
    applied: string[];
}
```

## Rate Limiting

### Rate Limit Configuration

```
Standard Endpoints: 100 requests per minute
Report Endpoints: 20 requests per minute
Download Endpoints: 5 requests per minute
```

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

### Rate Limit Exceeded Response

```typescript
{
    code: "4029",
    message: "Rate limit exceeded. Try again later.",
    data: null,
    retryAfter: 60
}
```

## API Usage Examples

### JavaScript/TypeScript Examples

#### Get Commission Summaries
```javascript
const getCommissionSummaries = async () => {
    try {
        const response = await fetch('/api/commission/summaries', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching commission summaries:', error);
        throw error;
    }
};
```

#### Create Commission Configuration
```javascript
const createCommission = async (commissionData) => {
    try {
        const response = await fetch('/api/commission/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commissionData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to create commission');
        }
        
        return result;
    } catch (error) {
        console.error('Error creating commission:', error);
        throw error;
    }
};
```

#### Download Settlement Report
```javascript
const downloadReport = async (settlementId, format = 'excel') => {
    try {
        const response = await fetch(
            `/api/commission/download-report?settlementId=${settlementId}&format=${format}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to download report');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settlement-report-${settlementId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading report:', error);
        throw error;
    }
};
```

### cURL Examples

#### Get Running Tally
```bash
curl -X POST /api/commission/running-tally \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"
```

#### Update Settlement Status
```bash
curl -X PUT /api/commission/update-unsettled-commission \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "settlementIds": ["settlement-1", "settlement-2"],
    "settlementDate": "2024-01-15",
    "paymentReference": "PAY-2024-001",
    "notes": "Monthly settlement batch"
  }'
```

#### Get Payment Gateway Fees
```bash
curl -X GET "/api/commission/payment-gateway-fees?userId=user-123" \
  -H "Authorization: Bearer your-jwt-token"
```

## Best Practices

### API Usage Guidelines

1. **Authentication**: Always include valid JWT token
2. **Error Handling**: Implement proper error handling for all API calls
3. **Rate Limiting**: Respect rate limits and implement retry logic
4. **Data Validation**: Validate input data before sending requests
5. **Caching**: Cache frequently accessed data to reduce API calls

### Performance Optimization

1. **Pagination**: Use pagination for large datasets
2. **Filtering**: Apply filters to reduce response size
3. **Parallel Requests**: Use parallel requests where appropriate
4. **Connection Pooling**: Implement connection pooling for high-volume applications

### Security Considerations

1. **Token Management**: Securely store and refresh JWT tokens
2. **HTTPS**: Always use HTTPS in production
3. **Input Sanitization**: Sanitize all input data
4. **Rate Limiting**: Implement client-side rate limiting
5. **Error Information**: Don't expose sensitive information in error messages

## Troubleshooting

### Common Issues

**Issue**: 401 Unauthorized
**Solution**: Check token validity and expiration

**Issue**: 403 Forbidden
**Solution**: Verify user role permissions

**Issue**: Rate limit exceeded
**Solution**: Implement exponential backoff retry logic

**Issue**: Large response timeouts
**Solution**: Use pagination and filtering

### Debug Tips

1. **Check Headers**: Verify all required headers are present
2. **Validate Payload**: Ensure request body matches expected format
3. **Check Timestamps**: Verify date formats and timezone handling
4. **Monitor Logs**: Check server logs for detailed error information
5. **Test Permissions**: Verify user has required role permissions

## API Testing

### Test Environment

```
Base URL: https://api-test.pagent.com/api/commission
Test Token: Use development JWT tokens
Rate Limits: Reduced limits in test environment
```

### Sample Test Cases

```javascript
// Test suite example
describe('Commission API Tests', () => {
    test('should get commission summaries', async () => {
        const response = await getCommissionSummaries();
        expect(response.code).toBe('2003');
        expect(response.data).toBeDefined();
    });
    
    test('should create commission configuration', async () => {
        const commissionData = {
            roleId: 'test-role',
            siteId: 'test-site',
            userId: 'test-user',
            categoryId: 'test-category',
            commissionPercentage: 25
        };
        
        const response = await createCommission(commissionData);
        expect(response.code).toBe('2001');
    });


});
```

