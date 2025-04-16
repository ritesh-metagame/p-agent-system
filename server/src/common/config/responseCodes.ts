class ResponseCodes {
  static readonly INVALID_USERNAME_OR_PASSWORD = {
    code: "1001",
    message: "Invalid username or password",
  } as const;

  static readonly LOGIN_SUCCESSFUL = {
    code: "1002",
    message: "Login successful",
  } as const;

  static readonly SOMETHING_WENT_WRONG = {
    code: "1003",
    message: "Something went wrong",
  } as const;

  static readonly USER_CREATED_SUCCESSFULLY = {
    code: "1004",
    message: "User created successfully",
  } as const;

  static readonly SITE_CREATED_SUCCESSFULLY = {
    code: "1005",
    message: "Site created successfully",
  } as const;
  static readonly SITE_CREATED_FAILED = {
    code: "400",
    message: "Site created failed",
  } as const;

  static readonly SITES_FETCHED_SUCCESSFULLY = {
    code: "1006",
    message: "Sites fetched successfully",
  } as const;

  static readonly USER_SITE_CREATED_SUCCESSFULLY = {
    code: "1006",
    message: "User site created successfully",
  } as const;

  static readonly USER_SITE_CREATED_FAILED = {
    code: "1007",
    message: "User site created failed",
  } as const;

  static readonly USER_SITES_FETCHED_SUCCESSFULLY = {
    code: "1008",
    message: "User sites fetched successfully",
  } as const;

  static readonly USER_SITES_FETCHED_FAILED = {
    code: "1009",
    message: "User sites fetched failed",
  } as const;

  static readonly CATEGORIES_FETCHED_SUCCESSFULLY = {
    code: "1010",
    message: "Categories fetched successfully",
  } as const;
  static readonly CATEGORIES_FETCHED_FAILED = {
    code: "1011",
    message: "Categories fetched failed",
  } as const;

  static readonly ROLE_FETCHED_SUCCESSFULLY = {
    code: "1012",
    message: "Role fetched successfully",
  } as const;

  static readonly ROLE_FETCH_FAILED = {
    code: "1013",
    message: "Role fetch failed",
  } as const;

  static readonly USERS_FETCHED_SUCCESSFULLY = {
    code: "1014",
    message: "Users fetched successfully",
  } as const;

  static readonly TRANSACTION_FETCHED_SUCCESSFULLY = {
    code: "T214",
    message: "Transaction fetched successfully",
  } as const;

  static readonly USERS_FETCHED_FAILED = {
    code: "1015",
    message: "Users fetched failed",
  } as const;

  static readonly NETWORK_STATISTICS_UPDATED_SUCCESSFULLY = {
    code: "1016",
    message: "Network statistics calculated and updated successfully",
  } as const;
  static readonly NETWORK_STATISTICS_FETCHED_SUCCESSFULLY = {
    code: "1017",
    message: "Network statistics fetched successfully",
  } as const;

  static readonly COMMISSION_CREATED_SUCCESSFULLY = {
    code: "2001",
    message: "Commission created successfully",
  } as const;

  static readonly COMMISSION_CREATION_FAILED = {
    code: "2002",
    message: "Commission creation failed",
  } as const;

  static readonly COMMISSION_FETCHED_SUCCESSFULLY = {
    code: "2003",
    message: "Commission fetched successfully",
  } as const;

  static readonly COMMISSION_FETCH_FAILED = {
    code: "2004",
    message: "Commission fetch failed",
  } as const;

  static readonly UNAUTHORIZED = {
    code: "401",
    message: "Unauthorized access",
  } as const;
}

export { ResponseCodes };
