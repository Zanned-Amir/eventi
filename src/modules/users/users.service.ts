import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserAccount,
  UserLoginData,
  UserRole,
  Permission,
} from 'src/database/entities/user';
import {
  CreateUserAccountDto,
  UpdateUserAccountDto,
  CreateUserLoginDataDto,
  UpdateUserLoginDataDto,
  CreateUserRoleDto,
  UpdateUserRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from './dto/index';
import { FindUsersDto } from './dto/FindUsersDto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: Repository<UserAccount>,
    @InjectRepository(UserLoginData)
    private readonly userLoginDataRepository: Repository<UserLoginData>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async createUserAccount(createUserAccountDto: CreateUserAccountDto) {
    const userAccount = this.userAccountRepository.create(createUserAccountDto);
    return this.userAccountRepository.save(userAccount);
  }

  async getUserAccount(id: number) {
    return this.userAccountRepository.findOne({
      where: { user_id: id },
    });
  }
  async getUsers(query: FindUsersDto): Promise<UserAccount[]> {
    const queryBuilder = this.userAccountRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userLoginData', 'loginData');

    // Apply filters
    if (query.first_name) {
      queryBuilder.andWhere('LOWER(user.first_name) LIKE LOWER(:first_name)', {
        first_name: `%${query.first_name}%`,
      });
    }

    if (query.last_name) {
      queryBuilder.andWhere('LOWER(user.last_name) LIKE LOWER(:last_name)', {
        last_name: `%${query.last_name}%`,
      });
    }

    if (query.gender) {
      queryBuilder.andWhere('LOWER(user.gender) = LOWER(:gender)', {
        gender: query.gender,
      });
    }

    if (query.role_name) {
      queryBuilder
        .innerJoinAndSelect('user.role', 'role')
        .andWhere('LOWER(role.role_name) = LOWER(:role_name)', {
          role_name: query.role_name,
        });
    }

    if (query.email) {
      queryBuilder.andWhere('LOWER(loginData.email) LIKE LOWER(:email)', {
        email: `%${query.email}%`,
      });
    }

    if (query.username) {
      queryBuilder.andWhere('LOWER(loginData.username) LIKE LOWER(:username)', {
        username: `%${query.username}%`,
      });
    }

    if (query.is_confirmed !== undefined) {
      queryBuilder.andWhere('loginData.is_confirmed = :is_confirmed', {
        is_confirmed: query.is_confirmed,
      });
    }

    if (query.account_status) {
      queryBuilder.andWhere(
        'LOWER(loginData.account_status) = LOWER(:account_status)',
        {
          account_status: query.account_status,
        },
      );
    }

    if (query.birth_date) {
      queryBuilder.andWhere('user.birth_date = :birth_date', {
        birth_date: query.birth_date,
      });
    }

    if (query.birth_date_gte) {
      queryBuilder.andWhere('user.birth_date >= :birth_date_gte', {
        birth_date_gte: query.birth_date_gte,
      });
    }

    if (query.birth_date_lte) {
      queryBuilder.andWhere('user.birth_date <= :birth_date_lte', {
        birth_date_lte: query.birth_date_lte,
      });
    }

    if (query.birth_date_gt) {
      queryBuilder.andWhere('user.birth_date > :birth_date_gt', {
        birth_date_gt: query.birth_date_gt,
      });
    }

    if (query.birth_date_lt) {
      queryBuilder.andWhere('user.birth_date < :birth_date_lt', {
        birth_date_lt: query.birth_date_lt,
      });
    }

    queryBuilder.limit(query.limit);
    queryBuilder.offset(query.offset);

    if (query.orderBy) {
      for (const [key, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(
          `user.${key}`,
          order.toUpperCase() as 'ASC' | 'DESC',
        );
      }
    }

    return query.rawQuery ? queryBuilder.getRawMany() : queryBuilder.getMany();
  }

  async updateUserAccount(
    id: number,
    updateUserAccountDto: UpdateUserAccountDto,
  ) {
    await this.userAccountRepository.update(id, updateUserAccountDto);
    return this.userAccountRepository.findOne({
      where: { user_id: id },
    });
  }

  async deleteUserAccount(id: number) {
    await this.userAccountRepository.delete(id);
    return { deleted: true };
  }

  // Create User Login Data
  async createUserLoginData(createUserLoginDataDto: CreateUserLoginDataDto) {
    const userLoginData = this.userLoginDataRepository.create(
      createUserLoginDataDto,
    );
    return this.userLoginDataRepository.save(userLoginData);
  }

  // Update User Login Data
  async updateUserLoginData(
    id: number,
    updateUserLoginDataDto: UpdateUserLoginDataDto,
  ) {
    await this.userLoginDataRepository.update(id, updateUserLoginDataDto);
    return this.userLoginDataRepository.findOne({
      where: { user_id: id },
    });
  }

  // Create User Role
  async createUserRole(createUserRoleDto: CreateUserRoleDto) {
    const userRole = this.userRoleRepository.create(createUserRoleDto);
    return this.userRoleRepository.save(userRole);
  }

  // Update User Role
  async updateUserRole(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    await this.userRoleRepository.update(id, updateUserRoleDto);
    return this.userRoleRepository.findOne({
      where: { role_id: id },
    });
  }

  // Create Permission
  async createPermission(createPermissionDto: CreatePermissionDto) {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  // Update Permission
  async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto) {
    await this.permissionRepository.update(id, updatePermissionDto);
    return this.permissionRepository.findOne({
      where: { permission_id: id },
    });
  }
}
