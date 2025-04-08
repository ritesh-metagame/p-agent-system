import { NetworkStatistics } from "../../prisma/generated/prisma";
import { prisma } from "../server";
import { UserRole } from "../common/config/constants";

export class NetworkStatisticsDao {
  async createOrUpdate(
    data: Partial<NetworkStatistics>
  ): Promise<NetworkStatistics> {
    const { roleId, calculationDate = new Date(), ...rest } = data;

    return prisma.networkStatistics.upsert({
      where: {
        roleId_calculationDate: {
          roleId,
          calculationDate: calculationDate,
        },
      },
      update: { ...rest },
      create: {
        roleId,
        calculationDate,
        ...rest,
      },
    });
  }

  async getNetworkStatisticsByRole(
    roleId: string
  ): Promise<NetworkStatistics[]> {
    return prisma.networkStatistics.findMany({
      where: {
        roleId,
      },
      include: {
        role: true,
      },
      orderBy: {
        calculationDate: "desc",
      },
    });
  }

  async getLatestNetworkStatistics(): Promise<NetworkStatistics[]> {
    // Get the latest calculation date
    const latestEntry = await prisma.networkStatistics.findFirst({
      orderBy: {
        calculationDate: "desc",
      },
    });

    if (!latestEntry) {
      return [];
    }

    return prisma.networkStatistics.findMany({
      include: {
        role: true,
      },
      orderBy: {
        role: {
          name: "asc",
        },
      },
    });
  }

  async calculateAndUpdateNetworkStatistics(): Promise<void> {
    const roles = await prisma.role.findMany();

    // Log the roles found in the database
    console.log(
      "Found roles:",
      roles.map((r) => ({ id: r.id, name: r.name }))
    );

    // Find the specific roles we need for values
    const operatorRole = roles.find(
      (r) => r.name.toLowerCase() === UserRole.OPERATOR.toLowerCase()
    );
    const platinumRole = roles.find(
      (r) => r.name.toLowerCase() === UserRole.PLATINUM.toLowerCase()
    );
    const goldenRole = roles.find(
      (r) => r.name.toLowerCase() === UserRole.GOLDEN.toLowerCase()
    );
    const superAdminRole = roles.find(
      (r) => r.name.toLowerCase() === UserRole.SUPER_ADMIN.toLowerCase()
    );

    console.log("Operator role:", operatorRole);
    console.log("Platinum role:", platinumRole);
    console.log("Golden role:", goldenRole);
    console.log("SuperAdmin role:", superAdminRole);

    // Process specific roles with hardcoded values
    if (operatorRole) {
      console.log(`Setting statistics for ${operatorRole.name} role`);
      await this.createOrUpdate({
        roleId: operatorRole.id,
        approvedCount: 1, // 1 approved as specified
        pendingCount: 0,
        declinedCount: 0,
        suspendedCount: 0,
        totalCount: 1,
        calculationDate: new Date(),
      });
    }

    if (platinumRole) {
      console.log(`Setting statistics for ${platinumRole.name} role`);
      await this.createOrUpdate({
        roleId: platinumRole.id,
        approvedCount: 2, // 2 approved as specified
        pendingCount: 0,
        declinedCount: 0,
        suspendedCount: 0,
        totalCount: 2,
        calculationDate: new Date(),
      });
    }

    if (goldenRole) {
      console.log(`Setting statistics for ${goldenRole.name} role`);
      await this.createOrUpdate({
        roleId: goldenRole.id,
        approvedCount: 2, // 2 approved as specified
        pendingCount: 0,
        declinedCount: 0,
        suspendedCount: 0,
        totalCount: 2,
        calculationDate: new Date(),
      });
    }

    // SuperAdmin role doesn't get an entry in the database as specified
    console.log(
      "SuperAdmin role will not have an entry in database as specified"
    );

    // We'll skip player role as specified
    console.log("Skipping player role as specified");
  }
}
