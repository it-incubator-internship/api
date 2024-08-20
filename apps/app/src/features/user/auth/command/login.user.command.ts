import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../user/repository/user.repository';
import { UserSession } from '../../user/class/session.fabric';
import { ConfigurationType } from '../../../../common/settings/configuration';

export class LoginUserCommand {
  constructor(public inputModel: {email: string, ipAddress: string, userAgent: string}) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {}
  async execute(command: LoginUserCommand): Promise<any> {
    console.log('command in login user use case:', command);

    const user = await this.userRepository.findUserByEmail({email: command.inputModel.email})
    console.log('user in login user use case:', user);

    const accessTokenPayload = {userId: user?.id}
    console.log('accessTokenPayload in login user use case:', accessTokenPayload);

    const deviceUuid = randomUUID()
    console.log('deviceUuid in login user use case:', deviceUuid);

    const refreshTokenPayload = {userId: user?.id, deviceUuid}
    console.log('refreshTokenPayload in login user use case:', refreshTokenPayload);

    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });
    console.log('jwtConfiguration in login user use case:', jwtConfiguration);
    const accessTokenSecret = jwtConfiguration.accessToken as string;
    console.log('accessTokenSecret in login user use case:', accessTokenSecret);
    const refreshTokenSecret = jwtConfiguration.refreshToken as string;
    console.log('refreshTokenSecret in login user use case:', refreshTokenSecret);

    const accessToken = this.jwtService.sign(accessTokenPayload, {secret: accessTokenSecret, expiresIn: '500s' })   // время действия accessToken
    console.log('accessToken in login user use case:', accessToken);

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {secret: refreshTokenSecret, expiresIn: '1000s' })   // время действия refreshToken
    console.log('refreshToken in login user use case:', refreshToken);

    const payload = await this.jwtService.decode(refreshToken)
    console.log('payload in login user use case:', payload);

    // const session = UserSession.create({
    //   profileId: user!.id,
    //   deviceName: command.inputModel.userAgent,
    //   ip: command.inputModel.ipAddress,
    //   lastActiveDate: payload.
    // })

  }
}
