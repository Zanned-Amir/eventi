import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  UserAccount,
  UserLoginData,
  UserRole,
  Permission,
  UserTokens,
} from '../../database/entities/user';
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
import { compare, hash } from 'bcrypt';
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

  // crud user (userAccount + userLoginData)
  async getUsers(query: FindUsersDto): Promise<UserAccount[]> {
    const queryBuilder = this.userAccountRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userLoginData', 'loginData')
      .leftJoinAndSelect('user.role', 'role');

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
      queryBuilder.andWhere('user.gender = :gender', {
        gender: query.gender,
      });
    }

    if (query.role_name) {
      queryBuilder.andWhere('role.role_name = :role_name', {
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
        'loginData.account_status = UPPER(:account_status)',
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
        throw new NotFoundException('User role not found contact webSupport');
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
    const user = await this.userAccountRepository
      .createQueryBuilder('userAccount')
      .leftJoinAndSelect('userAccount.role', 'role')
      .leftJoinAndSelect('userAccount.userLoginData', 'userLoginData')
      .leftJoinAndSelect('userAccount.permissions', 'permissions')
      .where('userAccount.user_id = :id', { id })
      .select([
        'userAccount.user_id',
        'userAccount.first_name',
        'userAccount.last_name',
        'role.role_name',
        'role.role_id',
        'userLoginData.email',
        'userLoginData.username',
        'userLoginData.is_confirmed',
        'userLoginData.account_status',
        'userLoginData.created_at',
        'userLoginData.updated_at',
        'userLoginData.enabled_m2fa',
        'permissions',
      ])
      .getOne();

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
      created_at: user.userLoginData?.created_at,
      updated_at: user.userLoginData?.updated_at,
      enabled_m2fa: user.userLoginData?.enabled_m2fa,

      role: {
        role_name: user.role?.role_name,
        role_id: user.role?.role_id,
      },
      permissions: user.permissions?.map((permission) => ({
        permission_id: permission.permission_id,
        permission_name: permission.permission_name,
      })),
    };
  }

  // CRUD User Account

  async createUserAccount(createUserAccountDto: CreateUserAccountDto) {
    const userAccount = this.userAccountRepository.create(createUserAccountDto);
    return this.userAccountRepository.save(userAccount);
  }
  // remove field from userAccount
  async getUserAccount(id: number) {
    const user = await this.userAccountRepository.findOne({
      where: { user_id: id },
      relations: ['role', 'userLoginData'],
    });

    return {
      user_id: user.user_id,
      role_id: user.role_id,
      first_name: user.first_name,
      last_name: user.last_name,
      gender: user.gender,
      birth_date: user.birth_date,
      created_at: user.created_at,
      updated_at: user.updated_at,
      role: {
        role_id: user.role.role_id,
        role_name: user.role.role_name,
        role_description: user.role.role_description,
      },
      userLoginData: {
        user_id: user.userLoginData.user_id,
        username: user.userLoginData.username,
        email: user.userLoginData.email,
        is_confirmed: user.userLoginData.is_confirmed,
        account_status: user.userLoginData.account_status,
        created_at: user.userLoginData.created_at,
        updated_at: user.userLoginData.updated_at,
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

  // CRUD User Login Data

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
      .leftJoinAndSelect('userAccount.permissions', 'permissions')
      .where('userLoginData.email = :email', { email })
      .select([
        'userLoginData.user_id',
        'userLoginData.email',
        'userLoginData.password',
        'userLoginData.is_confirmed',
        'userLoginData.account_status',
        'userAccount.role_id',
        'role.role_name',
        'userLoginData.created_at',
        'userLoginData.updated_at',
        'userLoginData.enabled_m2fa',
        'permissions',
      ])
      .getOne();

    if (userLoginData) {
      return {
        user_id: userLoginData.user_id,
        email: userLoginData.email,
        password: userLoginData.password,
        is_confirmed: userLoginData.is_confirmed,
        account_status: userLoginData.account_status,
        created_at: userLoginData.created_at,
        updated_at: userLoginData.updated_at,
        enabled_m2fa: userLoginData.enabled_m2fa,
        role: {
          role_id: userLoginData.userAccount?.role_id,
          role_name: userLoginData.userAccount?.role?.role_name,
        },
        permissions: userLoginData.userAccount?.permissions?.map(
          (permission) => ({
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
          }),
        ),
      };
    }

    return userLoginData;
  }

  async _getUserLoginDataByEmail(email: string) {
    return this.userLoginDataRepository.findOne({
      where: { email },
    });
  }

  async deleteUserLoginData(id: number) {
    const result = await this.userLoginDataRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { deleted: true };
  }

  async createUserLoginData(createUserLoginDataDto: CreateUserLoginDataDto) {
    const userLoginData = this.userLoginDataRepository.create(
      createUserLoginDataDto,
    );
    return this.userLoginDataRepository.save(userLoginData);
  }

  async updateUserLoginData(
    id: number,
    updateUserLoginDataDto: UpdateUserLoginDataDto,
  ) {
    await this.userLoginDataRepository.update(id, updateUserLoginDataDto);
    return this.userLoginDataRepository.findOne({
      where: { user_id: id },
    });
  }

  async deactivateUserAccount(id: number) {
    const result = await this.userLoginDataRepository.update(id, {
      account_status: 'DEACTIVATED',
    });

    if (result.affected > 0) return true;

    return false;
  }

  async activateUserAccount(id: number) {
    const result = await this.userLoginDataRepository.update(id, {
      account_status: 'ACTIVE',
    });

    if (result.affected > 0) return true;

    return false;
  }

  async blockUserAccount(id: number) {
    const result = await this.userLoginDataRepository.update(id, {
      account_status: 'BLOCKED',
    });

    if (result.affected > 0) return true;

    return false;
  }

  async unblockUserAccount(id: number) {
    const result = await this.userLoginDataRepository.update(id, {
      account_status: 'ACTIVE',
    });

    if (result.affected > 0) return true;

    return false;
  }

  async updateUserPassword(id: number, password: string) {
    const result = await this.userLoginDataRepository.update(id, {
      password,
    });
    if (result.affected > 0) return true;
    return false;
  }

  // CRUD App Role
  async createAppRole(createUserRoleDto: CreateUserRoleDto) {
    const userRole = this.userRoleRepository.create(createUserRoleDto);
    return this.userRoleRepository.save(userRole);
  }

  async updateAppRole(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    await this.userRoleRepository.update(id, updateUserRoleDto);
    return this.userRoleRepository.findOne({
      where: { role_id: id },
    });
  }

  async getAppRoles() {
    return this.userRoleRepository.find();
  }

  async getAppRole(id: number) {
    return this.userRoleRepository.findOne({
      where: { role_id: id },
    });
  }

  async deleteAppRole(id: number) {
    const result = await this.userRoleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return { deleted: true };
  }

  //  crud Permission
  async createPermission(createPermissionDto: CreatePermissionDto) {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto) {
    await this.permissionRepository.update(id, updatePermissionDto);
    return this.permissionRepository.findOne({
      where: { permission_id: id },
    });
  }

  async getPermissions() {
    return this.permissionRepository.find();
  }

  async getPermission(id: number) {
    return this.permissionRepository.findOne({
      where: { permission_id: id },
    });
  }

  async deletePermission(id: number) {
    const result = await this.permissionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return { deleted: true };
  }

  async getUserPermissions(id: number) {
    const user = await this.userAccountRepository.findOne({
      where: { user_id: id },
      relations: ['permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user.permissions;
  }

  async getUserRolePermissions(role_id: number) {
    const role = await this.userRoleRepository.findOne({
      where: { role_id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${role_id} not found`);
    }

    return role.permissions;
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
      .leftJoinAndSelect('user.permissions', 'permissions')
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
        'permissions',
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
        permissions: userToken.user.permissions?.map((permission) => ({
          permission_id: permission.permission_id,
          permission_name: permission.permission_name,
        })),
      };
    }
    return null;
  }

  async blackList(user_id: number, device_info: string) {
    const result = await this.userTokensRepository.update(
      { user_id, device_info },
      { is_in_blacklist: true },
    );

    return result;
  }

  async assignPermissionToUser(user_id: number, permission_id: number) {
    const user = await this.userAccountRepository.findOne({
      where: { user_id },
      relations: ['permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const permission = await this.permissionRepository.findOne({
      where: { permission_id },
    });

    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permission_id} not found`,
      );
    }

    user.permissions.push(permission);

    return this.userAccountRepository.save(user);
  }

  async removePermissionFromUser(user_id: number, permission_id: number) {
    const user = await this.userAccountRepository.findOne({
      where: { user_id },
      relations: ['permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const permission = await this.permissionRepository.findOne({
      where: { permission_id },
    });

    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permission_id} not found`,
      );
    }

    user.permissions = user.permissions.filter(
      (p) => p.permission_id !== permission_id,
    );

    return this.userAccountRepository.save(user);
  }

  async assignPermissionToRole(role_id: number, permission_id: number) {
    const role = await this.userRoleRepository.findOne({
      where: { role_id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${role_id} not found`);
    }

    const permission = await this.permissionRepository.findOne({
      where: { permission_id },
    });

    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permission_id} not found`,
      );
    }

    role.permissions.push(permission);

    return this.userRoleRepository.save(role);
  }

  async removePermissionFromRole(role_id: number, permission_id: number) {
    const role = await this.userRoleRepository.findOne({
      where: { role_id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${role_id} not found`);
    }

    const permission = await this.permissionRepository.findOne({
      where: { permission_id },
    });

    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permission_id} not found`,
      );
    }

    role.permissions = role.permissions.filter(
      (p) => p.permission_id !== permission_id,
    );

    return this.userRoleRepository.save(role);
  }

  async changePassword(
    OldPassword: string,
    NewPassword: string,
    user_id: number,
  ) {
    let hashedPassword;
    const userLoginData = await this.userLoginDataRepository.findOneBy({
      user_id,
    });
    if (await compare(OldPassword, (await userLoginData).password)) {
      hashedPassword = await hash(NewPassword, 10);
    } else {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }
    const result = await this.userLoginDataRepository.update(user_id, {
      password: hashedPassword,
    });

    if (result.affected > 0) {
      return {
        message: 'Password changed successfully',
        email: userLoginData.email,
      };
    }
    return null;
  }

  async changePasswordByRecoveryToken(
    newPassword: string,
    token: string,
    email: string,
  ) {
    const user = await this.userLoginDataRepository.findOneBy({
      email,
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    // add logic to check if token is expired  10min
    if (user.isRecoveredTokenExpired()) {
      throw new HttpException('Token expired', HttpStatus.BAD_REQUEST);
    }

    if (!(await compare(token, user.recovery_token))) {
      throw new HttpException('Invalid recovery token', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await hash(newPassword, 10);

    const result = await this.userLoginDataRepository.update(user.user_id, {
      password: hashedPassword,
      recovery_token: null,
      recovery_token_timestamp: null,
    });

    if (result.affected > 0) {
      return { email: user.email, message: 'Password changed successfully' };
    }
    return null;
  }

  async confirmEmailByToken(email: string, token: string) {
    const user = await this.userLoginDataRepository.findOneBy({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.is_confirmed) {
      throw new HttpException('User already confirmed', HttpStatus.BAD_REQUEST);
    }

    if (!(await compare(token, user.confirmation_token))) {
      throw new HttpException(
        'Invalid confirmation token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.userLoginDataRepository.update(user.user_id, {
      is_confirmed: true,
      confirmation_token: null,
      token_generation_timestamp: null,
    });

    if (result.affected > 0) {
      return { email: user.email, message: 'Email confirmed successfully' };
    }
    return null;
  }

  async updateRecoveryCred(
    user_id: number,
    recovery_token: any,
    recovery_token_timestamp: Date,
  ) {
    const result = await this.userLoginDataRepository.update(user_id, {
      recovery_token,
      recovery_token_timestamp,
    });

    if (result.affected > 0) {
      return true;
    }
    return false;
  }

  async updateConfirmationCred(
    user_id: number,
    confirmation_token: any,
    token_generation_timestamp: Date,
  ) {
    const result = await this.userLoginDataRepository.update(user_id, {
      confirmation_token,
      token_generation_timestamp,
    });

    if (result.affected > 0) {
      return true;
    }
    return false;
  }

  async currentUserDeactivate(user_id: number, password: string) {
    const user = await this.userLoginDataRepository.findOne({
      where: { user_id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }
    if (await compare(password, user.password)) {
      const result = await this.userLoginDataRepository.update(user_id, {
        account_status: 'DEACTIVATED',
      });
      if (result.affected > 0) return true;
    }
    return false;
  }

  async invalidateUserTokens(userId: number) {
    await this.userTokensRepository.update(
      { user_id: userId, is_in_blacklist: false },
      { is_in_blacklist: true },
    );
  }

  async assignRoleToUser(user_id: number, role_id: number) {
    const user = await this.userAccountRepository.findOne({
      where: { user_id },
    });

    if (!user) {
      throw new HttpException(
        `User with ID ${user_id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const role = await this.userRoleRepository.findOne({
      where: { role_id },
    });

    if (!role) {
      throw new HttpException(
        `Role with ID ${role_id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    user.role = role;

    return this.userAccountRepository.save(user);
  }

  async enableM2FA(user_id: number) {
    const user = await this.userLoginDataRepository.findOne({
      where: { user_id },
    });

    if (!user) {
      throw new HttpException(
        `User with ID ${user_id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    user.enabled_m2fa = true;

    return this.userLoginDataRepository.save(user);
  }

  async disableM2FA(user_id: number) {
    const user = await this.userLoginDataRepository.findOne({
      where: { user_id },
    });

    if (!user) {
      throw new HttpException(
        `User with ID ${user_id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    user.enabled_m2fa = false;

    return this.userLoginDataRepository.save(user);
  }

  async getUserLoginDataByUserM2faToken(token: string) {
    return this.userLoginDataRepository.findOne({
      where: { m2fa_token: token },
    });
  }

  async updateLoginData(user_id: number, data: any) {
    await this.userLoginDataRepository.update(user_id, data);
    return this.userLoginDataRepository.findOne({
      where: { user_id },
    });
  }
}
