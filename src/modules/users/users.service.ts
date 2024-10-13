import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  UserAccount,
  UserLoginData,
  UserRole,
  Permission,
  UserTokens,
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
import { hash } from 'bcrypt';
import { CreateUserTokenDto } from './dto/CreateUserTokenDto';

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
    @InjectRepository(UserTokens)
    private readonly userTokensRepository: Repository<UserTokens>,
    private readonly entityManger: EntityManager,
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

  async createUser(
    createUserAccountDto: CreateUserAccountDto,
    createUserLoginDataDto: CreateUserLoginDataDto,
  ) {
    let userAccount: UserAccount;
    let userLoginData: UserLoginData;
    let userRole: UserRole;

    await this.entityManger.transaction(async (transactionalEntityManager) => {
      userRole = await transactionalEntityManager.findOne(UserRole, {
        where: { role_name: 'USER' },
      });

      if (!userRole) {
        throw new NotFoundException('User role not found');
      }

      createUserAccountDto.role_id = userRole.role_id;

      userAccount = transactionalEntityManager.create(
        UserAccount,
        createUserAccountDto,
      );

      await transactionalEntityManager.save(UserAccount, userAccount);
      userLoginData = transactionalEntityManager.create(UserLoginData, {
        ...createUserLoginDataDto,
        password: await hash(createUserLoginDataDto.password, 10),
        user_id: userAccount.user_id,
      });

      await transactionalEntityManager.save(UserLoginData, userLoginData);
    });

    return {
      user_id: userAccount.user_id,
      first_name: userAccount.first_name,
      last_name: userAccount.last_name,
      email: userLoginData.email,
      username: userLoginData.username,
      is_confirmed: userLoginData.is_confirmed,
      account_status: userLoginData.account_status,
      role: {
        role_name: userRole.role_name,
        role_id: userRole.role_id,
      },
    };
  }

  async updateUser(
    id: number,
    UpdateUserAccountDto: UpdateUserAccountDto,
    updateUserLoginDataDto: UpdateUserLoginDataDto,
  ) {
    await this.entityManger.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.update(
        UserAccount,
        id,
        UpdateUserAccountDto,
      );

      await transactionalEntityManager.update(
        UserLoginData,
        id,
        updateUserLoginDataDto,
      );
    });
  }

  async getUser(id: number) {
    const user = await this.userAccountRepository.findOne({
      where: { user_id: id },
      relations: ['role', 'userLoginData'],
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        role: {
          role_name: true,
          role_id: true,
        },
        userLoginData: {
          email: true,
          username: true,
          is_confirmed: true,
          account_status: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.userLoginData?.email,
      username: user.userLoginData?.username,
      is_confirmed: user.userLoginData?.is_confirmed,
      account_status: user.userLoginData?.account_status,
      role: {
        role_name: user.role?.role_name,
        role_id: user.role?.role_id,
      },
    };
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

  //NB: it will delete the user account and all related data (login data, tokens, etc.)

  async deleteUserAccount(id: number) {
    const result = await this.userAccountRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { deleted: true };
  }

  async getUserLoginData(id: number) {
    return this.userLoginDataRepository.findOne({
      where: { user_id: id },
    });
  }

  async getUserLoginDataByEmail(email: string) {
    const userLoginData = await this.userLoginDataRepository
      .createQueryBuilder('userLoginData')
      .leftJoinAndSelect('userLoginData.userAccount', 'userAccount')
      .leftJoinAndSelect('userAccount.role', 'role')
      .where('userLoginData.email = :email', { email })
      .select([
        'userLoginData.user_id',
        'userLoginData.email',
        'userLoginData.password',
        'userLoginData.is_confirmed',
        'userLoginData.account_status',
        'userAccount.role_id',
        'role.role_name',
      ])
      .getOne();

    if (userLoginData) {
      return {
        user_id: userLoginData.user_id,
        email: userLoginData.email,
        password: userLoginData.password,
        is_confirmed: userLoginData.is_confirmed,
        account_status: userLoginData.account_status,
        role: {
          role_id: userLoginData.userAccount?.role_id,
          role_name: userLoginData.userAccount?.role?.role_name,
        },
      };
    }

    return userLoginData;
  }

  async deleteUserLoginData(id: number) {
    const result = await this.userLoginDataRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

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

  async verifyUserRefreshToken(user_id: number, device_info: string) {
    return await this.userTokensRepository.findOne({
      where: { user_id, device_info },
    });
  }

  async createUserToken(userToken: CreateUserTokenDto) {
    const existedToken = await this.userTokensRepository.findOne({
      where: { user_id: userToken.user_id, device_info: userToken.device_info },
    });

    if (existedToken) {
      return this.userTokensRepository.update(
        { user_id: userToken.user_id, device_info: userToken.device_info },
        userToken,
      );
    }

    const token = this.userTokensRepository.create(userToken);
    return this.userTokensRepository.save(token);
  }

  async getUserToken(user_id: number, device_info: string) {
    const userToken = await this.userTokensRepository
      .createQueryBuilder('userToken')
      .leftJoinAndSelect('userToken.user', 'user')
      .leftJoinAndSelect('user.role', 'role')
      .where('userToken.user_id = :user_id', { user_id })
      .andWhere('userToken.device_info = :device_info', { device_info })
      .andWhere('userToken.is_in_blacklist = false')
      .select([
        'userToken.token',
        'userToken.user_id',
        'userToken.device_info',
        'user.birth_date', //DON'T remove this line  !!
        'role.role_name',
        'role.role_id',
      ])
      .getOne();

    if (userToken) {
      return {
        user_id: userToken.user_id,
        token: userToken.token,
        device_info: userToken.device_info,
        birth_date: userToken.user.birth_date,
        role: {
          role_name: userToken.user.role?.role_name,
          role_id: userToken.user.role?.role_id,
        },
      };

      return null; // Return null if no token is found
    }
  }

  async blackList(user_id: number, device_info: string) {
    const result = await this.userTokensRepository.update(
      { user_id, device_info },
      { is_in_blacklist: true },
    );

    return result;
  }
}
