import { Site, UserSite } from "../../prisma/generated/prisma";
import { prisma } from "../server";

class SiteDao {
  public async createSite(site: Site) {
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

  public async createUserSite(userSite: UserSite) {
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
