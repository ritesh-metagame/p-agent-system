import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { CommissionService } from "../services/commission.service";

class CommissionController {
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

      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async commissionByCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { date } = req.query as any;

      const commissionService = Container.get(CommissionService);

      const response = await commissionService.createCommissionCategory(date);

      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async topPerformer(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { date } = req.query as any;

      const commissionService = Container.get(CommissionService);

      const response = await commissionService.getTopPerformer(date);

      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async getTotalCommissionByUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req.query as any;

      const commissionService = Container.get(CommissionService);

      const response = await commissionService.getTotalCommissionByUser(userId);

      return response;
    } catch (error) {
      next(error);
    }
  }
}

export { CommissionController };
