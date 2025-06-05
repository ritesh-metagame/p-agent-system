import {NextFunction, Request, Response, Router} from "express";
import {catchAsync} from "../common/lib";
import {RoleController} from "../controllers/role.controller";
import {PlayerController} from "../controllers/player.controller";

const route = Router();

export default (app: Router) => {
    app.use("/player", route);

    route.get(
        "/getNumberOfPlayerAssociatedWithAgent",
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {

            const playerController = new PlayerController();

            const response = await playerController.getNumberOfPlayerAssociatedWithAgent(req, res, next);

            res.status(200).json(response);
        }) as any
    );
};