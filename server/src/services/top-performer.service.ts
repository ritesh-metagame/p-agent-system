import { Service } from "typedi";
import { PrismaClient } from "../../prisma/generated/prisma";
import { UserRole } from "../common/config/constants";
import UserDao from "../daos/user.dao";
import { RoleDao } from "../daos/role.dao";

const prisma = new PrismaClient();

@Service()
class TopPerformerService {
  private userDao: UserDao;
  private roleDao: RoleDao;

  constructor() {
    this.userDao = new UserDao();
    this.roleDao = new RoleDao();
  }

  // Role hierarchy mapping - which role's performers should be shown to a particular role
  private roleHierarchy = {
    [UserRole.SUPER_ADMIN]: UserRole.OPERATOR,
    [UserRole.OPERATOR]: UserRole.PLATINUM,
    [UserRole.PLATINUM]: UserRole.GOLDEN,
    [UserRole.GOLDEN]: null, // No lower level for Gold agents
  };

  /**
   * Calculate and store top performers for all roles
   * This should be run on a schedule (e.g., daily)
   * @param calculationDate Optional date to use for the calculation, defaults to today
   */
  public async calculateTopPerformers(calculationDate?: Date) {
    const dateToUse = calculationDate || new Date();

    // Calculate for each role level that has child roles
    await this.calculateTopPerformersForRole(UserRole.SUPER_ADMIN, dateToUse);
    await this.calculateTopPerformersForRole(UserRole.OPERATOR, dateToUse);
    await this.calculateTopPerformersForRole(UserRole.PLATINUM, dateToUse);

    return { success: true, message: "Top performers calculated successfully" };
  }

  /**
   * Calculate top performers for a specific role's view (i.e., who they would see)
   */
  private async calculateTopPerformersForRole(
    parentRole: UserRole,
    calculationDate: Date
  ) {
    const childRole = this.roleHierarchy[parentRole];

    if (!childRole) {
      return; // No child roles to calculate for
    }

    // Find role ID for the child role
    const childRoleRecord = await prisma.role.findUnique({
      where: { name: childRole },
    });

    if (!childRoleRecord) {
      throw new Error(`Role ${childRole} not found`);
    }

    // Get users with this role
    const users = await prisma.user.findMany({
      where: {
        role: {
          name: childRole,
        },
      },
    });

    // Process all users with the child role
    for (const user of users) {
      // For each role level, collect both settled and pending transactions
      let settledTransactions = [];
      let pendingTransactions = [];

      // Query logic based on role
      if (childRole === UserRole.GOLDEN) {
        // For Gold agents, find transactions where they are directly listed
        settledTransactions = await prisma.transaction.findMany({
          where: {
            agentGoldenId: user.id,
            settled: "Y",
          },
        });

        pendingTransactions = await prisma.transaction.findMany({
          where: {
            agentGoldenId: user.id,
            settled: "N",
          },
        });
      } else {
        // For other roles (Operator, Platinum), we need to find
        // transactions via the user hierarchy
        let userIds = [];

        if (childRole === UserRole.PLATINUM) {
          // Find all Gold agents under this Platinum agent
          const goldUsers = await prisma.user.findMany({
            where: {
              parentId: user.id,
              role: {
                name: UserRole.GOLDEN,
              },
            },
            select: { id: true },
          });
          userIds = goldUsers.map((u) => u.id);

          // Get transactions where these Gold agents appear
          if (userIds.length > 0) {
            settledTransactions = await prisma.transaction.findMany({
              where: {
                agentGoldenId: {
                  in: userIds,
                },
                settled: "Y",
              },
            });

            pendingTransactions = await prisma.transaction.findMany({
              where: {
                agentGoldenId: {
                  in: userIds,
                },
                settled: "N",
              },
            });
          }
        } else if (childRole === UserRole.OPERATOR) {
          // For Operators, find transactions from all Platinum and Gold agents under them
          const platinumUsers = await prisma.user.findMany({
            where: {
              parentId: user.id,
              role: {
                name: UserRole.PLATINUM,
              },
            },
            include: {
              children: {
                where: {
                  role: {
                    name: UserRole.GOLDEN,
                  },
                },
              },
            },
          });

          // Collect all Gold agent IDs under these Platinum agents
          const goldUserIds = [];
          platinumUsers.forEach((platinum) => {
            platinum.children.forEach((golden) => {
              goldUserIds.push(golden.id);
            });
          });

          // Get transactions for these Gold agents
          if (goldUserIds.length > 0) {
            settledTransactions = await prisma.transaction.findMany({
              where: {
                agentGoldenId: {
                  in: goldUserIds,
                },
                settled: "Y",
              },
            });

            pendingTransactions = await prisma.transaction.findMany({
              where: {
                agentGoldenId: {
                  in: goldUserIds,
                },
                settled: "N",
              },
            });
          }
        }
      }

      // Don't create records if no transactions exist
      if (
        settledTransactions.length === 0 &&
        pendingTransactions.length === 0
      ) {
        continue;
      }

      // Calculate total counts across all sites for this user
      const settledCount = settledTransactions.length;
      const pendingCount = pendingTransactions.length;

      // Get the first site ID for reference, or use a default
      // This is needed because the database schema requires a siteId
      const defaultSiteId =
        settledTransactions.length > 0
          ? settledTransactions[0].siteId
          : pendingTransactions.length > 0
            ? pendingTransactions[0].siteId
            : null;

      if (!defaultSiteId) {
        continue; // Skip if we couldn't determine a site ID
      }

      // Create or update a single record for this user, aggregating all transactions
      await prisma.topPerformerSummary.upsert({
        where: {
          userId_siteId_calculationDate: {
            userId: user.id,
            siteId: defaultSiteId,
            calculationDate,
          },
        },
        update: {
          settledTransactions: settledCount,
          pendingCommission: pendingCount,
          operatorName:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.username,
          updatedAt: new Date(),
        },
        create: {
          siteId: defaultSiteId,
          userId: user.id,
          roleId: childRoleRecord.id,
          type: childRole,
          settledTransactions: settledCount,
          pendingCommission: pendingCount,
          operatorName:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.username,
          calculationDate,
        },
      });
    }
  }

