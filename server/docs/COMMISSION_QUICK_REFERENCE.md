# P-Agent System - Commission Calculation Quick Reference

## Commission Rate Constants

| Platform | Rate | Applied To | Formula |
|----------|------|------------|---------|
| E-Games | 30% | GGR (Revenue) | `commission = (betAmount - payoutAmount) × 0.30` |
| Sports Betting | 2% | Bet Amount (minus refunds) | `commission = (betAmount - refundAmount) × 0.02` |
| Speciality Games - RNG | 30% | GGR (Revenue) | `commission = (betAmount - payoutAmount) × 0.30` |
| Speciality Games - Tote | 2% | Bet Amount | `commission = betAmount × 0.02` |

## Key Calculations

### Revenue (GGR) Calculation
```
Revenue = Bet Amount - Payout Amount
```

### Base Amount by Platform
- **E-Games**: `betAmount - payoutAmount`
- **Sports Betting**: `betAmount - refundAmount`
- **Speciality Games RNG**: `betAmount - payoutAmount`
- **Speciality Games Tote**: `betAmount`

### Commission Calculation
```
Commission = Base Amount × (Commission Rate / 100)
```

### Net Commission Available for Payout
```
Net Commission = Gross Commission - Payment Gateway Fee
```

### Final Payout Calculation
```
Payout = Total Commission Amount - User Commission - Parent Commission - Payment Gateway Fee

Where:
Total Commission Amount = (E-Games GGR × 0.30) + (Sports Betting Amount × 0.02)
```

### Wallet Balance by Role
- **Golden Agent**: `User Commission - Payment Gateway Fee`
- **Higher Roles**: `User Commission` (fees tracked separately)

## Settlement Status Rules

| Role | Settled By | Field |
|------|------------|-------|
| Operator | Super Admin | `settledBySuperadmin` |
| Platinum | Operator | `settledByOperator` |
| Golden | Platinum | `settledByPlatinum` |

## User Role Hierarchy

```
Super Admin
    ↓
Operator (Owner)
    ↓
Platinum (Master Agent)
    ↓
Golden (Golden Agent)
```

## Commission Summary Fields

| Field | Description | Type |
|-------|-------------|------|
| `totalDeposit` | Sum of all deposits | Number |
| `totalWithdrawals` | Sum of all withdrawals | Number |
| `totalBetAmount` | Sum of all bet amounts | Number |
| `netGGR` | Net Gross Gaming Revenue | Number |
| `grossCommission` | Commission before deductions | Number |
| `paymentGatewayFee` | Payment processing fees | Number |
| `netCommissionAvailablePayout` | Final commission amount | Number |
| `pendingSettleCommission` | Commission pending settlement | Number |
| `settledStatus` | "Y" (settled) or "N" (pending) | String |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/commission/:userId` | Get user commission data |
| POST | `/api/commission` | Create new commission |
| GET | `/api/commission/summaries` | Get commission summaries |
| GET | `/api/commission/payout-report` | Get payout report |
| POST | `/api/commission/category` | Generate commission by date |

## Database Tables

### `commission`
- Stores commission rates for users by category
- Primary key: `id`
- Foreign keys: `userId`, `roleId`, `categoryId`, `siteId`

### `commissionSummary`
- Daily aggregated commission data
- Primary key: `id`
- Foreign keys: `userId`, `roleId`, `siteId`

### `transaction`
- Individual bet/transaction records
- Contains commission calculations for each role level
- Includes payment gateway fees

## File Locations

| Component | File Path |
|-----------|-----------|
| Main Service | `src/services/commission.service.ts` |
| Data Access | `src/daos/commission.dao.ts` |
| Daily Generation | `src/daos/generateCommission.ts` |
| Automated Processing | `src/commission-cron.ts` |
| User Calculations | `src/daos/user.dao.ts` |
| API Controllers | `src/controllers/commission.controller.ts` |

## Common Error Patterns

| Error | Cause | Solution |
|-------|-------|----------|
| Commission rate not found | Missing commission record | Check commission table for user/category |
| Settlement check fails | Role-specific settlement flag not set | Verify settlement status by role hierarchy |
| Payout calculation returns 0 | User not settled | Check appropriate settlement flag |
| Transaction processing skipped | Missing user ID in role field | Validate user hierarchy data |

## Example Calculations

### E-Games Example
```
Bet Amount: $1,000
Payout Amount: $700
Revenue (GGR): $1,000 - $700 = $300
Commission (30%): $300 × 0.30 = $90
```

### Sports Betting Example
```
Bet Amount: $1,000
Refund Amount: $50
Base Amount: $1,000 - $50 = $950
Commission (2%): $950 × 0.02 = $19
```

### Net Payout Example
```
E-Games Commission: $90
Sports Betting Commission: $19
Total Commission: $109
Payment Gateway Fee: $5
User's Commission Share: $40
Parent Commission: $30
Final Payout: $109 - $40 - $30 - $5 = $34
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COMMISSION_CRON_SCHEDULE` | Cron job schedule | "0 1 * * *" |
| `IGNORE_BEFORE_DATE` | Start date for processing | "2025-05-26" |
| `BATCH_SIZE` | Processing batch size | 1000 |
| `MAX_RETRIES` | Maximum retry attempts | 3 |

## Constants in Code

```typescript
// From commission.service.ts
const SUPER_ADMIN_DEFAULT_COMMISSION_RATES = {
    "E-Games": 30,
    "Sports Betting": 2,
    "Speciality Games - Tote": 2,
    "Speciality Games - RNG": 30,
};

// From commission-cron.ts
const IGNORE_BEFORE_DATE = new Date("2025-05-26T00:00:00.000Z");
const META_ID = "commission-meta";

// Role targets for processing
const roleTargets = ["ownerId", "maId", "gaId"];
```

## Troubleshooting Checklist

### Commission Not Calculating
1. ✅ Check if user exists in user table
2. ✅ Verify commission record exists for user/category
3. ✅ Confirm transaction has valid bet time
4. ✅ Validate platform type mapping
5. ✅ Check for zero or negative amounts

### Settlement Issues
1. ✅ Verify settlement status flags by role
2. ✅ Check parent-child relationships
3. ✅ Confirm cycle dates for category
4. ✅ Validate settlement permissions

### Payout Calculation Problems
1. ✅ Check all commission summaries exist
2. ✅ Verify settlement status validation
3. ✅ Confirm parent commission calculations
4. ✅ Validate payment gateway fee calculations

### Performance Issues
1. ✅ Monitor batch processing sizes
2. ✅ Check database query execution plans
3. ✅ Validate memory usage during large operations
4. ✅ Confirm proper indexing on query fields
