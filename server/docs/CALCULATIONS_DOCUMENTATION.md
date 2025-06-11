# P-Agent System - Financial Calculations Documentation

## Table of Contents
1. [Overview](#overview)
2. [Commission Rate Constants](#commission-rate-constants)
3. [Commission Calculation Methods](#commission-calculation-methods)
4. [Payment Gateway Fee Calculations](#payment-gateway-fee-calculations)
5. [Hierarchical Commission Distribution](#hierarchical-commission-distribution)
6. [Settlement and Settlement Status](#settlement-and-settlement-status)
7. [Revenue Calculations](#revenue-calculations)
8. [Commission Summary Generation](#commission-summary-generation)
9. [Examples and Use Cases](#examples-and-use-cases)

## Overview

The P-Agent system implements a comprehensive financial calculation framework that handles commission calculations, payment gateway fees, and hierarchical commission distribution across different user roles and gaming platforms.

### Key Components
- **Commission Service** (`commission.service.ts`) - Main service for commission calculations
- **Commission DAO** (`commission.dao.ts`) - Data access layer for commission operations
- **Generate Commission** (`generateCommission.ts`) - Commission generation algorithms
- **Commission Cron** (`commission-cron.ts`) - Automated commission processing
- **User DAO** (`user.dao.ts`) - User payout and wallet balance calculations

## Commission Rate Constants

The system uses predefined commission rates for different gaming platforms:

### Default Super Admin Commission Rates
```typescript
const SUPER_ADMIN_DEFAULT_COMMISSION_RATES = {
    "E-Games": 30,           // 30% of GGR (Gross Gaming Revenue)
    "Sports Betting": 2,     // 2% of bet amount
    "Speciality Games - Tote": 2,   // 2% of bet amount
    "Speciality Games - RNG": 30,   // 30% of GGR
};
```

### Commission Rate Application
- **E-Games & Speciality Games RNG**: Applied to GGR (Gross Gaming Revenue)
- **Sports Betting & Speciality Games Tote**: Applied to bet amount

## Commission Calculation Methods

### 1. Base Amount Calculation

The base amount for commission calculation varies by platform type:

```typescript
// From commission-cron.ts
const baseAmount = new Decimal(
    platformType === "egames"
        ? revenue || 0  // For E-Games: use revenue (GGR)
        : platformType === "sports" || platformType === "sportsbet"
            ? betAmount.minus(refundAmount)  // For Sports: bet amount minus refunds
            : betAmount  // Default: bet amount
);
```

### 2. Revenue Calculation

Revenue (GGR) is calculated as:
```typescript
const revenue = betAmount.minus(payoutAmount);
```

**Formula**: `Revenue = Bet Amount - Payout Amount`

### 3. Commission Calculation by Role

The system calculates commissions for three hierarchical roles:

#### Golden Agent (GA) Commission
```typescript
const gaPercentage = new Decimal(gaCommissionRecord?.commissionPercentage || 0);
const gaCommission = baseAmount.mul(gaPercentage).div(100);
```

#### Master Agent (MA) Commission
```typescript
const maPercentage = new Decimal(maCommissionRecord?.commissionPercentage || 0);
const maCommission = baseAmount.mul(maPercentage).div(100);
```

#### Owner Commission
```typescript
const ownerPercentage = new Decimal(ownerCommissionRecord?.commissionPercentage || 0);
const ownerCommission = baseAmount.mul(ownerPercentage).div(100);
```

### 4. Pending Settlement Commission

For automatic commission calculations in `generateCommission.ts`:

```typescript
let pendingSettleCommission = 0;
if (categoryName === "E-Games") {
    pendingSettleCommission = sum.revenue * 0.3;  // 30% of revenue
} else if (categoryName === "Sports Betting") {
    pendingSettleCommission = sum.betAmount * 0.02;  // 2% of bet amount
}
```

## Payment Gateway Fee Calculations

Payment gateway fees are tracked and deducted from commission calculations:

### Fee Tracking
```typescript
// In generateCommission.ts
pgFeeCommission: existing.pgFeeCommission + Number(txn.pgFeeCommission || 0)
```

### Net Commission Calculation
```typescript
// Net commission after payment gateway fees
const netCommissionAvailablePayout = grossCommission - paymentGatewayFee;
```

## Hierarchical Commission Distribution

### User Role Hierarchy
1. **Super Admin** - Top level, sees all operators
2. **Operator** - Manages platinum and golden agents
3. **Platinum** - Manages golden agents
4. **Golden** - End-level agents

### Commission Flow
```
Super Admin
    ↓
Operator (Owner)
    ↓
Platinum (Master Agent)
    ↓
Golden (Golden Agent)
```

### Commission Aggregation

The system aggregates commissions based on user hierarchy:

```typescript
// For operators: include all platinums and goldens under them
if (userRole === UserRole.OPERATOR) {
    const platinums = await prisma.user.findMany({
        where: {
            parentId: userId,
            role: {name: UserRole.PLATINUM},
        },
    });
    userIds.push(...platinums.map((platinum) => platinum.id));

    const goldens = await prisma.user.findMany({
        where: {
            parentId: {in: platinums.map((platinum) => platinum.id)},
            role: {name: UserRole.GOLDEN},
        },
    });
    userIds.push(...goldens.map((golden) => golden.id));
}
```

## Settlement and Settlement Status

### Settlement Status Values
- **"N"** - Not settled (pending)
- **"Y"** - Settled (completed)

### Settlement Process
1. Transactions are initially created with `settledStatus: "N"`
2. Commission summaries track pending settlements
3. Cycle-based settlement processing converts "N" to "Y"

### Cycle-Based Processing
```typescript
// Get pending settlements for a specific cycle
const pendingSettlements = await prisma.commissionSummary.findMany({
    where: {
        userId: {in: userIds},
        categoryName: category,
        createdAt: {
            gte: categoryCycleDates.cycleStartDate,
            lte: categoryCycleDates.cycleEndDate,
        },
        settledStatus: "N",
    },
});
```

## Revenue Calculations

### Gross Gaming Revenue (GGR)
```typescript
// For E-Games and RNG games
const ggr = betAmount - payoutAmount;
```

### Net Revenue
```typescript
// After deducting refunds
const netRevenue = ggr - refundAmount;
```

### Revenue by Platform
- **E-Games**: `betAmount - payoutAmount`
- **Sports Betting**: `betAmount - refundAmount` (for commission base)
- **Speciality Games**: Varies by type (RNG vs Tote)

## Commission Summary Generation

### Daily Summary Creation

The `generateCommission.ts` creates daily summaries for each user-role-category combination:

```typescript
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
        createdAt: date,
    },
});
```

### Summary Fields
- **totalDeposit**: Sum of all deposits
- **totalWithdrawals**: Sum of all withdrawals
- **totalBetAmount**: Sum of all bet amounts
- **netGGR**: Net Gross Gaming Revenue
- **grossCommission**: Total commission before deductions
- **paymentGatewayFee**: Total payment gateway fees
- **netCommissionAvailablePayout**: Final commission after all deductions
- **pendingSettleCommission**: Commission pending settlement

## Examples and Use Cases

### Example 1: E-Games Commission Calculation

```typescript
// Transaction data
const betAmount = 1000;
const payoutAmount = 700;
const revenue = betAmount - payoutAmount; // 300

// Commission calculation (30% rate)
const commissionRate = 0.30;
const commission = revenue * commissionRate; // 90

// For Golden Agent with 15% rate
const gaRate = 0.15;
const gaCommission = revenue * gaRate; // 45
```

### Example 2: Sports Betting Commission Calculation

```typescript
// Transaction data
const betAmount = 1000;
const refundAmount = 50;
const baseAmount = betAmount - refundAmount; // 950

// Commission calculation (2% rate)
const commissionRate = 0.02;
const commission = baseAmount * commissionRate; // 19

// For Master Agent with 1% rate
const maRate = 0.01;
const maCommission = baseAmount * maRate; // 9.5
```

### Example 3: Net Commission After Fees

```typescript
// Commission and fee data
const grossCommission = 100;
const paymentGatewayFee = 5;
const netCommission = grossCommission - paymentGatewayFee; // 95
```

### Example 4: Hierarchical Commission Distribution

```typescript
// Base amount: 1000, Revenue: 300 (E-Games)
const baseAmount = 300;

// Owner: 30% = 90
const ownerCommission = baseAmount * 0.30;

// Master Agent: 20% = 60
const maCommission = baseAmount * 0.20;

// Golden Agent: 15% = 45
const gaCommission = baseAmount * 0.15;

// Total distributed: 195 (can exceed base if rates sum > 100%)
```

## Important Notes

1. **Decimal Precision**: All calculations use `Decimal` type for financial precision
2. **Date Handling**: UTC dates are used for consistent processing across timezones
3. **Error Handling**: Comprehensive error handling for missing users, roles, or commission records
4. **Audit Trail**: All transactions and commission calculations are logged for audit purposes
5. **Cycle Management**: Commission cycles are platform-specific and managed separately
6. **Settlement Timing**: Settlements occur at specific intervals based on platform and business rules

## File References

- **Main Service**: `src/services/commission.service.ts`
- **Data Access**: `src/daos/commission.dao.ts`
- **Commission Generation**: `src/daos/generateCommission.ts`
- **Automated Processing**: `src/commission-cron.ts`
- **User Operations**: `src/daos/user.dao.ts`
- **API Endpoints**: `src/controllers/commission.controller.ts`

## Wallet and Payout Calculations

### Wallet Balance Calculation

The wallet balance calculation varies by user role and settlement status:

```typescript
// From user.dao.ts - getUserPayoutAndWalletBalance method

// Role-based settlement check
const isSettled = roleName === UserRole.OPERATOR
    ? summaries.every((s) => s.settledBySuperadmin)
    : roleName === UserRole.PLATINUM
    ? summaries.every((s) => s.settledByOperator)
    : roleName === UserRole.GOLDEN
    ? summaries.every((s) => s.settledByPlatinum)
    : true;

// Wallet calculation by role
if (roleName === UserRole.GOLDEN) {
    wallet = totalCommissionByUser - totalPaymentGatewayFee;
} else {
    wallet = totalCommissionByUser;
}
```

### Payout Calculation Formula

```typescript
// Total commission calculation by platform
const totalEgamesAmount = totalNetGGR * 0.3;          // 30% of GGR
const totalSportsBettingAmount = totalBetAmount * 0.02; // 2% of bet amount
const totalCommissionAmount = totalEgamesAmount + totalSportsBettingAmount;

// Final payout calculation
const payout = totalCommissionAmount 
    - totalCommissionByUser 
    - totalParentCommission 
    - totalPaymentGatewayFee;
```

### Settlement Status Validation

Settlement requirements by role hierarchy:
- **Operators**: Must be settled by Super Admin (`settledBySuperadmin`)
- **Platinum**: Must be settled by Operator (`settledByOperator`)
- **Golden**: Must be settled by Platinum (`settledByPlatinum`)

```typescript
// Settlement validation prevents payout/wallet calculation if not settled
if (!isSettled) {
    return { payout: 0, wallet: 0 };
}
```

## Advanced Commission Distribution Logic

### Hierarchical Commission Aggregation

The system implements sophisticated aggregation for different user roles:

#### Super Admin View - All Operators
```typescript
// Groups all operators under "ALL OPERATORS" category
if (roleName === UserRole.SUPER_ADMIN) {
    if (!acc[platform]["ALL OPERATORS"]) {
        acc[platform]["ALL OPERATORS"] = {
            totalDeposit: 0,
            totalWithdrawals: 0,
            totalBetAmount: 0,
            netGGR: 0,
            grossCommission: 0,
            netCommissionAvailablePayout: 0,
            operators: [],
        };
    }
}
```

#### Operator View - Platinums and Goldens
```typescript
// Includes operator's direct platinums and their golden children
const platinums = await prisma.user.findMany({
    where: {
        parentId: userId,
        role: {name: UserRole.PLATINUM},
    },
});

const goldens = await prisma.user.findMany({
    where: {
        parentId: {in: platinums.map((platinum) => platinum.id)},
        role: {name: UserRole.GOLDEN},
    },
});
```

### Payment Gateway Fee Distribution

#### Fee Calculation by Settlement Status
```typescript
// Pending fees (non-settled transactions)
pendingPaymentGatewayFee = await this.getPaymentGatewayFee(
    gChildrensIds,     // Golden children IDs
    false,             // Not settled
    undefined,         // No date range
    undefined
);

// Settled fees (completed transactions)
settledPaymentGatewayFee = await this.getPaymentGatewayFee(
    settledUserIds,    // Settled user IDs
    true,              // Settled status
    undefined,         // No date range
    undefined
);
```

#### Fee Impact on Net Commission
Payment gateway fees directly reduce available commission payouts:
- **Golden Agents**: Fees deducted from wallet balance
- **Higher Roles**: Fees tracked separately from wallet balance

## Transaction Processing and Commission Generation

### Daily Commission Summary Process

The automated commission generation process (`generateCommission.ts`) creates daily summaries:

```typescript
// Process each role target (ownerId, maId, gaId)
const roleTargets = ["ownerId", "maId", "gaId"];

for (const roleKey of roleTargets) {
    // Group transactions by user and category
    const key = `${userId}|${category}`;
    
    // Aggregate transaction data
    grouped.set(key, {
        deposit: existing.deposit + Number(txn.deposit || 0),
        withdrawal: existing.withdrawal + Number(txn.withdrawal || 0),
        betAmount: existing.betAmount + Number(txn.betAmount || 0),
        revenue: existing.revenue + Number(txn.revenue || 0),
        pgFeeCommission: existing.pgFeeCommission + Number(txn.pgFeeCommission || 0),
    });
}
```

### Commission Attribution by Role

```typescript
// Role-specific commission attribution
if (roleKey === "ownerId") {
    netCommission += Number(txn.ownerCommission || 0);
} else if (roleKey === "maId") {
    netCommission += Number(txn.maCommission || 0);
} else if (roleKey === "gaId") {
    netCommission += Number(txn.gaCommission || 0);
}
```

## Cycle-Based Commission Processing

### Previous Completed Cycle Logic

The system determines commission cycles based on platform-specific timing:

```typescript
// Get cycle dates specific to each category
const categoryCycleDates = await this.getPreviousCompletedCycleDates(category);

// Query commissions within cycle dates
const pendingSettlements = await prisma.commissionSummary.findMany({
    where: {
        userId: {in: userIds},
        categoryName: category,
        createdAt: {
            gte: categoryCycleDates.cycleStartDate,
            lte: categoryCycleDates.cycleEndDate,
        },
        settledStatus: "N",
    },
});
```

### All-Time vs Pending Data

```typescript
// Pending data (current cycle)
const pendingData = {
    betAmount: pendingSettlements.reduce((sum, s) => sum + Number(s.totalBetAmount), 0),
    commission: pendingSettlements.reduce((sum, s) => sum + Number(s.netCommissionAvailablePayout), 0),
};

// All-time data (settled cycles)
const allTimeData = await prisma.commissionSummary.findMany({
    where: {
        userId: {in: userIds},
        categoryName: category,
        settledStatus: "Y",
    },
});
```

## Platform-Specific Commission Rules

### E-Games Platform
- **Base Amount**: Revenue (Bet Amount - Payout Amount)
- **Commission Rate**: 30% of GGR
- **Formula**: `commission = revenue × 0.30`

### Sports Betting Platform
- **Base Amount**: Bet Amount - Refund Amount
- **Commission Rate**: 2% of adjusted bet amount
- **Formula**: `commission = (betAmount - refundAmount) × 0.02`

### Speciality Games - RNG
- **Base Amount**: Revenue (same as E-Games)
- **Commission Rate**: 30% of GGR
- **Formula**: `commission = revenue × 0.30`

### Speciality Games - Tote
- **Base Amount**: Bet Amount
- **Commission Rate**: 2% of bet amount
- **Formula**: `commission = betAmount × 0.02`

## Error Handling and Edge Cases

### Missing User or Commission Data
```typescript
if (!user) {
    console.warn(`⚠️ Role user not found: ${userId}`);
    continue; // Skip transaction processing
}

const gaPercentage = new Decimal(gaCommissionRecord?.commissionPercentage || 0);
// Defaults to 0% if no commission record found
```

### Refund Handling
```typescript
const refundAmount = new Decimal(row["refund_amount"] || 0);
const baseAmount = betAmount.minus(refundAmount); // Subtract refunds from base
```

### Settlement Status Validation
```typescript
if (!isSettled) {
    console.warn(`Settlement not completed for role ${roleName}`);
    return { payout: 0, wallet: 0 }; // Return zero values if not settled
}
```

## Commission Summary Data Structure

### Core Summary Fields
```typescript
{
    userId: string,                          // User identifier
    roleId: string,                          // Role identifier
    categoryName: string,                    // Platform category
    totalDeposit: number,                    // Sum of deposits
    totalWithdrawals: number,                // Sum of withdrawals
    totalBetAmount: number,                  // Sum of all bet amounts
    netGGR: number,                          // Net Gross Gaming Revenue
    grossCommission: number,                 // Commission before deductions
    paymentGatewayFee: number,              // Payment processing fees
    netCommissionAvailablePayout: number,    // Final commission amount
    pendingSettleCommission: number,         // Commission pending settlement
    settledStatus: "Y" | "N",               // Settlement status
    settledBySuperadmin: boolean,           // Super admin settlement flag
    settledByOperator: boolean,             // Operator settlement flag
    settledByPlatinum: boolean,             // Platinum settlement flag
    createdAt: Date,                        // Creation timestamp
    updatedAt: Date                         // Last update timestamp
}
```

### Settlement Status Fields by Role
- **settledBySuperadmin**: Used for Operator settlements
- **settledByOperator**: Used for Platinum settlements  
- **settledByPlatinum**: Used for Golden settlements
