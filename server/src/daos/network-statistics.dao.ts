import { NetworkStatistics } from "../../prisma/generated/prisma";
import { prisma } from "../server";
import { UserRole } from "../common/config/constants";

export class NetworkStatisticsDao {
  async createOrUpdate(
    data: Partial<NetworkStatistics>
  ): Promise<NetworkStatistics> {
    const { roleId, calculationDate = new Date(), userId, ...rest } = data;

    const existing = await prisma.networkStatistics.findFirst({
      where: {
        roleId,
        calculationDate,
      },
    });

    if (existing) {
      return prisma.networkStatistics.update({
        where: { id: existing.id },
        data: rest,
      });
    }

    return prisma.networkStatistics.create({
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
    const users = await prisma.user.findMany({
      include: {
        role: true,
        children: {
          include: {
            role: true,
            children: {
              include: {
                role: true,
                children: {
                  include: {
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const user of users) {
      const stats = {
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

      // Function to count users recursively
      const countUsersInChain = (children: any[]) => {
        for (const child of children) {
          switch (child.role.name.toLowerCase()) {
            case "operator":
              stats.operatorUserTotalCount++;
              if (child.approved) stats.operatorUserApprovedCount++;
              else if (child.declined) stats.operatorUserDeclinedCount++;
              else if (child.suspended) stats.operatorUserSuspendedCount++;
              else stats.operatorUserPendingCount++;
              break;

            case "platinum":
              stats.platinumUserTotalCount++;
              if (child.approved) stats.platinumUserApprovedCount++;
              else if (child.declined) stats.platinumUserDeclinedCount++;
              else if (child.suspended) stats.platinumUserSuspendedCount++;
              else stats.platinumUserPendingCount++;
              break;

            case "gold":
              stats.goldUserTotalCount++;
              if (child.approved) stats.goldUserApprovedCount++;
              else if (child.declined) stats.goldUserDeclinedCount++;
              else if (child.suspended) stats.goldUserSuspendedCount++;
              else stats.goldUserPendingCount++;
              break;
          }

          // Recursively count children's children
          if (child.children?.length > 0) {
            countUsersInChain(child.children);
          }
        }
      };

      // Start counting from immediate children
      if (user.children?.length > 0) {
        countUsersInChain(user.children);
      }

      // Only store statistics that are relevant for the user's role
      const roleStats: any = {};
      switch (user.role.name.toLowerCase()) {
        case "superadmin":
          // SuperAdmin can see all counts
          Object.assign(roleStats, stats);
          break;
        case "operator":
          // Operator can see platinum and gold counts
          Object.assign(roleStats, {
            platinumUserApprovedCount: stats.platinumUserApprovedCount,
            platinumUserPendingCount: stats.platinumUserPendingCount,
            platinumUserDeclinedCount: stats.platinumUserDeclinedCount,
            platinumUserSuspendedCount: stats.platinumUserSuspendedCount,
            platinumUserTotalCount: stats.platinumUserTotalCount,

            goldUserApprovedCount: stats.goldUserApprovedCount,
            goldUserPendingCount: stats.goldUserPendingCount,
            goldUserDeclinedCount: stats.goldUserDeclinedCount,
            goldUserSuspendedCount: stats.goldUserSuspendedCount,
            goldUserTotalCount: stats.goldUserTotalCount,
          });
          break;
        case "platinum":
          // Platinum can see only gold counts
          Object.assign(roleStats, {
            goldUserApprovedCount: stats.goldUserApprovedCount,
            goldUserPendingCount: stats.goldUserPendingCount,
            goldUserDeclinedCount: stats.goldUserDeclinedCount,
            goldUserSuspendedCount: stats.goldUserSuspendedCount,
            goldUserTotalCount: stats.goldUserTotalCount,
          });
          break;
        case "gold":
          // Gold users don't see any counts
          break;
      }

      await this.createOrUpdate({
        roleId: user.roleId,
        userId: user.id,
        calculationDate: new Date(),
        ...roleStats,
      });
    }
  }
}
