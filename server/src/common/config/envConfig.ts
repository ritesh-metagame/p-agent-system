import dotenv from "dotenv";
import { cleanEnv, str } from "envalid";

dotenv.config();

// First validate all required environment variables are present
const env = cleanEnv(process.env, {
  // Google OAuth
  GOOGLE_OAUTH_REDIRECT_URI: str(),
  GOOGLE_OAUTH_CLIENT_ID: str(),
  GOOGLE_OAUTH_CLIENT_SECRET: str(),

  // Facebook OAuth
  FACEBOOK_OAUTH_REDIRECT_URI: str(),
  FACEBOOK_OAUTH_CLIENT_ID: str(),
  FACEBOOK_OAUTH_CLIENT_SECRET: str(),
  JWT_SECRET: str(),
});

// Now organize environment variables into structured groups
const config = {
  port: process.env.PORT || 3000,
  jwtSecret: env.JWT_SECRET,
  oAuth: {
    google: {
      redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI,
      clientId: env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    },
    facebook: {
      redirectUri: env.FACEBOOK_OAUTH_REDIRECT_URI,
      clientId: env.FACEBOOK_OAUTH_CLIENT_ID,
      clientSecret: env.FACEBOOK_OAUTH_CLIENT_SECRET,
    },
    // truecaller: {
    //     appId: env.TRUECALLER_OAUTH_APP_ID,
    //     redirectUri: env.TRUECALLER_OAUTH_REDIRECT_URI,
    // },
  },
  authServiceMap: {
    google: "GoogleAuthenticationService",
    facebook: "FBAuthenticationService",
    truecaller: "TrueCallerAuthenticationService",
  },
};

// Export the grouped configuration
export default config;
