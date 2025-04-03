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

      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error}`);
    }
  }

  public async createUser({
    username,
    parentId,
    password,
    roleId,
  }: Record<string, any>): Promise<User> {
    const affiliateLink: string = `https://example.com/${username}`; // Example affiliate link generation

    try {
      const user = await prisma.user.create({
        data: {
          username,
          password,
          parentId,
          roleId,
          affiliateLink,
        },
      });

      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }
}

export default UserDao;
