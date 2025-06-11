# P-Agent System - Commission Documentation Index

This directory contains comprehensive documentation for the commission calculation system in the P-Agent platform.

## Documentation Files

### 📋 [CALCULATIONS_DOCUMENTATION.md](./CALCULATIONS_DOCUMENTATION.md)
**Primary Reference Document**
- Complete overview of all calculation methods
- Commission rate constants and formulas
- Payment gateway fee calculations
- Hierarchical commission distribution
- Settlement and revenue calculations
- Detailed examples and use cases

**Best for**: Understanding the business logic, formulas, and mathematical foundations

### 🛠️ [COMMISSION_IMPLEMENTATION_GUIDE.md](./COMMISSION_IMPLEMENTATION_GUIDE.md)
**Technical Implementation Guide**
- File structure and class architecture
- Data models and relationships
- Algorithm implementations
- Error handling and validation
- Performance optimization
- Testing strategies
- Configuration management

**Best for**: Developers implementing features, debugging issues, or extending functionality

### ⚡ [COMMISSION_QUICK_REFERENCE.md](./COMMISSION_QUICK_REFERENCE.md)
**Quick Lookup Reference**
- Commission rate table
- Key formula summaries
- API endpoint reference
- Database schema overview
- Troubleshooting checklist
- Common error patterns

**Best for**: Quick lookups, troubleshooting, and day-to-day reference

### ⏰ [CRON_JOB_DOCUMENTATION.md](./CRON_JOB_DOCUMENTATION.md)
**Automated Processing System**
- Daily commission processing schedule
- Transaction processing pipeline
- Error handling and recovery mechanisms
- Meta data tracking and state management
- Hierarchical commission calculation flow
- Monitoring and logging guidelines

**Best for**: Understanding automated processing, troubleshooting cron issues, and system maintenance

### 🌐 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
**Complete API Reference**
- All commission-related endpoints
- Request/response formats and examples
- Authentication and authorization details
- Error codes and troubleshooting
- Rate limiting and best practices
- Integration examples and usage patterns

**Best for**: API integration, frontend development, and third-party integrations

## Getting Started

### For Business Analysts
1. Start with [CALCULATIONS_DOCUMENTATION.md](./CALCULATIONS_DOCUMENTATION.md)
2. Focus on "Commission Rate Constants" and "Examples and Use Cases" sections
3. Use [COMMISSION_QUICK_REFERENCE.md](./COMMISSION_QUICK_REFERENCE.md) for formula lookups

### For Developers
1. Begin with [COMMISSION_IMPLEMENTATION_GUIDE.md](./COMMISSION_IMPLEMENTATION_GUIDE.md)
2. Review "Commission Service Architecture" and "Data Models" sections
3. Reference [CALCULATIONS_DOCUMENTATION.md](./CALCULATIONS_DOCUMENTATION.md) for business logic understanding
4. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint specifications

### For System Administrators
1. Start with [CRON_JOB_DOCUMENTATION.md](./CRON_JOB_DOCUMENTATION.md)
2. Focus on "Scheduling System" and "Error Handling" sections
3. Use [COMMISSION_QUICK_REFERENCE.md](./COMMISSION_QUICK_REFERENCE.md) for troubleshooting
4. Monitor processing through logging guidelines

### For API Integrators
1. Primary reference: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review authentication and authorization requirements
3. Study response formats and error handling
4. Implement rate limiting and best practices

### For Support Teams
1. Use [COMMISSION_QUICK_REFERENCE.md](./COMMISSION_QUICK_REFERENCE.md) as primary reference
2. Check "Troubleshooting Checklist" for common issues
3. Refer to detailed docs for complex scenarios

## Key Concepts Summary

### Commission Rates
- **E-Games**: 30% of GGR (Gross Gaming Revenue)
- **Sports Betting**: 2% of bet amount (minus refunds)
- **Speciality Games RNG**: 30% of GGR
- **Speciality Games Tote**: 2% of bet amount

### User Hierarchy
```
Super Admin → Operator → Platinum → Golden
```

### Settlement Flow
- Golden agents settled by Platinum
- Platinum agents settled by Operators  
- Operators settled by Super Admin

### Core Calculations
- **Revenue**: `Bet Amount - Payout Amount`
- **Commission**: `Base Amount × Commission Rate`
- **Net Payout**: `Total Commission - User Share - Parent Share - Fees`

## File Organization in Codebase

### Core Files
```
server/src/
├── services/commission.service.ts     # Main business logic
├── daos/commission.dao.ts            # Data access layer
├── daos/generateCommission.ts        # Daily processing
├── daos/user.dao.ts                  # User calculations
├── commission-cron.ts                # Automated processing
└── controllers/commission.controller.ts # API endpoints
```

### Documentation Files
```
server/docs/
├── CALCULATIONS_DOCUMENTATION.md     # Complete calculation reference
├── COMMISSION_IMPLEMENTATION_GUIDE.md # Technical implementation
├── COMMISSION_QUICK_REFERENCE.md     # Quick lookup guide
├── CRON_JOB_DOCUMENTATION.md         # Automated processing system
├── API_DOCUMENTATION.md              # Complete API reference
└── README.md                         # This index file
```

## Common Use Cases

### Calculating Commission for a Transaction
1. Determine platform type (E-Games, Sports Betting, etc.)
2. Calculate base amount based on platform rules
3. Apply appropriate commission rate
4. Factor in user role and hierarchy
5. Deduct payment gateway fees

### Generating Daily Commission Summaries
1. Fetch all transactions for the date
2. Group by user ID and platform category
3. Apply role-specific commission calculations
4. Create commission summary records
5. Set settlement status to pending

### Processing User Payouts
1. Validate settlement status by role hierarchy
2. Calculate total commission amounts by platform
3. Subtract user's commission share
4. Subtract parent commission (if applicable)
5. Subtract payment gateway fees
6. Return final payout amount

## Update Guidelines

When modifying commission calculations:

1. **Update Documentation**: Ensure all three documentation files reflect changes
2. **Test Thoroughly**: Commission calculations affect financial transactions
3. **Version Control**: Tag releases that change calculation logic
4. **Audit Trail**: Log all commission calculation changes
5. **Backward Compatibility**: Consider impact on historical data

## Support and Maintenance

### For Questions About:
- **Business Logic**: Check CALCULATIONS_DOCUMENTATION.md
- **Implementation Details**: Check COMMISSION_IMPLEMENTATION_GUIDE.md  
- **Quick Answers**: Check COMMISSION_QUICK_REFERENCE.md
- **Automated Processing**: Check CRON_JOB_DOCUMENTATION.md
- **API Usage**: Check API_DOCUMENTATION.md
- **System Integration**: Check commission.controller.ts and route files

### For Issues:
1. Check troubleshooting section in COMMISSION_QUICK_REFERENCE.md
2. Verify settlement status and user hierarchy
3. Validate commission rates and platform mappings
4. Check logs for processing errors

## Version History

- **v1.0** (2025-06-08): Initial comprehensive documentation
  - Complete calculation reference
  - Technical implementation guide
  - Quick reference and troubleshooting
  - Automated cron job processing documentation
  - Complete API reference with examples

## Related Documentation

- Database schema documentation: `../prisma/schema/`
- API documentation: Controller files and route definitions
- Configuration files: `../src/common/config/`
- Logging configuration: `../src/common/logger/`

---

*For additional support or questions not covered in these documents, please contact the development team.*
