// api-property-decorators.ts
import { ApiProperty } from '@nestjs/swagger';

export const firstNameApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'Имя',
    example: 'John',
    required: true,
    pattern: '^[A-Za-zА-Яа-я]+$',
    minLength: 1,
    maxLength: 50,
  });

export const lastNameApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'Фамилия',
    example: 'Rambo',
    required: true,
    pattern: '^[A-Za-zА-Яа-я]+$',
    minLength: 1,
    maxLength: 50,
  });

export const dateOfBirthApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'День рождения',
    example: '07.07.1997',
    required: false,
    pattern: '^(\\d{2}\\.\\d{2}\\.\\d{4})?$',
  });

export const countryApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'Страна',
    example: 'Canada',
    required: false,
    pattern: '^[A-Za-zА-Яа-я\\s]*$',
    maxLength: 30,
  });

export const cityApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'Город',
    example: 'Toronto',
    required: false,
    pattern: '^[A-Za-zА-Яа-я\\s]*$',
    maxLength: 30,
  });

export const aboutMeApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'Информация о user',
    example: 'I am John Rambo. I was born in Canada in 1997.',
    required: false,
    pattern: `^[0-9A-Za-zА-Яа-яёЁ\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$`,
    maxLength: 200,
  });
