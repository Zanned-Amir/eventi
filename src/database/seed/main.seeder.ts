import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import {
  Permission,
  UserRole,
  UserAccount,
  UserLoginData,
} from '../entities/user';
import { Genre } from '../entities/concert/genre.entity';
import { Role } from '../entities/concert/role.entity';

export class MainSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository(UserRole);
    const permissionRepository = dataSource.getRepository(Permission);
    const userAccountRepository = dataSource.getRepository(UserAccount);
    const userLoginDataRepository = dataSource.getRepository(UserLoginData);
    const genreRepository = dataSource.getRepository(Genre);
    const roleConcert = dataSource.getRepository(Role);

    console.log('Cleaning up existing data...');

    // Clean up existing data
    await dataSource.query(
      'TRUNCATE TABLE "user_login_data", "user_account", "user_role", "permission" CASCADE',
    );

    console.log('Existing data cleaned up.');

    console.log('Seeding database with initial data...');
    console.log('Creating permissions,genres, roles, and test users...');

    const genres = [
      {
        genre_name: 'Rock',
      },
      {
        genre_name: 'Pop',
      },
      {
        genre_name: 'Jazz',
      },
      {
        genre_name: 'Classical',
      },
      {
        genre_name: 'Hip-hop',
      },
    ];

    await genreRepository.save(genres);
    console.log('Genres created');

    const roleConcerts = [
      {
        role_name: 'Performer',
        role_description:
          'Responsible for performing at the event, including musicians, bands, and other entertainers.',
      },
      {
        role_name: 'Organizer',
        role_description:
          'Manages the overall planning and execution of the concert, coordinating with different teams and services.',
      },
      {
        role_name: 'Security',
        role_description:
          'Ensures the safety of attendees, performers, and staff, managing crowd control and access points.',
      },
      {
        role_name: 'Vendor',
        role_description:
          'Manages stalls or booths, selling merchandise, food, or drinks during the concert.',
      },
      {
        role_name: 'Sound Engineer',
        role_description:
          'Responsible for managing and optimizing sound quality during the event, including sound checks and equipment setup.',
      },
      {
        role_name: 'Light Engineer',
        role_description:
          'Manages stage lighting and effects to enhance the visual experience during performances.',
      },
      {
        role_name: 'Stage Manager',
        role_description:
          'Coordinates all backstage activities, including managing the schedule and ensuring smooth transitions between performances.',
      },
      {
        role_name: 'Volunteer',
        role_description:
          'Helps with various tasks such as event setup, guest assistance, and providing general support during the concert.',
      },
      {
        role_name: 'Ticketing Manager',
        role_description:
          'Oversees ticket sales, access control, and customer issues related to ticketing.',
      },
      {
        role_name: 'Marketing Manager',
        role_description:
          'Handles promotional activities, advertising, and outreach to ensure a strong audience turnout.',
      },
      {
        role_name: 'VIP Coordinator',
        role_description:
          'Ensures the smooth experience of VIP attendees, including managing seating, amenities, and exclusive access.',
      },
      {
        role_name: 'Artist Liaison',
        role_description:
          'Coordinates with performers, ensuring their needs are met, and manages their schedule during the event.',
      },
      {
        role_name: 'Backstage Crew',
        role_description:
          'Assists with setting up equipment, moving props, and supporting performers behind the scenes.',
      },
      {
        role_name: 'Catering Manager',
        role_description:
          'Organizes food and beverages for performers, staff, and VIP guests during the event.',
      },
      {
        role_name: 'Safety Officer',
        role_description:
          'Monitors health and safety standards, ensuring the venue complies with safety regulations.',
      },
      {
        role_name: 'Transport Manager',
        role_description:
          'Arranges transportation for performers, staff, and equipment to and from the venue.',
      },
      {
        role_name: 'Event Host/Emcee',
        role_description:
          'Serves as the public face of the event, introducing performers and keeping the audience engaged.',
      },
    ];

    await roleConcert.save(roleConcerts);
    console.log('Concert roles created');

    // Create Permissions with UPPERCASE and UNDERSCORE separated names
    const permissions = [
      // Define your permissions here
      {
        permission_name: 'MANAGE_USERS',
        permission_description: 'Full user management',
      },
      {
        permission_name: 'MANAGE_EVENTS',
        permission_description: 'Create, edit, delete events',
      },
      {
        permission_name: 'MANAGE_TICKETS',
        permission_description: 'Manage ticket inventory',
      },
      {
        permission_name: 'VIEW_REPORTS',
        permission_description: 'View financial and reservation reports',
      },
      {
        permission_name: 'ISSUE_REFUNDS',
        permission_description: 'Refund issued tickets',
      },
      {
        permission_name: 'VIEW_ALL_RESERVATIONS',
        permission_description: 'View all user reservations',
      },
      {
        permission_name: 'CREATE_EVENTS',
        permission_description: 'Create new events',
      },
      {
        permission_name: 'EDIT_EVENTS',
        permission_description: 'Edit existing events',
      },
      {
        permission_name: 'VIEW_EVENTS',
        permission_description: 'Allows guests to view events',
      },
      {
        permission_name: 'DELETE_EVENTS',
        permission_description: 'Delete events',
      },
      {
        permission_name: 'VIEW_EVENT_RESERVATIONS',
        permission_description: 'View reservations for events',
      },
      {
        permission_name: 'MANAGE_VENDOR_BOOTHS',
        permission_description: 'Setup and manage vendor booths',
      },
      {
        permission_name: 'VIEW_VENDOR_SALES_REPORTS',
        permission_description: 'View sales reports for vendors',
      },
    ];

    // Save Permissions
    const savedPermissions = await permissionRepository.save(permissions);
    console.log('Permissions created');

    // Create Roles
    const roles = [
      {
        role_name: 'ADMIN',
        role_description: 'System administrator',
        permissions: savedPermissions, // Admin gets all permissions
      },
      {
        role_name: 'EVENT_ORGANIZER',
        role_description: 'Manages event creation and tickets',
        permissions: savedPermissions.filter((p) =>
          [
            'MANAGE_EVENTS',
            'CREATE_EVENTS',
            'EDIT_EVENTS',
            'DELETE_EVENTS',
            'VIEW_EVENT_RESERVATIONS',
            'MANAGE_TICKETS',
          ].includes(p.permission_name),
        ),
      },
      {
        role_name: 'SUPPORT_STAFF',
        role_description: 'Handles support for tickets and users',
        permissions: savedPermissions.filter((p) =>
          ['ISSUE_REFUNDS', 'VIEW_ALL_RESERVATIONS', 'VIEW_REPORTS'].includes(
            p.permission_name,
          ),
        ),
      },
      {
        role_name: 'USER',
        role_description: 'Standard customer',
        permissions: savedPermissions.filter((p) =>
          ['VIEW_EVENT_RESERVATIONS', 'VIEW_ALL_RESERVATIONS'].includes(
            p.permission_name,
          ),
        ),
      },
      {
        role_name: 'GUEST',
        role_description: 'Unregistered user browsing events',
        permissions: savedPermissions.filter((p) =>
          ['VIEW_EVENTS'].includes(p.permission_name),
        ),
      },
    ];

    // Save Roles
    const savedRoles = await roleRepository.save(roles);
    console.log('Roles created');

    const adminRole = savedRoles.find((role) => role.role_name === 'ADMIN');
    const userRole = savedRoles.find((role) => role.role_name === 'USER');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Admin Account
    const adminAccount = userAccountRepository.create({
      first_name: 'Admin',
      last_name: 'User',
      gender: 'M',
      birth_date: new Date('1990-01-01'),
      role: adminRole,
    });
    const savedAdminAccount = await userAccountRepository.save(adminAccount);

    // Create Admin Login Data
    const adminLoginData = userLoginDataRepository.create({
      user_id: savedAdminAccount.user_id,
      username: 'admin_user',
      password: hashedPassword,
      email: 'admin@example.com',
      confirmation_token: 'confirm123',
      recovery_token: 'recover123',
      is_confirmed: true,
      userAccount: savedAdminAccount,
    });
    await userLoginDataRepository.save(adminLoginData);

    // Create Regular User Account
    const userAccount = userAccountRepository.create({
      first_name: 'Regular',
      last_name: 'User',
      gender: 'F',
      birth_date: new Date('1995-01-01'),
      role: userRole,
    });
    const savedUserAccount = await userAccountRepository.save(userAccount);

    // Create Regular User Login Data
    const userLoginData = userLoginDataRepository.create({
      user_id: savedUserAccount.user_id,
      username: 'regular_user',
      password: hashedPassword,
      email: 'user@example.com',
      confirmation_token: 'confirm456',
      recovery_token: 'recover456',
      is_confirmed: true,
      userAccount: savedUserAccount,
    });
    await userLoginDataRepository.save(userLoginData);

    console.log('Admin and user accounts created');
  }
}
