
export enum AppView {
  WORKBENCH = 'workbench',
  DASHBOARD = 'dashboard'
}

export enum ThemeMode {
  MODERN = 'modern',
  HISTORICAL = 'historical',
  FAN = 'fan',
  REVIEW = 'review'
}

export interface TimelineEvent {
  id: string;
  year: number;
  era: string;
  title: string;
  description: string;
  solarDate: string;
  tags: string[];
  docId: string;
  originMode: ThemeMode; // 记录产生该数据的场景模式
}

export interface HistoricalDoc {
  id: string;
  title: string;
  source: string;
  solarDate: string;
  lunarDate: string;
  content: string[];
  tags: string[];
  imageUrl?: string;
  originMode: ThemeMode; // 记录产生该数据的场景模式
  isDeleted?: boolean; // 回收站标记
}

export interface ResearchTheme {
  id: string;
  name: string;
  docIds: string[];
  createdAt: number;
}

export interface ResearchTopic {
  id: string;
  name: string;
  description: string;
  docIds: string[];
}

export interface AnalysisPoint {
  id: string;
  text: string;
  type: 'insight' | 'dispute' | 'social';
}
