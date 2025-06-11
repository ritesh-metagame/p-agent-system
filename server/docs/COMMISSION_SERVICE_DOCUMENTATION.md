# Commission Service Documentation

## Table of Contents
1. [Overview](#overview)
2. [Class Structure](#class-structure)
3. [Dependencies](#dependencies)
4. [Configuration Constants](#configuration-constants)
5. [Core Methods](#core-methods)
6. [Business Logic Workflows](#business-logic-workflows)
7. [Role-Based Access Patterns](#role-based-access-patterns)
8. [Commission Calculation Logic](#commission-calculation-logic)
9. [Date Cycle Management](#date-cycle-management)
10. [Error Handling](#error-handling)
11. [Usage Examples](#usage-examples)

## Overview

The `CommissionService` is the core business logic service in the P-Agent System responsible for handling all commission-related operations. It manages commission calculations, summaries, settlements, breakdowns, and reporting across different user roles and gaming categories.

### Key Responsibilities
- **Commission Calculation**: Calculate commissions based on GGR, bet amounts, and configured rates
- **Role-Based Access**: Provide hierarchical access to commission data based on user roles
- **Settlement Management**: Handle commission settlements between different user levels
- **Reporting**: Generate various commission reports and breakdowns
- **Cycle Management**: Manage different commission computation periods (bi-monthly, weekly)
- **License Breakdown**: Provide detailed commission breakdowns by gaming license types

## Class Structure

```typescript
@Service()
class CommissionService {
    private commissionDao: CommissionDao;
    private roleDao: RoleDao;
    private commissionSummaryDao: GenerateCommission;
    private userDao: UserDao;
}
```

### Dependencies Injected
- **CommissionDao**: Database operations for commission data
- **RoleDao**: Role-related database operations
- **GenerateCommission**: Commission summary generation logic
- **UserDao**: User-related database operations

## Dependencies

### External Libraries
```typescript
import { Service } from "typedi";
import { addDays, differenceInDays, endOfMonth, format, getDaysInMonth, 
         lastDayOfMonth, setDate, startOfMonth, subMonths } from "date-fns";
```

### Internal Dependencies
```typescript
import { Commission, User } from "../../prisma/generated/prisma";
import { CommissionDao } from "../daos/commission.dao";
import { RoleDao } from "../daos/role.dao";
import { GenerateCommission } from "../daos/generateCommission";
import { prisma } from "../server";
import { CommissionComputationPeriod, DEFAULT_COMMISSION_COMPUTATION_PERIOD, 
         UserRole } from "../common/config/constants";
import { ResponseCodes } from "../common/config/responseCodes";
import { Response } from "../common/config/response";
import UserDao from "../daos/user.dao";
import logger from "../common/logger";
```

## Configuration Constants

### Default Commission Rates (Super Admin)
```typescript
const SUPER_ADMIN_DEFAULT_COMMISSION_RATES = {
    "E-Games": 30,
    "Sports Betting": 2,
    "Speciality Games - Tote": 2,
    "Speciality Games - RNG": 30,
};
```

### License Data Interfaces
```typescript
interface EGamesLicenseData {
    type: "E-Games";
    ggr: { pending: number; allTime: number };
    commission: { pending: number; allTime: number };
    commissionRate: number;
}

interface SportsBettingLicenseData {
    type: "Sports Betting";
    betAmount: { pending: number; allTime: number };
    commission: { pending: number; allTime: number };
    commissionRate: number;
}
```

## Core Methods

### 1. Commission Creation and Management

#### `createCommission(commission: Partial<Commission>)`
**Purpose**: Creates a new commission record in the database.

**Parameters**:
- `commission`: Partial commission object with commission details

**Returns**: Promise\<Commission\>

**Error Handling**: Throws error with descriptive message if creation fails

#### `createCommissionCategory(date: string)`
**Purpose**: Generates commission summaries for a specific date.

**Parameters**:
- `date`: Date string for commission generation

**Returns**: Promise\<any\>

**Business Logic**: Delegates to `GenerateCommission` service for date-based summary generation

### 2. Commission Retrieval and Summaries

#### `getCommissionByUserId(userId: string, categoryId?: string)`
**Purpose**: Retrieves commission data for a specific user with optional category filtering.

**Parameters**:
- `userId`: Target user ID
- `categoryId`: Optional category filter

**Returns**: Promise\<Response\> with commission data

**Response Structure**:
```typescript
{
    code: "USER_COMMISSION_FETCHED_SUCCESSFULLY",
    message: "Success message",
    data: CommissionData[]
}
```

#### `getCommissionSummaries(user: { id: string; role: { name: string } })`
**Purpose**: Retrieves role-based commission summaries with hierarchical grouping.

**Parameters**:
- `user`: User object with ID and role information

**Returns**: Promise\<Record\<string, Record\<string, any\>\>\>

**Role-Based Logic**:
- **Super Admin**: Groups all operators together under "ALL OPERATORS"
- **Operator**: Shows own data plus "ALL PLATINUMS" group with individual platinums and their golden children
- **Platinum**: Shows own data plus "ALL GOLDS" group
- **Other Roles**: Shows only own commission data

**Data Grouping Structure**:
```typescript
{
    [platform: string]: {
        [role: string]: {
            user: UserInfo,
            totalDeposit: number,
            totalWithdrawals: number,
            totalBetAmount: number,
            netGGR: number,
            grossCommission: number,
            netCommissionAvailablePayout: number,
            children?: ChildData[] // For hierarchical roles
        }
    }
}
```

### 3. Commission Reports and Breakdowns

#### `getCommissionPayoutReport(userId: string, categoryId?: string)`
**Purpose**: Generates comprehensive commission payout reports with pending and all-time data.

**Parameters**:
- `userId`: User ID for report generation
- `categoryId`: Optional category filter

**Returns**: Promise\<Object\> with detailed payout report

**Report Structure**:
```typescript
{
    code: "2003",
    message: "Commission fetched successfully",
    data: {
        columns: string[],
        periodInfo: {
            pendingPeriod: { start: string, end: string },
            noDataMessage?: string
        },
        overview: OverviewMetric[],
        categories: {
            "E-GAMES": OverviewMetric[],
            "SPORTS BETTING": OverviewMetric[]
        }
    }
}
```

**Business Logic**:
1. Determines user hierarchy based on role
2. Calculates cycle dates for each gaming category
3. Aggregates pending and settled commission data
4. Generates overview metrics and category breakdowns
5. Handles empty data scenarios with appropriate messaging

#### `getRunningTally(userId: string, userRole: string, timestamp: Date)`
**Purpose**: Provides real-time commission tally for the current cycle period.

**Parameters**:
- `userId`: User ID
- `userRole`: User's role for access control
- `timestamp`: Current timestamp

**Returns**: Promise\<Object\> with running tally data

**Category Processing**:
- **E-Games & Speciality Games RNG**: Bi-monthly cycles
- **Sports Betting & Speciality Games Tote**: Weekly cycles

**Response Structure**:
```typescript
{
    columns: string[],
    roleLabel: string,
    tally: [{
        metric: "Commission Available for Payout",
        eGames: number,
        sportsBetting: number,
        specialityGamesTote: number,
        specialityGamesRNG: number
    }],
    from: string,
    to: string
}
```

#### `getTotalCommissionByUser(userId: string)`
**Purpose**: Calculates total commission across all categories for a user, including settled and pending amounts.

**Returns**: Promise\<Object\> with comprehensive commission breakdown

**Complex Business Logic**:
1. **Hierarchy Management**: Builds user hierarchies based on role (Super Admin → Operator → Platinum → Golden)
2. **Settlement Tracking**: Distinguishes between settled and pending commissions
3. **Payment Gateway Fee Calculation**: Deducts applicable fees from commission totals
4. **Category-Specific Cycles**: Handles different computation periods per gaming category

#### `getTotalBreakdown(userId: string, roleName: string)`
**Purpose**: Generates detailed commission breakdown with pending/settled analysis across all gaming categories.

**Parameters**:
- `userId`: User ID for breakdown generation
- `roleName`: User's role for access control

**Returns**: Promise\<Object\> with comprehensive breakdown

**Breakdown Structure**:
```typescript
{
    columns: string[],
    periodInfo: { pendingPeriod: { start: string, end: string } },
    rows: [{
        label: string,
        pendingSettlement: number,
        settledAllTime: number,
        note?: string
    }]
}
```

**Row Categories**:
- Total EGames
- Total Sports Betting  
- Total Speciality Games (RNG & Tote)
- Gross Commissions
- Less: Total Payment Gateway Fees
- Net Commission (role-dependent)
- Commission Available for Payout

### 4. Settlement Management

#### `getPendingSettlements(userId: string, roleName: string)`
**Purpose**: Retrieves pending commission settlements with detailed breakdown by network/user.

**Parameters**:
- `userId`: User ID
- `roleName`: User's role for access control

**Returns**: Promise\<Object\> with pending settlements data

**Settlement Processing**:
1. **Date Range Calculation**: Determines previous completed cycle dates
2. **Hierarchy Building**: Constructs user hierarchies based on role
3. **Commission Aggregation**: Groups commissions by user and category
4. **Payment Gateway Fee Integration**: Calculates and deducts applicable fees
5. **Network Grouping**: Organizes data by network/username for easy settlement processing

**Response Structure**:
```typescript
{
    columns: string[],
    periodInfo: { start: string, end: string },
    rows: [{
        ids: string[],
        network: string,
        totalEgamesCommissions: number,
        totalSportsBettingCommissions: number,
        totalSpecialtyGamesRNGCommissions: number,
        totalSpecialtyGamesToteCommissions: number,
        grossCommissions: number,
        paymentGatewayFees: number,
        netCommissions: number,
        transferableAmount: number,
        breakdownAction: "view",
        releaseAction: "release_comms"
    }]
}
```

#### `markCommissionSummaryStatus(ids: string[], childrenCommissionIds: string[], roleName: UserRole)`
**Purpose**: Marks commission summaries as settled based on role hierarchy.

**Parameters**:
- `ids`: Commission summary IDs to mark as settled
- `childrenCommissionIds`: Child commission IDs for hierarchical settlement
- `roleName`: Role performing the settlement

**Returns**: Promise\<any\> with settlement result

### 5. License and Category Breakdowns

#### `getLicenseBreakdown(userId: string, roleName: string)`
**Purpose**: Provides detailed commission breakdown by gaming license types.

**Parameters**:
- `userId`: User ID
- `roleName`: User's role

**Returns**: Promise\<Object\> with license-specific breakdown

**License Categories**:
- **E-Games**: GGR-based commissions
- **Sports Betting**: Bet amount-based commissions  
- **Speciality Games - Tote**: Bet amount-based commissions
- **Speciality Games - RNG**: GGR-based commissions

**Role-Specific Commission Rates**:
- **Super Admin**: Fixed default rates
- **Other Roles**: Database-configured rates per category

#### `getCommissionBreakdown(userId: string, role: string, startDate?: Date, endDate?: Date, targetUserId?: string)`
**Purpose**: Generates hierarchical commission breakdown for operators showing platinum and golden partners.

**Parameters**:
- `userId`: Primary user ID
- `role`: User's role
- `startDate`: Optional start date filter
- `endDate`: Optional end date filter  
- `targetUserId`: Optional target user for specific breakdown

**Returns**: Promise\<Object\> with hierarchical breakdown

**Hierarchy Structure**:
```typescript
{
    data: {
        platinum: PlatinumUser[],
        golden: GoldenUser[]
    }
}
```

### 6. Payment Gateway Fee Management

#### `getPaymentGatewayFeesBreakdown(userId: string, roleName: string)`
**Purpose**: Calculates and categorizes payment gateway fees.

**Parameters**:
- `userId`: User ID
- `roleName`: User's role for access scope

**Returns**: Promise\<Object\> with fee breakdown

**Fee Categories**:
- Deposit fees
- Withdrawal fees
- Total payment gateway fees

#### `getPaymentGatewayFee(userIds: string[], settled: boolean, startDate: Date, endDate: Date, roleName?: string)`
**Purpose**: Private helper method to calculate payment gateway fees for specific users and time periods.

**Parameters**:
- `userIds`: Array of user IDs
- `settled`: Whether to include settled or pending fees
- `startDate`: Start date for calculation
- `endDate`: End date for calculation
- `roleName`: Optional role for settlement status filtering

**Returns**: Promise\<number\> with total fee amount

## Business Logic Workflows

### Commission Calculation Workflow

1. **User Role Identification**: Determine user's role in the hierarchy
2. **Category Processing**: Process each gaming category with appropriate cycle dates
3. **Hierarchy Building**: Build user hierarchies based on parent-child relationships
4. **Data Aggregation**: Aggregate commission data across users and categories
5. **Fee Calculation**: Calculate and deduct payment gateway fees
6. **Settlement Status**: Distinguish between settled and pending commissions
7. **Response Formatting**: Format data according to UI requirements

### Settlement Processing Workflow

1. **Validation**: Validate user permissions and commission IDs
2. **Hierarchy Validation**: Ensure settlement follows proper hierarchy
3. **Status Update**: Update commission settlement status in database
4. **Cascade Updates**: Update child commission statuses if applicable
5. **Audit Trail**: Log settlement actions for audit purposes

### Report Generation Workflow

1. **Date Range Calculation**: Determine appropriate cycle dates
2. **Data Retrieval**: Fetch commission data from database
3. **Role-Based Filtering**: Apply role-based access controls
4. **Data Transformation**: Transform raw data into report format
5. **Calculation Processing**: Perform necessary calculations and aggregations
6. **Response Structuring**: Structure data for frontend consumption

## Role-Based Access Patterns

### Super Admin Access
- **Scope**: All operators and their hierarchies
- **Data**: Aggregated data across all operators
- **Settlements**: Can settle operator commissions
- **Reports**: System-wide commission reports

### Operator Access  
- **Scope**: Own data plus direct platinum partners and their golden children
- **Data**: Operator's own commissions plus downline breakdown
- **Settlements**: Can settle platinum partner commissions
- **Reports**: Operator-specific and downline reports

### Platinum Access
- **Scope**: Own data plus direct golden partners
- **Data**: Platinum's own commissions plus golden partner breakdown  
- **Settlements**: Can settle golden partner commissions
- **Reports**: Platinum-specific and golden partner reports

### Golden Access
- **Scope**: Own data only
- **Data**: Only own commission data
- **Settlements**: Cannot settle commissions
- **Reports**: Own commission reports only

## Commission Calculation Logic

### Commission Rate Determination
```typescript
// Super Admin rates (fixed)
const rates = {
    "E-Games": 30,
    "Sports Betting": 2, 
    "Speciality Games - Tote": 2,
    "Speciality Games - RNG": 30
};

// Other roles (database-configured)
const commission = await prisma.commission.findFirst({
    where: { userId, categoryId },
    select: { commissionPercentage: true }
});
```

### GGR-Based Calculation (E-Games, Speciality Games RNG)
```typescript
const commission = netGGR * (commissionRate / 100);
```

### Bet Amount-Based Calculation (Sports Betting, Speciality Games Tote)  
```typescript
const commission = totalBetAmount * (commissionRate / 100);
```

### Net Commission Calculation
```typescript
const netCommission = grossCommission - paymentGatewayFees;
```

## Date Cycle Management

### Bi-Monthly Cycles (E-Games, Speciality Games RNG)
- **First Half**: 1st - 15th of month
- **Second Half**: 16th - end of month

### Weekly Cycles (Sports Betting, Speciality Games Tote)  
- **Week Period**: Monday - Sunday
- **Calculation**: Based on day of week offset

### Cycle Date Calculation Logic
```typescript
private async getPreviousCompletedCycleDates(categoryName?: string) {
    if (categoryName === "Sports Betting" || categoryName === "Speciality Games - Tote") {
        return this.getWeeklyCompletedCycleDates(currentDate);
    }
    // Bi-monthly logic for other categories
    if (currentDay >= 16) {
        // Show first half of current month
        cycleStartDate = new Date(year, month, 1);
        cycleEndDate = new Date(year, month, 15);
    } else {
        // Show second half of previous month  
        cycleStartDate = new Date(year, month - 1, 16);
        cycleEndDate = endOfMonth(new Date(year, month - 1));
    }
}
```

## Error Handling

### Common Error Patterns
```typescript
try {
    // Business logic
    const result = await this.commissionDao.someOperation();
    return result;
} catch (error) {
    throw new Error(`Error in operation: ${error}`);
}
```

### Role-Based Authorization Errors
```typescript
if (roleName !== UserRole.SUPER_ADMIN && roleName !== UserRole.OPERATOR) {
    throw new Error("Unauthorized access to commission data");
}
```

### Data Validation Errors
```typescript
if (!userId || !Array.isArray(ids)) {
    throw new Error("Invalid parameters provided");
}
```

## Usage Examples

### Basic Commission Retrieval
```typescript
const commissionService = new CommissionService();
const user = { id: "user123", role: { name: "operator" } };
const summaries = await commissionService.getCommissionSummaries(user);
```

### Generate Payout Report
```typescript
const report = await commissionService.getCommissionPayoutReport(
    "user123", 
    "category456"
);
```

### Get Running Tally
```typescript
const tally = await commissionService.getRunningTally(
    "user123",
    "operator", 
    new Date()
);
```

### Mark Commission as Settled
```typescript
await commissionService.markCommissionSummaryStatus(
    ["comm1", "comm2"],
    ["child1", "child2"],
    UserRole.OPERATOR
);
```

### Generate License Breakdown
```typescript
const breakdown = await commissionService.getLicenseBreakdown(
    "user123",
    "platinum"
);
```

---

## Additional Notes

### Performance Considerations
- Complex hierarchical queries may impact performance with large datasets
- Database indexing on userId, categoryName, and createdAt fields is recommended
- Consider implementing caching for frequently accessed commission summaries

### Business Rules
- Commission settlements follow strict hierarchy: Super Admin → Operator → Platinum → Golden
- Payment gateway fees are deducted from gross commissions at the Golden level
- Different gaming categories have different commission calculation cycles
- Settlement status propagates down the hierarchy when parent commissions are settled

### Integration Points
- **Transaction System**: Retrieves bet amounts and GGR data
- **User Management**: Validates user hierarchies and permissions  
- **Audit System**: Logs commission settlements and status changes
- **Reporting System**: Provides data for various commission reports
