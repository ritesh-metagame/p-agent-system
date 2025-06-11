# P-Agent System - Commission Calculation Implementation Guide

## Overview

This guide provides detailed implementation information for developers working with the commission calculation system in the P-Agent platform.

## File Structure and Responsibilities

### Core Files
```
server/src/
├── services/commission.service.ts     # Main business logic service
├── daos/commission.dao.ts            # Data access operations
├── daos/generateCommission.ts        # Daily commission generation
├── daos/user.dao.ts                  # User payout calculations
├── commission-cron.ts                # Automated processing
└── controllers/commission.controller.ts # API endpoints
```

## Commission Service Architecture

### Class Structure
```typescript
@Service()
class CommissionService {
    private commissionDao: CommissionDao;
    private roleDao: RoleDao;
    private commissionSummaryDao: GenerateCommission;
    private userDao: UserDao;
}
```

### Key Methods
- `createCommission()` - Create new commission records
- `getCommissionByUserId()` - Fetch user-specific commissions
- `getCommissionSummaries()` - Role-based summary aggregation
- `getCommissionPayoutReport()` - Generate payout reports

## Data Models and Relationships

### Commission Model
```typescript
interface Commission {
    id: string;
    userId: string;
    roleId: string;
    categoryId: string;
    siteId?: string;
    commissionPercentage: number;
    createdAt: Date;
    updatedAt: Date;
}
```

### Commission Summary Model
```typescript
interface CommissionSummary {
    id: string;
    userId: string;
    roleId: string;
    categoryName: string;
    siteId?: string;
    totalDeposit: number;
    totalWithdrawals: number;
    totalBetAmount: number;
    netGGR: number;
    grossCommission: number;
    paymentGatewayFee: number;
    netCommissionAvailablePayout: number;
    pendingSettleCommission: number;
    settledStatus: "Y" | "N";
    settledBySuperadmin?: boolean;
    settledByOperator?: boolean;
    settledByPlatinum?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
```

### Transaction Model
```typescript
interface Transaction {
    transactionId: string;
    betTime: Date;
    userId: string;
    playerName: string;
    platformType: string;
    transactionType: string;
    deposit: Decimal;
    withdrawal: Decimal;
    betAmount: Decimal;
    payoutAmount: Decimal;
    refundAmount: Decimal;
    revenue: Decimal;
    pgFeeCommission: Decimal;
    status: string;
    settled: "Y" | "N";
    // Role-specific fields
    gaId: string;
    gaName: string;
    gaPercentage: Decimal;
    gaCommission: Decimal;
    maId: string;
    maName: string;
    maPercentage: Decimal;
    maCommission: Decimal;
    ownerId: string;
    ownerName: string;
    ownerPercentage: Decimal;
    ownerCommission: Decimal;
}
```

## Commission Calculation Algorithms

### 1. Base Amount Determination

```typescript
function calculateBaseAmount(platformType: string, transaction: any): Decimal {
    switch (platformType) {
        case "egames":
        case "E-Games":
            // Use revenue (GGR)
            return new Decimal(transaction.betAmount).minus(transaction.payoutAmount);
        
        case "sports":
        case "sportsbet":
        case "Sports Betting":
            // Use bet amount minus refunds
            return new Decimal(transaction.betAmount).minus(transaction.refundAmount || 0);
        
        case "Speciality Games - RNG":
            // Use revenue (same as E-Games)
            return new Decimal(transaction.betAmount).minus(transaction.payoutAmount);
        
        case "Speciality Games - Tote":
            // Use bet amount
            return new Decimal(transaction.betAmount);
        
        default:
            return new Decimal(transaction.betAmount);
    }
}
```

### 2. Commission Rate Application

```typescript
function calculateCommission(baseAmount: Decimal, commissionRate: number): Decimal {
    return baseAmount.mul(commissionRate).div(100);
}

// Usage examples:
const gaCommission = calculateCommission(baseAmount, gaPercentage);
const maCommission = calculateCommission(baseAmount, maPercentage);
const ownerCommission = calculateCommission(baseAmount, ownerPercentage);
```

