enum UserRole {
  SUPER_ADMIN = "superadmin",
  OPERATOR = "operator",
  PLATINUM = "platinum",
  GOLDEN = "gold",
  PLAYER = "player",
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
  DEFAULT_COMMISSION_COMPUTATION_PERIOD,
};
