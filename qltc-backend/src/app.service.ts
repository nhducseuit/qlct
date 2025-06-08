import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'QLTC Backend (NestJS) is running!';
  }
}