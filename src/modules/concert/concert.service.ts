import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Artist,
  Concert,
  ConcertGroup,
  ConcertMember,
  ConcertRole,
  Genre,
  Role,
  Venue,
} from 'src/database/entities/concert';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateGenreDto,
  UpdateGenreDto,
  CreateConcertDto,
  UpdateConcertDto,
  CreateConcertGroupDto,
  UpdateConcertGroupDto,
  CreateConcertMemberDto,
  UpdateConcertMemberDto,
  CreateConcertRoleDto,
  UpdateConcertRoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  CreateVenueDto,
  UpdateVenueDto,
} from './dto/index';

@Injectable()
export class ConcertService {
  constructor(
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
    @InjectRepository(Concert)
    private concertRepository: Repository<Concert>,
    @InjectRepository(ConcertGroup)
    private concertGroupRepository: Repository<ConcertGroup>,
    @InjectRepository(ConcertMember)
    private concertMemberRepository: Repository<ConcertMember>,
    @InjectRepository(ConcertRole)
    private concertRoleRepository: Repository<ConcertRole>,
    @InjectRepository(Role)
    private roleMemberRepository: Repository<Role>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  // Genre CRUD
  async createGenre(createGenreDto: CreateGenreDto) {
    const genre = this.genreRepository.create(createGenreDto);
    return await this.genreRepository.save(genre);
  }

  async findAllGenres() {
    return await this.genreRepository.find();
  }

  async findGenreById(id: number) {
    return await this.genreRepository.findOneOrFail({
      where: { genre_id: id },
    });
  }

  async updateGenre(
    id: number,
    updateGenreDto: UpdateGenreDto,
  ): Promise<Genre> {
    await this.genreRepository.update(id, updateGenreDto);
    return await this.findGenreById(id);
  }

  async deleteGenre(id: number) {
    await this.genreRepository.delete(id);
  }

  // Concert CRUD
  async createConcert(createConcertDto: CreateConcertDto) {
    const concert = this.concertRepository.create(createConcertDto);
    return await this.concertRepository.save(concert);
  }

  async findAllConcerts() {
    return await this.concertRepository.find();
  }

  async findConcertById(id: number) {
    return await this.concertRepository.findOneOrFail({
      where: { concert_id: id },
    });
  }

  async updateConcert(id: number, updateConcertDto: UpdateConcertDto) {
    await this.concertRepository.update(id, updateConcertDto);
    return await this.findConcertById(id);
  }

  async deleteConcert(id: number) {
    await this.concertRepository.delete(id);
  }

  // Concert Group CRUD
  async createConcertGroup(createConcertGroupDto: CreateConcertGroupDto) {
    const concertGroup = this.concertGroupRepository.create(
      createConcertGroupDto,
    );
    return await this.concertGroupRepository.save(concertGroup);
  }

  async findAllConcertGroups() {
    return await this.concertGroupRepository.find();
  }

  async findConcertGroupById(id: number) {
    return await this.concertGroupRepository.findOneOrFail({
      where: { concert_group_id: id },
    });
  }

  async updateConcertGroup(id: number, updateData: UpdateConcertGroupDto) {
    await this.concertGroupRepository.update(id, updateData);
    return await this.findConcertGroupById(id);
  }

  async deleteConcertGroup(id: number) {
    await this.concertGroupRepository.delete(id);
  }

  // Concert Member CRUD
  async createConcertMember(createConcertMemberDto: CreateConcertMemberDto) {
    const concertMember = this.concertMemberRepository.create(
      createConcertMemberDto,
    );
    return await this.concertMemberRepository.save(concertMember);
  }

  async findAllConcertMembers() {
    return await this.concertMemberRepository.find();
  }

  async findConcertMemberById(id: number) {
    return await this.concertMemberRepository.findOneOrFail({
      where: { concert_member_id: id },
    });
  }

  async updateConcertMember(
    id: number,
    updateConcertMemberDto: UpdateConcertMemberDto,
  ) {
    await this.concertMemberRepository.update(id, updateConcertMemberDto);
    return await this.findConcertMemberById(id);
  }

  async deleteConcertMember(id: number) {
    await this.concertMemberRepository.delete(id);
  }

  // Concert Role CRUD
  async createConcertRole(createConcertRoleDto: CreateConcertRoleDto) {
    const concertRole = this.concertRoleRepository.create({
      ...createConcertRoleDto,
      access_code: uuidv4(),
    });
    return await this.concertRoleRepository.save(concertRole);
  }

  async findAllConcertRoles() {
    return await this.concertRoleRepository.find();
  }

  async findConcertRoleById(id: number) {
    return await this.concertRoleRepository.findOneOrFail({
      where: { concert_member_id: id },
    });
  }

  async updateConcertRole(id: number, updateData: UpdateConcertRoleDto) {
    await this.concertRoleRepository.update(id, updateData);
    return await this.findConcertRoleById(id);
  }

  async deleteConcertRole(id: number) {
    await this.concertRoleRepository.delete(id);
  }

  // Role CRUD
  async createRole(roleData: CreateRoleDto) {
    const role = this.roleMemberRepository.create(roleData);
    return await this.roleMemberRepository.save(role);
  }

  async findAllRoles() {
    return await this.roleMemberRepository.find();
  }

  async findRoleById(id: number) {
    return await this.roleMemberRepository.findOneOrFail({
      where: { role_id: id },
    });
  }

  async updateRole(id: number, updateData: UpdateRoleDto) {
    await this.roleMemberRepository.update(id, updateData);
    return await this.findRoleById(id);
  }

  async deleteRole(id: number) {
    await this.roleMemberRepository.delete(id);
  }

  // Venue CRUD
  async createVenue(venueData: CreateVenueDto) {
    const venue = this.venueRepository.create(venueData);
    return await this.venueRepository.save(venue);
  }

  async findAllVenues(): Promise<Venue[]> {
    return await this.venueRepository.find();
  }

  async findVenueById(id: number) {
    return await this.venueRepository.findOneOrFail({
      where: { venue_id: id },
    });
  }

  async updateVenue(id: number, updateData: UpdateVenueDto): Promise<Venue> {
    await this.venueRepository.update(id, updateData);
    return await this.findVenueById(id);
  }

  async deleteVenue(id: number): Promise<void> {
    await this.venueRepository.delete(id);
  }

  // Artist CRUD (if needed)
  async createArtist(artistData: any) {
    const artist = this.artistRepository.create(artistData);
    return await this.artistRepository.save(artist);
  }

  async findAllArtists() {
    return await this.artistRepository.find();
  }

  async findArtistById(id: number) {
    return await this.artistRepository.findOneOrFail({
      where: { artist_id: id },
    });
  }

  async updateArtist(id: number, updateData: any) {
    await this.artistRepository.update(id, updateData);
    return await this.findArtistById(id);
  }

  async deleteArtist(id: number) {
    await this.artistRepository.delete(id);
  }
}
