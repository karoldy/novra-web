import type { TranslationResource } from './sc';

export const tc: TranslationResource = {
  app: {
    title: 'ZWIS 內容管理系統',
  },
  pagination: {
    label: '分頁',
    previous: '上一頁',
    next: '下一頁',
    summary: '第 {{page}} 頁，共 {{pageCount}} 頁（顯示第{{total}}項內的 {{range}} 項）',
    pageSize: '顯示{{count}}項',
  },
  locale: {
    label: '語言',
    sc: '简体中文',
    tc: '繁體中文',
    en: 'English',
  },
};
