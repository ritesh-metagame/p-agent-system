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
