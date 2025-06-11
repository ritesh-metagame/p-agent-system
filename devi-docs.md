# P-Agent System Server Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Database Architecture & Prisma Implementation](#database-architecture--prisma-implementation)
3. [Commission & Settlement System](#commission--settlement-system)
4. [Data Flow & Transaction Processing](#data-flow--transaction-processing)
5. [Calculation Logic](#calculation-logic)
6. [API Endpoints & Controllers](#api-endpoints--controllers)
7. [Background Jobs & Automation](#background-jobs--automation)
8. [File Structure & Key Components](#file-structure--key-components)

---

## System Overview

The P-Agent System is a multi-level commission tracking and settlement platform for gaming/betting operations. It manages hierarchical agent structures with automated commission calculations, settlement processing, and comprehensive reporting.

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **Dependency Injection**: TypeDI
- **Job Scheduling**: node-cron
- **Authentication**: JWT with express-jwt
- **Validation**: Joi with Celebrate middleware

---

## Database Architecture & Prisma Implementation

### Prisma Configuration

**File**: `server/prisma/schema/schema.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../generated/prisma"
  previewFeatures = ["prismaSchemaFolder"]
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### Core Database Models

#### 1. User Hierarchy Model

**File**: `server/prisma/schema/user.prisma`

- Supports hierarchical structure: SuperAdmin → Operator → Platinum → Golden → Player
- Self-referencing relationship with `parentId`
- Role-based permissions and commission structures

#### 2. Transaction Model

**File**: `server/prisma/schema/transaction.prisma`

```prisma
model Transaction {
  id            BigInt    @id @default(autoincrement())
  transactionId String
  betTime       DateTime?
  userId        String?
  playerName    String?
  platformType  String?
  transactionType TransactionType?
  deposit         Decimal  @default(0.00)
  withdrawal      Decimal  @default(0.00)
  betAmount       Decimal?
  payoutAmount    Decimal?
  refundAmount    Decimal?
  revenue         Decimal?
  pgFeeCommission Decimal?
  status  String?
  settled String? @default("N")

  // Owner level (Operator)
  ownerId         String?
  ownerName       String?
  ownerPercentage Decimal?
  ownerCommission Decimal?

  // MA level (Platinum)
  maId         String?
  maName       String?
  maPercentage Decimal?
  maCommission Decimal?

  // GA level (Golden)
  gaId         String?
  gaName       String?
  gaPercentage Decimal?
  gaCommission Decimal?
}
```

#### 3. Commission Model

**File**: `server/prisma/schema/commission.prisma`

```prisma
model Commission {
  id                          String           @id @default(cuid())
  siteId                      String           @map("site_id")
  userId                      String           @map("user_id")
  commissionComputationPeriod SettlementPeriod @default(BI_MONTHLY)
  parentPercentage        Float?           @map("parent_percentage")
  roleId                      String           @map("role_id")
  categoryId                  String           @map("category_id")
  totalAssignedCommissionPercentage        Float
  commissionPercentage        Float
}
```

#### 4. Commission Summary Model

**File**: Referenced in `server/src/daos/generateCommission.ts`

- Aggregated commission data by user, role, and category
- Tracks pending vs settled status
- Includes payment gateway fees and net commission calculations

---

## Commission & Settlement System

### Settlement Lifecycle

#### 1. Transaction Ingestion

**File**: `server/src/commission-cron.ts` (Lines 67-309)

The system processes betting transactions through automated cron jobs:

```typescript
async function processCommissionBetween(start: Date, end: Date) {
  const rawRows = await getBetsBetween(start, end);

  for (const row of rawRows) {
    // Platform type normalization
    const platformType = row["platform_name"];
    const normalizedPlatform =
      platformType === "egames"
        ? "E-Games"
        : platformType === "sports" || platformType === "sportsbet"
        ? "Sports Betting"
        : platformType;

    // Calculate base amounts for commission
    const betAmount = new Decimal(row["bet_amount"] || 0);
    const payoutAmount = new Decimal(row["payout_amount"] || 0);
    const revenue = betAmount.minus(payoutAmount);

    const baseAmount = new Decimal(
      platformType === "egames"
        ? revenue || 0 // E-Games uses GGR (revenue)
        : platformType === "sports" || platformType === "sportsbet"
        ? betAmount.minus(refundAmount) // Sports uses net bet amount
        : betAmount
    );
  }
}
```

#### 2. Commission Calculation Hierarchy

**File**: `server/src/commission-cron.ts` (Lines 126-200)

The system calculates commissions in a bottom-up approach:

1. **Golden Agent (GA)** - Lowest level agent
2. **Master Agent (MA)** - Platinum level
3. **Owner** - Operator level

```typescript
// Step 1: GA Commission
const gaCommissionRecord = await prisma.commission.findFirst({
  where: { userId: gaId, categoryId },
});
const gaPercentage = new Decimal(gaCommissionRecord?.commissionPercentage || 0);
const gaCommission = baseAmount.mul(gaPercentage).div(100);

// Step 2: MA Commission (if GA has parent)
const gaUser = await prisma.user.findUnique({ where: { id: gaId } });
const maId = gaUser?.parentId || null;
if (maId) {
  const maCommissionRecord = await prisma.commission.findFirst({
    where: { userId: maId, categoryId },
  });
  maPercentage = new Decimal(maCommissionRecord?.commissionPercentage || 0);
  maCommission = baseAmount.mul(maPercentage).div(100);
}

// Step 3: Owner Commission (if MA has parent)
if (maId) {
  const maUser = await prisma.user.findUnique({ where: { id: maId } });
  ownerId = maUser?.parentId || null;
  if (ownerId) {
    const ownerCommissionRecord = await prisma.commission.findFirst({
      where: { userId: ownerId, categoryId },
    });
    ownerPercentage = new Decimal(
      ownerCommissionRecord?.commissionPercentage || 0
    );
    ownerCommission = baseAmount.mul(ownerPercentage).div(100);
  }
}
```

#### 3. Commission Summary Generation

**File**: `server/src/daos/generateCommission.ts` (Lines 7-140)

Daily commission summaries are generated for each role level:

```typescript
public async generateCommissionSummariesByDate(dateInput: string | Date) {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const from = startOfDay(date);
    const to = endOfDay(date);

    // Get all transactions in date range
    const transactions = await prisma.transaction.findMany({
        where: {
            betTime: { gte: from, lte: to }
        }
    });

    const roleTargets = ["ownerId", "maId", "gaId"];

    for (const roleKey of roleTargets) {
        const grouped = new Map<string, { [key: string]: number }>();

        // Group transactions by user and category
        for (const txn of transactions) {
            const userId = txn[roleKey as keyof typeof txn] as string;
            const category = txn.platformType || "Unknown";
            if (!userId) continue;

            const key = `${userId}|${category}`;
            // Aggregate amounts...
        }

        // Create commission summaries
        for (const [key, sum] of grouped.entries()) {
            const [userId, categoryName] = key.split("|");

            // Calculate pending settle commission based on category
            let pendingSettleCommission = 0;
            if (categoryName === "E-Games") {
                pendingSettleCommission = sum.revenue * 0.3; // 30% of GGR
            } else if (categoryName === "Sports Betting") {
                pendingSettleCommission = sum.betAmount * 0.02; // 2% of bet amount
            }

            await prisma.commissionSummary.create({
                data: {
                    userId,
                    roleId: user.roleId,
                    categoryName,
                    totalDeposit: sum.deposit,
                    totalWithdrawals: sum.withdrawal,
                    totalBetAmount: sum.betAmount,
                    netGGR: sum.revenue,
                    grossCommission: 0,
                    paymentGatewayFee: sum.pgFeeCommission,
                    netCommissionAvailablePayout: netCommission,
                    pendingSettleCommission: pendingSettleCommission,
                    settledStatus: "N",
                    createdAt: date
                }
            });
        }
    }
}
```

### Settlement Process

#### 1. Pending Settlement Identification

**File**: `server/src/services/commission.service.ts` (Lines 2410-3020)

The system identifies pending settlements based on completed commission cycles:

```typescript
public async getPendingSettlements(userId: string, roleName: string) {
    // Calculate the date range for the last completed cycle
    const {cycleStartDate, cycleEndDate} = await this.getPreviousCompletedCycleDates();

    // Get direct child user IDs based on role hierarchy
    let childrenIds = await prisma.user
        .findMany({
            where: { parentId: userId },
            select: {id: true}
        })
        .then((users) => users.map((user) => user.id));

    // Process each category separately
    const categories = ["E-Games", "Sports Betting", "Speciality Games - RNG", "Speciality Games - Tote"];

    for (const category of categories) {
        const summaries = await prisma.commissionSummary.findMany({
            where: {
                userId: {in: childrenIds},
                createdAt: { gte: cycleStartDate, lte: cycleEndDate },
                settledStatus: "N",
                categoryName: category
            }
        });

        // Group summaries by user and calculate totals
        const userGroups = summaries.reduce((acc, summary) => {
            if (!acc[summary.user.id]) {
                acc[summary.user.id] = {
                    summaries: [],
                    totalEgamesCommissions: 0,
                    totalSportsBettingCommissions: 0,
                    totalSpecialtyGamesRNGCommissions: 0,
                    totalSpecialtyGamesToteCommissions: 0,
                    grossCommissions: 0,
                    netCommissions: 0
                };
            }

            acc[summary.user.id].summaries.push(summary);

            // Calculate totals by game category
            if (summary.categoryName.includes("E-Games")) {
                acc[summary.user.id].totalEgamesCommissions += summary.netCommissionAvailablePayout || 0;
            } else if (summary.categoryName.includes("Sports Betting")) {
                acc[summary.user.id].totalSportsBettingCommissions += summary.netCommissionAvailablePayout || 0;
            }
            // ... other categories

            return acc;
        }, {});
    }
}
```

#### 2. Settlement Execution

**File**: `server/src/daos/commission.dao.ts` (Lines 771-1013)

The settlement process marks commissions as settled and handles payment gateway fee allocation:

```typescript
public async markCommissionAsSettled(ids: string[], roleName: UserRole, childrenCommissionIds: string[]) {
    // Get current records with user roles
    const currentRecords = await prisma.commissionSummary.findMany({
        where: { id: { in: ids } },
        select: {
            id: true,
            pendingSettleCommission: true,
            netCommissionAvailablePayout: true,
            paymentGatewayFee: true,
            userId: true,
            createdAt: true,
            user: {
                select: {
                    role: { select: { name: true } }
                }
            }
        }
    });

    // Find "Unknown" category records (payment gateway fees) for the same date
    const unknownCategoryRecords = await prisma.commissionSummary.findMany({
        where: {
            userId: { in: userIds },
            categoryName: "Unknown",
            createdAt: { gte: startOfDay, lte: endOfDay },
            settledStatus: "N"
        }
    });

    // Separate golden users from others for special PG fee handling
    const goldenRecords = currentRecords.filter(record => record.user.role.name === UserRole.GOLDEN);
    const otherRecords = currentRecords.filter(record => record.user.role.name !== UserRole.GOLDEN);

    // For golden users, distribute payment gateway fees proportionally
    if (goldenRecords.length > 0) {
        const totalGoldenNetCommission = goldenRecords.reduce(
            (sum, record) => sum + record.netCommissionAvailablePayout, 0
        );

        const totalPaymentGatewayFee = paymentGatewayFees[0].paymentGatewayFee || 0;

        await Promise.all(goldenRecords.map(record => {
            const ratio = record.netCommissionAvailablePayout / totalGoldenNetCommission;
            const recordPaymentGatewayFee = totalPaymentGatewayFee * ratio;

            return prisma.commissionSummary.update({
                where: { id: record.id },
                data: {
                    settledStatus: "Y",
                    settledAt: new Date(),
                    settledBySuperadmin: roleName === UserRole.SUPER_ADMIN,
                    settledByOperator: roleName === UserRole.OPERATOR,
                    settledByPlatinum: roleName === UserRole.PLATINUM,
                    grossCommission: record.netCommissionAvailablePayout - recordPaymentGatewayFee,
                    pendingSettleCommission: (record.pendingSettleCommission || 0) - record.netCommissionAvailablePayout
                }
            });
        }));
    }
}
```

---

## Data Flow & Transaction Processing

### Data Sources & Input

#### 1. Raw Betting Data

**File**: `server/src/commission-cron.ts` (Lines 32-66)

The system ingests betting data from external sources via SQL queries:

```typescript
async function getBetsBetween(start: Date, end: Date): Promise<any[]> {
  const result: any[] = await prisma.$queryRawUnsafe(`
        SELECT *
        FROM bets
        WHERE time_of_bet BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
    `);
  return result;
}
```

#### 2. Data Transformation Pipeline

The system normalizes platform types and calculates revenue:

1. **Platform Normalization**: Maps platform codes to standard categories
2. **Revenue Calculation**: `revenue = betAmount - payoutAmount`
3. **Base Amount Determination**: Different calculation methods per platform type

### Processing Flow

```
Raw Bet Data → Transaction Creation → Commission Calculation → Summary Generation → Settlement Processing
```

#### 1. Transaction Creation Flow

**File**: `server/src/commission-cron.ts` (Lines 200-260)

```typescript
const transaction = {
  transactionId: String(row["transaction_id"]),
  betTime: row["time_of_bet"],
  userId: row["User Id"],
  playerName: row["player_id"],
  platformType: normalizedPlatform,
  transactionType: row["transaction_type"],

  deposit: new Decimal(row["deposit_amount"] || 0),
  withdrawal: new Decimal(row["withdraw_amount"] || 0),
  betAmount: new Decimal(row["bet_amount"] || 0),
  payoutAmount: new Decimal(row["payout_amount"] || 0),
  refundAmount: new Decimal(row["refund_amount"] || 0),
  revenue: revenue,
  pgFeeCommission: new Decimal(row["pg_fee_commission"] || 0),

  status: row["status"] || null,
  settled: "N",

  gaId,
  gaName: gaUser?.username,
  gaPercentage,
  gaCommission,
  maId,
  maName: maName?.username,
  maPercentage,
  maCommission,
  ownerId,
  ownerName,
  ownerPercentage,
  ownerCommission,
};

await prisma.transaction.create({ data: transaction });
```

#### 2. Background Processing

**File**: `server/src/commission-cron.ts` (Lines 280-309)

The system runs daily cron jobs to process commissions:

```typescript
export function scheduleDailyCommissionJob() {
  const nowUTC = DateTime.now().setZone("UTC");
  let target = nowUTC.set({ hour: 18, minute: 30, second: 0 }); // 6:30 PM UTC = 12:00 AM IST

  setTimeout(() => {
    runCommissionCron();

    // Schedule daily recurring job
    cron.schedule(
      "30 18 * * *",
      () => {
        logger.info("🔄 Running daily commission cron job");
        runCommissionCron();
      },
      {
        scheduled: true,
        timezone: "UTC",
      }
    );
  }, delay);
}
```

---

## Calculation Logic

### Commission Calculation Methods

#### 1. E-Games Commission (GGR-based)

- **Base Amount**: Revenue (Bet Amount - Payout Amount)
- **Commission Rate**: 30% of GGR typically
- **Formula**: `commission = revenue × commission_percentage ÷ 100`

#### 2. Sports Betting Commission (Turnover-based)

- **Base Amount**: Net Bet Amount (Bet Amount - Refund Amount)
- **Commission Rate**: 2% of turnover typically
- **Formula**: `commission = (bet_amount - refund_amount) × commission_percentage ÷ 100`

#### 3. Settlement Period Calculations

**File**: `server/src/services/commission.service.ts` (Lines 800-1000)

The system uses bi-monthly settlement cycles by default:

```typescript
private async getPreviousCompletedCycleDates(categoryName?: string) {
    const now = new Date();
    let cycleStartDate: Date;
    let cycleEndDate: Date;

    // Bi-monthly cycles: 1st-15th and 16th-end of month
    if (now.getDate() <= 15) {
        // Current period is 1st-15th, so previous period is 16th-end of last month
        const lastMonth = subMonths(now, 1);
        cycleStartDate = setDate(lastMonth, 16);
        cycleEndDate = endOfMonth(lastMonth);
    } else {
        // Current period is 16th-end, so previous period is 1st-15th of current month
        cycleStartDate = startOfMonth(now);
        cycleEndDate = setDate(now, 15);
    }

    return { cycleStartDate, cycleEndDate };
}
```

### Payment Gateway Fee Handling

**File**: `server/src/daos/commission.dao.ts` (Lines 321-350)

Payment gateway fees are tracked separately and deducted from net commissions:

```typescript
private async getPaymentGatewayFee(
    userIds: string[],
    settled: boolean = false,
    startDate: Date,
    endDate: Date
): Promise<number> {
    const commissions = await prisma.commissionSummary.findMany({
        where: {
            userId: { in: userIds },
            paymentGatewayFee: { gte: 0 },
            ...(startDate && endDate
                ? { createdAt: { gte: startDate, lte: endDate } }
                : {}
            )
        },
        select: { paymentGatewayFee: true }
    });

    return commissions.reduce(
        (total, commission) => total + (commission.paymentGatewayFee || 0), 0
    );
}
```

---

## API Endpoints & Controllers

### Commission Management Endpoints

**File**: `server/src/routes/commission.route.ts`

Key API endpoints for commission management:

1. **GET `/commission/summaries`** - Get commission summaries by role
2. **GET `/commission/payout-report`** - Get commission payout reports
3. **GET `/commission/pending-settlements`** - Get pending settlements
4. **PUT `/commission/update-unsettled-commission`** - Mark commissions as settled
5. **GET `/commission/payment-gateway-fees`** - Get payment gateway fee breakdown

### Controller Implementation

**File**: `server/src/controllers/commission.controller.ts` (Lines 60-150)

```typescript
public static async getCommissionSummaries(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.user;

        // Get user with role details
        const userWithRole = await prisma.user.findUnique({
            where: { id: user.id },
            include: { role: true }
        });

        const commissionService = Container.get(CommissionService);
        const summaries = await commissionService.getCommissionSummaries({
            id: userWithRole.id,
            role: { name: userWithRole.role.name }
        });

        return new ApiResponse(
            ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.code,
            ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.message,
            sanitizedSummaries
        );
    } catch (error) {
        next(error);
    }
}
```

### Service Layer Implementation

**File**: `server/src/services/commission.service.ts`

The service layer handles business logic with role-based data access:

```typescript
public async getCommissionSummaries(user: { id: string; role: { name: string } }) {
    const roleName = user.role.name.toLowerCase();
    let summaries;

    if (roleName === UserRole.SUPER_ADMIN) {
        summaries = await this.commissionDao.getSuperAdminCommissionSummaries();
    } else if (roleName === UserRole.OPERATOR) {
        summaries = await this.commissionDao.getOperatorCommissionSummaries(user.id);
    } else if (roleName === UserRole.PLATINUM) {
        summaries = await this.commissionDao.getPlatinumCommissionSummaries(user.id);
    } else {
        summaries = await this.commissionDao.getCommissionSummariesForUser(user.id);
    }

    // Transform and group the data by platform and role
    const groupedSummaries = summaries.reduce((acc, summary) => {
        const platform = summary.category.name;
        const role = summary.role.name.toLowerCase();

        if (!acc[platform]) {
            acc[platform] = {};
        }

        // Role-specific grouping logic...
        return acc;
    }, {});

    return groupedSummaries;
}
```

---

## Background Jobs & Automation

### Cron Job Configuration

**File**: `server/src/commission-cron.ts` (Lines 1-30)

The system maintains processing state to handle incremental updates:

```typescript
const IGNORE_BEFORE_DATE = new Date("2025-05-26T00:00:00.000Z");
const META_ID = "commission-meta";

async function getLastProcessedDate(): Promise<Date | null> {
  const meta = await prisma.commissionProcessMeta.findUnique({
    where: { id: META_ID },
  });
  return meta?.lastProcessedAt ?? null;
}

async function setLastProcessedDate(date: Date) {
  await prisma.commissionProcessMeta.upsert({
    where: { id: META_ID },
    update: { lastProcessedAt: date },
    create: {
      id: META_ID,
      lastProcessedAt: date,
    },
  });
}
```

### Automated Processing Flow

```typescript
export async function runCommissionCron() {
  const lastProcessed = await getLastProcessedDate();

  if (!lastProcessed) {
    // First run - process from earliest bet
    const firstBetTime = await getEarliestBetAfter(IGNORE_BEFORE_DATE);
    if (firstBetTime) {
      const endTime = new Date();
      await processCommissionBetween(firstBetTime, endTime);
      await setLastProcessedDate(endTime);
    }
  } else {
    // Incremental processing
    const startTime = lastProcessed;
    const endTime = new Date();
    await processCommissionBetween(startTime, endTime);
    await setLastProcessedDate(endTime);
  }
}
```

---

## File Structure & Key Components

### Core Architecture Files

#### Server Entry Point

- **`server/src/server.ts`** - Main application server setup
- **`server/src/main.ts`** - Application bootstrap

#### Database Layer

- **`server/prisma/schema/`** - Prisma schema definitions
  - `schema.prisma` - Database configuration
  - `user.prisma` - User and role models
  - `transaction.prisma` - Transaction tracking
  - `commission.prisma` - Commission configuration
  - `summary.prisma` - Aggregated summary models

#### Data Access Layer (DAOs)

- **`server/src/daos/transaction.dao.ts`** - Transaction data operations
- **`server/src/daos/commission.dao.ts`** - Commission data operations
- **`server/src/daos/generateCommission.ts`** - Commission summary generation
- **`server/src/daos/user.dao.ts`** - User management operations

#### Service Layer

- **`server/src/services/commission.service.ts`** - Commission business logic
- **`server/src/services/transaction.service.ts`** - Transaction processing
- **`server/src/services/user.service.ts`** - User management

#### Controller Layer

- **`server/src/controllers/commission.controller.ts`** - Commission API endpoints
- **`server/src/controllers/transaction.controller.ts`** - Transaction endpoints
- **`server/src/controllers/user.controller.ts`** - User management endpoints

#### Routing

- **`server/src/routes/commission.route.ts`** - Commission API routes
- **`server/src/routes/transaction.route.ts`** - Transaction API routes
- **`server/src/routes/index.ts`** - Route aggregation

#### Background Processing

- **`server/src/commission-cron.ts`** - Automated commission processing
- **`server/src/seed-transactions.ts`** - Data seeding utilities

#### Configuration & Utilities

- **`server/src/common/config/constants.ts`** - System constants and enums
- **`server/src/common/config/response.ts`** - Standardized API responses
- **`server/src/common/logger.ts`** - Logging configuration

### Key Design Patterns

#### 1. Dependency Injection

Uses TypeDI for service container management:

```typescript
@Service()
class CommissionService {
  constructor() {
    this.commissionDao = new CommissionDao();
    this.roleDao = new RoleDao();
  }
}
```

#### 2. Repository Pattern

Data access is abstracted through DAO classes:

```typescript
class CommissionDao {
  public async createCommission(commission: any): Promise<Commission> {
    return await prisma.commission.create({ data: commission });
  }
}
```

#### 3. Layered Architecture

- **Controllers** - HTTP request handling
- **Services** - Business logic
- **DAOs** - Data access
- **Models** - Data structures (Prisma)

---

## Summary

The P-Agent System is a sophisticated commission management platform that:

1. **Automates Commission Processing** - Daily cron jobs process betting transactions and calculate hierarchical commissions
2. **Manages Complex Hierarchies** - Supports multi-level agent structures with role-based permissions
3. **Handles Multiple Game Types** - Different calculation methods for E-Games (GGR) vs Sports Betting (turnover)
4. **Provides Comprehensive Reporting** - Real-time dashboards and settlement reports for all user levels
5. **Ensures Data Integrity** - Transactional processing with proper error handling and logging
6. **Supports Flexible Settlement Cycles** - Configurable bi-monthly or custom settlement periods

The system's strength lies in its modular architecture, comprehensive data tracking, and automated processing capabilities, making it suitable for large-scale gaming operations with complex commission structures.
