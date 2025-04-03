import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { CommissionService } from "../services/commission.service";

class UserController {
  public static async createCommission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { roleId, siteId, userId, categoryId, commissionPercentage } =
        req.body;

      const commissionData = {
        roleId,
        siteId,
        userId,
        categoryId,
        commissionPercentage,
      };

      const commissionService = Container.get(CommissionService);

      const response = await commissionService.createCommission(commissionData);

      return res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export { UserController };
