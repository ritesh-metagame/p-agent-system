import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import siteRoute from "./site.route";
import categoryRoute from "./category.route";
import roleRoute from "./role.route";

class Routes {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    authRoute(this.router);
    userRoute(this.router);
    siteRoute(this.router);
    categoryRoute(this.router);
    roleRoute(this.router);
  }

  public getRouter() {
    return this.router;
  }
}

export default Routes;
