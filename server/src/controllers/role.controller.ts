import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { RoleService } from "../services/role.service";

class RoleController {
  public static async getRoles(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const roleService = Container.get(RoleService);

      const currentUser = req.user; // Assuming you have middleware to set req.user
      const role = req.role;

      const roles = await roleService.getAllRoles(currentUser, role); // Assuming you have a RoleService to fetch roles from the database

      return roles;
    } catch (error) {
      next(error);
    }
  }
}

export { RoleController };
