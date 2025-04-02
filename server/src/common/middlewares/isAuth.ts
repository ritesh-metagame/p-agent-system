import { expressjwt, Request } from 'express-jwt';
import config from '../config';

// Function to extract the JWT token from the request headers
const getTokenFromHeader = (req: Request) => {
	let token = '';
	// Check if the Authorization header is present and formatted as either 'Token' or 'Bearer'
	if (
		(req.headers.authorization &&
			req.headers.authorization.split(' ')[0] === 'Token') ||
		(req.headers.authorization &&
			req.headers.authorization.split(' ')[0] === 'Bearer')
	) {
		// Return the extracted JWT token
		token = req.headers.authorization.split(' ')[1];
	}

	return token;
	// If no valid token found, return null
};

// Middleware for JWT authentication using expressjwt
const isAuth = expressjwt({
	// The secret used to sign the JWTs for verification
	secret: config.jwtSecret,

	// Function to extract the JWT token from the request
	getToken: getTokenFromHeader,

	// Specify the allowed algorithms for JWT verification
	algorithms: ['HS256'],
}).unless({
	path: [],
});

export default isAuth;
