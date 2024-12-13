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
import { CreateConcertRoleDto, UpdateConcertRoleDto } from './dto';
import { FindConcertRoleDto } from './dto/Find/FindConcertRoleDto';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';

@Controller('concert-position')
export class ConcertPositionController {
  constructor(private readonly concertService: ConcertService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
  async findAllConcertPositions(@Query() query: FindConcertRoleDto) {
    const concertPositions = await this.concertService.getConcertRoles(query);
    return { status: 'success', data: concertPositions };
  }

  @Post(':concert_id/send-badge/:concert_role_id')
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
  async sendEmail(
    @Param('concert_id') concert_id: number,
    @Param('concert_role_id') concert_role_id: number,
  ) {
    await this.concertService.sendConcertRoleBudget(
      concert_id,
      concert_role_id,
    );
    return {
      status: 'success',
      message: 'Email sent successfully',
    };
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
  async createConcertPosition(@Body() concertRoleDto: CreateConcertRoleDto) {
    const concertPosition =
      await this.concertService.createConcertRole(concertRoleDto);
    return { status: 'success', data: concertPosition };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
  async findConcertPositionById(@Param('id') id: number) {
    const concertPosition = await this.concertService.findConcertRoleById(id);
    return { status: 'success', data: concertPosition };
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
  async updateConcertPosition(
    @Param('id') id: number,
    @Body() updateData: UpdateConcertRoleDto,
  ) {
    const updatedConcertPosition = await this.concertService.updateConcertRole(
      id,
      updateData,
    );
    return { status: 'success', data: updatedConcertPosition };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
  async deleteConcertPosition(@Param('id') id: number) {
    await this.concertService.deleteConcertRole(id);
    return {
      status: 'success',
      message: 'Concert position deleted successfully',
    };
  }
}
