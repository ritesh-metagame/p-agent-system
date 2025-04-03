import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { UserService } from "../services/user.service";

class UserController {
  public static async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        username,
        password,
        firstname,
        lastname,
        mobileNumber,
        bankName,
        accountNumber,
        roleId,
        parentId,
      } = req.body;

      const userData = {
        username,
        password,
        firstname,
        lastname,
        mobileNumber,
        bankName,
        accountNumber,
      };

      const role = req.role;
      const user = req.user;

      console.log("Role in UserController:", role);

      const userService = Container.get(UserService);

      const response = await userService.createUser(userData, role, user);

      return response;
    } catch (error) {
      next(error);
    }
  }
}

export { UserController };
