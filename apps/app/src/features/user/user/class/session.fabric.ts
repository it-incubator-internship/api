import { Session } from '../../../../../prisma/client';

export class UserSession implements Session {
  id: string;
  profileId: string;
  deviceUuid: string;
  deviceName: string;
  ip: string;
  lastActiveDate: Date;

  // в этом случае этот метод будет применяться и для создания и для преобразования в "умную" модель
  static create({
    profileId,
    deviceUuid,
    deviceName,
    ip,
    lastActiveDate
  }: {
    profileId: string,
    deviceUuid: string,
    deviceName: string,
    ip: string,
    lastActiveDate: string
  }): Omit<UserSession, 'id'> {

    const session = {
      profileId,
      deviceUuid,
      deviceName,
      ip,
      lastActiveDate
    }

    return Object.assign(new this(), session);
  }

  static convert(session: Session): UserSession {
    return Object.assign(new this(), session);
  }

  updateLastActiveDate({lastActiveDate}: {lastActiveDate: Date}) {
    this.lastActiveDate = lastActiveDate;
  }
}
