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
        },
      });

      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }
}

export default UserDao;
