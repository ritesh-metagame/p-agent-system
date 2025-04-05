import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { CastError } from 'mongoose';
import { WriteError } from 'mongodb';
import { ApiError } from './appError';
import { isCelebrateError } from 'celebrate';

class ErrorHandler {
	public static sendDevError(err: ApiError, res: Response): void {
		res.status(err.statusCode).json({
			status: err.status,
			err: err,
			message: err.message,
			stack: err.stack,
		});
	}

	public static sendProdError(err: ApiError, res: Response): void {
		err.isOperational
			? res.status(err.statusCode).json({
					status: err.status,
					message: err.message,
				})
			: res.status(500).json({
					status: 'error',
					message: 'Something went wrong, please try again later!',
				});
	}

	public static handleCastError(err: CastError): ApiError {
		const message = `Value ${err.path}:${err.value}`;
		return new ApiError(message, 400);
	}

	public static handleCelebrateErrors(err: any): ApiError {
		let message = '';
		for (const value of err.details.values()) {
			message += value.message + '; ';
		}

		return new ApiError(message, 400);
	}

	public static handleDuplicateFieldsError(err: WriteError): ApiError {
		const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
		const message = `Duplicate field value: ${value}, Please try again with another value`;
		return new ApiError(message, 400);
	}

	public static handleValidationError(err: any): ApiError {
		const errors = Object.values(err.errors).map((el: any) => el.message);
		const message = `Invalid input data, ${errors.join('. ')}`;
		return new ApiError(message, 400);
	}

	public static handleTokenExpiredError(err: any): ApiError {
		const message = `Token has expired, please login to try again`;
		return new ApiError(message, 401);
	}

	public static handleJsonWebTokenError(err: any): ApiError {
		const message = `Invalid token, please login again!`;
		return new ApiError(message, 401);
	}

	public static errorHandler: ErrorRequestHandler = (
		err: any,
		req: Request,
		res: Response,
		_next: NextFunction,
	) => {
		err.statusCode = +err.statusCode || 500;
		err.status = err.status || 'error';

		if (process.env.NODE_ENV === 'development') {
			ErrorHandler.sendDevError(err, res);
		} else if (process.env.NODE_ENV === 'production') {
			let error = { ...err };
			if (error.name === 'CastError')
				error = ErrorHandler.handleCastError(error);
			if (error.code === 11000)
				error = ErrorHandler.handleDuplicateFieldsError(error);
			if (error.name === 'ValidationError')
				error = ErrorHandler.handleValidationError(error);
			if (error.name === 'TokenExpiredError')
				error = ErrorHandler.handleTokenExpiredError(error);
			if (error.name === 'JsonWebTokenError')
				error = ErrorHandler.handleJsonWebTokenError(error);
			if (isCelebrateError(error))
				error = ErrorHandler.handleCelebrateErrors(error);
			ErrorHandler.sendProdError(error, res);
		}
	};
}

export { ErrorHandler };
