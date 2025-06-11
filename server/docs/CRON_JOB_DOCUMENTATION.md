# Commission Cron Job Documentation

## Overview

The commission cron job (`commission-cron.ts`) is an automated system that processes betting transactions and calculates commissions for the P-Agent system. It runs daily at 6:30 PM UTC (12:00 AM IST) to ensure all betting data is processed and commission calculations are up to date.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Scheduling System](#scheduling-system)
3. [Processing Pipeline](#processing-pipeline)
4. [Error Handling & Recovery](#error-handling--recovery)
5. [Meta Data Tracking](#meta-data-tracking)
6. [Transaction Processing](#transaction-processing)
7. [Commission Summary Generation](#commission-summary-generation)
8. [Configuration & Constants](#configuration--constants)
9. [Monitoring & Logging](#monitoring--logging)

## Architecture Overview

The cron job system consists of several key components:

- **Scheduler**: Handles daily scheduling and initial runs
- **Data Processor**: Fetches and processes betting transactions
- **Commission Calculator**: Calculates hierarchical commissions
- **Meta Tracker**: Maintains processing state and recovery points
- **Logger**: Provides comprehensive logging for monitoring

## Scheduling System

### Schedule Configuration

```
Daily Schedule: 6:30 PM UTC (12:00 AM IST)
Cron Expression: '30 18 * * *'
Initial Run: 2 minutes after server start
```

### Scheduling Functions

#### `scheduleDailyCommissionJob()`

Sets up the daily commission processing schedule with intelligent timing:

**Features:**
- Initial run 2 minutes after server start for immediate processing
- Daily recurring schedule at 6:30 PM UTC
- Timezone-aware scheduling using Luxon DateTime
- Automatic handling of next-day scheduling if current time has passed

**Implementation Details:**
```typescript
// If current time is past 6:30 PM UTC, schedule for next day
if (nowUTC > target) {
    target = target.plus({days: 1});
}
```

### Time Zone Handling

- **Server Time**: UTC
- **Business Time**: IST (UTC+5:30)
- **Processing Window**: Daily at midnight IST business time

## Processing Pipeline

### Main Processing Flow

#### 1. `runCommissionCron()`

Main entry point for commission processing:

1. **Fetch Last Processed Date**: Retrieves last successful processing timestamp
2. **Determine Processing Range**: Calculates start and end times for processing
3. **Process Transactions**: Calls `processCommissionBetween()` for the time range
4. **Update Meta Data**: Records successful completion timestamp

### Data Retrieval

#### `getLastProcessedDate()`

Retrieves the last successful processing timestamp from meta data:

```typescript
const meta = await prisma.commissionProcessMeta.findUnique({
    where: {id: META_ID},
});
return meta?.lastProcessedAt ?? null;
```

#### `setLastProcessedDate(date: Date)`

Updates the processing meta data with successful completion:

```typescript
await prisma.commissionProcessMeta.upsert({
    where: {id: META_ID},
    update: {lastProcessedAt: date},
    create: {
        id: META_ID,
        lastProcessedAt: date,
    },
});
```

#### `getEarliestBetAfter(date: Date)`

Finds the earliest bet after a given date for initial processing:

```sql
SELECT time_of_bet
FROM bets
WHERE time_of_bet >= '${date.toISOString()}'
ORDER BY time_of_bet ASC LIMIT 1
```

#### `getBetsBetween(start: Date, end: Date)`

Retrieves all betting transactions within a time range:

```sql
SELECT *
FROM bets
WHERE time_of_bet BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
```

## Meta Data Tracking

### Processing State Management

The system maintains processing state using the `commissionProcessMeta` table:

**Meta ID**: `"commission-meta"`
**Fields:**
- `id`: Unique identifier for the meta record
- `lastProcessedAt`: Timestamp of last successful processing

### Recovery Mechanism

**First Run Scenario:**
- If no meta data exists, process from `IGNORE_BEFORE_DATE`
- Find earliest bet after ignore date
- Process all transactions from first bet to current time

**Subsequent Runs:**
- Use `lastProcessedAt` as start time
- Process from last processed time to current time
- Ensures no transactions are missed or duplicated

### Safety Constants

```typescript
const IGNORE_BEFORE_DATE = new Date("2025-05-26T00:00:00.000Z");
const META_ID = "commission-meta";
```

## Transaction Processing

### Platform Type Normalization

The system normalizes platform types for consistent processing:

```typescript
const normalizedPlatform =
    platformType === "egames"
        ? "E-Games"
        : platformType === "sports" || platformType === "sportsbet"
            ? "Sports Betting"
            : platformType;
```

### Category ID Mapping

```typescript
const categoryIdMap: Record<string, string> = {
    egames: "8a2ac3c1-202d-11f0-81af-0a951197db91",
    sportsbet: "8a2ac69c-202d-11f0-81af-0a951197db91",
};
```

### Base Amount Calculation

Different platforms use different base amounts for commission calculation:

**E-Games**: Revenue (bet amount - payout amount)
```typescript
const revenue = betAmount.minus(payoutAmount);
```

**Sports Betting**: Bet amount minus refunds
```typescript
const baseAmount = betAmount.minus(refundAmount);
```

### Hierarchical Commission Processing

#### 1. Golden Agent (GA) Commission

```typescript
const gaCommissionRecord = await prisma.commission.findFirst({
    where: {
        userId: gaId,
        categoryId,
    },
});

const gaPercentage = new Decimal(gaCommissionRecord?.commissionPercentage || 0);
const gaCommission = baseAmount.mul(gaPercentage).div(100);
```

#### 2. Master Agent (MA) Commission

```typescript
const maId = gaUser?.parentId || null;
const maCommissionRecord = await prisma.commission.findFirst({
    where: {
        userId: maId,
        categoryId,
    },
});

const maPercentage = new Decimal(maCommissionRecord?.commissionPercentage || 0);
const maCommission = baseAmount.mul(maPercentage).div(100);
```

#### 3. Owner Commission

```typescript
const maUser = await prisma.user.findUnique({where: {id: maId}});
const ownerId = maUser?.parentId || null;

const ownerCommissionRecord = await prisma.commission.findFirst({
    where: {
        userId: ownerId,
        categoryId,
    },
});

const ownerPercentage = new Decimal(ownerCommissionRecord?.commissionPercentage || 0);
const ownerCommission = baseAmount.mul(ownerPercentage).div(100);
```

### Transaction Object Structure

```typescript
const transaction = {
    transactionId: String(row["transaction_id"]),
    betTime: row["time_of_bet"],
    userId: row["User Id"],
    playerName: row["player_id"],
    platformType: normalizedPlatform,
    transactionType: row["transaction_type"],

    // Financial Data
    deposit: new Decimal(row["deposit_amount"] || 0),
    withdrawal: new Decimal(row["withdraw_amount"] || 0),
    betAmount: new Decimal(row["bet_amount"] || 0),
    payoutAmount: new Decimal(row["payout_amount"] || 0),
    refundAmount: new Decimal(row["refund_amount"] || 0),
    revenue: revenue,
    pgFeeCommission: new Decimal(row["pg_fee_commission"] || 0),

    // Status
    status: row["status"] || null,
    settled: "N",

    // Commission Hierarchy
    gaId, gaName, gaPercentage, gaCommission,
    maId, maName, maPercentage, maCommission,
    ownerId, ownerName, ownerPercentage, ownerCommission,
};
```

## Commission Summary Generation

### Date Collection

The system collects unique dates for commission summary generation:

```typescript
const involvedDates = new Set<string>(); // collect unique dates in UTC
const betDateUtc = format(new Date(row["time_of_bet"]), "yyyy-MM-dd");
involvedDates.add(betDateUtc);
```

### Summary Creation

For each unique date, the system generates commission summaries:

```typescript
for (const date of involvedDates) {
    await commissionService.createCommissionCategory(date);
}
```

## Error Handling & Recovery

### Transaction Insertion

```typescript
try {
    await prisma.transaction.create({data: transaction});
} catch (err) {
    console.error("Error inserting transaction:", transaction.transactionId, err);
}
```

### Commission Summary Generation

```typescript
try {
    await commissionService.createCommissionCategory(date);
} catch (err) {
    logger.error(`❌ Error creating commission for date ${date}:`, err);
}
```

### Validation Checks

**Missing GA ID Validation:**
```typescript
if (!gaId) {
    logger.warn(`GA ID ${gaId} not found. Skipping transaction.`);
    continue;
}
```

**Missing User Validation:**
```typescript
if (!gaUser) {
    logger.warn(`GA user ${gaId} not found. Skipping transaction.`);
    continue;
}
```

### Recovery Strategy

1. **Graceful Degradation**: Continue processing even if individual transactions fail
2. **Comprehensive Logging**: Log all errors with context for debugging
3. **State Preservation**: Only update meta data after successful completion
4. **Incremental Processing**: Process only new data since last successful run

## Monitoring & Logging

### Log Levels and Messages

**INFO Level:**
- Cron job start/completion
- Processing statistics
- Date range information

**WARN Level:**
- Missing user IDs
- Skipped transactions
- Data validation issues

**ERROR Level:**
- Database insertion failures
- Commission calculation errors
- System-level failures

### Key Logging Points

```typescript
logger.info("Starting commission cron...");
logger.info("Last processed date:", lastProcessed?.toISOString());
logger.info(`Processing bets between ${start.toISOString()} and ${end.toISOString()} with ${rawRows.length} rows`);
logger.info(`Collected ${involvedDates.size} unique dates for commission summaries`);
logger.info("Commission cron completed successfully.");
```

### Monitoring Metrics

- **Processing Time**: Duration of each cron run
- **Transaction Count**: Number of transactions processed
- **Error Rate**: Failed transaction insertions
- **Date Coverage**: Number of unique dates processed
- **Success Rate**: Successful commission summary generation

## Configuration & Constants

### Time Constants

```typescript
IGNORE_BEFORE_DATE = "2025-05-26T00:00:00.000Z"
META_ID = "commission-meta"
```

### Scheduling Constants

```typescript
CRON_SCHEDULE = "30 18 * * *"  // 6:30 PM UTC daily
INITIAL_DELAY = 2 minutes      // Delay before first run
TIME_ZONE = "UTC"              // Server timezone
BUSINESS_TIMEZONE = "IST"      // Business timezone (UTC+5:30)
```

### Platform Constants

```typescript
const categoryIdMap = {
    egames: "8a2ac3c1-202d-11f0-81af-0a951197db91",
    sportsbet: "8a2ac69c-202d-11f0-81af-0a951197db91",
};
```

## Performance Considerations

### Database Optimization

1. **Batch Processing**: Processes all transactions in time range together
2. **Indexed Queries**: Uses time-based indexes for efficient data retrieval
3. **Transaction Isolation**: Each bet processing is isolated to prevent data corruption

### Memory Management

1. **Streaming Processing**: Processes transactions one by one to avoid memory issues
2. **Set Collection**: Uses Set for unique date collection to minimize memory
3. **Decimal Precision**: Uses Decimal library for precise financial calculations

### Error Recovery

1. **Partial Success**: Can recover from individual transaction failures
2. **State Tracking**: Maintains processing state for restart capability
3. **Incremental Updates**: Only processes new data since last successful run

## Troubleshooting Guide

### Common Issues

**Issue**: Cron job not running
**Solution**: Check server logs for scheduling errors, verify cron expression

**Issue**: Transactions not processing
**Solution**: Check database connectivity, verify bet data format

**Issue**: Commission calculations incorrect
**Solution**: Verify commission rates in database, check hierarchy relationships

**Issue**: Meta data not updating
**Solution**: Check database permissions, verify meta table structure

### Debug Commands

```typescript
// Check last processed date
const lastProcessed = await getLastProcessedDate();

// Check earliest bet
const firstBet = await getEarliestBetAfter(IGNORE_BEFORE_DATE);

// Manually run processing
await runCommissionCron();
```

### Log Analysis

Look for these patterns in logs:
- `Starting commission cron...` - Cron job initiated
- `Processing bets between...` - Data processing started
- `Commission cron completed successfully` - Successful completion
- `Error inserting transaction` - Individual transaction failures
- `Error creating commission for date` - Summary generation failures

## Integration Points

### Database Dependencies

- `bets` table: Source betting transaction data
- `commissionProcessMeta` table: Processing state tracking
- `transaction` table: Processed transaction storage
- `commission` table: Commission rate configuration
- `user` table: Hierarchy relationship data

### Service Dependencies

- `CommissionService`: Commission summary generation
- `Logger`: System logging and monitoring
- `Prisma`: Database ORM and query execution
- `Luxon`: Timezone-aware date handling

### External Dependencies

- **Node-cron**: Task scheduling
- **Date-fns**: Date formatting utilities
- **Decimal.js**: Precise decimal calculations

## Future Enhancements

### Planned Improvements

1. **Real-time Processing**: Move from batch to real-time transaction processing
2. **Parallel Processing**: Add multi-threading for large data volumes
3. **Advanced Monitoring**: Add metrics collection and alerting
4. **Backup Processing**: Add secondary processing nodes for redundancy
5. **Configuration UI**: Add web interface for cron job management
