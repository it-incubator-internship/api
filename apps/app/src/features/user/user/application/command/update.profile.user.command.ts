import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../repository/user.repository';
import { BadRequestError, NotFoundError } from '../../../../../../../common/utils/result/custom-error';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { EntityEnum } from '../../../../../../../common/repository/base.repository';
import { ProfileEntityNEW, UserEntityNEW } from '../../domain/account-data.entity';
import { DateHalper } from '../../../../../../../common/halpers/date.halper/date.halper';

export class UpdateProfileUserCommand {
  constructor(public inputModel /* : ProfileUserInputModel */) {}
}

@CommandHandler(UpdateProfileUserCommand)
export class UpdateProfileUserCommandHandler implements ICommandHandler<UpdateProfileUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateProfileUserCommand): Promise<any> {
    const { userIdFromParam, userName, firstName, lastName, dateOfBirth, country, city, aboutMe } = command.inputModel;

    // поиск user по id
    const user: UserEntityNEW = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.user,
      conditions: { id: userIdFromParam },
    });

    // если user по id не найден
    if (!user) {
      throw new NotFoundError('user not found');
    }

    let parsedDateOfBirth;

    // если приходит значение dateOfBirth
    if (dateOfBirth) {
      // преобразование в Date
      const { parsedDate } = DateHalper.getDate({ date: dateOfBirth });

      // проверка на >100 лет
      const isValidMaxAge = DateHalper.checkMaxDate({ date: parsedDate, years: 100 });

      if (!isValidMaxAge) {
        // TODO добавить в logger
        return ObjResult.Err(
          new BadRequestError('User age is more than 100 years', [
            {
              message: "The user's age cannot be more than 100 years old",
              field: 'dateOfBirth',
            },
          ]),
        );
      }

      // проверка на <13 лет
      const isValidMinAge = DateHalper.checkMinDate({ date: parsedDate, years: 13 });

      if (!isValidMinAge) {
        // TODO добавить в logger
        return ObjResult.Err(
          new BadRequestError('User age is less than 13 years', [
            {
              message: "The user's age cannot be less than 13 years old",
              field: 'dateOfBirth',
            },
          ]),
        );
      }

      parsedDateOfBirth = parsedDate;
    }

    // если было изменено userName
    if (user.name !== userName) {
      user.updateUserName({ name: userName });

      await this.userRepository.updateOne({
        modelName: EntityEnum.user,
        conditions: { id: user.id },
        data: user,
      });
    }

    // поиск userProfile
    const userProfile: ProfileEntityNEW = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: userIdFromParam },
    });

    // если userProfile не найден
    if (!userProfile) {
      const profile = ProfileEntityNEW.createForDatabase({
        profileId: userIdFromParam,
        firstName,
        lastName,
        dateOfBirth: parsedDateOfBirth,
        country,
        city,
        aboutMe,
      });

      await this.userRepository.createProfile(profile);

      return ObjResult.Ok();
    }

    // если userProfile найден и есть изменения в userProfile
    if (
      userProfile.firstName !== firstName ||
      userProfile.lastName !== lastName ||
      userProfile.dateOfBirth!.getTime() !== parsedDateOfBirth.getTime() ||
      userProfile.country !== country ||
      userProfile.city !== city ||
      userProfile.aboutMe !== aboutMe
    ) {
      userProfile.updateUserProfile({ firstName, lastName, dateOfBirth: parsedDateOfBirth, country, city, aboutMe });

      await this.userRepository.updateOne({
        modelName: EntityEnum.profile,
        conditions: { profileId: userProfile.profileId },
        data: userProfile,
      });

      return ObjResult.Ok();
    }

    // если userProfile найден, но нет изменения в userProfile
    return ObjResult.Ok();
  }
}
