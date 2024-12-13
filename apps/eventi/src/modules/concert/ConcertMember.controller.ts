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
import { CreateConcertMemberDto, UpdateConcertMemberDto } from './dto';
import { FindConcertMemberDto } from './dto/Find/FindConcertMemberDto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../../utils/file.utils';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';

@Controller('concert-member')
@Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER)
export class ConcertMemberController {
  constructor(private readonly concertService: ConcertService) {}

  @Get()
  async findAllConcertMembers(@Query() query: FindConcertMemberDto) {
    const concertMembers = await this.concertService.getConcertMembers(query);
    return { status: 'success', data: concertMembers };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.EVENT_ORGANIZER, Role.TICKET_VERIFIER, Role.SECURITY_GUARD)
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

  @Post(':id/upload-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1024 * 1024 * 5 },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadConcertMember(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user,
  ) {
    const artist = await this.concertService.uploadConcertMemberPicture(
      user.user_id,
      id,
      file,
    );
    return { status: 'success', data: artist };
  }

  @Delete(':id/delete-picture')
  async deleteConcertMemberPicture(@Param('id') id: number) {
    const message = await this.concertService.deleteConcertMemberPicture(id);
    return {
      status: 'success',
      message,
    };
  }

  @Get(':id/picture')
  async getConcertMemberPicture(@Param('id') id: number) {
    const picture = await this.concertService.getConcertMemberPicture(id);
    return { status: 'success', data: picture };
  }
}
