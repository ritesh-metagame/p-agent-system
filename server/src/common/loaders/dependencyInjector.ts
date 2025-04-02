import { Container } from 'typedi';
import logger from '../logger';
const log = logger(module);

import { OAuth2Client } from 'google-auth-library';
import config from '../config';

export default async ({ models }: { models: { name: string; model: any }[] }): Promise<any> => {
  try {
    models.forEach((m) => {
      Container.set(m.name, m.model);
    });

    const googleOAuth2Client = new OAuth2Client(config.googleAuthClientId, config.googleAuthClientSecret);
    Container.set('googleOAuth2Client', googleOAuth2Client);
  } catch (e) {
    log.error('🔥 Error on dependency injector loader: %o', e);
    throw e;
  }
};
