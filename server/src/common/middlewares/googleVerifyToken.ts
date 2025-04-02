import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { OAuth2Client } from 'google-auth-library';
import getLogger from '../logger';
import config from '../config';

const log = getLogger(module);

// Function to extract the JWT token from the request headers
const getTokenFromHeader = (req: Request) => {
	// Check if the Authorization header is present and formatted as a Bearer token
	if (
		req.headers.authorization &&
		req.headers.authorization.split(' ')[0] === 'Bearer'
	) {
		// Return the extracted JWT token
		return req.headers.authorization.split(' ')[1];
	}
	// If no valid token found, return null
	return null;
};

// Middleware to verify Google authentication token and populate req.googleUserObj
const googleVerifyToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Get the Google OAuth2Client instance from the dependency injection container
		const client: OAuth2Client = Container.get('googleOAuth2Client');

		// Obtain tokens from Google using the authorization code
		const { tokens } = await client.getToken({
			code: req.body.code,
			redirect_uri: 'postmessage',
		});

		// Check if an id_token is present in the obtained tokens
		if (tokens.id_token) {
			// Verify the id_token with Google and obtain user information (Google User Object)
			const ticket = await client.verifyIdToken({
				idToken: tokens.id_token,
				audience: config.googleAuthClientId,
			});

			// Attach the Google User Object to the request object as req.googleUserObj
			req.googleUserObj = ticket.getPayload();

			// Continue to the next middleware or route handler
			return next();
		} else {
			// Log an error if no id_token is found
			log.error(
				'googleVerifyToken: No id_token found from code: ' + req.body.code,
			);

			// Respond with a Forbidden status if no id_token is present
			return res.status(403).json({
				message: 'Forbidden',
			});
		}
	} catch (e) {
		// Log any errors that occur during Google token verification
		log.error({
			text: e,
			fn: 'googleVerifyToken',
		});

		// Pass the error to the next middleware or error handler
		return next(e);
	}
};

export default googleVerifyToken;
