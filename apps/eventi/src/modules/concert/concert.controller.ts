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
import { Public } from '../../common/decorators/public.decorator';
import { CreateConcertDto, UpdateConcertDto } from './dto';

import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';

@Public()
@Controller('concert')
@Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
export class ConcertController {
  constructor(private readonly concertService: ConcertService) {}

  // concert CRUD
  @Public()
  @Get()
  async findAllConcerts(@Query() query) {
    const concerts = await this.concertService.getConcerts(query);
    return { status: 'success', data: concerts };
  }

  @Public()
  @Get(':id')
  async findConcertById(@Param('id') id: number) {
    const concert = await this.concertService.findConcertById(id);
    return { status: 'success', data: concert };
  }

  @Get('a')
  async findAllConcertsForAdmin(@Query() query) {
    const concerts = await this.concertService.getConcerts(query, false);
    return { status: 'success', data: concerts };
  }

  @Get('a/:id')
  async findConcertByIdForAdmin(@Param('id') id: number) {
    const concert = await this.concertService.findConcertById(id, false);
    return { status: 'success', data: concert };
  }

  @Post()
  async createConcert(@Body() createConcertDto: CreateConcertDto) {
    const concert = await this.concertService.createConcert(createConcertDto);
    return { status: 'success', data: concert };
  }

  @Patch(':id')
  async updateConcert(
    @Param('id') id: number,
    @Body() updateConcertDto: UpdateConcertDto,
  ) {
    const updatedConcert = await this.concertService.updateConcert(
      id,
      updateConcertDto,
    );
    return { status: 'success', data: updatedConcert };
  }

  @Delete(':id')
  async deleteConcert(@Param('id') id: number) {
    await this.concertService.deleteConcert(id);
    return { status: 'success', message: 'Concert deleted successfully' };
  }

  // genre CRUD

  // Concert Group CRUD

  // Role CRUD

  // Concert Member CRUD

  // Concert Role CRUD

  // registration rule CRUD
}
