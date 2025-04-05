import { prisma } from "../server";
import type { User } from "../../prisma/generated/prisma";

class UserDao {
  constructor() {}

  public async getUserByUsername(username: string) {
    console.log("Username:", username); // Debugging line
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        include: { role: true },
      });
      console.log("Username1111111111111:", username); // Debugging line

      console.log("User fetched:", user);

      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error}`);
    }
  }

  public async createUser({ ...data }: Record<string, any>): Promise<User> {
    const affiliateLink: string = `https://example.com/${data?.username}`; // Example affiliate link generation

    try {
      const user = await prisma.user.create({
        data: {
          ...(data as any),
          affiliateLink,
        },
      });

      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  public async getUsersByParentId(parentId: string) {
    try {
      const users = await prisma.user.findMany({
        where: { parentId },
        include: {
          role: true,
          commissions: {
            include: {
              category: true,
              site: true,
            },
          },
          userSites: true,
          children: true,
        },
      });

      return users;
    } catch (error) {
      throw new Error(`Error fetching users by parent ID: ${error}`);
    }
  }

  // public async getAllUsersWithDetails(startDate?: string, endDate?: string) {
  //   try {
  //     const whereClause: any = {}; // Initialize an empty where clause

  //     if (startDate && endDate) {
  //       whereClause.createdAt = {
  //         gte: new Date(startDate), // Greater than or equal to startDate
  //         lte: new Date(endDate), // Less than or equal to endDate
  //       };
  //     }

  //     const users = await prisma.user.findMany({
  //       where: whereClause, // Apply the filtering condition
  //       include: {
  //         role: true,
  //         commissions: {
  //           include: {
  //             category: true,
  //             site: true,
  //           },
  //         },
  //         userSites: {
  //           include: {
  //             site: true,
  //           },
  //         },
  //       },
  //     });

  //     return users;
  //   } catch (error) {
  //     throw new Error(`Error fetching users with details: ${error}`);
  //   }
  // }

  public async getAllUsersWithDetails(startDate?: string, endDate?: string) {
    try {
      // Step 1: Get unique Commission IDs (grouped)
      const groupedCommissions = await prisma.commission.groupBy({
        by: ["id"],
      });

      const commissionIds = groupedCommissions.map((c) => c.id);

      // Step 2: Fetch full details for grouped Commission IDs
      const commissions = await prisma.commission.findMany({
        where: {
          id: { in: commissionIds },
        },
        include: {
          site: true,
          user: true,
          role: true,
          category: true,
        },
      });

      return commissions;
    } catch (error) {
      throw new Error(`Error fetching grouped commissions: ${error.message}`);
    }
  }
}

export default UserDao;
