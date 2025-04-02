import { Express } from 'express';
import logger from '../logger';
import { ExpressLoader } from './express';
import { createServer, Server as HttpServer } from 'http';

const log = logger(module);

class AppLoader {
	private expressApp: Express;

	constructor(expressApp: Express) {
		this.expressApp = expressApp;
	}

	public async load(): Promise<void> {

		// const expressLoader = new ExpressLoader(this.expressApp);
		const expressLoader = new ExpressLoader(this.expressApp); // Pass httpServer to ExpressLoader

		console.log('---------');
		await expressLoader.load();
		console.log('---------');

		log.info('✌️ Express loaded');
	}
}

export default AppLoader;
