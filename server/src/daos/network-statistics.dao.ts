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

      // Calculate statistics for each non-golden user
      for (const user of users) {
        if (user.role.name.toLowerCase() === UserRole.GOLDEN) continue;

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
          goldenUserApprovedCount: 0,
          goldenUserPendingCount: 0,
          goldenUserDeclinedCount: 0,
          goldenUserSuspendedCount: 0,
          goldenUserTotalCount: 0,
        };

        // Helper function to update counts based on user status
        const updateCounts = (user: any, rolePrefix: string) => {
          console.log(
            `Updating counts for user ${user.id} with role ${user.role.name}`
          );

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

            console.log(
              `Counting child ${child.id} with role ${childRoleName} under parent ${currentUserId} with role ${parentRole}`
            );

            if (
              parentRole === UserRole.SUPER_ADMIN &&
              childRoleName === UserRole.OPERATOR
            ) {
              updateCounts(child, UserRole.OPERATOR);
              // Count platinum and golden under this operator
              countDescendants(child.id, UserRole.OPERATOR);
            } else if (
              parentRole === UserRole.OPERATOR &&
              childRoleName === UserRole.PLATINUM
            ) {
              updateCounts(child, UserRole.PLATINUM);
              // Count golden under this platinum
              countDescendants(child.id, UserRole.PLATINUM);
            } else if (
              parentRole === UserRole.PLATINUM &&
              childRoleName === UserRole.GOLDEN
            ) {
              updateCounts(child, UserRole.GOLDEN);
            }
          }
        };

        // Start counting based on user's role
        const userRole = user.role.name.toLowerCase();
        if (userRole === UserRole.SUPER_ADMIN) {
          countDescendants(user.id, UserRole.SUPER_ADMIN);
        } else if (userRole === UserRole.OPERATOR) {
          countDescendants(user.id, UserRole.OPERATOR);
        } else if (userRole === UserRole.PLATINUM) {
          countDescendants(user.id, UserRole.PLATINUM);
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
