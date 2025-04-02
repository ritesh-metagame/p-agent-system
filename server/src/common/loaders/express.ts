import compression from "compression";
import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import morganMiddleware from "../logger/morgan";
import { isCelebrateError } from "celebrate";
// import '../../payment/seed/config.seed';
import getLogger from "../logger";
import config from "../config";
// import checkAuthAndAttachCurrentUser from "../middlewares/checkAuthAndAttachCurrentUser";
// import { initializeWebSocketServer } from './webSocket';
// import Container from 'typedi';
// import "../../authentication/services/index"; // Adds social authentication services to Container(typedi)
import Route from "./../../routes";

const log = getLogger(module);

class ExpressLoader {
  private app: Express;

  constructor(app: Express) {
    this.app = app;
  }

  private handleStatusRequests(req: Request, res: Response): void {
    res.status(200).end();
  }

  public async load(): Promise<void> {
    // swaggerDocs(this.app, config.port);

    this.app.enable("trust proxy");
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(compression());
    this.app.use(morganMiddleware);

    const routes = new Route();

    // this.app.use("/api/internal", coreRoutes.getRouter());

    // this.app.use(checkAuthAndAttachCurrentUser);

    this.app.use("/api/v1", routes.getRouter());

    // this.app.use(ErrorHandler.errorHandler);

    this.app.use((err, req, res, next) => {
      console.log({ err });
      // Check if err.details exists
      if (err.isOperational) {
        res.status(err.statusCode || 500).json({
          status_code: err.customErrorCode || 500,
          message: err.message || "Internal Server Error",
          status: err.status || "error",
        });
      }
      if (err.details) {
        // Handle Celebrate validation errors
        const validationError = err.details.get("body");
        console.log(err);
        const errorMessage = validationError
          ? validationError.message
          : "Validation error";
        res.status(422).json({ error: errorMessage });
      } else {
        // Handle other errors
        const statusCode = err.status || 500;
        res.status(statusCode).json({ error: err.message });
      }
    });

    // this.app.use(this.handleNotFound);
    // this.app.use(this.handleUnauthorizedError);
    // this.app.use(this.handleCelebrateErrors);
    // this.app.use(this.handleGeneralErrors);
  }
}

export { ExpressLoader };
