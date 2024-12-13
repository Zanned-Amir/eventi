import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ConcertService } from './concert.service';
import { FindRegistrationRuleDto } from './dto/Find/FindRegistrationRuleDto';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';

@Controller('registration-rule')
@Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
export class RegistrationRuleController {
  constructor(private readonly concertService: ConcertService) {}

  @Get()
  async findAllRegistrationRules(@Query() query: FindRegistrationRuleDto) {
    const registrationRules =
      await this.concertService.getRegistrationRules(query);
    return { status: 'success', data: registrationRules };
  }

  @Get(':id')
  async findRegistrationRuleById(@Param('id') id: number) {
    const registrationRule =
      await this.concertService.findRegistrationRuleById(id);
    return { status: 'success', data: registrationRule };
  }

  @Post()
  async createRegistrationRule(@Body() createRegistrationRuleDto: any) {
    const registrationRule = await this.concertService.createRegistrationRule(
      createRegistrationRuleDto,
    );
    return { status: 'success', data: registrationRule };
  }

  @Patch(':id')
  async updateRegistrationRule(
    @Param('id') id: number,
    @Body() updateData: any,
  ) {
    const updatedRegistrationRule =
      await this.concertService.updateRegistrationRule(id, updateData);
    return { status: 'success', data: updatedRegistrationRule };
  }

  @Delete(':id')
  async deleteRegistrationRule(@Param('id') id: number) {
    await this.concertService.deleteRegistrationRule(id);
    return {
      status: 'success',
      message: 'Registration rule deleted successfully',
    };
  }
}
