import { hashSync } from 'bcryptjs';
import request from 'supertest';

import { PrismaService } from '../../src/common/database_module/prisma-connection.service';
import { AccountDataEntityNEW, UserEntityNEW } from '../../src/features/user/user/domain/account-data.entity';
import { User } from '../../prisma/client';

export class UserE2EHelper {
  public users: User[] = [];
  public tokens: { accessToken: string; refreshToken: string; number: number }[] = [];
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpServer: any,
  ) {}

  async addConfirmUser(email: string): Promise<User> {
    const userData = UserEntityNEW.createForDatabase({
      name: email + '_name',
      email: email,
      passwordHash: hashSync('StRo0NgP@SSWoRD', 10),
    });

    const user = await this.prismaService.user.create({
      data: userData,
    });

    const accountDataData = AccountDataEntityNEW.createForDatabase({
      profileId: user.id,
      confirmationCode: '123',
      recoveryCode: '123',
      googleId: null,
      githubId: null,
      confirmationStatus: 'CONFIRM',
    });

    await this.prismaService.accountData.create({
      data: accountDataData,
    });

    this.users.push(user);

    return user;
  }

  async addManyUsers({ count }: { count: number }) {
    for (let i = 0; i < count; i++) {
      await this.addConfirmUser(`email${i}@email.com`);
    }
  }

  userByNumber(number: number) {
    return this.users[number - 1];
  }

  userById(id: string) {
    return this.users.find((user) => user.id === id);
  }

  async loginUserByNumber(number: number) {
    const user = this.userByNumber(number);

    const result = await request(this.httpServer).post('/auth/login').send({
      email: user.email,
      password: 'StRo0NgP@SSWoRD',
    });

    // Достаем accessToken из тела ответа
    const accessToken = result.body.accessToken;

    // Достаем куки из заголовка Set-Cookie
    const cookies = result.headers['set-cookie'] as unknown as string[];

    // Находим refreshToken в куках
    const refreshToken = cookies
      .find((cookie: string) => cookie.startsWith('refreshToken'))
      ?.split(';')[0]
      .split('=')[1] as string;

    // Проверяем, есть ли уже токены для этого номера
    const existingTokenIndex = this.tokens.findIndex((token) => token.number === number);

    if (existingTokenIndex !== -1) {
      // Если токен уже существует, заменяем его на новый
      this.tokens[existingTokenIndex] = { number, accessToken, refreshToken };
    } else {
      // Если нет, добавляем новый токен
      this.tokens.push({ number, accessToken, refreshToken });
    }
  }

  getTokensPairByNumber(number: number) {
    return this.tokens.find((token) => token.number === number);
  }
}
