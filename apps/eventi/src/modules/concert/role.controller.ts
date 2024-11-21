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
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { FindRoleDto } from './dto/Find/FindRoleDto';

@Controller('role')
export class RoleController {
  constructor(private readonly concertService: ConcertService) {}

  @Get()
  async findAllRoles(@Query() query: FindRoleDto) {
    const roles = await this.concertService.getRoles(query);
    return { status: 'success', data: roles };
  }

  @Get(':id')
  async findRoleById(@Param('id') id: number) {
    const role = await this.concertService.findRoleById(id);
    return { status: 'success', data: role };
  }

  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.concertService.createRole(createRoleDto);
    return { status: 'success', data: role };
  }

  @Patch(':id')
  async updateRole(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const updatedRole = await this.concertService.updateRole(id, updateRoleDto);
    return { status: 'success', data: updatedRole };
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: number) {
    await this.concertService.deleteRole(id);
    return { status: 'success', message: 'Role deleted successfully' };
  }
}
