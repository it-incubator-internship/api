// api-property-decorators.ts
import { ApiProperty } from '@nestjs/swagger';

export const RecaptchaTokenApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'Token, возвращаемый от google reCAPTCHA.',
    example: '03AGdBq24m5U9F8Lk7jI8N1e03AGdBq24m5U9F8Lk7jI8N1e3AGdBq24m5U9F8Lk7j2g3K0P4hZBq24m5U9F8Lk7jI803AGdBq24',
    required: true,
  });
