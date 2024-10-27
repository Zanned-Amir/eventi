import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RmqService } from './rmq.service';

export interface RmqModuleOptions {
  name: string;
}

@Module({
  providers: [RmqService, RmqService],
  exports: [RmqModule, RmqService],
})
export class RmqModule {
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get<string>('RMQ_URL')],
                queue: configService.get<string>(`RMQ_${name}_QUEUE`),
                noAck: false,
                persistent: true,
                durable: true,
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