### 3. Platform-Specific Commission Rates

```typescript
const COMMISSION_RATES = {
    "E-Games": {
        superAdmin: 30,     // 30% of GGR
        operator: 25,       // Configurable
        platinum: 20,       // Configurable
        golden: 15          // Configurable
    },
    "Sports Betting": {
        superAdmin: 2,      // 2% of bet amount
        operator: 1.5,      // Configurable
        platinum: 1.2,      // Configurable
        golden: 1.0         // Configurable
    },
    "Speciality Games - RNG": {
        superAdmin: 30,     // 30% of GGR
        operator: 25,       // Configurable
        platinum: 20,       // Configurable
        golden: 15          // Configurable
    },
    "Speciality Games - Tote": {
        superAdmin: 2,      // 2% of bet amount
        operator: 1.5,      // Configurable
        platinum: 1.2,      // Configurable
        golden: 1.0         // Configurable
    }
};
```

## Daily Commission Generation Process

### GenerateCommission Class Implementation

```typescript
class GenerateCommission {
    public async generateCommissionSummariesByDate(dateInput: string | Date) {
        const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
        const from = startOfDay(date);
        const to = endOfDay(date);

        // 1. Fetch all transactions for the date
        const transactions = await prisma.transaction.findMany({
            where: {
                betTime: { gte: from, lte: to }
            }
        });

        // 2. Process each role level
        const roleTargets = ["ownerId", "maId", "gaId"];
        
        for (const roleKey of roleTargets) {
            // 3. Group by user and category
            const grouped = this.groupTransactions(transactions, roleKey);
            
            // 4. Create commission summaries
            await this.createCommissionSummaries(grouped, roleKey, date);
        }
    }

    private groupTransactions(transactions: any[], roleKey: string): Map<string, any> {
        const grouped = new Map();
        
        for (const txn of transactions) {
            const userId = txn[roleKey];
            const category = txn.platformType || "Unknown";
            if (!userId) continue;

            const key = `${userId}|${category}`;
            const existing = grouped.get(key) || this.getEmptyGrouping();

            grouped.set(key, {
                deposit: existing.deposit + Number(txn.deposit || 0),
                withdrawal: existing.withdrawal + Number(txn.withdrawal || 0),
                betAmount: existing.betAmount + Number(txn.betAmount || 0),
                revenue: existing.revenue + Number(txn.revenue || 0),
                pgFeeCommission: existing.pgFeeCommission + Number(txn.pgFeeCommission || 0),
            });
        }

        return grouped;
    }
}
```

## Automated Commission Processing (Cron)

### Commission Cron Architecture

```typescript
// commission-cron.ts
export async function runCommissionCron() {
    const lastProcessed = await getLastProcessedDate();
    
    if (!lastProcessed) {
        // First time run - process from earliest bet
        const firstBetTime = await getEarliestBetAfter(IGNORE_BEFORE_DATE);
        if (firstBetTime) {
            await processCommissionBetween(firstBetTime, new Date());
        }
    } else {
        // Regular run - process since last run
        await processCommissionBetween(lastProcessed, new Date());
    }
    
    await setLastProcessedDate(new Date());
}
```

### Transaction Processing Pipeline

```typescript
async function processCommissionBetween(start: Date, end: Date) {
    const rawRows = await getBetsBetween(start, end);
    
    for (const row of rawRows) {
        // 1. Platform normalization
        const normalizedPlatform = normalizePlatformName(row.platform_name);
        
        // 2. Calculate base amounts
        const baseAmount = calculateBaseAmount(normalizedPlatform, row);
        
        // 3. Process role hierarchy
        await processRoleHierarchy(row, baseAmount, normalizedPlatform);
        
        // 4. Create transaction record
        await createTransactionRecord(row, calculatedCommissions);
    }
}
```

## User Payout and Wallet Calculations

### UserDao Payout Implementation

