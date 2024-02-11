import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from './application/utils/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<AppConfiguration>) {}

  isDevMode(): boolean {
    return this.configService.get('DEV_MODE') === 'true';
  }
}
