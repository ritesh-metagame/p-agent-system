// import { NextFunction, Request, Response } from 'express';
// import * as jwt from 'jsonwebtoken';
// // import extractToken from './isAuth';
// import { RoleEnum } from '../types/role';
// import { PlayerDao } from '../../core/daos/player.dao';
// import { Response as ApiResponse } from '../config/response';
// import { ResponseCodes } from '../config/responseCodes';

// function extractToken(req: Request): string | null {
// 	if (
// 		req.headers.authorization &&
// 		req.headers.authorization.split(' ')[0] === 'Bearer'
// 	) {
// 		return req.headers.authorization.split(' ')[1];
// 	} else if (req.query && req.query.token) {
// 		return req.query.token as string;
// 	}
// 	return null;
// }

// declare module 'express' {
// 	export interface Request {
// 		id?: string;
// 		role?: string;
// 	}
// }

// function verifyUser() {
// 	return async (req: Request, res: Response, next: NextFunction) => {
// 		if (req.originalUrl.includes('internal')) {
// 			console.log('Internal-----------', req.originalUrl);
// 			// Assuming playerId is present in req.body for internal routes
// 			const playerId = req.body?.playerId; // Adjust based on actual structure

// 			if (!playerId) {
// 				const resp = new ApiResponse(
// 					ResponseCodes.PLAYER_ID_NOT_FOUND.code,
// 					ResponseCodes.PLAYER_ID_NOT_FOUND.message,
// 				);
// 				return res.status(400).json(resp); // Return bad request if playerId is missing
// 			}

// 			try {
// 				console.log('PlayerId:', playerId);

// 				const playerDao = new PlayerDao();
// 				const player = await playerDao.getPlayerById(playerId);

// 				console.log('Player:', player);

// 				req.currentUser = player;
// 				req.id = player._id as unknown as string; // Assuming player._id is string
// 				res.locals.role = player.role;

// 				return next(); // Proceed to next middleware or route handler
// 			} catch (err) {
// 				console.error('Error fetching player:', err);
// 				const resp = new ApiResponse(
// 					ResponseCodes.SERVER_ERROR.code,
// 					ResponseCodes.SERVER_ERROR.message,
// 				);
// 				return res.status(500).json(resp); // Return internal server error if something goes wrong
// 			}
// 		} else {
// 			const token = extractToken(req);
// 			const privateKey = process.env.JWT_SECRET;
// 			if (token !== null) {
// 				const decodedToken = jwt.verify(token, privateKey) as {
// 					playerId: string;
// 					email: string;
// 					role: RoleEnum;
// 				};
// 				console.log(decodedToken);

// 				const playerDao = new PlayerDao();

// 				const player = await playerDao.getPlayerById(decodedToken.playerId);

// 				// req.id = userDetails.playerId;
// 				// req.role = userDetails.role;
// 				// res.locals.id = player._id;
// 				// res.locals.userId = player.userId;
// 				// res.locals.role = userDetails.role;

// 				req.currentUser = player;
// 				req.id = player._id as unknown as string;
// 				res.locals.role = player.role;
// 				next();
// 			} else {
// 				const resp = new ApiResponse(
// 					ResponseCodes.RS_ERROR_INVALID_TOKEN.code,
// 					ResponseCodes.RS_ERROR_INVALID_TOKEN.message,
// 				);
// 				res.status(200).json(resp);
// 			}
// 		}
// 	};
// }

// export { verifyUser };
