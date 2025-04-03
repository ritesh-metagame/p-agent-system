import { Service } from "typedi";
import { SiteDao } from "../daos/site.dao";
import { Site, UserSite } from "../../prisma/generated/prisma";
import { Response } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";

@Service()
class SiteService {
  private siteDao: SiteDao;

  constructor() {
    this.siteDao = new SiteDao();
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

      return new Response(
        ResponseCodes.SITE_CREATED_SUCCESSFULLY.code,
        ResponseCodes.SITE_CREATED_SUCCESSFULLY.message,
        siteData
      );
    } catch (error) {
      return new Response(
        ResponseCodes.SITE_CREATED_FAILED.code,
        ResponseCodes.SITE_CREATED_FAILED.message
      );
    }
  }
}

export { SiteService };
