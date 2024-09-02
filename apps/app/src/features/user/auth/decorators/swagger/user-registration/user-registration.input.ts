// api-property-decorators.ts
import { ApiProperty } from '@nestjs/swagger';

export const userNameApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'Имя пользователя',
    example: 'FelixArgyle',
    required: true,
    pattern: '^[a-zA-Z0-9_-]+$',
    minLength: 6,
    maxLength: 30,
  });

export const passwordApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'Пароль',
    example: 'StRo0NgP@SSWoRD',
    required: true,
    pattern: '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&\'()*+,-./:;<=>?@[\\]_\\^`{|}~]).{8,}$',
    minLength: 6,
    maxLength: 20,
  });

export const passwordConfirmationApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'Повтор пароля',
    example: 'StRo0NgP@SSWoRD',
    required: true,
    pattern: '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&\'()*+,-./:;<=>?@[\\]_\\^`{|}~]).{8,}$',
    minLength: 6,
    maxLength: 20,
  });

export const isAgreementApiProperty = () =>
  ApiProperty({
    type: Boolean,
    description: 'Согласие с правилами сервиса',
    example: true,
    required: true,
  });
