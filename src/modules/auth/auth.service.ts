import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UserAccount,
  UserLoginData,
  UserLoginDataExternal,
  UserTokens,
  UserRole,
  externalProvider,
  Permission,
} from '../../database/entities/user/index';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: Repository<UserAccount>,
    @InjectRepository(UserLoginData)
    private readonly userLoginDataRepository: Repository<UserLoginData>,
    @InjectRepository(UserLoginDataExternal)
    private readonly userLoginDataExternalRepository: Repository<UserLoginDataExternal>,
    @InjectRepository(UserTokens)
    private readonly userTokensRepository: Repository<UserTokens>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(externalProvider)
    private readonly externalProviderRepository: Repository<externalProvider>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
}
