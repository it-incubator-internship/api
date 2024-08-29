import { randomBytes, randomUUID } from 'crypto';

import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

// import { LoginUserCommand } from './login.user.command';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../../user/repository/user.repository';

import { RegistrationUserByGoogleCommand } from './registration-by-google.user.command';

export class GoogleAuthCommand {
  constructor(
    public inputModel: {
      googleId: string;
      email: string;
      emailValidation: boolean;
      // ipAddress: string;
      // userAgent: string;
    },
  ) {}
}

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler implements ICommandHandler<GoogleAuthCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private commandBus: CommandBus,
  ) {}
  async execute(command: GoogleAuthCommand): Promise<any> {
    console.log('command in google auth command:', command);

    // поиск user по googleId
    const accountDataByGoogleId = await this.userRepository.findAccountDataByGoogleId({
      googleId: command.inputModel.googleId,
    });
    console.log('accountDataByGoogleId in google auth command:', accountDataByGoogleId);

    // если user по googleId найден
    if (accountDataByGoogleId) {
      console.log('console.log in google auth command (accountDataByGoogleId)');

      return ObjResult.Ok();

      // login user
      // const result = await this.commandBus.execute(
      //   new LoginUserCommand({
      //     ipAddress: command.inputModel.ipAddress,
      //     userAgent: command.inputModel.userAgent,
      //     userId: accountDataByGoogleId.profileId,
      //   }),
      // );
      // console.log('result in google auth command (accountDataByGoogleId):', result);
      // return result;
    }

    // если user по googleId не найден и не приходит email
    if (!command.inputModel.email) {
      console.log('console.log in google auth command (!command.inputModel.email)');

      const email = '';
      console.log('email in google auth command (!command.inputModel.email):', email);

      // не мало ли 3-значного числа?
      const random = randomBytes(3).toString('hex');
      console.log('random in google auth command (!command.inputModel.email):', random);
      const userName = 'user' + random;
      console.log('userName in google auth command (!command.inputModel.email):', userName);

      const password = randomUUID();
      console.log('password in google auth command (!command.inputModel.email):', password);

      const registrationResult = await this.commandBus.execute(
        new RegistrationUserByGoogleCommand({
          googleId: command.inputModel.googleId,
          password,
          email,
          userName,
        }),
      );
      console.log('registrationResult in google auth command (!command.inputModel.email):', registrationResult);

      return ObjResult.Ok();

      // login user
      // const loginResult = await this.commandBus.execute(
      //   new LoginUserCommand({
      //     ipAddress: command.inputModel.ipAddress,
      //     userAgent: command.inputModel.userAgent,
      //     userId: accountDataByGoogleId.profileId,
      //   }),
      // );
      // console.log('result in google auth command:', loginResult);
      // return loginResult;

      // return loginResult;
    }

    // если user по googleId не найден, но приходит email
    if (command.inputModel.email) {
      console.log('console.log in google auth command (command.inputModel.email)');

      // поиск user по email
      const userByEmail = await this.userRepository.findUserByEmail({ email: command.inputModel.email });
      console.log('userByEmail in google command (command.inputModel.email):', userByEmail);

      // если user по email найден
      if (userByEmail) {
        console.log('console.log in google auth command (userByEmail)');

        const accountData = await this.userRepository.findAccountDataById({ id: userByEmail.id });
        console.log('accountData in google command (userByEmail):', accountData);

        accountData!.addGoogleId({ googleId: command.inputModel.googleId });
        console.log('accountData in google command (userByEmail):', accountData);

        await this.userRepository.updateAccountData(accountData!);

        return ObjResult.Ok();

        // login user
        // const loginResult = await this.commandBus.execute(
        //   new LoginUserCommand({
        //     ipAddress: command.inputModel.ipAddress,
        //     userAgent: command.inputModel.userAgent,
        //     userId: accountDataByGoogleId.profileId,
        //   }),
        // );
        // console.log('result in google auth command:', loginResult);
        // return loginResult;

        // return loginResult;
      }

      // если user по email не найден
      if (!userByEmail) {
        console.log('console.log in google auth command (!userByEmail)');

        const email = command.inputModel.email;
        console.log('email in google auth command (!userByEmail):', email);

        const index = email.indexOf('@');
        let userName;
        if (index !== -1) {
          userName = email.slice(0, index);
          console.log('userName in google command (!userByEmail):', userName);
        }

        const userByUserName = await this.userRepository.findUserByUserName({ userName });
        console.log('userByUserName in google command (!userByEmail):', userByUserName);

        if (userByUserName) {
          const random = randomBytes(3).toString('hex');
          console.log('random in google command (!userByEmail):', random);
          userName = userName + random;
          console.log('userName in google command (!userByEmail):', userName);
        }

        const password = randomUUID();
        console.log('password in google auth command (!userByEmail):', password);

        const registrationResult = await this.commandBus.execute(
          new RegistrationUserByGoogleCommand({
            googleId: command.inputModel.googleId,
            password,
            email,
            userName,
          }),
        );
        console.log('registrationResult in google auth command (!userByEmail):', registrationResult);

        return ObjResult.Ok();

        // login user
        // const loginResult = await this.commandBus.execute(
        //   new LoginUserCommand({
        //     ipAddress: command.inputModel.ipAddress,
        //     userAgent: command.inputModel.userAgent,
        //     userId: accountDataByGoogleId.profileId,
        //   }),
        // );
        // console.log('result in google auth command:', loginResult);
        // return loginResult;

        // return loginResult;
      }
    }
  }
}
