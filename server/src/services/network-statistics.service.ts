import { Service } from "typedi";
import { NetworkStatisticsDao } from "../daos/network-statistics.dao";
import { Response } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";
import { RoleDao } from "../daos/role.dao";
import { UserRole } from "../common/config/constants";

@Service()
export class NetworkStatisticsService {
  private networkStatisticsDao: NetworkStatisticsDao;
  private roleDao: RoleDao;

  constructor() {
    this.networkStatisticsDao = new NetworkStatisticsDao();
    this.roleDao = new RoleDao();
  }

  /**
   * Calculate and update network statistics for all roles
   */
  public async calculateAndUpdateNetworkStatistics() {
    try {
      await this.networkStatisticsDao.calculateAndUpdateNetworkStatistics();

      return new Response(
        ResponseCodes.NETWORK_STATISTICS_UPDATED_SUCCESSFULLY.code,
        ResponseCodes.NETWORK_STATISTICS_UPDATED_SUCCESSFULLY.message,

        null
      );
    } catch (error) {
      console.error("Error calculating network statistics:", error);
      return error;
    }
  }

  /**
   * Get network statistics based on user role
   * - SuperAdmin: All roles (OPERATOR, PLATINUM, GOLDEN, PLAYER)
   * - Operator: Only PLATINUM, GOLDEN and PLAYER
   * - Platinum: Only GOLDEN and PLAYER
   * - Golden: Only PLAYER
   */
  public async getNetworkStatisticsByUserRole(
    userRoleId: string,
    userId: string
  ) {
    try {
      const userRole = await this.roleDao.getRoleById(userRoleId);

      if (!userRole) {
        throw new Error("User role not found");
      }

      console.log("Getting statistics for user role:", userRole.name);

      // Get statistics for this specific user
      const userStats =
        await this.networkStatisticsDao.getLatestNetworkStatisticsByUserId(
          userId
        );

      if (userStats.length === 0) {
        // If no statistics exist yet, calculate them first
        console.log("No statistics found, calculating now...");
        await this.networkStatisticsDao.calculateAndUpdateNetworkStatistics();
        const freshStats =
          await this.networkStatisticsDao.getLatestNetworkStatisticsByUserId(
            userId
          );
        return this.formatStatistics(userRole.name, freshStats);
      }

      return this.formatStatistics(userRole.name, userStats);
    } catch (error) {
      console.error("Error fetching network statistics:", error);
      return error;
    }
  }

  private formatStatistics(userRoleName: string, statistics: any[]) {
    const formattedStats: any = {};

    // Convert role names to lowercase for case-insensitive comparison
    const lowerUserRoleName = userRoleName.toLowerCase();

    // Helper function to format counts for a role
    const formatRoleCounts = (stat: any, rolePrefix: string) => ({
      approved: stat[`${rolePrefix}UserApprovedCount`] || 0,
      pending: stat[`${rolePrefix}UserPendingCount`] || 0,
      declined: stat[`${rolePrefix}UserDeclinedCount`] || 0,
      suspended: stat[`${rolePrefix}UserSuspendedCount`] || 0,
      total: stat[`${rolePrefix}UserTotalCount`] || 0,
    });

    // Add statistics based on user role
    switch (lowerUserRoleName) {
      case "superadmin":
        // SuperAdmin sees all roles
        formattedStats.operator = formatRoleCounts(statistics[0], "operator");
        formattedStats.platinum = formatRoleCounts(statistics[0], "platinum");
        formattedStats.gold = formatRoleCounts(statistics[0], "gold");
        break;

      case "operator":
        // Operator sees platinum and gold
        formattedStats.platinum = formatRoleCounts(statistics[0], "platinum");
        formattedStats.gold = formatRoleCounts(statistics[0], "gold");
        break;

      case "platinum":
        // Platinum sees only gold
        formattedStats.gold = formatRoleCounts(statistics[0], "gold");
        break;

      case "gold":
        // Gold sees nothing
        break;
    }

    return new Response(
      ResponseCodes.NETWORK_STATISTICS_FETCHED_SUCCESSFULLY.code,
      ResponseCodes.NETWORK_STATISTICS_FETCHED_SUCCESSFULLY.message,
      formattedStats
    );
  }
}
