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
import { CreateGenreDto, UpdateGenreDto } from './dto';

@Controller('genre')
export class GenreController {
  constructor(private readonly concertService: ConcertService) {}

  @Get()
  async findAllGenres() {
    const genres = await this.concertService.findAllGenres();
    return { status: 'success', data: genres };
  }

  @Post()
  async createGenre(@Body() createGenreDto: CreateGenreDto) {
    const genre = await this.concertService.createGenre(createGenreDto);
    return { status: 'success', data: genre };
  }

  @Patch(':id')
  async updateGenre(
    @Param('id') id: number,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    const updatedGenre = await this.concertService.updateGenre(
      id,
      updateGenreDto,
    );
    return { status: 'success', data: updatedGenre };
  }

  @Delete(':id')
  async deleteGenre(@Param('id') id: number) {
    await this.concertService.deleteGenre(id);
    return { status: 'success', message: 'Genre deleted successfully' };
  }
}
