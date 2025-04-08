import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import siteRoute from "./site.route";
import commissionRoute from "./commission.route";
import categoryRoute from "./category.route";
import roleRoute from "./role.route";
import topPerformerRoute from "./top-performer.routes";
import networkStatisticsRoute from "./network-statistics.routes";

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
    commissionRoute(this.router);
    categoryRoute(this.router);
    roleRoute(this.router);
    topPerformerRoute(this.router);
    networkStatisticsRoute(this.router);

    // Register network statistics routes
    // this.router.use("/network-statistics", networkStatisticsRoute);

    // Register top performer routes
    // this.router.use("/top-performers", topPerformerRoutes);
  }

  public getRouter() {
    return this.router;
  }
}

export default Routes;
