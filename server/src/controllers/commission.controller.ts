import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { CommissionService } from "../services/commission.service";
import { RoleDao } from "../daos/role.dao";
import { prisma } from "../server";
import { Response as ApiResponse } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";

class CommissionController {
  public static async getCommissionByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req.params;
      const commissionService = Container.get(CommissionService);
      const result = await commissionService.getCommissionByUserId(userId);

      return result;
    } catch (error) {
      next(error);
    }
  }

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
      const { categoryId, userId } = req.query;
      const requestingUser = req.user;

      if (!requestingUser) {
        return new ApiResponse(
          ResponseCodes.UNAUTHORIZED.code,
          "Unauthorized - User details not found",
          null
        );
      }

      // If userId is provided, use it, otherwise use requesting user's id
      const targetUserId = (userId as string) || requestingUser.id;

      const commissionService = Container.get(CommissionService);
      const result = await commissionService.getCommissionPayoutReport(
        targetUserId,
        categoryId as string | undefined
      );

      return result;
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

  // public static async topPerformer(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) {
  //   try {
  //     const { date } = req.query as any;

  //     const commissionService = Container.get(CommissionService);

  //     const response = await commissionService.getTopPerformer(date);

  //     return response;
  //   } catch (error) {
  //     next(error);
  //   }
  // }

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

  public static async getTotalBreakdown(
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
      const result = await commissionService.getTotalBreakdown(
        userWithRole.id,
        userWithRole.role.name
      );

      return new ApiResponse(
        "2004",
        "Total Commission Payouts Breakdown fetched successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getPaymentGatewayFees(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user;

    const { userId } = req.query as any;

    if (!user || !user.roleId) {
      return new ApiResponse(
        ResponseCodes.UNAUTHORIZED.code,
        "Unauthorized - User details not found",
        null
      );
    }

    let userWithRole = await prisma.user.findUnique({
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

    if (userId) {
      userWithRole = await prisma.user.findUnique({
        where: { id: userId as string },
        include: { role: true },
      });

      if (!userWithRole || !userWithRole.role) {
        return new ApiResponse(
          ResponseCodes.UNAUTHORIZED.code,
          "Unauthorized - User role not found",
          null
        );
      }
    }

    const commissionService = Container.get(CommissionService);
    const result = await commissionService.getPaymentGatewayFeesBreakdown(
      userWithRole.id,
      userWithRole.role.name
    );

    return new ApiResponse(
      "2005",
      "Payment Gateway Fees Breakdown fetched successfully",
      result
    );
  }

  public static async getPendingSettlements(
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
      const result = await commissionService.getPendingSettlements(
        userWithRole.id,
        userWithRole.role.name
      );


      return new ApiResponse(
        "2006",
        "Pending Settlements fetched successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getOperatorBreakdown(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const commissionService = Container.get(CommissionService);
      const breakdown = await commissionService.getOperatorBreakdown(
        req.user.id
      );

      return res.json(breakdown);
    } catch (error) {
      next(error);
    }
  }

  public static async getPlatinumBreakdown(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const operatorId = req.params.operatorId;
      const commissionService = Container.get(CommissionService);
      const breakdown =
        await commissionService.getPlatinumBreakdown(operatorId);

      return res.json(breakdown);
    } catch (error) {
      next(error);
    }
  }

  public static async getGoldenBreakdown(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const platinumId = req.params.platinumId;
      const commissionService = Container.get(CommissionService);
      const breakdown = await commissionService.getGoldenBreakdown(platinumId);

      return res.json(breakdown);
    } catch (error) {
      next(error);
    }
  }

  public static async getBreakdown(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      const { startDate, endDate, id } = req.query;

      if (!user || !user.roleId) {
        return new ApiResponse(
          ResponseCodes.UNAUTHORIZED.code,
          "Unauthorized - User details not found",
          null
        );
      }

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
      const result = await commissionService.getCommissionBreakdown(
        userWithRole.id,
        userWithRole.role.name,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        id as string
      );

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async getLicenseBreakdown(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;

      const { userId } = req.query as any;

      if (!user || !user.roleId) {
        return new ApiResponse(
          ResponseCodes.UNAUTHORIZED.code,
          "Unauthorized - User details not found",
          null
        );
      }

      let userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });

      if (userId) {
        userWithRole = await prisma.user.findUnique({
          where: { id: userId as string },
          include: { role: true },
        });

        if (!userWithRole || !userWithRole.role) {
          return new ApiResponse(
            ResponseCodes.UNAUTHORIZED.code,
            "Unauthorized - User role not found",
            null
          );
        }
      }

      if (!userWithRole || !userWithRole.role) {
        return new ApiResponse(
          ResponseCodes.UNAUTHORIZED.code,
          "Unauthorized - User role not found",
          null
        );
      }

      const commissionService = Container.get(CommissionService);
      const result = await commissionService.getLicenseBreakdown(
        userWithRole.id,
        userWithRole.role.name
      );

      return result;
    } catch (error) {
      next(error);
    }
  }

  public static async gteUnsettledCommission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { date } = req.query as any;
      const commissionService = Container.get(CommissionService);
      const result = await commissionService.getAllUnSettledCommissionSummary();

      return new ApiResponse(
        ResponseCodes.UNSETTLED_DATA_FETCH_SUCCESSFULLY.code,
        ResponseCodes.UNSETTLED_DATA_FETCH_SUCCESSFULLY.message,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  public static async markSettledCommission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { ids } = req.body as any;
      const commissionService = Container.get(CommissionService);
      const result = await commissionService.markCommissionSummaryStatus(ids);

      return new ApiResponse(
        ResponseCodes.UNSETTLED_DATA_UPDATE_SUCCESSFULLY.code,
        ResponseCodes.UNSETTLED_DATA_UPDATE_SUCCESSFULLY.message,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getSettledCommissionReports(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      const { startDate, endDate, downlineId } = req.query;

      if (!user || !user.roleId) {
        return res
          .status(401)
          .json(
            new ApiResponse(
              ResponseCodes.UNAUTHORIZED.code,
              "Unauthorized - User details not found",
              null
            )
          );
      }

      // Get user with role details
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });

      if (!userWithRole || !userWithRole.role) {
        return res
          .status(401)
          .json(
            new ApiResponse(
              ResponseCodes.UNAUTHORIZED.code,
              "Unauthorized - User role not found",
              null
            )
          );
      }

      const commissionService = Container.get(CommissionService);

      // If dates are provided, validate them before passing to service
      let startDateObj, endDateObj;

      if (startDate && endDate) {
        startDateObj = new Date(startDate as string);
        endDateObj = new Date(endDate as string);

        // Check if dates are valid
        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
          return res
            .status(400)
            .json(
              new ApiResponse(
                "4000",
                "Bad Request - Invalid date format. Please use YYYY-MM-DD format.",
                null
              )
            );
        }

        // Check if start date is before end date
        if (startDateObj > endDateObj) {
          return res
            .status(400)
            .json(
              new ApiResponse(
                "4000",
                "Bad Request - Start date must be before or equal to end date.",
                null
              )
            );
        }
      }

      const result = await commissionService.getSettledCommissionReports(
        userWithRole.id,
        userWithRole.role.name,
        startDateObj, // Pass undefined if not provided
        endDateObj, // Pass undefined if not provided
        downlineId as string | undefined
      );

      return res
        .status(200)
        .json(
          new ApiResponse("2050", result.message, { reports: result.reports })
        );
    } catch (error) {
      next(error);
    }
  }

  public static async downloadSettledCommissionReport(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      const { fromDate, toDate, downlineId } = req.query;

      if (!user || !user.roleId) {
        return res
          .status(401)
          .json(
            new ApiResponse(
              ResponseCodes.UNAUTHORIZED.code,
              "Unauthorized - User details not found",
              null
            )
          );
      }

      // Validate required query parameters
      if (!fromDate || !toDate || !downlineId) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              "4000",
              "Bad Request - fromDate, toDate, and downlineId are required",
              null
            )
          );
      }

      // Get user with role details
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });

      if (!userWithRole || !userWithRole.role) {
        return res
          .status(401)
          .json(
            new ApiResponse(
              ResponseCodes.UNAUTHORIZED.code,
              "Unauthorized - User role not found",
              null
            )
          );
      }

      const commissionService = Container.get(CommissionService);
      const result = await commissionService.downloadSettledCommissionReport(
        userWithRole.id,
        userWithRole.role.name,
        new Date(fromDate as string),
        new Date(toDate as string),
        downlineId as string
      );

      // Set headers for CSV download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${result.filename}`
      );

      // Send CSV content
      return res.status(200).send(result.content);
    } catch (error) {
      next(error);
    }
  }
}

export { CommissionController };
