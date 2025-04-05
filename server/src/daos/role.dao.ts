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
    console.log("Role:", role); // Debugging line
    try {
      const roleHierarchy: Record<string, string[]> = {
        operator: ["platinum", "gold"],
        platinum: ["gold"],
        gold: [],
      };

      const childRoles = roleHierarchy[role.toLowerCase()] || [];

      console.log("Child Roles:", childRoles); // Debugging line

      if (childRoles.length === 0) {
        return [];
      }

      const roles = await prisma.role.findMany({
        where: {
          name: {
            in: childRoles, // ✅ Use "in" instead of "contains"
          },
        },
      });

      return roles;
    } catch (error) {
      throw new Error(`Error fetching roles: ${error.message}`);
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
