import { Session } from '../../../../../prisma/client';

export class UserSession implements Session {
  id: string;
  profileId: string;
  deviceUuid: string;
  deviceName: string;
  ip: string;
  lastActiveDate: Date;

  // в этом случае этот метод будет применяться и для создания и для преобразования в "умную" модель
  // static create({profileId, deviceUuid, deviceName, ip, lastActiveDate}: {profileId: string, deviceUuid: string, deviceName: string, ip: string, lastActiveDate: string}): Omit<UserSession, 'id'> {
  //   console.log('profileId in user fabric:', profileId);
  //   console.log('deviceUuid in user fabric:', deviceUuid);
  //   console.log('deviceName in user fabric:', deviceName);
  //   console.log('ip in user fabric:', ip);
  //   console.log('lastActiveDate in user fabric:', lastActiveDate);
  //   return Object.assign(new this(), session);
  // }

  updateLastActiveDate(lastActiveDate: Date) {
    this.lastActiveDate = lastActiveDate;
  }
}
