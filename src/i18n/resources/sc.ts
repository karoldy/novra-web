// Source language (DEFAULT_LOCALE). Its shape is the type every other locale must match.
export const sc = {
  app: {
    title: 'ZWIS 内容管理系统',
  },
  locale: {
    label: '语言',
    // Language names stay in their own script in every locale, so users can find theirs.
    sc: '简体中文',
    tc: '繁體中文',
    en: 'English',
  },
};

export type TranslationResource = typeof sc;
