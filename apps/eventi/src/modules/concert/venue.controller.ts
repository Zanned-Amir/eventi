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
import { CreateVenueDto, UpdateVenueDto } from './dto';

@Controller('venue')
export class VenueController {
  constructor(private readonly concertService: ConcertService) {}

  @Get()
  async findAllVenues() {
    const venues = await this.concertService.findAllVenues();
    return { status: 'success', data: venues };
  }

  @Get(':id')
  async findVenueById(@Param('id') id: number) {
    const venue = await this.concertService.findVenueById(id);
    return { status: 'success', data: venue };
  }

  @Post()
  async createVenue(@Body() createVenueDto: CreateVenueDto) {
    const venue = await this.concertService.createVenue(createVenueDto);
    return { status: 'success', data: venue };
  }

  @Patch(':id')
  async updateVenue(
    @Param('id') id: number,
    @Body() updateVenueDto: UpdateVenueDto,
  ) {
    const updatedVenue = await this.concertService.updateVenue(
      id,
      updateVenueDto,
    );
    return { status: 'success', data: updatedVenue };
  }

  @Delete(':id')
  async deleteVenue(@Param('id') id: number) {
    await this.concertService.deleteVenue(id);
    return { status: 'success', message: 'Venue deleted successfully' };
  }
}