// api-property-decorators.ts
import { ApiProperty } from '@nestjs/swagger';

export const EmailApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'Адрес электронной почты пользователя. ',
    example: 'someemail@mail.ru',
    required: true,
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', // Примерный паттерн для email
  });
