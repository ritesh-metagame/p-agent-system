import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
// import { Response as CustomResponse } from "../common/lib/response";
import TopPerformerService from "../services/top-performer.service";
import { UserRole } from "../common/config/constants";

class TopPerformerController {
  private topPerformerService: TopPerformerService;

  constructor() {
    this.topPerformerService = Container.get(TopPerformerService);
  }

  /**
   * Calculate top performers
   * This endpoint should be called on a schedule or manually by an admin
   */
  public async calculateTopPerformers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const roleId = req.role;

      console.log("Calculating top performers... Role:", roleId);

      const result = await this.topPerformerService.calculateTopPerformers();

      return result;
    } catch (error) {
      throw new Error(`Error calculating top performers: ${error.message}`);
    }
  }

  //   /**
  //    * Get top performers for the current user based on their role
  //    *
  //   public async getTopPerformers(req: Request, res: Response) {
  //     try {
  //       const userId = req.user?.id;
  //       const siteId = req.query.siteId as string;
  //       const limit = parseInt(req.query.limit as string) || 10;

  //       const topPerformers =
  //         await this.topPerformerService.getTopPerformersForUser(
  //           userId,
  //           siteId,
  //           limit
  //         );

  //       // Get transaction statistics for the site
  //       const transactionStats =
  //         await this.topPerformerService.getTransactionStatistics(siteId);

  //       // Combine response data
  //       const responseData = {
  //         topPerformers,
  //         transactionStats,
  //       };

  //       return responseData
  //     } catch (error) {

  //   }

  //   /**
  //    * Get top performers for a specific role (admin function)
  //    */
  public async getTopPerformersByRole(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const role = req.params.role as UserRole;
      const siteId = req.query.siteId as string;
      const limit = parseInt(req.query.limit as string) || 10;

      console.log("Role in getTopPerformersByRole:", role);

      const topPerformers =
        await this.topPerformerService.getTopPerformersForRole(
          role,
          siteId,
          limit
        );

      // Get transaction statistics
      const transactionStats =
        await this.topPerformerService.getTransactionStatistics(siteId);

      // Combine response data
      const responseData = {
        topPerformers,
        transactionStats,
      };

      return responseData;
    } catch (error) {
      next(error);
    }
  }

  //   /**
  //    * Get transaction statistics
  //    */
  //   public async getTransactionStatistics(req: Request, res: Response) {
  //     try {
  //       const siteId = req.query.siteId as string;

  //       const stats =
  //         await this.topPerformerService.getTransactionStatistics(siteId);

  //       return res.json(
  //         new CustomResponse(
  //           200,
  //           "Transaction statistics retrieved successfully",
  //           stats
  //         )
  //       );
  //     } catch (error) {
  //       return res
  //         .status(500)
  //         .json(
  //           new CustomResponse(
  //             500,
  //             `Error getting transaction statistics: ${error.message}`,
  //             null
  //           )
  //         );
  //     }
  //   }

  //   /**
  //    * Trace agent hierarchy from a specific transaction
  //    * This is useful for debugging and understanding the agent relationships
  //    */
  //   public async traceAgentHierarchy(req: Request, res: Response) {
  //     try {
  //       const transactionId = req.params.transactionId;

  //       if (!transactionId) {
  //         return res
  //           .status(400)
  //           .json(new CustomResponse(400, "Transaction ID is required", null));
  //       }

  //       const result =
  //         await this.topPerformerService.traceAgentHierarchyFromTransaction(
  //           transactionId
  //         );

  //       if (result.success) {
  //         return res.json(new CustomResponse(200, result.message, result.data));
  //       } else {
  //         return res
  //           .status(404)
  //           .json(new CustomResponse(404, result.message, null));
  //       }
  //     } catch (error) {
  //       return res
  //         .status(500)
  //         .json(
  //           new CustomResponse(
  //             500,
  //             `Error tracing agent hierarchy: ${error.message}`,
  //             null
  //           )
  //         );
  //     }
  //   }
}

export default TopPerformerController;
