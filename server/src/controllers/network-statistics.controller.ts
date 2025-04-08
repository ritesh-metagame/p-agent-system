import { Request, Response } from "express";
import Container from "typedi";
import { NetworkStatisticsService } from "../services/network-statistics.service";

export class NetworkStatisticsController {
  private networkStatisticsService: NetworkStatisticsService;

  constructor() {
    this.networkStatisticsService = Container.get(NetworkStatisticsService);
  }

  /**
   * Calculate and update network statistics
   */
  public calculateAndUpdateNetworkStatistics = async (
    req: Request,
    res: Response
  ) => {
    try {
      const result =
        await this.networkStatisticsService.calculateAndUpdateNetworkStatistics();

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error calculating network statistics:", error);
      return res.status(500).json({
        code: 500,
        message: `Error calculating network statistics: ${error.message}`,
        data: null,
      });
    }
  };

  /**
   * Get network statistics based on user role
   */
  public getNetworkStatistics = async (req: Request, res: Response) => {
    try {
      const roleId = req.role;

      const result =
        await this.networkStatisticsService.getNetworkStatisticsByUserRole(
          roleId
        );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching network statistics:", error);
      return res.status(500).json({
        code: 500,
        message: `Error fetching network statistics: ${error.message}`,
        data: null,
      });
    }
  };
}