  /**
   * Get top performers that should be visible to a user of the specified role
   * @param userRole The role of the user viewing the top performers
   * @param siteId Optional site ID to filter by, if not provided will return top performers across all sites
   * @param limit Maximum number of top performers to return
   */
  public async getTopPerformersForRole(
    userRole: UserRole,
    siteId?: string,
    limit: number = 10
  ) {
    const childRole = this.roleHierarchy[userRole as UserRole];

    console.log("Child Role:", childRole);

    if (!childRole) {
      return [];
    }

    // Get role ID for the child role
    const childRoleRecord = await prisma.role.findUnique({
      where: { name: childRole },
    });

    if (!childRoleRecord) {
      throw new Error(`Role ${childRole} not found`);
    }

    // Calculate the most recent date for which we have top performer records
    const latestRecord = await prisma.topPerformerSummary.findFirst({
      where: {
        role: {
          name: childRole,
        },
      },
      orderBy: {
        calculationDate: "desc",
      },
    });

    const calculationDate = latestRecord?.calculationDate || new Date();

    // Prepare the query for top performers
    const whereClause: any = {
      role: {
        name: childRole,
      },
      calculationDate, // Use the most recent calculation date
    };

    // Add site filter only if siteId is provided
    if (siteId) {
      whereClause.siteId = siteId;
    }

    // Get the top performers for this role, ordered by settled transactions
    const topPerformers = await prisma.topPerformerSummary.findMany({
      where: whereClause,
      orderBy: {
        settledTransactions: "desc",
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Format the response to return GOLDEN NAME, PENDING COMMISSION, RELEASED
    const formattedTopPerformers = topPerformers.map((performer) => {
      const name =
        `${performer.user.firstName || ""} ${performer.user.lastName || ""}`.trim() ||
        performer.user.username;

      return {
        name,
        pendingCommission: performer.pendingCommission,
        released: performer.settledTransactions,
      };
    });

    return formattedTopPerformers;
  }

  /**
   * Get transaction statistics summary
   */
  public async getTransactionStatistics(siteId?: string) {
    const whereClause = siteId ? { siteId } : {};

    // Get counts of settled and pending transactions
    const [settledCount, pendingCount] = await Promise.all([
      prisma.transaction.count({
        where: {
          ...whereClause,
          settled: "Y",
        },
      }),
      prisma.transaction.count({
        where: {
          ...whereClause,
          settled: "N",
        },
      }),
    ]);

    return {
      settled: settledCount,
      pending: pendingCount,
      total: settledCount + pendingCount,
    };
  }

  /**
   * Get top performers for a specific user based on their role
   * Users will see the top performers from the level below them
   */
  public async getTopPerformersForUser(
    userId: string,
    siteId: string,
    limit: number = 10
  ) {
    // Get the user with their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return this.getTopPerformersForRole(
      user.role.name as UserRole,
      siteId,
      limit
    );
  }

  /**
   * Use a transaction with agentGoldenId to trace the hierarchy up through parentIds
   * This is useful for manually tracking the relationship between transactions and
   * agents at different levels.
   */
  public async traceAgentHierarchyFromTransaction(transactionId: string) {
    try {
      // Find the transaction
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: BigInt(transactionId),
        },
      });

      if (!transaction || !transaction.agentGoldenId) {
        return {
          success: false,
          message: "Transaction not found or no Golden agent associated",
        };
      }

      const hierarchy = [];

      // Start with the Gold agent
      let currentAgentId = transaction.agentGoldenId;
      let currentAgent = await this.userDao.getUserByUserId(currentAgentId);

      while (currentAgent) {
        hierarchy.push({
          id: currentAgent.id,
          username: currentAgent.username,
          role: currentAgent.role?.name || "Unknown",
          firstName: currentAgent.firstName,
          lastName: currentAgent.lastName,
        });

        // Move up to parent if exists
        if (currentAgent.parentId) {
          currentAgentId = currentAgent.parentId;
          currentAgent = await this.userDao.getUserByUserId(currentAgentId);
        } else {
          // No more parents in the hierarchy
          break;
        }
      }

      return {
        success: true,
        message: "Agent hierarchy traced successfully",
        data: {
          transaction: {
            id: transaction.id.toString(),
            betId: transaction.betId,
            settled: transaction.settled,
          },
          hierarchy,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error tracing agent hierarchy: ${error.message}`,
      };
    }
  }
}

export default TopPerformerService;
