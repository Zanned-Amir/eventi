import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
} from '../../database/entities/concert';
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
import { RegistrationRule } from '../../database/entities/order';
import { CreateRegistrationRuleDto } from './dto/Create/CreateRegistrationRuleDto';
import { UpdateRegistrationRuleDto } from './dto/Update/UpdateRegistrationRuleDto';
import { FindConcertsDto } from './dto/Find/FindConcertDto';
import { FindConcertRoleDto } from './dto/Find/FindConcertRoleDto';
import { FindRoleDto } from './dto/Find/FindRoleDto';
import { FindConcertMemberDto } from './dto/Find/FindConcertMemberDto';
import { FindArtistDto } from './dto/Find/FindArtistDto';
import { FindRegistrationRuleDto } from './dto/Find/FindRegistrationRuleDto';
import { AUTH_STAFF_SERVICE } from '@app/common/constants/service';
import { ClientProxy } from '@nestjs/microservices';
import * as QRCode from 'qrcode';
import { createSign } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { FileService } from '../file/file.service';
import {
  AssociationTypes,
  EntityTypes,
} from '../../database/entities/file/fileAssociation.entity';

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

    @InjectRepository(RegistrationRule)
    private registrationRuleRepository: Repository<RegistrationRule>,

    private readonly configService: ConfigService,

    private readonly FileService: FileService,

    @Inject(AUTH_STAFF_SERVICE)
    private readonly authStaffClient: ClientProxy,
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

  async getConcertsImages(concert_id: number) {
    const concert = await this.concertRepository.findOne({
      where: { concert_id },
    });
    if (!concert) {
      throw new HttpException('Concert not found', HttpStatus.NOT_FOUND);
    }

    return await this.FileService.getImagesForEntity(
      concert_id,
      EntityTypes.CONCERT,
    );
  }

  async getConcerts(
    query: FindConcertsDto,
    for_user: boolean = true,
  ): Promise<Concert[]> {
    const queryBuilder = this.concertRepository
      .createQueryBuilder('concert')
      .leftJoinAndSelect('concert.venue', 'venue')
      .leftJoinAndSelect('concert.concertGroup', 'concertGroup')
      .leftJoinAndSelect('concert.artists', 'artist')
      .leftJoinAndSelect('artist.genres', 'genre');

    if (for_user) {
      queryBuilder.andWhere('concert.concert_available_from >= NOW()');
      queryBuilder.andWhere('concert.is_active = :isActive', {
        isActive: true,
      });
    }

    // Filter by concert and venue fields with case-insensitive LIKE
    if (query.concert_name) {
      queryBuilder.andWhere(
        'LOWER(concert.concert_name) LIKE LOWER(:concertName)',
        {
          concertName: `%${query.concert_name}%`,
        },
      );
    }

    if (query.concert_group_name) {
      queryBuilder.andWhere(
        'LOWER(concertGroup.concert_group_name) LIKE LOWER(:concertGroupName)',
        {
          concertGroupName: `%${query.concert_group_name}%`,
        },
      );
    }

    if (typeof query.is_active !== 'undefined') {
      queryBuilder.andWhere('concert.is_active = :isActive', {
        isActive: query.is_active,
      });
    }

    // Date filters for concert availability, start, and end dates
    if (query.concert_available_from) {
      queryBuilder.andWhere(
        'concert.concert_available_from = :concertAvailableFrom',
        {
          concertAvailableFrom: query.concert_available_from,
        },
      );
    }
    if (query.concert_available_from_gte) {
      queryBuilder.andWhere(
        'concert.concert_available_from >= :concertAvailableFromGte',
        {
          concertAvailableFromGte: query.concert_available_from_gte,
        },
      );
    }
    if (query.concert_available_from_lte) {
      queryBuilder.andWhere(
        'concert.concert_available_from <= :concertAvailableFromLte',
        {
          concertAvailableFromLte: query.concert_available_from_lte,
        },
      );
    }

    if (query.concert_start_date) {
      queryBuilder.andWhere('concert.concert_start_date = :concertStartDate', {
        concertStartDate: query.concert_start_date,
      });
    }
    if (query.concert_start_date_gte) {
      queryBuilder.andWhere(
        'concert.concert_start_date >= :concertStartDateGte',
        {
          concertStartDateGte: query.concert_start_date_gte,
        },
      );
    }
    if (query.concert_start_date_lte) {
      queryBuilder.andWhere(
        'concert.concert_start_date <= :concertStartDateLte',
        {
          concertStartDateLte: query.concert_start_date_lte,
        },
      );
    }

    if (query.concert_end_date) {
      queryBuilder.andWhere('concert.concert_end_date = :concertEndDate', {
        concertEndDate: query.concert_end_date,
      });
    }
    if (query.concert_end_date_gte) {
      queryBuilder.andWhere('concert.concert_end_date >= :concertEndDateGte', {
        concertEndDateGte: query.concert_end_date_gte,
      });
    }
    if (query.concert_end_date_lte) {
      queryBuilder.andWhere('concert.concert_end_date <= :concertEndDateLte', {
        concertEndDateLte: query.concert_end_date_lte,
      });
    }

    // Filter by venue fields with case-insensitive LIKE
    if (query.venue_name) {
      queryBuilder.andWhere('LOWER(venue.venue_name) LIKE LOWER(:venueName)', {
        venueName: `%${query.venue_name}%`,
      });
    }

    if (query.venue_location) {
      queryBuilder.andWhere(
        'LOWER(venue.location) LIKE LOWER(:venueLocation)',
        {
          venueLocation: `%${query.venue_location}%`,
        },
      );
    }

    if (query.venue_capacity) {
      queryBuilder.andWhere('venue.capacity = :venueCapacity', {
        venueCapacity: query.venue_capacity,
      });
    }

    if (query.venue_capacity_gte) {
      queryBuilder.andWhere('venue.capacity >= :venueCapacityGte', {
        venueCapacityGte: query.venue_capacity_gte,
      });
    }

    if (query.venue_capacity_lte) {
      queryBuilder.andWhere('venue.capacity <= :venueCapacityLte', {
        venueCapacityLte: query.venue_capacity_lte,
      });
    }

    if (query.venue_type) {
      queryBuilder.andWhere('LOWER(venue.type) LIKE LOWER(:venueType)', {
        venueType: `%${query.venue_type}%`,
      });
    }

    if (query.venue_email) {
      queryBuilder.andWhere('LOWER(venue.email) LIKE LOWER(:venueEmail)', {
        venueEmail: `%${query.venue_email}%`,
      });
    }

    if (query.venue_phone_number) {
      queryBuilder.andWhere(
        'LOWER(venue.phone_number) LIKE LOWER(:venuePhoneNumber)',
        {
          venuePhoneNumber: `%${query.venue_phone_number}%`,
        },
      );
    }

    // Filter by artist name with case-insensitive LIKE
    if (query.artist_name) {
      queryBuilder.andWhere(
        'LOWER(artist.artist_name) LIKE LOWER(:artistName)',
        {
          artistName: `%${query.artist_name}%`,
        },
      );
    }

    // Filter by genre name with case-insensitive LIKE
    if (query.genre_name) {
      queryBuilder.andWhere('LOWER(genre.genre_name) LIKE LOWER(:genreName)', {
        genreName: `%${query.genre_name}%`,
      });
    }

    // Default pagination
    const limit = query.limit ?? 10; // Default to 10 if not provided
    const offset = query.offset ?? 0; // Default to 0 if not provided

    queryBuilder.skip(offset).take(limit);

    // Sorting results based on the provided orderBy field
    if (query.orderBy) {
      for (const [field, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(`concert.${field}`, order);
      }
    }

    // Execute query and return results
    return query.rawQuery ? queryBuilder.getRawMany() : queryBuilder.getMany();
  }

  async findConcertById(id: number, for_user: boolean = true) {
    const queryBuilder = this.concertRepository
      .createQueryBuilder('concert')
      .leftJoinAndSelect('concert.venue', 'venue')
      .leftJoinAndSelect('concert.concertGroup', 'concertGroup')
      .leftJoinAndSelect('concert.artists', 'artist')
      .leftJoinAndSelect('artist.genres', 'genre')
      .where('concert.concert_id = :concertId', { concertId: id });

    if (for_user) {
      queryBuilder.andWhere('concert.concert_available_from >= NOW()');
      queryBuilder.andWhere('concert.is_active = :isActive', {
        isActive: true,
      });
    }

    return await queryBuilder.getOne();
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

  async getConcertMembers(query: FindConcertMemberDto) {
    const queryBuilder =
      this.concertMemberRepository.createQueryBuilder('concertMember');

    if (query.concert_member_id) {
      queryBuilder.andWhere(
        'concertMember.concert_member_id = :concert_member_id',
        {
          concert_member_id: query.concert_member_id,
        },
      );
    }

    if (query.full_name) {
      queryBuilder.andWhere(
        'LOWER(concertMember.full_name) LIKE LOWER(:full_name)',
        {
          full_name: `%${query.full_name}%`,
        },
      );
    }

    if (query.email) {
      queryBuilder.andWhere('LOWER(concertMember.email) LIKE LOWER(:email)', {
        email: `%${query.email}%`,
      });
    }

    if (query.phone_number) {
      queryBuilder.andWhere('concertMember.phone_number LIKE :phone_number', {
        phone_number: `%${query.phone_number}%`,
      });
    }

    if (query.orderBy) {
      for (const [key, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(`concertMember.${key}`, order);
      }
    }

    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;
    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    return await queryBuilder.getMany();
  }

  async uploadConcertMemberPicture(
    user_id: number,
    concert_member_id: number,
    file: Express.Multer.File,
  ) {
    const concertMember = await this.concertMemberRepository.findOne({
      where: { concert_member_id },
    });
    if (!concertMember) {
      throw new HttpException('Artist not found', HttpStatus.NOT_FOUND);
    }

    return await this.FileService.uploadAndAssignImage(
      file,
      concert_member_id,
      EntityTypes.CONCERT_MEMBER,
      AssociationTypes.PROFILE_PICTURE,
      1,
      true,
      user_id,
    );
  }

  async deleteConcertMemberPicture(concert_member_id: number) {
    const concertMember = await this.concertMemberRepository.findOne({
      where: { concert_member_id },
    });
    if (!concertMember) {
      throw new HttpException('Artist not found', HttpStatus.NOT_FOUND);
    }

    const result = await this.FileService.removeImage(
      concert_member_id,
      EntityTypes.CONCERT_MEMBER,
      AssociationTypes.PROFILE_PICTURE,
    );

    if (!result) {
      throw new HttpException('Artist picture not found', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Artist picture deleted successfully',
    };
  }

  async getConcertMemberPicture(concert_member_id: number) {
    const concertMember = await this.concertMemberRepository.findOne({
      where: { concert_member_id },
    });
    if (!concertMember) {
      throw new HttpException('Artist not found', HttpStatus.NOT_FOUND);
    }

    return await this.FileService.getImagesForEntity(
      concert_member_id,
      EntityTypes.CONCERT_MEMBER,
    );
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

  async sendConcertRoleBudget(concert_id: number, concert_role_id: number) {
    const concertRole = await this.concertRoleRepository
      .createQueryBuilder('concert_role')
      .leftJoinAndSelect('concert_role.concertMember', 'concertMember')
      .leftJoinAndSelect('concert_role.role', 'role')
      .leftJoinAndSelect('concert_role.concert', 'concert')
      .where('concert_role.concert_role_id = :concert_role_id', {
        concert_role_id,
      })
      .andWhere('concert_role.concert_id = :concert_id', { concert_id })
      .getOne();

    if (!concertRole) {
      throw new UnauthorizedException('Concert role not found');
    }

    // Construct the payload
    const payload = `${concert_id}:${concert_role_id}:${concertRole.access_code}`;

    // Sign the payload using the private key
    const privateKey = this.configService.getOrThrow<string>(
      'PRIVATE_KEY_SIGNATURE',
    );
    const sign = createSign('SHA256');
    sign.update(payload);
    const signature = sign.sign(privateKey, 'base64');

    console.log('Signature:', signature);

    // Include the signature in the QR code data
    const qrData = `${payload}:${signature}`;

    const data = {
      full_name: concertRole.concertMember.full_name,
      role_name: concertRole.role.role_name,
      concert_name: concertRole.concert.concert_name,
      concert_start_date: concertRole.concert.concert_start_date
        .toISOString()
        .replace('T', ' ')
        .replace(/\..+/, ''),
      concert_end_date: concertRole.concert.concert_end_date
        .toISOString()
        .replace('T', ' ')
        .replace(/\..+/, ''),
      concert_member_id: concertRole.concert_member_id,
      email: concertRole.concertMember.email,
      access_code_qr: await QRCode.toDataURL(qrData), // Generate QR code with signed data
    };

    // Emit the email event with the signed data
    this.authStaffClient.emit('send_role_badge_email', data);
  }

  async getConcertRoles(query: FindConcertRoleDto) {
    const queryBuilder =
      this.concertRoleRepository.createQueryBuilder('concertRole');

    if (query.concert_member_id) {
      queryBuilder.andWhere(
        'concertRole.concert_member_id = :concert_member_id',
        {
          concert_member_id: query.concert_member_id,
        },
      );
    }

    if (query.concert_id) {
      queryBuilder.andWhere('concertRole.concert_id = :concert_id', {
        concert_id: query.concert_id,
      });
    }

    if (query.role_id) {
      queryBuilder.andWhere('concertRole.role_id = :role_id', {
        role_id: query.role_id,
      });
    }

    if (query.access_code) {
      queryBuilder.andWhere('concertRole.access_code = :access_code', {
        access_code: query.access_code,
      });
    }

    if (query.orderBy) {
      for (const [key, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(`concertRole.${key}`, order);
      }
    }

    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;
    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    return await queryBuilder.getMany();
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

  async getRoles(query: FindRoleDto) {
    const queryBuilder = this.roleMemberRepository.createQueryBuilder('role');

    if (query.role_id) {
      queryBuilder.andWhere('role.role_id = :role_id', {
        role_id: query.role_id,
      });
    }

    if (query.role_name) {
      queryBuilder.andWhere('LOWER(role.role_name) LIKE LOWER(:role_name)', {
        role_name: `%${query.role_name}%`,
      });
    }

    if (query.orderBy) {
      for (const [key, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(`role.${key}`, order);
      }
    }

    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;
    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    return await queryBuilder.getMany();
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

  async getArtists(query: FindArtistDto) {
    const queryBuilder = this.artistRepository.createQueryBuilder('artist');

    if (query.artist_id) {
      queryBuilder.andWhere('artist.artist_id = :artist_id', {
        artist_id: query.artist_id,
      });
    }

    if (query.artist_name) {
      queryBuilder.andWhere(
        'LOWER(artist.artist_name) LIKE LOWER(:artist_name)',
        {
          artist_name: `%${query.artist_name}%`,
        },
      );
    }

    if (query.genre_id) {
      queryBuilder.andWhere('artist.genre_id = :genre_id', {
        genre_id: query.genre_id,
      });
    }

    if (query.orderBy) {
      for (const [key, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(`artist.${key}`, order);
      }
    }

    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;
    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    return await queryBuilder.getMany();
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

  async uploadArtistPicture(
    user_id: number,
    artist_id: number,
    file: Express.Multer.File,
  ) {
    const artist = await this.artistRepository.findOne({
      where: { artist_id },
    });
    if (!artist) {
      throw new HttpException('Artist not found', HttpStatus.NOT_FOUND);
    }

    return await this.FileService.uploadAndAssignImage(
      file,
      artist_id,
      EntityTypes.ARTIST,
      AssociationTypes.ARTIST_PICTURE,
      1,
      true,
      user_id,
    );
  }

  async deleteArtistPicture(artist_id: number) {
    const artist = await this.artistRepository.findOne({
      where: { artist_id },
    });
    if (!artist) {
      throw new HttpException('Artist not found', HttpStatus.NOT_FOUND);
    }

    const result = await this.FileService.removeImage(
      artist_id,
      EntityTypes.ARTIST,
      AssociationTypes.ARTIST_PICTURE,
    );

    if (!result) {
      throw new HttpException('Artist picture not found', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Artist picture deleted successfully',
    };
  }

  async getArtistPicture(artist_id: number) {
    const artist = await this.artistRepository.findOne({
      where: { artist_id },
    });
    if (!artist) {
      throw new HttpException('Artist not found', HttpStatus.NOT_FOUND);
    }

    return await this.FileService.getImagesForEntity(
      artist_id,
      EntityTypes.ARTIST,
    );
  }

  async createRegistrationRule(
    createRegistrationRuleDto: CreateRegistrationRuleDto,
  ) {
    const registrationRule = this.registrationRuleRepository.create(
      createRegistrationRuleDto,
    );
    return await this.registrationRuleRepository.save(registrationRule);
  }

  async getRegistrationRules(query: FindRegistrationRuleDto) {
    const queryBuilder =
      this.registrationRuleRepository.createQueryBuilder('registrationRule');

    if (query.register_rule_id) {
      queryBuilder.andWhere(
        'registrationRule.register_rule_id = :register_rule_id',
        {
          register_rule_id: query.register_rule_id,
        },
      );
    }

    if (query.concert_id) {
      queryBuilder.andWhere('registrationRule.concert_id = :concert_id', {
        concert_id: query.concert_id,
      });
    }

    if (query.available_from_gte) {
      queryBuilder.andWhere(
        'registrationRule.available_from >= :available_from_gte',
        {
          available_from_gte: query.available_from_gte,
        },
      );
    }

    if (query.valid_until_lte) {
      queryBuilder.andWhere(
        'registrationRule.valid_until <= :valid_until_lte',
        {
          valid_until_lte: query.valid_until_lte,
        },
      );
    }

    if (query.is_active !== undefined) {
      queryBuilder.andWhere('registrationRule.is_active = :is_active', {
        is_active: query.is_active,
      });
    }

    if (query.orderBy) {
      for (const [key, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(`registrationRule.${key}`, order);
      }
    }

    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;
    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    return await queryBuilder.getMany();
  }

  async findRegistrationRuleById(id: number) {
    return await this.registrationRuleRepository.findOneOrFail({
      where: { register_rule_id: id },
    });
  }

  async updateRegistrationRule(
    id: number,
    UpdateRegistrationRule: UpdateRegistrationRuleDto,
  ) {
    await this.registrationRuleRepository.update(id, UpdateRegistrationRule);
    return await this.findRegistrationRuleById(id);
  }

  async deleteRegistrationRule(id: number) {
    await this.registrationRuleRepository.delete(id);
  }
}
