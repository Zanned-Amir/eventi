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
import { Public } from '../../common/decorators/public.decorator';
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
import { CreateArtistDto } from './dto/CreateArtistDto';

@Public()
@Controller('concert')
export class ConcertController {
  constructor(private readonly concertService: ConcertService) {}

  // concert CRUD
  @Public()
  @Get()
  async findAllConcerts() {
    const concerts = await this.concertService.findAllConcerts();
    return { status: 'success', data: concerts };
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
  @Public()
  @Get('genre')
  async findAllGenres() {
    const genres = await this.concertService.findAllGenres();
    return { status: 'success', data: genres };
  }

  @Post('genre')
  async createGenre(@Body() createGenreDto: CreateGenreDto) {
    const genre = await this.concertService.createGenre(createGenreDto);
    return { status: 'success', data: genre };
  }

  @Patch('genre/:id')
  async updateGenre(
    @Param('id') id: number,
    @Body() updateData: UpdateGenreDto,
  ) {
    const updatedGenre = await this.concertService.updateGenre(id, updateData);
    return { status: 'success', data: updatedGenre };
  }

  @Delete('genre/:id')
  async deleteGenre(@Param('id') id: number) {
    await this.concertService.deleteGenre(id);
    return { status: 'success', message: 'Genre deleted successfully' };
  }

  // Venue CRUD
  @Public()
  @Get('venue')
  async findAllVenues() {
    const venues = await this.concertService.findAllVenues();
    return { status: 'success', data: venues };
  }

  @Get('venue/:id')
  async findVenueById(@Param('id') id: number) {
    const venue = await this.concertService.findVenueById(id);
    return { status: 'success', data: venue };
  }

  @Post('venue')
  async createVenue(@Body() createVenueDto: CreateVenueDto) {
    const venue = await this.concertService.createVenue(createVenueDto);
    return { status: 'success', data: venue };
  }

  @Patch('venue/:id')
  async updateVenue(
    @Param('id') id: number,
    @Body() updateData: UpdateVenueDto,
  ) {
    const updatedVenue = await this.concertService.updateVenue(id, updateData);
    return { status: 'success', data: updatedVenue };
  }

  @Delete('venue/:id')
  async deleteVenue(@Param('id') id: number) {
    await this.concertService.deleteVenue(id);
    return { status: 'success', message: 'Venue deleted successfully' };
  }

  // Concert Group CRUD
  @Public()
  @Get('group')
  async findAllConcertGroups() {
    const concertGroups = await this.concertService.findAllConcertGroups();
    return { status: 'success', data: concertGroups };
  }

  @Post('group')
  async createConcertGroup(@Body() concertGroupData: CreateConcertGroupDto) {
    const concertGroup =
      await this.concertService.createConcertGroup(concertGroupData);
    return { status: 'success', data: concertGroup };
  }

  @Patch('group/:id')
  async updateConcertGroup(
    @Param('id') id: number,
    @Body() updateData: UpdateConcertGroupDto,
  ) {
    const updatedConcertGroup = await this.concertService.updateConcertGroup(
      id,
      updateData,
    );
    return { status: 'success', data: updatedConcertGroup };
  }

  @Delete('group/:id')
  async deleteConcertGroup(@Param('id') id: number) {
    await this.concertService.deleteConcertGroup(id);
    return { status: 'success', message: 'Concert group deleted successfully' };
  }

  // Role CRUD
  @Public()
  @Get('role')
  async findAllRoles() {
    const roles = await this.concertService.findAllRoles();
    return { status: 'success', data: roles };
  }

  @Post('role')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.concertService.createRole(createRoleDto);
    return { status: 'success', data: role };
  }

  @Patch('role/:id')
  async updateRole(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const updatedRole = await this.concertService.updateRole(id, updateRoleDto);
    return { status: 'success', data: updatedRole };
  }

  @Delete('role/:id')
  async deleteRole(@Param('id') id: number) {
    await this.concertService.deleteRole(id);
    return { status: 'success', message: 'Role deleted successfully' };
  }

  // Concert Member CRUD
  @Public()
  @Get('member')
  async findAllConcertMembers() {
    const concertMembers = await this.concertService.findAllConcertMembers();
    return { status: 'success', data: concertMembers };
  }

  @Post('member')
  async createConcertMember(@Body() concertMemberData: CreateConcertMemberDto) {
    const concertMember =
      await this.concertService.createConcertMember(concertMemberData);
    return { status: 'success', data: concertMember };
  }

  @Patch('member/:id')
  async updateConcertMember(
    @Param('id') id: number,
    @Body() updateData: UpdateConcertMemberDto,
  ) {
    const updatedConcertMember = await this.concertService.updateConcertMember(
      id,
      updateData,
    );
    return { status: 'success', data: updatedConcertMember };
  }

  @Delete('member/:id')
  async deleteConcertMember(@Param('id') id: number) {
    await this.concertService.deleteConcertMember(id);
    return {
      status: 'success',
      message: 'Concert member deleted successfully',
    };
  }

  // Concert Role CRUD
  @Public()
  @Get('concertPosition')
  async findAllConcertRoles() {
    const concertRoles = await this.concertService.findAllConcertRoles();
    return { status: 'success', data: concertRoles };
  }

  @Post('concertPosition')
  async createConcertRole(@Body() concertRoleDto: CreateConcertRoleDto) {
    const concertRole =
      await this.concertService.createConcertRole(concertRoleDto);
    return { status: 'success', data: concertRole };
  }

  @Patch('concertPosition/:id')
  async updateConcertRole(
    @Param('id') id: number,
    @Body() updateData: UpdateConcertRoleDto,
  ) {
    const updatedConcertRole = await this.concertService.updateConcertRole(
      id,
      updateData,
    );
    return { status: 'success', data: updatedConcertRole };
  }

  @Delete('concertPosition/:id')
  async deleteConcertRole(@Param('id') id: number) {
    await this.concertService.deleteConcertRole(id);
    return { status: 'success', message: 'Concert role deleted successfully' };
  }

  @Post('artist')
  async createArtist(@Body() createArtistDto: CreateArtistDto) {
    const artist = await this.concertService.createArtist(createArtistDto);
    return { status: 'success', data: artist };
  }

  @Get('artist')
  async findAllArtists() {
    const artists = await this.concertService.findAllArtists();
    return { status: 'success', data: artists };
  }
  @Get('artist/:id')
  async findArtistById(@Param('id') id: number) {
    const artist = await this.concertService.findArtistById(id);
    return { status: 'success', data: artist };
  }

  @Patch('artist/:id')
  async updateArtist(@Param('id') id: number, @Body() updateData: any) {
    const updatedArtist = await this.concertService.updateArtist(
      id,
      updateData,
    );
    return { status: 'success', data: updatedArtist };
  }

  @Delete('artist/:id')
  async deleteArtist(@Param('id') id: number) {
    await this.concertService.deleteArtist(id);
    return { status: 'success', message: 'Artist deleted successfully' };
  }
}
