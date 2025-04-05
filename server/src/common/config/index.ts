import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if (!envFound) {
	// This error should crash whole process
	throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
	port: parseInt(process.env.PORT || '8080', 10),

	isDev: process.env.IS_DEV == 'true',

	/**
	 * Used by winston logger
	 */
	logs: {
		level: process.env.LOG_LEVEL || 'silly',
	},

	otp: {
		expiry: 1 * 60 * 1000,
	},

	getTransactionFor: process.env.GET_TRANSACTION_FOR || 7,

	operator: process.env.OPERATOR,

	server: {
		host: process.env.DOMAIN_OR_HOST,
	},

	redis: {
		host: process.env.REDIS_HOST,
		tls: process.env.REDIS_TSL,
		port: process.env.REDIS_PORT || 6379,
	},

	rgs: {
		gameListUrl: process.env.GAME_LIST_URL,
		gameLaunchUrl: process.env.GAME_LAUNCH_URL,
	} as const,

	mongo: {
		URL: process.env.MONGO_URL,
		user: process.env.MONGO_USERNAME,
		pass: process.env.MONGO_PASSWORD,
		dbName: process.env.MONGO_DB,
	},

	basicAuth: {
		username: process.env.BASIC_AUTH_USER,
		password: process.env.BASIC_AUTH_PASSWORD,
	},
	giftonConnection: {
		baseUrl: process.env.GIFTON_BASE_URL,
		clientSecret: process.env.GIFTON_CLIENT_SECRET,
		programId: process.env.GIFTON_PROGRAM_ID,
		apiKey: process.env.GIFTON_API_KEY,
		salt: process.env.GIFTON_SALT,
		redirectUrl: process.env.GIFTON_REDIRECT_URL,
	},

	smsProvider: {
		baseUrl: process.env.SMSPROVIDER_BASE_URL,
		username: process.env.SMSPROVIDER_USERNAME,
		password: process.env.SMSPROVIDER_PASSWORD,
		apiKey: process.env.SMSPROVIDER_API_KEY,
		route: process.env.SMSPROVIDER_ROTUE,
		sender: process.env.SMSPROVIDER_SENDER,
		type: process.env.SMSPROVIDER_TYPE,
		product: process.env.SMSPROVIDER_PRODUCT,
		template: process.env.SMSPROVIDER_TEMPLATE,
		message: process.env.SMSPROVIDER_MESSAGE,
	},

	skillzLive: {
		apiKey: process.env.SKILLZLIVE_API_KEY,
		salt: process.env.SKILLZLIVE_SALT,
		redirectUrl: process.env.SKILLZLIVE_REDIRECT_URL,
	},

	pokerServer: {
		secretKey: process.env.POKERSERVER_SECRET_KEY,
		baseUrl: process.env.POKERSERVER_BASE_URL,
		clientId: process.env.POKERSERVER_CLIENTID,
	},

	trackierConfig: {
		trackier_baseUrl: process.env.TRACKIER_BASE_URL,
		trackier_clientId: process.env.TRACKIER_CLIENT_ID,
		trackier_customerId: process.env.TRACKIER_CUSTOMER_ID,
		trackier_promocode: process.env.TRACKIER_PROMOCODE || 'ORGANIC',
		trackier_sdk_key: process.env.TRACKIER_SDK_KEY,
		trackier_sdk_id: process.env.TRACKIER_SDK_ID,
		trackier_login_event: process.env.TRACKIER_SDK_LOGIN_EVENT,
		trackier_register_event: process.env.TRACKIER_SDK_REGISTER_EVENT,
		trackier_bet_event: process.env.TRACKIER_SDK_BET_EVENT,
		trackier_win_event: process.env.TRACKIER_SDK_WIN_EVENT,
		trackier_deposit_event: process.env.TRACKIER_SDK_DEPOSIT_EVENT,
	},

	jwtExpiresIn: '2592000s',
	jwtSecret: process.env.JWT_SECRET as string,
	googleAuthClientId: process.env.GOOGLE_AUTH_CLIENT_ID as string,
	googleAuthClientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
};
