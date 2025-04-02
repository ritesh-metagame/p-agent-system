import { NextFunction, Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import { Response as ApiResponse } from "./../config/response";
import { expressjwt, Request } from "express-jwt";
import config from "../config";
import getLogger from "../logger";
// import Player from '../../core/models/player.model';
import Container from "typedi";
import { ResponseCodes } from "../config/responseCodes";
import UserDao from "../../daos/user.dao";

const log = getLogger(module);

const excludedPathsFromMiddleware = ["/api/v1/auth/login", "/"];

const normalizedPaths = excludedPathsFromMiddleware.map((path) =>
  path.replace(/\//g, "")
);

const isExcludedPath = (requestPath: string): boolean => {
  const normalizedRequestPath = requestPath.replace(/\//g, "");

  return normalizedPaths.some((path) => path === normalizedRequestPath);
};

/**
 * Middleware to perform JWT authentication and attach the current user to the request.
 * @param {*} req JWTRequest
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const authAndAttachUser = expressjwt({
  // The secret used to sign the JWTs for verification
  secret: config.jwtSecret,

  // Function to extract the JWT token from the request
  getToken: (req: Request) => {
    let token = "";
    // Check if the Authorization header is present and formatted as either 'Token' or 'Bearer'
    if (
      (req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Token") ||
      (req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer")
    ) {
      // Return the extracted JWT token
      token = req.headers.authorization.split(" ")[1];
    }

    return token;
    // If no valid token found, return null
  },

  // Specify the allowed algorithms for JWT verification
  algorithms: ["HS256"],
});

export default async (req: JWTRequest, res: Response, next: NextFunction) => {
  try {
    if (isExcludedPath(req.path)) {
      return next();
    }
    // Call the authAndAttachUser middleware
    await authAndAttachUser(req, res, async (err: any) => {
      if (err) {
        // If there's an error with authentication, pass it to the error handler
        return next(err);
      }

      const userDao = new UserDao();
      // Retrieve player information from the database based on JWT's player ID
      log.debug(`Getting player by id--`);
      const user = await userDao.getUserByUsername(req.auth!.username);

      // Retrieve player information from the database based on JWT's player ID
      // If no player is found, respond with Unauthorized status
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Attach the retrieved user to the request object as currentUser
      req.user = user;
      req.role = user.roleId;

      // Continue to the next middleware or route handler
      return next();
    });
  } catch (e) {
    // Log any errors that occur during the execution of the middleware
    log.error("🔥 Error attaching user to req: ", e?.message);

    // Pass the error to the next middleware or error handler
    return next(e);
  }
};
