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
import { Public } from 'src/common/decorators/public.decorator';
import {
  CreateConcertDto,
  CreateConcertGroupDto,
  CreateConcertMemberDto,
  CreateConcertRoleDto,
  CreateGenreDto,
  CreateRoleDto,
  CreateVenueDto,
  UpdateConcertDto,
  UpdateConcertGroupDto,
  UpdateConcertMemberDto,
  UpdateConcertRoleDto,
  UpdateGenreDto,
  UpdateRoleDto,
  UpdateVenueDto,
} from './dto';

@Controller('concert')
export class ConcertController {
  constructor(private readonly concertService: ConcertService) {}

  // concert CRUD
  @Public()
  @Get()
  async findAllConcerts() {
    return await this.concertService.findAllConcerts();
  }

  @Post(':id')
  async createConcert(@Body() concertData: CreateConcertDto) {
    return await this.concertService.createConcert(concertData);
  }

  @Patch(':id')
  async updateConcert(
    @Param('id') id: number,
    @Body() updateData: UpdateConcertDto,
  ) {
    return await this.concertService.updateConcert(id, updateData);
  }

  @Delete(':id')
  async deleteConcert(@Param('id') id: number) {
    return await this.concertService.deleteConcert(id);
  }

  //genre

  @Public()
  @Get('genre')
  async findAllGenres() {
    return await this.concertService.findAllGenres();
  }

  @Post('genre/:id')
  async createGenre(@Body() genreData: CreateGenreDto) {
    return await this.concertService.createGenre(genreData);
  }

  @Delete('genre/:id')
  async deleteGenre(@Param('id') id: number) {
    return await this.concertService.deleteGenre(id);
  }
  @Patch('genre/:id')
  async updateGenre(
    @Param('id') id: number,
    @Body() updateData: UpdateGenreDto,
  ) {
    return await this.concertService.updateGenre(id, updateData);
  }

  //venue CRUD
  @Public()
  @Get('venue')
  async findAllVenues() {
    return await this.concertService.findAllVenues();
  }

  @Post('venue/:id')
  async createVenue(@Body() venueData: CreateVenueDto) {
    return await this.concertService.createVenue(venueData);
  }

  @Delete('venue/:id')
  async deleteVenue(@Param('id') id: number) {
    return await this.concertService.deleteVenue(id);
  }
  @Patch('venue/:id')
  async updateVenue(
    @Param('id') id: number,
    @Body() updateData: UpdateVenueDto,
  ) {
    return await this.concertService.updateVenue(id, updateData);
  }

  // concertGroup CRUD

  @Public()
  @Get('concertGroup')
  async findAllConcertGroups() {
    return await this.concertService.findAllConcertGroups();
  }

  @Post('concertGroup/:id')
  async createConcertGroup(@Body() concertGroupData: CreateConcertGroupDto) {
    return await this.concertService.createConcertGroup(concertGroupData);
  }

  @Delete('concertGroup/:id')
  async deleteConcertGroup(@Param('id') id: number) {
    return await this.concertService.deleteConcertGroup(id);
  }

  @Patch('concertGroup/:id')
  async updateConcertGroup(
    @Param('id') id: number,
    @Body() updateData: UpdateConcertGroupDto,
  ) {
    return await this.concertService.updateConcertGroup(id, updateData);
  }

  // role CRUD

  @Public()
  @Get('role')
  async findAllRoles() {
    return await this.concertService.findAllRoles();
  }

  @Post('role/:id')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return await this.concertService.createRole(createRoleDto);
  }

  @Delete('role/:id')
  async deleteRole(@Param('id') id: number) {
    return await this.concertService.deleteRole(id);
  }

  @Patch('role/:id')
  async updateRole(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.concertService.updateRole(id, updateRoleDto);
  }

  // concertMember CRUD

  @Public()
  @Get('concertMember')
  async findAllConcertMembers() {
    return await this.concertService.findAllConcertMembers();
  }

  @Post('concertMember/:id')
  async createConcertMember(@Body() concertMemberData: CreateConcertMemberDto) {
    return await this.concertService.createConcertMember(concertMemberData);
  }

  @Patch('concertMember/:id')
  async updateConcertMember(
    @Param('id') id: number,
    @Body() updateData: UpdateConcertMemberDto,
  ) {
    return await this.concertService.updateConcertMember(id, updateData);
  }

  @Delete('concertMember/:id')
  async deleteConcertMember(@Param('id') id: number) {
    return await this.concertService.deleteConcertMember(id);
  }

  // concertRole CRUD

  @Public()
  @Get('concertRole')
  async findAllConcertRoles() {
    return await this.concertService.findAllConcertRoles();
  }

  @Post('concertRole/:id')
  async createConcertRole(@Body() concertRoleDto: CreateConcertRoleDto) {
    return await this.concertService.createConcertRole(concertRoleDto);
  }

  @Patch('concertRole/:id')
  async updateConcertRole(
    @Param('id') id: number,
    @Body() updateData: UpdateConcertRoleDto,
  ) {
    return await this.concertService.updateConcertRole(id, updateData);
  }

  @Delete('concertRole/:id')
  async deleteConcertRole(@Param('id') id: number) {
    return await this.concertService.deleteConcertRole(id);
  }
}
