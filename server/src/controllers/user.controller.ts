import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { UserService } from "../services/user.service";
import { UserRole } from "../common/config/constants";

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

  public static async registerPartner(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userData = {
        ...req.body,
      };

      // const role = req.role;
      // const user = req.user;

      // console.log("Role in UserController:", role);

      const userService = Container.get(UserService);

      const response = await userService.registerPartner(userData);

      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async getPartnerApprovalList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;

      const userService = Container.get(UserService);

      const response = await userService.getPartnersForApproval(user);

      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async approvePartner(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      const partnerId = req.body.partnerId;

      const userService = Container.get(UserService);

      const response = await userService.approvePartner(req.body);

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
        agent as UserRole
      );

      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async getUserDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.params.userId;
      const userService = Container.get(UserService);
      const response = await userService.getUserDetails(userId);
      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.params.userId;
      const userData = req.body;
      const currentUser = req.user;

      const userService = Container.get(UserService);
      const response = await userService.updateUser(
        userId,
        userData,
        currentUser
      );
      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async getUserDetailsByUsername(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const username = req.params.username;
      const userService = Container.get(UserService);
      const response = await userService.getUserDetailsByUsername(username);
      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async updateUserByUsername(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const username = req.params.username;
      const userData = req.body;
      const currentUser = req.user;

      const userService = Container.get(UserService);
      const response = await userService.updateUserByUsername(
        username,
        userData,
        currentUser
      );
      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.params.userId;
      const profileData = req.body;
      const currentUser = req.user;

      const userService = Container.get(UserService);
      const response = await userService.updateProfile(
        userId,
        profileData,
        currentUser
      );
      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async getPayoutAndWalletBalance(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;

      console.log("User in UserController:", user);

      const userService = Container.get(UserService);

      const response = await userService.getUserPayoutAndWalletBalance(user.id);

      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async getDownloadReportList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { downlineId, fromDateISO, toDateISO } = req.body;
      const user = req.user;

      console.log("Userid in UserController:", user);

      const userService = Container.get(UserService);

      const response = await userService.getDownloadReportLists(
        user,
        downlineId,
        fromDateISO,
        toDateISO,
        res
      );

      return response;
    } catch (error) {
      next(error);
    }
  }
}

export { UserController };
