import { TimelineEvent, HistoricalDoc, ThemeMode } from './types';

export const MODE_UI_CONFIG: Record<ThemeMode, {
  importBtn: string;
  trashTitle: string;
  footerStatus: string;
  footerBrand: string;
  sidebarTopicTitle: string;
  sidebarTagTitle: string;
  aiTabIndividual: string;
  aiTabTimeline: string;
  ingestPlaceholder: string;
  ingestTitle: string;
  emptyState: string;
}> = {
  [ThemeMode.HISTORICAL]: {
    importBtn: "导入文献卷宗",
    trashTitle: "废纸篓",
    footerStatus: "灵台清明 · 考据无极",
    footerBrand: "ClioNote 乾坤版",
    sidebarTopicTitle: "工作区目录",
    sidebarTagTitle: "分类矩阵",
    aiTabIndividual: "旨归 / 研判",
    aiTabTimeline: "纵横 / 比对",
    ingestPlaceholder: "请在此输入或粘贴原始文献、碑刻拓片或地方志文本...",
    ingestTitle: "录入新史料卷宗",
    emptyState: "待调阅档案文献"
  },
  [ThemeMode.FAN]: {
    importBtn: "记录脑洞",
    trashTitle: "碎纸机",
    footerStatus: "为爱发电 · 圈地自萌",
    footerBrand: "CLIO LOVE ENGINE v1.0",
    sidebarTopicTitle: "世界线收束",
    sidebarTagTitle: "登场角色",
    aiTabIndividual: "情感研判 / 刀糖",
    aiTabTimeline: "羁绊 / 连结",
    ingestPlaceholder: "请在此记录那些令人难忘的名场面或感情线...",
    ingestTitle: "入坑记录安利",
    emptyState: "等待糖点掉落"
  },
  [ThemeMode.MODERN]: {
    importBtn: "新建文档",
    trashTitle: "回收站",
    footerStatus: "系统就绪 · 自动保存",
    footerBrand: "CLIONOTE OS 2.4.0",
    sidebarTopicTitle: "项目专题",
    sidebarTagTitle: "关键实体",
    aiTabIndividual: "要点提取 / 摘要",
    aiTabTimeline: "趋势分析 / 洞察",
    ingestPlaceholder: "输入文档正文内容...",
    ingestTitle: "新建文档存档",
    emptyState: "暂无活动文档"
  },
  [ThemeMode.REVIEW]: {
    importBtn: "收录综述文献",
    trashTitle: "剔除项",
    footerStatus: "逻辑构建 · 范式转移",
    footerBrand: "Review Protocol v3.0",
    sidebarTopicTitle: "研究范式目录",
    sidebarTagTitle: "学术谱系矩阵",
    aiTabIndividual: "学术元分析",
    aiTabTimeline: "学术史综述",
    ingestPlaceholder: "请粘贴学术文献原文、摘要或研究评论...",
    ingestTitle: "录入综述文献",
    emptyState: "待评阅文献详情"
  }
};

export const MOCK_DOCS: Record<string, HistoricalDoc> = {
  'doc-1': {
    id: 'doc-1',
    title: '《明史·神宗本纪》：即位大赦',
    source: '《明史》卷二十',
    solarDate: '1573年 7月',
    lunarDate: '万历元年 癸酉',
    content: [
      '元年六月乙卯，穆宗崩。丙辰，皇太子即皇帝位。以明年为万历元年。',
      '大赦天下。以张居正为首辅，高拱罢。时居正任内阁大学士，总理朝政，推行考成法。',
      '诏曰：“朕以冲人，继承大统，仰承祖宗之休，俯听臣民之愿。”'
    ],
    tags: ['万历皇帝', '张居正', '政治', '即位'],
    imageUrl: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?q=80&w=1000&auto=format&fit=crop',
    originMode: ThemeMode.HISTORICAL
  },
  'doc-2': {
    id: 'doc-2',
    title: '《明史·张居正传》：夺情争端',
    source: '《明史》卷二百一十三',
    solarDate: '1577年 10月',
    lunarDate: '万历五年 丁丑',
    content: [
      '五年九月，居正父文明卒。帝遣中使慰问，赏赐优渥。',
      '时诏留居正，不令归省。礼部尚书马自强、吏部尚书张瀚等各疏论，谓丧礼不可废，居正宜乞假。',
      '居正上疏辞，帝不许。吴中行、赵用贤继之，言：“古今夺情，非金革之世不宜。”帝怒，廷杖之。'
    ],
    tags: ['张居正', '政治', '儒家伦理', '廷杖', '万历皇帝'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBbN--P5H9DZJGUrAudQPgCqo9080fwO1-vPtfnwBkYjYIYMxX1xRCYRx230wq3fiqFPW45XWREFEBBLbWWyty2-_vyfvFujPVbjYGp8Znby20LCaAO53mSfwLLTKiHMYEjhn0HednKPVuCNNYrLQUYTylJgY5G24bWpwQkIczrs0HOT87hGbiixDAlxcDEFTvnjIl0QcsKvzyzD9LK24LKwk7jhxmztbRl0wJMze2yNlSBZ6dWIEQN09JrotLtzt4TwkCUN3DZS8',
    originMode: ThemeMode.HISTORICAL
  },
  'doc-3': {
    id: 'doc-3',
    title: '《明经世文编》：一条鞭法论',
    source: '《明经世文编》卷三百',
    solarDate: '1581年 3月',
    lunarDate: '万历九年 辛巳',
    content: [
      '万历九年，诏天下通行一条鞭法。总括一县之赋役，量地计丁，一律征银。',
      '此法去贪墨之弊，便民甚矣。然豪强地主往往隐匿田产，贫民负担犹重。',
      '张居正致书各省：若不严督考成，则法虽良，终必为虚器。'
    ],
    tags: ['张居正', '经济', '一条鞭法', '赋役', '政治', '万历皇帝'],
    imageUrl: 'https://images.unsplash.com/photo-1524591431555-cc7876d14ade?q=80&w=1000&auto=format&fit=crop',
    originMode: ThemeMode.HISTORICAL
  }
};

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    year: 1573,
    era: '万历元年',
    title: '万历皇帝即位',
    solarDate: '公历 1573',
    description: '明神宗朱翊钧正式登基，改元万历。张居正此时任首辅，开始辅佐幼主，筹备新政。',
    tags: ['万历皇帝', '张居正', '政治', '即位'],
    docId: 'doc-1',
    originMode: ThemeMode.HISTORICAL
  },
  {
    id: '2',
    year: 1577,
    era: '万历五年',
    title: '张居正“夺情”事件',
    solarDate: '公历 1577',
    description: '张居正父丧，依例应守制，但神宗下令“夺情”留任，引发朝中官僚大规模议论与对立。',
    tags: ['张居正', '政治', '儒家伦理', '万历皇帝', '廷杖'],
    docId: 'doc-2',
    originMode: ThemeMode.HISTORICAL
  },
  {
    id: '3',
    year: 1581,
    era: '万历九年',
    title: '一条鞭法推广',
    solarDate: '公历 1581',
    description: '在全国范围内推广“一条鞭法”，简化赋税征收，由实物改为征银，明代经济的一大转折点。',
    tags: ['张居正', '经济', '政治', '一条鞭法', '赋役', '万历皇帝'],
    docId: 'doc-3',
    originMode: ThemeMode.HISTORICAL
  }
];
