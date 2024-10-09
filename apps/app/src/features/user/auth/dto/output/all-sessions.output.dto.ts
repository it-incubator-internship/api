import { ApiProperty } from '@nestjs/swagger';

export class OutputSession {
  @ApiProperty({ example: '12345', description: 'id сессии ( DeviceUUid )' })
  sessionId: string;

  @ApiProperty({
    example: true,
    description: 'флаг, отображающий текущую сессию (true для текущей сессии, false для остальных)',
  })
  current: boolean;

  @ApiProperty({ example: '67890', description: 'id юзера' })
  userId: string;

  @ApiProperty({ example: 'iPhone 12', description: 'девай с которого произведен логин' })
  deviceName: string;

  @ApiProperty({ example: '192.168.0.1', description: 'ip адрес девай с которого произведен логин' })
  ip: string;

  @ApiProperty({ example: '2024-09-09T12:34:56Z', description: 'последняя дата обновления сессии' })
  lastActiveDate: Date;
}
