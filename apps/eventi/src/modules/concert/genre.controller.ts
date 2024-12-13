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
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';
import { Public } from '../../common/decorators/public.decorator';

@Controller('genre')
@Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
export class GenreController {
  constructor(private readonly concertService: ConcertService) {}

  @Get()
  @Public()
  async findAllGenres() {
    const genres = await this.concertService.findAllGenres();
    return { status: 'success', data: genres };
  }

  @Public()
  @Get(':id')
  async findGenreById(@Param('id') id: number) {
    const genre = await this.concertService.findGenreById(id);
    return { status: 'success', data: genre };
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
