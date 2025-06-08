import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // Optional: you can pass Prisma Client options here, e.g., logging
      // log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    // Note: It's important to call connect() on the Prisma Client.
    // https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management#connect
    await this.$connect();
  }

  async onModuleDestroy() {
    // It's good practice to disconnect when the application shuts down.
    await this.$disconnect();
  }

  // You can add custom methods here if needed, for example, to handle transactions
  // or specific cleanup logic, though often direct use of PrismaClient methods is sufficient.
}
