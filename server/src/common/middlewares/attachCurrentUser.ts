import { NextFunction, Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import { Container } from "typedi";
import getLogger from "../logger";
import UserDao from "../../daos/user.dao";
// import getLogger from '../../logger';

const log = getLogger(module);

/**
 * Attach user to req.user
 * @param {*} req JWTRequest
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
// Middleware to attach the current user to the request based on JWT information
const attachUser = async (
  req: JWTRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userDao = new UserDao();
    // Retrieve player information from the database based on JWT's player ID
    const user = await userDao.getUserByUsername(req.auth!.username);

    // If no player is found, respond with Unauthorized status
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach the retrieved user to the request object as currentUser
    req.user = user;

    // Continue to the next middleware or route handler
    return next();
  } catch (e) {
    // Log any errors that occur during the execution of the middleware
    log.error("🔥 Error attaching user to req: ", e?.message);

    // Pass the error to the next middleware or error handler
    return next(e);
  }
};

export default attachUser;
