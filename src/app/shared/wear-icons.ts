import { Season, TimeOfDay } from '../core/models';
import { Icons } from './icons';

export const SEASON_ICONS: Record<Season, typeof Icons.sun> = {
  Spring: Icons.seedling,
  Summer: Icons.sun,
  Autumn: Icons.leaf,
  Winter: Icons.snowflake,
};

export const TIME_ICONS: Record<TimeOfDay, typeof Icons.sun> = {
  Day: Icons.sun,
  Night: Icons.moon,
  Both: Icons.halfCircle,
};
