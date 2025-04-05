// import { NextFunction, Request, Response } from 'express';
// import * as jwt from 'jsonwebtoken';
// // import extractToken from './isAuth';
// import { RoleEnum } from '../types/role';
// import { PlayerDao } from '../../core/daos/player.dao';
// import { Response as ApiResponse } from '../config/response';
// import { ResponseCodes } from '../config/responseCodes';
// import config from '../config';

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

// function verifySkillzUser() {
// 	return async (req: Request, res: Response, next: NextFunction) => {
// 		console.log({ BearerToken: req.headers.authorization });

// 		const token = extractToken(req);
// 		const privateKey = config.jwtSecret;

// 		console.log({ token });

// 		if (token !== null) {
// 			const decodedToken = jwt.verify(token, privateKey) as {
// 				city: string;
// 				country: string;
// 				customerName: string;
// 				email: string;
// 				mobileNumber: string;
// 				state: string;
// 				userId: string;
// 				zipCode: string;
// 			};
// 			console.log(decodedToken);

// 			const playerDao = new PlayerDao();

// 			// req.id = userDetails.playerId;
// 			// req.role = userDetails.role;
// 			// res.locals.id = player._id;
// 			// res.locals.userId = player.userId;
// 			// res.locals.role = userDetails.role;

// 			req.skillzUser = decodedToken;
// 			next();
// 		} else {
// 			const resp = new ApiResponse(
// 				ResponseCodes.RS_ERROR_INVALID_TOKEN.code,
// 				ResponseCodes.RS_ERROR_INVALID_TOKEN.message,
// 			);
// 			res.status(200).json(resp);
// 		}
// 	};
// }

// export { verifySkillzUser };
