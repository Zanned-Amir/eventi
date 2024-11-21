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
import { CreateArtistDto } from './dto/Create/CreateArtistDto';
import { FindArtistDto } from './dto/Find/FindArtistDto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('artist')
export class ArtistController {
  constructor(private readonly concertService: ConcertService) {}

  @Public()
  @Get()
  async findAllArtists(@Query() query: FindArtistDto) {
    const artists = await this.concertService.getArtists(query);
    return { status: 'success', data: artists };
  }

  @Get(':id')
  async findArtistById(@Param('id') id: number) {
    const artist = await this.concertService.findArtistById(id);
    return { status: 'success', data: artist };
  }

  @Post()
  async createArtist(@Body() createArtistDto: CreateArtistDto) {
    const artist = await this.concertService.createArtist(createArtistDto);
    return { status: 'success', data: artist };
  }

  @Patch(':id')
  async updateArtist(@Param('id') id: number, @Body() updateData: any) {
    const updatedArtist = await this.concertService.updateArtist(
      id,
      updateData,
    );
    return { status: 'success', data: updatedArtist };
  }

  @Delete(':id')
  async deleteArtist(@Param('id') id: number) {
    await this.concertService.deleteArtist(id);
    return { status: 'success', message: 'Artist deleted successfully' };
  }
}
