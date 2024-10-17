import { Module } from '@nestjs/common';

import { RmqConsumer } from './rmq.consumer';

@Module({
  imports: [],
  controllers: [RmqConsumer],
  providers: [],
  exports: [],
})
export class RmqModule {}
