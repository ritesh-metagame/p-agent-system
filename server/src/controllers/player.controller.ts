import {PlayerService} from "../services/player.service";
import {Container} from "typedi";
import {NextFunction, Request, Response} from "express";
import {RoleDao} from "../daos/role.dao";

export class PlayerController {

    private playerService: PlayerService; // Replace 'any' with the actual type of playerService

    private roleDao: RoleDao

    constructor() {
        this.playerService = Container.get(PlayerService);
        this.roleDao = new RoleDao();
    }

    public getNumberOfPlayerAssociatedWithAgent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const roleName = await this.roleDao.getRoleById(req.role).then((role) => role.name);

            return await this.playerService.getNumberOfPlayerAssociatedWithAgent(userId, roleName);
        } catch (error) {
            next(error);
        }
    };
}