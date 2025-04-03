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

  public async getAllRolesForSuperAdmin() {
    try {
      const roles = await prisma.role.findMany({
        include: {
          users: true,
        },
      });

      return roles;
    } catch (error) {
      throw new Error(`Error fetching roles: ${error}`);
    }
  }

  public async getRoleForARole(role: string) {
    try {
      // Define role hierarchy relationships
      const roleHierarchy: Record<string, string[]> = {
        operator: ["platinum", "gold"],
        platinum: ["gold"],
        gold: [],
      };

      // Get the list of child roles for the given role
      const childRoles = roleHierarchy[role.toLowerCase()] || [];

      if (childRoles.length === 0) {
        return [];
      }

      // Find roles that match any of the child roles
      const roles = await prisma.role.findMany({
        where: {
          OR: childRoles.map((r) => ({
            name: {
              contains: r,
              mode: "insensitive",
            },
          })),
        },
      });

      return roles;
    } catch (error) {
      throw new Error(`Error fetching roles: ${error}`);
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
