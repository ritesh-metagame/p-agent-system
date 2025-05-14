import { Service } from "typedi";
import getLogger from "../common/logger";
import { loginSchema } from "../common/interfaces/auth.interface";
import UserDao from "../daos/user.dao";
import { BcryptService, JWTService } from "../common/lib";
import { Response } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";
import config from "../common/config";

const logger = getLogger(module);

type LoginData = {
  username: string;
  password: string;
};

@Service()
class AuthService {
  private userDao: UserDao;
  private bcryptService: BcryptService;

  constructor() {
    this.userDao = new UserDao();
    this.bcryptService = new BcryptService();
  }

  public async login(data: LoginData) {
    try {
      const result = loginSchema.validate(data);

      if (result.error) {
        logger.error("Validation error: ", result.error.details[0].message);
        return {
          status: false,
          message: result.error.details[0].message,
        };
      }

      const { username, password } = data;

      const user = await this.userDao.getUserByUsername(username);

      if (
        !user ||
        !(await BcryptService.compareHash(password, user.password))
      ) {
        return new Response(
          ResponseCodes.INVALID_USERNAME_OR_PASSWORD.code,
          ResponseCodes.INVALID_USERNAME_OR_PASSWORD.message
        );
      }

      if (user.approved !== 1) {
        return new Response(
          ResponseCodes.USER_NOT_APPROVED.code,
          ResponseCodes.USER_NOT_APPROVED.message
        );
      }

      const token = JWTService.assignToken(
        {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        config.jwtSecret,
        "3600"
      );

      if (!token) {
        return new Response(
          ResponseCodes.SOMETHING_WENT_WRONG.code,
          ResponseCodes.SOMETHING_WENT_WRONG.message
        );
      }

      return new Response(
        ResponseCodes.LOGIN_SUCCESSFUL.code,
        ResponseCodes.LOGIN_SUCCESSFUL.message,
        {
          token: token,
          user: {
            ...user,
            id: user.id,
            username: user.username,
            role: user.role,
          },
        }
      );
    } catch (error) {
      logger.error("Error in login: ", error);
      return error;
    }
  }
}

export { AuthService };
