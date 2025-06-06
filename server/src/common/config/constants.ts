enum UserRole {
  SUPER_ADMIN = "superadmin",
  OPERATOR = "operator",
  PLATINUM = "platinum",
  GOLDEN = "golden",
  PLAYER = "player",
}

enum ApprovedStatus {
  APPROVED = 1,
  PENDING = 0,
  REJECTED = -1,
}

enum CommissionComputationPeriod {
  MONTHLY = "MONTHLY",
  BI_MONTHLY = "BI_MONTHLY",
}

const DEFAULT_COMMISSION_COMPUTATION_PERIOD =
  CommissionComputationPeriod.BI_MONTHLY;

export {
  UserRole,
  CommissionComputationPeriod,
  ApprovedStatus,
  DEFAULT_COMMISSION_COMPUTATION_PERIOD,
};
