import { Request, NextFunction, Response } from 'express';

type CatchAsyncFN = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<unknown>;

export const catchAsync = (fn: CatchAsyncFN) => {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
};
