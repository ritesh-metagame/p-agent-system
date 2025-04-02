import { IResponse } from '../interfaces/response.interface';

class Response<T = unknown> implements IResponse {
	code: string;
	message: string;
	data: any;

	constructor(code: string, message: string, data: T = null) {
		this.code = code;
		this.message = message;
		this.data = data ?? {};
	}
	getResponse() {
		return {
			code: this.code,
			message: this.message,
			data: this.data,
		};
	}
}

export { Response };
