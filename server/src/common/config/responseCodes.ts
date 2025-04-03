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
}

export { ResponseCodes };
