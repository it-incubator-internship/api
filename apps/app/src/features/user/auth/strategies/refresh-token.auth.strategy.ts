// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { configVariables } from '../../config.variables/config.variables';
// import { Request } from 'express';
// import { RefreshTokenValidation } from '../../utils/validation.refresh.token';
// import { CustomResponse } from '../../utils/custom.response';

// @Injectable()
// export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
//     constructor(private readonly refreshTokenValidation: RefreshTokenValidation) {
//         super({
//             jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
//                 return request?.cookies?.refreshToken;
//             }]),
//             ignoreExpiration: false,
//             secretOrKey: configVariables.JWT_SECRET_REFRESH,
//         });
//     }

//     async validate(payload: any) {

// console.log('payload in refresh token auth strategy:', payload)

//         const session = await this.refreshTokenValidation.validateRefreshToken(payload.userId, payload.deviceId, payload.exp)

// console.log('session in refresh token auth strategy:', session)
// console.log('data in refresh token auth strategy:', session.data)
// console.log('payload in refresh token auth strategy:', payload)
// console.log('payload.userId in refresh token auth strategy:', payload.userId)
// console.log('payload.deviceId in refresh token auth strategy:', payload.deviceId)

//         const result = CustomResponse.fromResult(session)

// console.log('result in refresh token auth strategy:', result)

//         return result

//     }

// }
