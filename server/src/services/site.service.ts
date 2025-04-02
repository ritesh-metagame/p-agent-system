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

  public async createUserSite(userSite: UserSite) {
    try {
      const site = await this.siteDao.createUserSite(userSite);

      return new Response(
        ResponseCodes.USER_SITE_CREATED_SUCCESSFULLY.code,
        ResponseCodes.USER_SITE_CREATED_SUCCESSFULLY.message,
        site
      );
    } catch (error) {
      return error;
    }
  }

  public async createSite(site: Site) {
    try {
      const s = await this.siteDao.createSite(site);

      return new Response(
        ResponseCodes.SITE_CREATED_SUCCESSFULLY.code,
        ResponseCodes.SITE_CREATED_SUCCESSFULLY.message,
        s
      );
    } catch (error) {
      return error;
    }
  }
}

export { SiteService };
