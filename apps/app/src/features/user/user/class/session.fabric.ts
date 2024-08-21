import { Session } from '../../../../../prisma/client';

export class UserSession implements Session {
  id: string;
  profileId: string;
  deviceName: string;
  ip: string;
  lastActiveDate: Date;

  // в этом случае этот метод будет применяться и для создания и для преобразования в "умную" модель
  static create(session: Session) {
    return Object.assign(new this(), session);
  }

  updateLastActiveDate(lastActiveDate: Date) {
    this.lastActiveDate = lastActiveDate;
  }
}
