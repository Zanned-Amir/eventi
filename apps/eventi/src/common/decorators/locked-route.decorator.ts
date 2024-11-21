import { SetMetadata } from '@nestjs/common';

export const LOCKED_ROUTE_KEY = 'isLocked';
export const LockedRoute = () => SetMetadata(LOCKED_ROUTE_KEY, true);
