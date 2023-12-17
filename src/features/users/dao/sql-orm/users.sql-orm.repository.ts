import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../types/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';
import { DeleteResult, Repository } from 'typeorm';
import { UserCreateInputModel } from '../../types/dto';
import { UserEntityRepo } from '../user-entity.repo';
import { UserEntityFactory } from '../user-entity.factory';

@Injectable()
export class UsersSqlOrmRepository implements IUsersRepository<UsersEntity> {
  constructor(@InjectRepository(UsersEntity) private userRepo: Repository<UsersEntity>) {}

  async isUserAuthConfirmed(userId: string): Promise<boolean> {
    const user: UsersEntity | null = await this.userRepo.findOne({
      where: { _id: Number(userId) },
      relations: { authConfirmation: true },
    });
    return user !== null && user.isAuthConfirmed();
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const result: DeleteResult = await this.userRepo
      .createQueryBuilder()
      .delete()
      .where({ _id: Number(userId) })
      .execute();

    return result.affected != null && result.affected === 1;
  }

  async createUser(model: UserCreateInputModel): Promise<UserEntityRepo> {
    const user: UsersEntity = UsersEntity.createUser(model);
    await this.saveDoc(user);
    return UserEntityFactory.createTypeOrmEntity(user, () => this.saveDoc(user));
  }

  async getUserByAuthConfirmationCode(code: string): Promise<UserEntityRepo | null> {
    const user: UsersEntity | null = await this.userRepo.findOne({
      where: { authConfirmation: { code } },
      relations: { authConfirmation: true },
    });
    if (user) {
      return UserEntityFactory.createTypeOrmEntity(user, () => this.saveDoc(user));
    }
    return null;
  }

  async getUserByPassConfirmationCode(code: string): Promise<UserEntityRepo | null> {
    const user: UsersEntity | null = await this.userRepo.findOne({
      where: { passConfirmation: { code } },
      relations: { passConfirmation: true },
    });
    if (user) {
      return UserEntityFactory.createTypeOrmEntity(user, () => this.saveDoc(user));
    }
    return null;
  }

  async getUserById(userId: string): Promise<UserEntityRepo | null> {
    const user: UsersEntity | null = await this.userRepo.findOne({
      where: { _id: Number(userId) },
      relations: {
        password: true,
        authConfirmation: true,
        passConfirmation: true,
      },
    });
    if (user) {
      return UserEntityFactory.createTypeOrmEntity(user, () => this.saveDoc(user));
    }
    return null;
  }

  async isUserExist(userId: string): Promise<boolean> {
    const user: UsersEntity | null = await this.userRepo.findOne({
      where: { _id: Number(userId) },
    });
    return !!user;
  }

  async getUserByLoginOrEmail(login: string, email: string): Promise<UserEntityRepo | null> {
    const user: UsersEntity | null = await this.userRepo.findOne({
      where: [{ email }, { login }],
      relations: {
        password: true,
        authConfirmation: true,
        passConfirmation: true,
      },
    });
    if (user) {
      return UserEntityFactory.createTypeOrmEntity(user, () => this.saveDoc(user));
    }
    return null;
  }

  async getUserByEmail(email: string): Promise<UserEntityRepo | null> {
    const user: UsersEntity | null = await this.userRepo.findOne({ where: { email } });
    if (user) {
      return UserEntityFactory.createTypeOrmEntity(user, () => this.saveDoc(user));
    }
    return null;
  }

  async saveDoc(doc: UsersEntity): Promise<void> {
    await this.userRepo.save(doc);
  }

  async clear(): Promise<void> {
    await this.userRepo.createQueryBuilder().delete().from(UsersEntity).where('1=1').execute();
  }
}
