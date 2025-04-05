import { prisma } from "../server";
import type { User } from "../../prisma/generated/prisma";

class UserDao {
  constructor() {}

  public async getUserByUsername(username: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        include: { role: true },
      });

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
}

export default UserDao;
