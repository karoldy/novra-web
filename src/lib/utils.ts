import { createCn } from 'cn/config';
import { typographyVariantNames } from '@/tokens';

// Register custom `text-*` typography sizes as font-size, otherwise `cn` treats them as
// text colors and drops them when merged with e.g. `text-primary`.
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: [...typographyVariantNames] }],
    },
  },
});
