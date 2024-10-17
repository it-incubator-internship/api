// api-property-decorators.ts
import { ApiProperty } from '@nestjs/swagger';

export const ConfirmationCodeApiProperty = () =>
  ApiProperty({
    type: String,
    description: 'Код подтверждения.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVlbWFpbEBnbWFpbC5jb20iLCJpYXQiOjE3MjQ2ODQzMzMsImV4cCI6MTcyNDc3MDczM30.n0QviZkcsNMA9zs-S7gGhcsDyCKMXX4EVrrkRtWPeF0',
    required: true,
  });
