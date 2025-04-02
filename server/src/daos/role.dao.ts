import { prisma } from "../server";

class RoleDao {
  public async getRoleById(id: string) {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
      });

      return role;
    } catch (error) {
      throw new Error(`Error fetching role: ${error}`);
    }
  }

  public async getRoleByName(name: string) {
    try {
      const role = await prisma.role.findUnique({
        where: { name },
      });

      return role;
    } catch (error) {
      throw new Error(`Error fetching role: ${error}`);
    }
  }
}

export { RoleDao };