```typescript
class UserDao {
    public async getUserPayoutAndWalletBalance(userId: string) {
        // 1. Validate settlement status
        const isSettled = await this.validateSettlementStatus(userId);
        if (!isSettled) {
            return { payout: 0, wallet: 0 };
        }

        // 2. Calculate total commissions
        const summaries = await this.getUserCommissionSummaries(userId);
        const calculations = this.calculateCommissionTotals(summaries);
        
        // 3. Factor in parent commissions
        const parentCommission = await this.getParentCommission(userId);
        
        // 4. Calculate final payout and wallet
        return this.calculateFinalAmounts(calculations, parentCommission);
    }

    private calculateCommissionTotals(summaries: any[]) {
        let totalNetGGR = 0;
        let totalBetAmount = 0;
        let totalCommissionByUser = 0;
        let totalPaymentGatewayFee = 0;

        for (const summary of summaries) {
            if (summary.categoryName === "E-Games") {
                totalNetGGR += Number(summary.netGGR || 0);
            } else if (summary.categoryName === "Sports Betting") {
                totalBetAmount += Number(summary.totalBetAmount || 0);
            }

            totalCommissionByUser += Number(summary.netCommissionAvailablePayout || 0);
            totalPaymentGatewayFee += Number(summary.paymentGatewayFee || 0);
        }

        return {
            totalNetGGR,
            totalBetAmount,
            totalCommissionByUser,
            totalPaymentGatewayFee,
            totalEgamesAmount: totalNetGGR * 0.3,
            totalSportsBettingAmount: totalBetAmount * 0.02
        };
    }
}
```

## Error Handling and Validation

### Commission Validation Rules

```typescript
class CommissionValidator {
    static validateCommissionData(commission: Partial<Commission>): ValidationResult {
        const errors: string[] = [];

        if (!commission.userId) {
            errors.push("User ID is required");
        }

        if (!commission.categoryId) {
            errors.push("Category ID is required");
        }

        if (commission.commissionPercentage < 0 || commission.commissionPercentage > 100) {
            errors.push("Commission percentage must be between 0 and 100");
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateTransactionData(transaction: any): ValidationResult {
        const errors: string[] = [];

        if (!transaction.transactionId) {
            errors.push("Transaction ID is required");
        }

        if (!transaction.betTime) {
            errors.push("Bet time is required");
        }

        if (transaction.betAmount < 0) {
            errors.push("Bet amount cannot be negative");
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
```

### Error Recovery Mechanisms

```typescript
// In commission-cron.ts
try {
    await processCommissionBetween(startTime, endTime);
    await setLastProcessedDate(endTime);
} catch (error) {
    logger.error("Commission processing failed:", error);
    
    // Don't update last processed date on failure
    // This ensures the next run will retry the same period
    
    // Optionally implement retry logic
    await scheduleRetry(startTime, endTime, error);
}
```

## Performance Optimization

### Database Query Optimization

```typescript
// Batch processing for large datasets
async function processBatchCommissions(userIds: string[], batchSize = 1000) {
    for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        await processCommissionBatch(batch);
    }
}

// Efficient aggregation queries
const summaryData = await prisma.commissionSummary.aggregateRaw({
    pipeline: [
        { $match: { userId: { $in: userIds }, settledStatus: "N" } },
        {
            $group: {
                _id: { userId: "$userId", categoryName: "$categoryName" },
                totalCommission: { $sum: "$netCommissionAvailablePayout" },
                totalFees: { $sum: "$paymentGatewayFee" }
            }
        }
    ]
});
```

### Memory Management

```typescript
// Stream processing for large transaction sets
async function processTransactionsStream(dateRange: DateRange) {
    const stream = await prisma.transaction.findManyStream({
        where: {
            betTime: {
                gte: dateRange.start,
                lte: dateRange.end
            }
        }
    });

    for await (const transaction of stream) {
        await processTransaction(transaction);
        
        // Clear memory periodically
        if (processedCount % 10000 === 0) {
            await forceGarbageCollection();
        }
    }
}
```

## Testing Strategies

