import { NetworkStatistics } from "../../prisma/generated/prisma";
import { prisma } from "../server";
import { UserRole } from "../common/config/constants";

export class NetworkStatisticsDao {
  async createOrUpdate(
    data: Partial<NetworkStatistics>
  ): Promise<NetworkStatistics> {
    const { roleId, calculationDate = new Date(), userId, ...rest } = data;

    try {
      // First, delete any existing records that might conflict with unique constraints
      await prisma.networkStatistics.deleteMany({
        where: {
          roleId,
          calculationDate,
        },
      });

      // Then create a fresh record
      return await prisma.networkStatistics.create({
        data: {
          role: {
            connect: { id: roleId },
          },
          user: {
            connect: { id: userId },
          },
          calculationDate,
          ...rest,
        },
      });
    } catch (error) {
      console.error("Error in createOrUpdate:", error);
      throw error;
    }
  }

  async getNetworkStatisticsByRole(
    roleId: string
  ): Promise<NetworkStatistics[]> {
    return prisma.networkStatistics.findMany({
      where: {
        roleId,
      },
      include: {
        role: true,
      },
      orderBy: {
        calculationDate: "desc",
      },
    });
  }

  async getLatestNetworkStatistics(): Promise<NetworkStatistics[]> {
    // Get the latest calculation date
    const latestEntry = await prisma.networkStatistics.findFirst({
      orderBy: {
        calculationDate: "desc",
      },
    });

    if (!latestEntry) {
      return [];
    }

    return prisma.networkStatistics.findMany({
      include: {
        role: true,
      },
      orderBy: {
        role: {
          name: "asc",
        },
      },
    });
  }

  async getLatestNetworkStatisticsByUserId(
    userId: string
  ): Promise<NetworkStatistics[]> {
    // Get the latest calculation date for the user
    const latestEntry = await prisma.networkStatistics.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        calculationDate: "desc",
      },
    });

    if (!latestEntry) {
      return [];
    }

    // Get all statistics for this user on the latest calculation date
    return prisma.networkStatistics.findMany({
      where: {
        userId: userId,
        calculationDate: latestEntry.calculationDate,
      },
      include: {
        role: true,
      },
      orderBy: {
        role: {
          name: "asc",
        },
      },
    });
  }

  async calculateAndUpdateNetworkStatistics(): Promise<void> {
    try {
      // Get all users with their roles and parent/child relationships
      const users = await prisma.user.findMany({
        include: {
          role: true,
          parent: {
            include: {
              role: true,
            },
          },
        },
      });

      // Group users by their parent
      const usersByParent = users.reduce(
        (acc, user) => {
          if (user.parentId) {
            if (!acc[user.parentId]) {
              acc[user.parentId] = [];
            }
            acc[user.parentId].push(user);
          }
          return acc;
        },
        {} as Record<string, any[]>
      );

      // Calculate statistics for each non-gold user
      for (const user of users) {
        if (user.role.name.toLowerCase() === "gold") continue;

        // Initialize statistics object
        const stats: any = {
          operatorUserApprovedCount: 0,
          operatorUserPendingCount: 0,
          operatorUserDeclinedCount: 0,
          operatorUserSuspendedCount: 0,
          operatorUserTotalCount: 0,
          platinumUserApprovedCount: 0,
          platinumUserPendingCount: 0,
          platinumUserDeclinedCount: 0,
          platinumUserSuspendedCount: 0,
          platinumUserTotalCount: 0,
          goldUserApprovedCount: 0,
          goldUserPendingCount: 0,
          goldUserDeclinedCount: 0,
          goldUserSuspendedCount: 0,
          goldUserTotalCount: 0,
        };

        // Helper function to update counts based on user status
        const updateCounts = (user: any, rolePrefix: string) => {
          stats[`${rolePrefix}UserTotalCount`]++;
          if (user.approved) {
            stats[`${rolePrefix}UserApprovedCount`]++;
          } else {
            stats[`${rolePrefix}UserPendingCount`]++;
          }
        };

        // Recursive function to count all descendants
        const countDescendants = (
          currentUserId: string,
          parentRole: string
        ) => {
          const children = usersByParent[currentUserId] || [];

          for (const child of children) {
            const childRoleName = child.role.name.toLowerCase();

            if (parentRole === "superadmin" && childRoleName === "operator") {
              updateCounts(child, "operator");
              // Count platinum and gold under this operator
              countDescendants(child.id, "operator");
            } else if (
              parentRole === "operator" &&
              childRoleName === "platinum"
            ) {
              updateCounts(child, "platinum");
              // Count gold under this platinum
              countDescendants(child.id, "platinum");
            } else if (parentRole === "platinum" && childRoleName === "gold") {
              updateCounts(child, "gold");
            }
          }
        };

        // Start counting based on user's role
        const userRole = user.role.name.toLowerCase();
        if (userRole === "superadmin") {
          countDescendants(user.id, "superadmin");
        } else if (userRole === "operator") {
          countDescendants(user.id, "operator");
        } else if (userRole === "platinum") {
          countDescendants(user.id, "platinum");
        }

        // Create or update statistics entry
        await this.createOrUpdate({
          roleId: user.roleId,
          userId: user.id,
          calculationDate: new Date(),
          ...stats,
        });
      }
    } catch (error) {
      console.error("Error calculating network statistics:", error);
      throw error;
    }
  }
}
