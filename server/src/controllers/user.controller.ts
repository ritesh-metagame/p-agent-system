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
      const { username, password, roleId, parentId } = req.body;

      const userData = {
        username,
        password,
        roleId,
      };

      const userService = Container.get(UserService);

      const response = await userService.createUser(userData);

      return res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export { UserController };
