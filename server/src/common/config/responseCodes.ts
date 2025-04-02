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

  static readonly USER_SITE_CREATED_SUCCESSFULLY = {
    code: "1006",
    message: "User site created successfully",
  } as const;
}

export { ResponseCodes };
