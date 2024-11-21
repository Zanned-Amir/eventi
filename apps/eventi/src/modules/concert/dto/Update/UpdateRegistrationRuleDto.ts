import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistrationRuleDto } from '../Create/CreateRegistrationRuleDto';

export class UpdateRegistrationRuleDto extends PartialType(
  CreateRegistrationRuleDto,
) {}
