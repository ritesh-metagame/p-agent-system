import { prisma } from "../server";

class UserDao {
  constructor() {}

  public async getUserByUsername(username: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error}`);
    }
  }
}

export default UserDao;
