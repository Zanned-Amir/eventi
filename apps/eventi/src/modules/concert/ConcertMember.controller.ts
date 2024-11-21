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
import { CreateConcertMemberDto, UpdateConcertMemberDto } from './dto';
import { FindConcertMemberDto } from './dto/Find/FindConcertMemberDto';

@Controller('concert-member')
export class ConcertMemberController {
  constructor(private readonly concertService: ConcertService) {}

  @Get()
  async findAllConcertMembers(@Query() query: FindConcertMemberDto) {
    const concertMembers = await this.concertService.getConcertMembers(query);
    return { status: 'success', data: concertMembers };
  }

  @Get(':id')
  async findConcertMemberById(@Param('id') id: number) {
    const member = await this.concertService.findConcertMemberById(id);
    return { status: 'success', data: member };
  }

  @Post()
  async createConcertMember(
    @Body() createConcertMemberDto: CreateConcertMemberDto,
  ) {
    const member = await this.concertService.createConcertMember(
      createConcertMemberDto,
    );
    return { status: 'success', data: member };
  }

  @Patch(':id')
  async updateConcertMember(
    @Param('id') id: number,
    @Body() updateConcertMemberDto: UpdateConcertMemberDto,
  ) {
    const updatedMember = await this.concertService.updateConcertMember(
      id,
      updateConcertMemberDto,
    );
    return { status: 'success', data: updatedMember };
  }

  @Delete(':id')
  async deleteConcertMember(@Param('id') id: number) {
    await this.concertService.deleteConcertMember(id);
    return {
      status: 'success',
      message: 'Concert member deleted successfully',
    };
  }
}
