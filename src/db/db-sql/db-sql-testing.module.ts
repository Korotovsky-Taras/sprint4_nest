import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfiguration } from '../../application/utils/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService<AppConfiguration, true>): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
        const env = configService.get('sql', { infer: true });
        return {
          type: 'postgres',
          host: env.DB_HOST,
          port: env.DB_PORT,
          username: env.DB_USER,
          password: env.DB_PASS,
          database: env.DB_NAME,
          autoLoadEntities: false,
          synchronize: false,
        };
      },
    }),
  ],
})
export class DbSqlModule {}
