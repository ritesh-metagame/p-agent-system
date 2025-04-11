import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { CommissionService } from "../services/commission.service";
import { RoleDao } from "../daos/role.dao";
import { prisma } from "../server";
import { Response as ApiResponse } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";

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
      const result = await commissionService.createCommission(commissionData);

      return new ApiResponse(
        ResponseCodes.COMMISSION_CREATED_SUCCESSFULLY.code,
        ResponseCodes.COMMISSION_CREATED_SUCCESSFULLY.message,
        result
      );
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
      const result = await commissionService.createCommissionCategory(date);

      return new ApiResponse(
        ResponseCodes.COMMISSION_CREATED_SUCCESSFULLY.code,
        ResponseCodes.COMMISSION_CREATED_SUCCESSFULLY.message,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getCommissionSummaries(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;

      if (!user || !user.roleId) {
        return new ApiResponse(
          ResponseCodes.UNAUTHORIZED.code,
          "Unauthorized - User details not found",
          null
        );
      }

      // Get user with role details
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });

      if (!userWithRole || !userWithRole.role) {
        return new ApiResponse(
          ResponseCodes.UNAUTHORIZED.code,
          "Unauthorized - User role not found",
          null
        );
      }

      const commissionService = Container.get(CommissionService);
      const summaries = await commissionService.getCommissionSummaries({
        id: userWithRole.id,
        role: { name: userWithRole.role.name },
      });

      // Sanitize the response to handle circular references
      const sanitizedSummaries = JSON.parse(
        JSON.stringify(summaries, (key, value) => {
          // Remove any circular references or complex objects that shouldn't be serialized
          if (key === "prisma" || key === "middleware" || key === "client") {
            return undefined;
          }
          return value;
        })
      );

      return new ApiResponse(
        ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.message,
        sanitizedSummaries
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getCommissionPayoutReport(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { categoryId } = req.query;
      const user = req.user;

      if (!user) {
        return new ApiResponse(
          ResponseCodes.UNAUTHORIZED.code,
          "Unauthorized - User details not found",
          null
        );
      }

      const commissionService = Container.get(CommissionService);
      const result = await commissionService.getCommissionPayoutReport(
        user.id,
        categoryId as string | undefined
      );

      return new ApiResponse(
        ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.message,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getRunningTally(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      const roleId = req.role;

      if (!user || !roleId) {
        return new ApiResponse(
          ResponseCodes.UNAUTHORIZED.code,
          "Unauthorized - User details not found",
          null
        );
      }

      const commissionService = Container.get(CommissionService);
      const roleDao = new RoleDao();

      // Get role details
      const roleDetails = await roleDao.getRoleById(roleId);
      if (!roleDetails) {
        return new ApiResponse(
          ResponseCodes.UNAUTHORIZED.code,
          "Unauthorized - Role not found",
          null
        );
      }

      const runningTally = await commissionService.getRunningTally(
        user.id,
        roleDetails.name.toLowerCase(),
        new Date()
      );

      return new ApiResponse(
        ResponseCodes.COMMISSION_FETCHED_SUCCESSFULLY.code,
        "Commission tally fetched successfully",
        runningTally
      );
    } catch (error) {
      next(error);
    }
  }
}

export { CommissionController };
