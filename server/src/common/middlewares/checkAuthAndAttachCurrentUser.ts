// import { NextFunction, Response } from 'express';
// import { Request as JWTRequest } from 'express-jwt';
// import { Response as ApiResponse } from './../config/response';
// import { expressjwt, Request } from 'express-jwt';
// import config from '../config';
// import getLogger from '../logger';
// // import Player from '../../core/models/player.model';
// import { CommonPlayerDao } from '../daos/commonPlayer.dao';
// import { Player as PlayerClass } from '../classes/player.class';
// import Container from 'typedi';
// import { ResponseCodes } from '../config/responseCodes';
// import CacheService from '../../notifications/services/cache.service';
// import { redisService } from '../../core/services/redis.service';

// const log = getLogger(module);

// const excludedPathsFromMiddleware = [
// 	'/api/core/auth/otp/send-otp',
// 	'/api/core/auth/otp/verify-otp',
// 	'/api/core/auth/register',
// 	'/api/core/auth/login',
// 	'/api/core/auth/terminate-session',
// 	'/api/payment/deposit/capture-payment',
// 	'/api/core/auth/app-exited',
// 	'/api/core/auth/validateToken',
// 	'/api/external/payment/deposit',
// 	'/api/external/payment/deposit/capture-payment',
// 	'/api/auth/social-auth',
// 	'/',
// ];

// const normalizedPaths = excludedPathsFromMiddleware.map((path) =>
// 	path.replace(/\//g, ''),
// );

// const isExcludedPath = (requestPath: string): boolean => {
// 	const normalizedRequestPath = requestPath.replace(/\//g, '');

// 	return normalizedPaths.some((path) => path === normalizedRequestPath);
// };

// /**
//  * Middleware to perform JWT authentication and attach the current user to the request.
//  * @param {*} req JWTRequest
//  * @param {*} res  Express res Object
//  * @param {*} next  Express next Function
//  */
// const authAndAttachUser = expressjwt({
// 	// The secret used to sign the JWTs for verification
// 	secret: config.jwtSecret,

// 	// Function to extract the JWT token from the request
// 	getToken: (req: Request) => {
// 		let token = '';
// 		// Check if the Authorization header is present and formatted as either 'Token' or 'Bearer'
// 		if (
// 			(req.headers.authorization &&
// 				req.headers.authorization.split(' ')[0] === 'Token') ||
// 			(req.headers.authorization &&
// 				req.headers.authorization.split(' ')[0] === 'Bearer')
// 		) {
// 			// Return the extracted JWT token
// 			token = req.headers.authorization.split(' ')[1];
// 		}

// 		return token;
// 		// If no valid token found, return null
// 	},

// 	// Specify the allowed algorithms for JWT verification
// 	algorithms: ['HS256'],
// });

// export default async (req: JWTRequest, res: Response, next: NextFunction) => {
// 	try {
// 		if (isExcludedPath(req.path)) {
// 			return next();
// 		}
// 		// Call the authAndAttachUser middleware
// 		await authAndAttachUser(req, res, async (err: any) => {
// 			if (err) {
// 				// If there's an error with authentication, pass it to the error handler
// 				return next(err);
// 			}

// 			const playerDao = new CommonPlayerDao();

// 			log.debug(`Getting player by id--`);
// 			// Retrieve player information from the database based on JWT's player ID
// 			let player = await playerDao.getPlayerById(req.auth!.playerId);

// 			log.debug(
// 				`Got player by id query response-- ${JSON.stringify(player)}`,
// 			);

// 			if (!player) {
// 				return res.sendStatus(401).json({ message: 'Unauthorized' });
// 			}

// 			const cacheService = Container.get(CacheService);

// 			log.debug(`Getting the session of the player--`);
// 			let session = await redisService.getSession(req.auth!.phoneNumber);

// 			/**
// 			 * if session is null then try to get session by email
// 			 * This is the case when user is logged in through social Auth provider (using email) instead of using mobile number
// 			 */
// 			if (!session) {
// 				session = await redisService.getSession(req.auth!.email);
// 			}

// 			log.debug(`Got the session of the player--`);

// 			const parsedSession = JSON.parse(session);

// 			if (!parsedSession?.deviceId || !req.auth?.deviceId) {
// 				return res
// 					.status(200)
// 					.json(
// 						new ApiResponse(
// 							ResponseCodes.SESSION_TERMINATED.code,
// 							ResponseCodes.SESSION_TERMINATED.message,
// 						),
// 					);
// 			}

// 			if (parsedSession?.deviceId !== req.auth?.deviceId) {
// 				return res
// 					.status(200)
// 					.json(
// 						new ApiResponse(
// 							ResponseCodes.SESSION_TERMINATED.code,
// 							ResponseCodes.SESSION_TERMINATED.message,
// 						),
// 					);
// 			}

// 			player = new PlayerClass(player);

// 			// If no player is found, respond with Unauthorized status

// 			// Attach the retrieved player to the request object as currentUser
// 			req.currentUser = player;

// 			// Continue to the next middleware or route handler
// 			return next();
// 		});
// 	} catch (e) {
// 		// Log any errors that occur during the execution of the middleware
// 		log.error('🔥 Error attaching user to req: ', e?.message);

// 		// Pass the error to the next middleware or error handler
// 		return next(e);
// 	}
// };
