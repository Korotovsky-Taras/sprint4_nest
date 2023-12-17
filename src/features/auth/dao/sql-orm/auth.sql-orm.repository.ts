import { Injectable } from '@nestjs/common';
import { IAuthSessionRepository } from '../../types/common';
import { AuthEntity } from './auth.entity';
import { AuthSessionCreateModel, AuthSessionInfoModel } from '../../types/dto';
import { AuthEntityRepo } from '../auth-entity.repo';
import { AuthEntityFactory } from '../auth-entity.factory';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UsersEntity } from '../../../users/dao/sql-orm/entities/users.entity';

@Injectable()
export class AuthSqlOrmRepository implements IAuthSessionRepository<AuthEntity> {
  constructor(@InjectRepository(AuthEntity) private authRepo: Repository<AuthEntity>) {}

  async createSession(input: AuthSessionCreateModel): Promise<string> {
    const session: AuthEntity = AuthEntity.createSession(input);
    await this.saveDoc(session);
    return session._id.toString();
  }

  async deleteSession(input: AuthSessionInfoModel): Promise<boolean> {
    const result: DeleteResult = await this.authRepo
      .createQueryBuilder()
      .delete()
      .where({ userId: Number(input.userId), deviceId: input.deviceId })
      .execute();

    return result.affected != null && result.affected === 1;
  }

  async getSessionByDeviceId(deviceId: string): Promise<AuthEntityRepo | null> {
    const session: AuthEntity | null = await this.authRepo.findOne({ where: { deviceId } });
    if (session) {
      return AuthEntityFactory.createSqlOrmEntity(session, () => this.saveDoc(session));
    }
    return null;
  }

  async deleteAllSessions(model: AuthSessionInfoModel): Promise<boolean> {
    const result: DeleteResult = await this.authRepo
      .createQueryBuilder()
      .delete()
      .from(UsersEntity)
      .where('userId = :userId AND deviceId != :deviceId', { userId: Number(model.userId), deviceId: model.deviceId })
      .execute();

    return result.affected != null && result.affected > 0;
  }

  async isSessionByDeviceIdExist(deviceId: string): Promise<boolean> {
    const session = await this.authRepo.findOne({ where: { deviceId } });
    return session !== null;
  }

  async saveDoc(doc: AuthEntity): Promise<void> {
    await this.authRepo.save(doc);
  }

  async clear(): Promise<void> {
    await this.authRepo.createQueryBuilder().delete().from(UsersEntity).where('1=1').execute();
  }
}
