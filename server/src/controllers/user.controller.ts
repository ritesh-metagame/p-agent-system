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
      const userData = {
        ...req.body,
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

  public static async getPartners(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;

      const userService = Container.get(UserService);

      const response = await userService.getUsersByParentId(user.id);

      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { startDate, endDate } = req.query;

      const userService = Container.get(UserService);

      const response = await userService.getAllUsers(
        startDate as string,
        endDate as string
      );

      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async getTransactionByCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { categoryName } = req.query;

      console.log("Category Name in UserController:", categoryName);

      const userService = Container.get(UserService);

      const response = await userService.getTransactionByCategory(
        categoryName as string
      );

      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async getTransactionByCategoryAndAgent(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { categoryName } = req.query;
      const { agent } = req.query;

      console.log("Category Name in UserController:", categoryName);

      const userService = Container.get(UserService);

      const response = await userService.getTransactionByCategoryAndAgent(
        categoryName as string,
        agent as "gold" | "platinum" | "operator"
      );

      return response;
    } catch (error) {
      next(error);
    }
  }
}

export { UserController };
