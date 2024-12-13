import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ConcertService } from './concert.service';
import { CreateConcertGroupDto, UpdateConcertGroupDto } from './dto';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';

@Controller('concert-group')
@Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
export class ConcertGroupController {
  constructor(private readonly concertService: ConcertService) {}

  @Get()
  async findAllConcertGroups() {
    const groups = await this.concertService.findAllConcertGroups();
    return { status: 'success', data: groups };
  }

  @Get(':id')
  async findConcertGroupById(@Param('id') id: number) {
    const group = await this.concertService.findConcertGroupById(id);
    return { status: 'success', data: group };
  }

  @Post()
  async createConcertGroup(
    @Body() createConcertGroupDto: CreateConcertGroupDto,
  ) {
    const group = await this.concertService.createConcertGroup(
      createConcertGroupDto,
    );
    return { status: 'success', data: group };
  }

  @Patch(':id')
  async updateConcertGroup(
    @Param('id') id: number,
    @Body() updateConcertGroupDto: UpdateConcertGroupDto,
  ) {
    const updatedGroup = await this.concertService.updateConcertGroup(
      id,
      updateConcertGroupDto,
    );
    return { status: 'success', data: updatedGroup };
  }

  @Delete(':id')
  async deleteConcertGroup(@Param('id') id: number) {
    await this.concertService.deleteConcertGroup(id);
    return { status: 'success', message: 'Concert group deleted successfully' };
  }
}
