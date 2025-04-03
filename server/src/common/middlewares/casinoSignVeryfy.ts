// import { NextFunction, Request, Response } from 'express';
// import { Response as ApiResponse } from '../config/response';
// import { ResponseCodes } from '../config/responseCodes';
// import fs from 'fs';
// import crypto from 'node:crypto';
// import path from 'path';

// function extractCasinoSign(req: Request): any | null {
// 	if (req.headers['casino-signature']) {
// 		return req.headers['casino-signature'];
// 	} else if (req.query && req.query['casino-signature']) {
// 		return req.query['casino-signature'] as string;
// 	}
// 	return null;
// }

// function casinoSignVerify() {
// 	return async (req: Request, res: Response, next: NextFunction) => {
// 		const bufferData = Buffer.from(JSON.stringify(req.body));

// 		const casinoSign = extractCasinoSign(req);

// 		if (!casinoSign) {
// 			return res.status(200).json({
// 				code: ResponseCodes.RS_ERROR_INVALID_SIGNATURE.code,
// 				message: ResponseCodes.RS_ERROR_INVALID_SIGNATURE.message,
// 			});
// 		}

// 		const bufferSignature = Buffer.from(casinoSign, 'base64');

// 		const publicKey = fs.readFileSync('.keys/provfair-rgs-public.pem');

// 		if (!publicKey) {
// 			return res.status(400).json({
// 				code: ResponseCodes.RS_ERROR_UNKNOWN.code,
// 				message: ResponseCodes.RS_ERROR_UNKNOWN.message,
// 			});
// 		}
// 		const isVerified = crypto.verify(
// 			'RSA-SHA256',
// 			bufferData,
// 			publicKey, // Replace publicKey with the corresponding public key
// 			bufferSignature,
// 		);

// 		if (isVerified == false) {
// 			return res.status(400).json({
// 				code: ResponseCodes.RS_ERROR_INVALID_TOKEN.code,
// 				message: ResponseCodes.RS_ERROR_INVALID_TOKEN.message,
// 			});
// 		}
// 		next();
// 	};
// }

// export { casinoSignVerify };
