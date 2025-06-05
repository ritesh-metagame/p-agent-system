import {Service} from "typedi";
import {UserRole} from "../common/config/constants";
import {prisma} from "../server";

@Service()
class PlayerService {

    public async getNumberOfPlayerAssociatedWithAgent(userId: string, roleName: string) {
        try {
            let gIds = [userId]

            if (roleName === UserRole.SUPER_ADMIN) {
                const oIds = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {
                            name: UserRole.OPERATOR
                        }
                    }
                }).then((users) => users.map((user) => user.id));

                const pIds = await prisma.user.findMany({
                    where: {
                        parentId: {
                            in: oIds
                        },
                        role: {
                            name: UserRole.PLATINUM
                        }
                    }
                }).then((users) => users.map((user) => user.id));

                gIds = await prisma.user.findMany({
                    where: {
                        parentId: {
                            in: pIds
                        },
                        role: {
                            name: UserRole.GOLDEN
                        }
                    }
                }).then((users) => users.map((user) => user.id));
            }

            if (roleName === UserRole.OPERATOR) {
                const pIds = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {
                            name: UserRole.PLATINUM
                        }
                    }
                }).then((users) => users.map((user) => user.id));

                gIds = await prisma.user.findMany({
                    where: {
                        parentId: {
                            in: pIds
                        },
                        role: {
                            name: UserRole.GOLDEN
                        }
                    }
                }).then((users) => users.map((user) => user.id));
            }

            if (roleName === UserRole.PLATINUM) {

                gIds = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {
                            name: UserRole.GOLDEN
                        }
                    }
                }).then((users) => users.map((user) => user.id));
            }

            const count: any[] = await prisma.$queryRawUnsafe(`select *
                                                               from Players
                                                               where referenceCode IN (${gIds.map(id => `'${id}'`).join(",")})`);

            // const count = await prisma.$queryRawUnsafecount({
            //     where: {
            //         referenceCode: {
            //             in: gIds
            //         },
            //     }
            // });

            return {
                code: 200,
                message: "Number of players associated with agent",
                data: count.length || 0
            };

        } catch (error) {
            console.error("Error fetching number of players associated with agent:", error);
            return {
                code: 500,
                message: "Failed to fetch number of players associated with agent",
                data: error
            };
        }
    }
}

export {PlayerService}