import jwt from 'jsonwebtoken';

export interface JwtPayloadParams {
	id: string;
	username: string;
	email: string;
	role: string;
	permission: string;
}

export class JwtPayload {
	public id: string;
	public username: string;
	public email: string;
	public role: string;
	public permission: string;

	constructor(params: JwtPayloadParams) {
		this.id = params.id;
		this.username = params.username;
		this.email = params.email;
		this.role = params.role;
		this.permission = params.permission;
	}

	public static fromObject(obj: jwt.JwtPayload): JwtPayload {
		const jwtPayloadParams: JwtPayloadParams = {
			id: obj.id as string,
			username: obj.username as string,
			email: obj.email as string,
			role: obj.role as string,
			permission: obj.permission as string
		};

		return new JwtPayload(jwtPayloadParams);
	}

	public static fromJSON(json: string): JwtPayload {
		return new JwtPayload(JSON.parse(json));
	}

	public static toString(jwtPayload: JwtPayload): string {
		return JSON.stringify(jwtPayload);
	}

	public toString(): string {
		return JwtPayload.toString(this);
	}
}
