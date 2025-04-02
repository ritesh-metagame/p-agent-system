import { NextFunction, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { Container } from 'typedi';
import getLogger from '../logger';
import Player from '../../core/models/player.model';
// import getLogger from '../../logger';

const log = getLogger(module);

/**
 * Attach user to req.user
 * @param {*} req JWTRequest
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
// Middleware to attach the current user to the request based on JWT information
const attachCurrentUser = async (
	req: JWTRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Retrieve player information from the database based on JWT's player ID
		const player = await Player.findById({ _id: req.auth!.playerId }).select(
			'id email name source metaAddress nonce',
		);

		// If no player is found, respond with Unauthorized status
		if (!player) {
			return res.sendStatus(401).json({ message: 'Unauthorized' });
		}

		// Attach the retrieved player to the request object as currentUser
		req.currentUser = player;

		// Continue to the next middleware or route handler
		return next();
	} catch (e) {
		// Log any errors that occur during the execution of the middleware
		log.error('🔥 Error attaching user to req: ', e?.message);

		// Pass the error to the next middleware or error handler
		return next(e);
	}
};

export default attachCurrentUser;
