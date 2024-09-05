import { Body, Controller, Get, NotFoundException, Put } from '@nestjs/common';

import { BaseRepository, EntityEnum } from '../repository/base.repository';
import { UserEntityNEW } from '../../app/src/features/user/user/domain/account-data.entity';

@Controller('base')
export class BaseController {
  constructor(private baseRepository: BaseRepository) {}

  @Get('get/user/id')
  async getUserById(@Body() inputModel: { id: string }) {
    console.log('inputModel in base controller (getUserById):', inputModel);

    // поиск user по id
    const searchResult: UserEntityNEW | null = await this.baseRepository.findFirstOne({
      modelName: EntityEnum.user,
      conditions: { id: inputModel.id },
    });
    console.log('searchResult in base controller (getUserById):', searchResult);

    if (!searchResult) throw new NotFoundException();

    // использование метода экземпляра класса
    searchResult.deleteUserProfile();
    console.log('searchResult in base controller (getUserById):', searchResult);

    // обновление user
    const updatingResult1 = await this.baseRepository.updateOne({
      modelName: EntityEnum.user,
      conditions: { id: searchResult.id },
      data: searchResult,
    });
    console.log('updatingResult1 in base controller (updateUserData):', updatingResult1);

    if (!updatingResult1) throw new NotFoundException();

    // использование метода экземпляра класса
    searchResult.restoreUserProfile();
    console.log('searchResult in base controller (getUserById):', searchResult);

    // обновление user
    const updatingResult2 = await this.baseRepository.updateOne({
      modelName: EntityEnum.user,
      conditions: { id: searchResult.id },
      data: searchResult,
    });
    console.log('updatingResult2 in base controller (updateUserData):', updatingResult2);

    if (!updatingResult2) throw new NotFoundException();

    return searchResult;
  }

  @Get('get/user/email')
  async getUserByEmail(@Body() inputModel: { email: string }) {
    console.log('inputModel in base controller (getUserByEmail):', inputModel);

    const searchResult = await this.baseRepository.findFirstOne({
      modelName: EntityEnum.user,
      conditions: { email: inputModel.email },
    });
    console.log('searchResult in base controller (getUserByEmail):', searchResult);

    if (!searchResult) throw new NotFoundException();

    return searchResult;
  }

  @Get('get/user/name')
  async getUserByName(@Body() inputModel: { name: string }) {
    console.log('inputModel in base controller (getUserByName):', inputModel);

    const searchResult = await this.baseRepository.findFirstOne({
      modelName: EntityEnum.user,
      conditions: { name: inputModel.name },
    });
    console.log('searchResult in base controller (getUserByName):', searchResult);

    if (!searchResult) throw new NotFoundException();

    return searchResult;
  }

  @Get('get/accountdata/profileid')
  async getAccountDataByProfileId(@Body() inputModel: { profileId: string }) {
    console.log('inputModel in base controller (getAccountDataByProfileId):', inputModel);

    const searchResult = await this.baseRepository.findFirstOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: inputModel.profileId },
    });
    console.log('searchResult in base controller (getAccountDataByProfileId):', searchResult);

    if (!searchResult) throw new NotFoundException();

    return searchResult;
  }

  @Get('get/accountdata/googleid')
  async getAccountDataByGoogleId(@Body() inputModel: { googleId: string }) {
    console.log('inputModel in base controller (getAccountDataByGoogleId):', inputModel);

    const searchResult = await this.baseRepository.findFirstOne({
      modelName: EntityEnum.accountData,
      conditions: { googleId: inputModel.googleId },
    });
    console.log('searchResult in base controller (getAccountDataByGoogleId):', searchResult);

    if (!searchResult) throw new NotFoundException();

    return searchResult;
  }

  @Put('put/user/name')
  async updateUserName(@Body() inputModel: { id: string; name: string }) {
    console.log('inputModel in base controller (updateUserName):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: EntityEnum.user,
      conditions: { id: inputModel.id },
      data: { name: inputModel.name },
    });
    console.log('updatingResult in base controller (updateUserName):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/user/email')
  async updateUserEmail(@Body() inputModel: { id: string; email: string }) {
    console.log('inputModel in base controller (updateUserEmail):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: EntityEnum.user,
      conditions: { id: inputModel.id },
      data: { email: inputModel.email },
    });
    console.log('updatingResult in base controller (updateUserEmail):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/user/all')
  async updateUserData(@Body() inputModel: { id: string; name: string; email: string }) {
    console.log('inputModel in base controller (updateUserData):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: EntityEnum.user,
      conditions: { id: inputModel.id },
      data: {
        name: inputModel.name,
        email: inputModel.email,
      },
    });
    console.log('updatingResult in base controller (updateUserData):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/accountdata/confirmationcode')
  async updateAccountDataConfirmationCode(@Body() inputModel: { id: string; confirmationCode: string }) {
    console.log('inputModel in base controller (updateAccountDataConfirmationCode):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: inputModel.id },
      data: {
        confirmationCode: inputModel.confirmationCode,
      },
    });
    console.log('updatingResult in base controller (updatupdateAccountDataConfirmationCodeeUserData):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/accountdata/recoverycode')
  async updateAccountDataRecoveryCode(@Body() inputModel: { id: string; recoveryCode: string }) {
    console.log('inputModel in base controller (updateAccountDataRecoveryCode):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: inputModel.id },
      data: {
        recoveryCode: inputModel.recoveryCode,
      },
    });
    console.log('updatingResult in base controller (updateAccountDataRecoveryCode):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/accountdata/googleid')
  async updateAccountDataGoogleId(@Body() inputModel: { id: string; googleId: string }) {
    console.log('inputModel in base controller (updateAccountDataGoogleId):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: inputModel.id },
      data: {
        googleId: inputModel.googleId,
      },
    });
    console.log('updatingResult in base controller (updateAccountDataGoogleId):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/accountdata/githubid')
  async updateAccountDataGithubId(@Body() inputModel: { id: string; githubId: string }) {
    console.log('inputModel in base controller (updateAccountDataGithubId):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: inputModel.id },
      data: {
        githubId: inputModel.githubId,
      },
    });
    console.log('updatingResult in base controller (updateAccountDataGithubId):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/accountdata/all')
  async updateAccountDataData(
    @Body()
    inputModel: {
      id: string;
      confirmationCode: string;
      recoveryCode: string;
      googleId: string;
      githubId: string;
    },
  ) {
    console.log('inputModel in base controller (updateAccountDataData):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: inputModel.id },
      data: {
        confirmationCode: inputModel.confirmationCode,
        recoveryCode: inputModel.recoveryCode,
        googleId: inputModel.googleId,
        githubId: inputModel.githubId,
      },
    });
    console.log('updatingResult in base controller (updateAccountDataData):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }
}
