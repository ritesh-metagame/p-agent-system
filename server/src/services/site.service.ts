import { Service } from "typedi";
import { SiteDao } from "../daos/site.dao";
import { Site, User, UserSite } from "../../prisma/generated/prisma";
import { Response } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";
import { UserRole } from "../common/config/constants";
import { RoleDao } from "../daos/role.dao";

@Service()
class SiteService {
  private siteDao: SiteDao;
  private roleDao: RoleDao;

  constructor() {
    this.siteDao = new SiteDao();
    this.roleDao = new RoleDao();
  }

  public async getAllSites(user: User, role: string) {
    try {
      const currentUserRole = await this.roleDao.getRoleById(role);

      if (currentUserRole.name === UserRole.SUPER_ADMIN) {
        const sites = await this.siteDao.getAllSitesForSuperAdmin();
        console.log("Sites for Super Admin:", sites);
        return new Response(
          ResponseCodes.SITES_FETCHED_SUCCESSFULLY.code,
          ResponseCodes.SITES_FETCHED_SUCCESSFULLY.message,
          sites
        );
      }

      const sites = await this.siteDao.getAllSites(user.id);

      return new Response(
        ResponseCodes.SITES_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.SITES_FETCHED_SUCCESSFULLY.message,
        sites
      );
    } catch (error) {
      return error;
    }
  }

  public async createUserSite(userSite: Partial<UserSite>) {
    try {
      const siteUserData = await this.siteDao.createUserSite(userSite);

      return new Response(
        ResponseCodes.USER_SITE_CREATED_SUCCESSFULLY.code,
        ResponseCodes.USER_SITE_CREATED_SUCCESSFULLY.message,
        siteUserData
      );
    } catch (error) {
      return new Response(
        ResponseCodes.USER_SITE_CREATED_FAILED.code,
        ResponseCodes.USER_SITE_CREATED_FAILED.message
      );
    }
  }

  public async createSite(site: Partial<Site>) {
    try {
      const siteData = await this.siteDao.createSite(site);

      console.log({ siteData });

      return new Response(
        ResponseCodes.SITE_CREATED_SUCCESSFULLY.code,
        ResponseCodes.SITE_CREATED_SUCCESSFULLY.message,
        siteData
      );
    } catch (error) {
      console.error(error);

      return error;
    }
  }
}

export { SiteService };