### Unit Test Examples

```typescript
describe('Commission Calculations', () => {
    test('should calculate E-Games commission correctly', () => {
        const betAmount = new Decimal(1000);
        const payoutAmount = new Decimal(700);
        const revenue = betAmount.minus(payoutAmount); // 300
        const commissionRate = 30;
        
        const expectedCommission = revenue.mul(commissionRate).div(100); // 90
        const actualCommission = calculateCommission(revenue, commissionRate);
        
        expect(actualCommission.equals(expectedCommission)).toBe(true);
    });

    test('should handle Sports Betting with refunds', () => {
        const betAmount = new Decimal(1000);
        const refundAmount = new Decimal(100);
        const baseAmount = betAmount.minus(refundAmount); // 900
        const commissionRate = 2;
        
        const expectedCommission = new Decimal(18); // 900 * 0.02
        const actualCommission = calculateCommission(baseAmount, commissionRate);
        
        expect(actualCommission.equals(expectedCommission)).toBe(true);
    });
});
```

### Integration Test Examples

```typescript
describe('Commission Service Integration', () => {
    test('should generate daily commission summaries', async () => {
        // Setup test transactions
        await createTestTransactions('2025-06-08');
        
        // Generate commissions
        const service = new GenerateCommission();
        await service.generateCommissionSummariesByDate('2025-06-08');
        
        // Verify summaries created
        const summaries = await prisma.commissionSummary.findMany({
            where: {
                createdAt: {
                    gte: new Date('2025-06-08T00:00:00Z'),
                    lt: new Date('2025-06-09T00:00:00Z')
                }
            }
        });
        
        expect(summaries.length).toBeGreaterThan(0);
    });
});
```

## Configuration Management

### Commission Rate Configuration

```typescript
// config/commission-rates.ts
export const COMMISSION_RATE_CONFIG = {
    defaults: SUPER_ADMIN_DEFAULT_COMMISSION_RATES,
    
    // Environment-specific overrides
    development: {
        "E-Games": 25,
        "Sports Betting": 1.5
    },
    
    production: {
        // Use defaults
    }
};

export function getCommissionRate(platform: string, environment: string): number {
    const config = COMMISSION_RATE_CONFIG[environment] || COMMISSION_RATE_CONFIG.defaults;
    return config[platform] || 0;
}
```

### Processing Configuration

```typescript
// config/processing.ts
export const PROCESSING_CONFIG = {
    batchSize: 1000,
    maxRetries: 3,
    retryDelayMs: 5000,
    cronSchedule: "0 1 * * *", // Daily at 1 AM
    ignoreBeforeDate: new Date("2025-05-26T00:00:00.000Z"),
    
    // Platform-specific cycles
    cycles: {
        "E-Games": "monthly",
        "Sports Betting": "weekly",
        "Speciality Games - RNG": "monthly",
        "Speciality Games - Tote": "weekly"
    }
};
```

## Monitoring and Logging

### Commission Processing Metrics

```typescript
// monitoring/commission-metrics.ts
export class CommissionMetrics {
    static async recordProcessingTime(operation: string, duration: number) {
        await prisma.processingMetrics.create({
            data: {
                operation,
                duration,
                timestamp: new Date()
            }
        });
    }

    static async recordCommissionVolume(date: Date, platform: string, volume: number) {
        await prisma.commissionVolume.upsert({
            where: { date_platform: { date, platform } },
            update: { volume },
            create: { date, platform, volume }
        });
    }
}
```

### Audit Logging

```typescript
// audit/commission-audit.ts
export class CommissionAuditLogger {
    static async logCommissionChange(
        userId: string,
        oldValue: number,
        newValue: number,
        reason: string
    ) {
        await prisma.commissionAuditLog.create({
            data: {
                userId,
                oldValue,
                newValue,
                reason,
                changedBy: getCurrentUser(),
                changedAt: new Date()
            }
        });
    }
}
```

This implementation guide provides the technical details needed for developers to understand and work with the commission calculation system effectively.
