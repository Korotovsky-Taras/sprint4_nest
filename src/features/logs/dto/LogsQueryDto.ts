import { IsEnum, IsOptional } from 'class-validator';

enum LogsQueryLevelEnum {
  error = 'error',
  combined = 'combined',
}

export class LogsQueryDto {
  @IsOptional()
  @IsEnum(LogsQueryLevelEnum)
  level: string = LogsQueryLevelEnum.combined;
}
