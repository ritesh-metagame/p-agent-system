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
  public async getNetworkStatisticsByUserRole(userRoleId: string) {
    try {
      const userRole = await this.roleDao.getRoleById(userRoleId);

      if (!userRole) {
        throw new Error("User role not found");
      }

      console.log("Getting statistics for user role:", userRole.name);

      // Get all network statistics
      const allStats =
        await this.networkStatisticsDao.getLatestNetworkStatistics();

      if (allStats.length === 0) {
        // If no statistics exist yet, calculate them first
        console.log("No statistics found, calculating now...");
        await this.networkStatisticsDao.calculateAndUpdateNetworkStatistics();
        // Then fetch the newly calculated statistics
        const freshStats =
          await this.networkStatisticsDao.getLatestNetworkStatistics();
        console.log(`Calculated ${freshStats.length} new statistics entries`);
        return this.filterStatisticsByRole(userRole.name, freshStats);
      }

      console.log(`Found ${allStats.length} existing statistics entries`);
      return this.filterStatisticsByRole(userRole.name, allStats);
    } catch (error) {
      console.error("Error fetching network statistics:", error);
      return error;
    }
  }

  /**
   * Filter statistics based on user role
   */
  private filterStatisticsByRole(userRoleName: string, statistics: any[]) {
    console.log(`Filtering statistics for role: ${userRoleName}`);
    console.log(
      `Available roles in statistics: ${statistics.map((stat) => stat.role.name).join(", ")}`
    );

    let filteredStats = [];
    let includeSuspendedAndTotal = true;

    // Convert role names to lowercase for case-insensitive comparison
    const lowerUserRoleName = userRoleName.toLowerCase();

    switch (lowerUserRoleName) {
      case UserRole.SUPER_ADMIN.toLowerCase():
        // Super Admin can see all roles - include everything
        console.log("SuperAdmin role: returning all statistics");
        filteredStats = statistics;
        includeSuspendedAndTotal = false; // SuperAdmin doesn't need suspended and total columns
        break;

      case UserRole.OPERATOR.toLowerCase():
        // Operator can see PLATINUM and GOLDEN only
        console.log("Operator role: filtering to show only Platinum and Gold");
        filteredStats = statistics.filter(
          (stat) =>
            stat.role.name.toLowerCase() === UserRole.PLATINUM.toLowerCase() ||
            stat.role.name.toLowerCase() === UserRole.GOLDEN.toLowerCase()
        );
        break;

      case UserRole.PLATINUM.toLowerCase():
        // Platinum can see only GOLDEN
        console.log("Platinum role: filtering to show only Gold");
        filteredStats = statistics.filter(
          (stat) =>
            stat.role.name.toLowerCase() === UserRole.GOLDEN.toLowerCase()
        );
        break;

      default:
        console.log(`No specific filtering for role: ${userRoleName}`);
        filteredStats = [];
    }

    console.log(
      `After filtering: ${filteredStats.length} statistics entries remain`
    );
    if (filteredStats.length > 0) {
      console.log(
        `Filtered roles: ${filteredStats.map((stat) => stat.role.name).join(", ")}`
      );
    } else {
      console.log("No statistics remain after filtering");
    }

    // Format the result for the frontend
    const formattedStats = filteredStats.map((stat) => {
      const baseStats = {
        role: stat.role.name,
        approved: stat.approvedCount,
        pending: stat.pendingCount,
        declined: stat.declinedCount,
      };

      // Add suspended and total columns for non-SuperAdmin roles
      if (includeSuspendedAndTotal) {
        return {
          ...baseStats,
          suspended: stat.suspendedCount,
          total: stat.totalCount,
        };
      }

      return baseStats;
    });

    return new Response(
      ResponseCodes.NETWORK_STATISTICS_FETCHED_SUCCESSFULLY.code,
      ResponseCodes.NETWORK_STATISTICS_FETCHED_SUCCESSFULLY.message,
      formattedStats
    );
  }
}
