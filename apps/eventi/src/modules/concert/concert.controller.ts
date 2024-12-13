import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConcertService } from './concert.service';
import { Public } from '../../common/decorators/public.decorator';
import { CreateConcertDto, UpdateConcertDto } from './dto';

import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../../utils/file.utils';
import { FileService } from '../file/file.service';

@Controller('concert')
@Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
export class ConcertController {
  constructor(
    private readonly concertService: ConcertService,
    private readonly fileService: FileService,
  ) {}

  // concert CRUD

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

  @Post(':id/images')
  @UseInterceptors(
    FilesInterceptor('file', 4, {
      limits: { fileSize: 1024 * 1024 * 5 }, // Max 5 MB per file
      fileFilter: imageFileFilter,
    }),
  )
  async uploadConcertImages(
    @Param('id') concertId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user,
  ) {
    const uploadedBy = user.user_id;
    const uploadedFiles = await this.fileService.uploadConcertImages(
      files,
      concertId,
      uploadedBy,
    );
    return {
      status: 'success',
      data: uploadedFiles,
    };
  }

  @Delete(':id/images')
  async deleteConcertImages(
    @Param('id') concertId: number,
    @Body('fileIds') fileIds: number[],
  ) {
    const results = await this.fileService.removeConcertImages(
      concertId,
      fileIds,
    );
    return {
      status: 'success',
      data: results,
    };
  }

  @Get(':id/images')
  @Public()
  async getConcertImages(@Param('id') concertId: number) {
    const images = await this.concertService.getConcertsImages(concertId);
    return {
      status: 'success',
      data: images,
    };
  }

  // genre CRUD

  // Concert Group CRUD

  // Role CRUD

  // Concert Member CRUD

  // Concert Role CRUD

  // registration rule CRUD
}
