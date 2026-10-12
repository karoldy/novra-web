// Source language (DEFAULT_LOCALE). Its shape is the type every other locale must match.
export const sc = {
  app: {
    title: 'ZWIS 内容管理系统',
  },
  pagination: {
    label: '分页',
    previous: '上一页',
    next: '下一页',
    summary: '第 {{page}} 页，共 {{pageCount}} 页（显示第{{total}}项内的 {{range}} 项）',
    pageSize: '显示{{count}}项',
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
