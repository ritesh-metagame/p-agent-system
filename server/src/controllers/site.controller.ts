import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { SiteService } from "../services/site.service";

class SiteController {
  public static async createSite(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name, description, url } = req.body;

      const siteData = {
        name,
        description,
        url,
      };

      const siteService = Container.get(SiteService);

      const response = await siteService.createSite(siteData);

      return response;
    } catch (error) {
      console;
      next(error);
    }
  }

  public static async siteUserCreate(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { siteId, userId } = req.body;

      const siteUserData = {
        siteId,
        userId,
      };

      const siteService = Container.get(SiteService);

      const response = await siteService.createUserSite(siteUserData);

      return response;
    } catch (error) {
      next(error);
    }
  }

  public static async getSites(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const siteService = Container.get(SiteService);

      const currentUser = req.user;
      const currentUserRole = req.role;

      const response = await siteService.getAllSites(
        currentUser,
        currentUserRole
      );

      return response;
    } catch (error) {
      next(error);
    }
  }
}

export { SiteController };
