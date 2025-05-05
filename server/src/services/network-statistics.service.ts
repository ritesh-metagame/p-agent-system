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

    // Check if statistics array is empty or invalid
    if (
      !Array.isArray(statistics) ||
      statistics.length === 0 ||
      !statistics[0]
    ) {
      console.log("No statistics data available");
      return new Response(
        ResponseCodes.NETWORK_STATISTICS_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.NETWORK_STATISTICS_FETCHED_SUCCESSFULLY.message,
        { message: "No statistics available" }
      );
    }

    // Helper function to safely format counts for a role
    const formatRoleCounts = (stat: any, rolePrefix: string) => {
      // Add null checks and default to 0 if properties don't exist
      const data = {
        approved: 0,
        pending: 0,
        declined: 0,
        suspended: 0,
        total: 0,
      };

     
      try {
        if (stat) {
          data.approved = parseInt(stat[`${rolePrefix}UserApprovedCount`]) || 0;
          data.pending = parseInt(stat[`${rolePrefix}UserPendingCount`]) || 0;
          data.declined = parseInt(stat[`${rolePrefix}UserDeclinedCount`]) || 0;
          data.suspended =
            parseInt(stat[`${rolePrefix}UserSuspendedCount`]) || 0;
          data.total = parseInt(stat[`${rolePrefix}UserTotalCount`]) || 0;
        }
      } catch (error) {
        console.error(`Error formatting ${rolePrefix} counts:`, error);
      }

      return data;
    };

    // Add statistics based on user role
    try {
      switch (lowerUserRoleName) {
        case UserRole.SUPER_ADMIN:
          // SuperAdmin sees all roles
          formattedStats.operator = formatRoleCounts(
            statistics[0],
            UserRole.OPERATOR
          );
          formattedStats.platinum = formatRoleCounts(
            statistics[0],
            UserRole.PLATINUM
          );
          formattedStats.golden = formatRoleCounts(
            statistics[0],
            UserRole.GOLDEN
          );
          break;

        case UserRole.OPERATOR:
          // Operator sees platinum and golden
          formattedStats.platinum = formatRoleCounts(
            statistics[0],
            UserRole.PLATINUM
          );
          formattedStats.golden = formatRoleCounts(
            statistics[0],
            UserRole.GOLDEN
          );
          break;

        case UserRole.PLATINUM:
          // Platinum sees only golden
          formattedStats.golden = formatRoleCounts(
            statistics[0],
            UserRole.GOLDEN
          );
          break;

        case UserRole.GOLDEN:
          // Gold sees nothing
          break;
      }
    } catch (error) {
      console.error("Error processing statistics:", error);
    }

    return new Response(
      ResponseCodes.NETWORK_STATISTICS_FETCHED_SUCCESSFULLY.code,
      ResponseCodes.NETWORK_STATISTICS_FETCHED_SUCCESSFULLY.message,
      formattedStats
    );
  }
}
