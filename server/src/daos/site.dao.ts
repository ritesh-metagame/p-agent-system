import { Site, UserSite } from "../../prisma/generated/prisma";
import { prisma } from "../server";

class SiteDao {
  public async getAllSitesForSuperAdmin() {
    try {
      const sites = await prisma.site.findMany({
        include: {
          users: true,
        },
      });
      return sites;
    } catch (error) {
      throw new Error(`Error fetching sites: ${error}`);
    }
  }

  public async getAllSites(userId: string) {
    try {
      const sites = await prisma.userSite.findMany({
        where: {
          userId: userId,
        },
        include: {
          site: true,
          user: true,
        },
      });
      return sites;
    } catch (error) {
      throw new Error(`Error fetching sites: ${error}`);
    }
  }

  public async createSite(site: any) {
    try {
      const newSite = await prisma.site.create({
        data: {
          ...site,
        },
      });

      return newSite;
    } catch (error) {
      throw new Error("Error creating site: " + error);
    }
  }

  public async createUserSite(userSite: any) {
    try {
      const newUserSite = await prisma.userSite.create({
        data: {
          siteId: userSite.siteId,
          userId: userSite.userId,
        },
      });

      return newUserSite;
    } catch (error) {
      throw new Error(`Error creating user site: ${error}`);
    }
  }
}

export { SiteDao };
