import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../auth.constants';

/** Route does not require a valid Bearer session. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
