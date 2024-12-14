import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConcertService } from './concert.service';
import { CreateArtistDto } from './dto/Create/CreateArtistDto';
import { FindArtistDto } from './dto/Find/FindArtistDto';
import { Public } from '../../common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../../utils/file.utils';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';

@Controller('artist')
@Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
export class ArtistController {
  constructor(private readonly concertService: ConcertService) {}


  

  @Public()
  @Get()
  async findAllArtists(@Query() query: FindArtistDto) {
    const artists = await this.concertService.getArtists(query);
    return { status: 'success', data: artists };
  }

  @Public()
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

  @Post(':id/assign-artist-to-concert/:concertId')
  async assignArtistToConcert(
    @Param('concertId') concertId: number,
    @Param('id') artistId: number,
  ) {
    const artist = await this.concertService.assignArtistToConcert(
      concertId,
      artistId,
    );
    return { status: 'success', data: artist };
  }

  @Delete(':id/remove-artist-from-concert/:concertId')
  async removeArtistFromConcert(
    @Param('concertId') concertId: number,
    @Param('id') artistId: number,
  ) {
    await this.concertService.removeArtistFromConcert(concertId, artistId);
    return { status: 'success', message: 'Artist removed from concert' };
  }

  @Post(':id/upload-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1024 * 1024 * 5 },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadArtistPicture(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user,
  ) {
    console.log('file', file);
    const artist = await this.concertService.uploadArtistPicture(
      user.user_id,
      id,
      file,
    );
    return { status: 'success', data: artist };
  }

  @Delete(':id/delete-picture')
  async deleteArtistPicture(@Param('id') id: number) {
    const message = await this.concertService.deleteArtistPicture(id);

    return { status: 'success', message };
  }

  @Public()
  @Get(':id/picture')
  async getArtistPicture(@Param('id') id: number) {
    const picture = await this.concertService.getArtistPicture(id);
    return { status: 'success', data: picture };
  }
}
