
import React, { useMemo, useState } from 'react';
import { ThemeMode, TimelineEvent, ResearchTopic, HistoricalDoc } from '../types';

interface SidebarProps {
  themeMode: ThemeMode;
  isDataShared: boolean;
  allEvents: TimelineEvent[];
  onIngestClick: () => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  themes: ResearchTopic[];
  activeThemeId: string | null;
  onThemeSelect: (id: string | null) => void;
  onAddTheme: (name: string) => string;
  onManageTopic: (id: string) => void;
  allDocs: Record<string, HistoricalDoc>;
  onToggleDocInTheme: (themeId: string, docId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  themeMode, 
  isDataShared, 
  allEvents, 
  onIngestClick, 
  selectedTags, 
  onTagToggle,
  themes,
  activeThemeId,
  onThemeSelect,
  onAddTheme,
  onManageTopic,
  allDocs,
  onToggleDocInTheme
}) => {
  const isFan = themeMode === ThemeMode.FAN;
  const isHist = themeMode === ThemeMode.HISTORICAL;
  const isReview = themeMode === ThemeMode.REVIEW;

  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const modeSuffix: Record<ThemeMode, string> = {
    [ThemeMode.MODERN]: '现',
    [ThemeMode.HISTORICAL]: '史',
    [ThemeMode.FAN]: '同',
    [ThemeMode.REVIEW]: '综'
  };

  const activeTopic = useMemo(() => themes.find(t => t.id === activeThemeId), [themes, activeThemeId]);

  const dynamicTagData = useMemo(() => {
    const tagToModes = new Map<string, Set<ThemeMode>>();
    
    allEvents.forEach(event => {
      if (activeTopic && !activeTopic.docIds.includes(event.docId)) return;

      event.tags.forEach(tag => {
        if (!tagToModes.has(tag)) tagToModes.set(tag, new Set());
        tagToModes.get(tag)?.add(event.originMode);
      });
    });

    const visibleTags: { name: string; isNative: boolean; origin: ThemeMode[] }[] = [];
    tagToModes.forEach((modes, tagName) => {
      const hasCurrentMode = modes.has(themeMode);
      if (isDataShared || hasCurrentMode) {
        visibleTags.push({
          name: tagName,
          isNative: hasCurrentMode,
          origin: Array.from(modes)
        });
      }
    });

    return visibleTags.sort((a, b) => a.name.localeCompare(b.name));
  }, [allEvents, themeMode, isDataShared, activeTopic]);

  const categories = useMemo(() => {
    // 模拟针对不同模式的标签分类建议
    const methodTags = ['定量分析', '定性研究', '田野调查', '文献考据'];
    const people = ['张居正', '万历皇帝', '穆宗', '高拱'];

    if (isReview) {
      return [
        { 
          label: '研究方法', 
          icon: 'menu_book', 
          tags: dynamicTagData.filter(t => methodTags.includes(t.name)) 
        },
        { 
          label: '核心议题', 
          icon: 'account_balance', 
          tags: dynamicTagData.filter(t => !methodTags.includes(t.name) && !people.includes(t.name)) 
        },
        { 
          label: '流派分类', 
          icon: 'diversity_3', 
          tags: dynamicTagData.filter(t => people.includes(t.name)) 
        }
      ];
    }

    return [
      { 
        label: isFan ? '人物实体' : isHist ? '档案主体' : '主体 (Entities)', 
        icon: isFan ? 'face' : 'dataset', 
        tags: dynamicTagData.filter(t => people.includes(t.name)) 
      },
      { 
        label: isFan ? '专题分析' : isHist ? '专题分类' : '专题 (Topics)', 
        icon: isFan ? 'favorite' : 'account_tree', 
        tags: dynamicTagData.filter(t => !people.includes(t.name)) 
      }
    ];
  }, [dynamicTagData, isFan, isHist, isReview]);

  const handleAddTopicSubmit = () => {
    if (newTopicName.trim()) {
      const id = onAddTheme(newTopicName);
      onThemeSelect(id);
      setNewTopicName('');
      setIsAddingTopic(false);
    }
  };

  const handleManageClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onManageTopic(id);
  };

  return (
    <aside className={`w-60 border-r flex flex-col overflow-y-auto shrink-0 transition-colors ${
      isFan ? 'bg-[#FFF5F8] border-pink-100' : 
      isHist ? 'bg-[#F9F7F2] border-[#D1CEC4]' : 
      isReview ? 'bg-slate-review-100 border-slate-review-200' :
      'bg-white border-border-muted'
    }`}>
      <div className="p-5 flex flex-col gap-8">
        
        <button 
          onClick={onIngestClick}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-white rounded-md text-[11px] font-bold tracking-wider transition-all shadow-sm ${
            isFan ? 'bg-pink-500 hover:bg-pink-600' : 
            isHist ? 'bg-[#5B554D] hover:bg-[#4A453E]' : 
            isReview ? 'bg-slate-review-600 hover:bg-slate-review-700' :
            'bg-charcoal hover:bg-accent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isFan ? 'favorite' : isReview ? 'library_books' : isHist ? 'library_add' : 'add_box'}
          </span>
          {isFan ? '入坑安利' : isReview ? '录入综述文献' : isHist ? '导入文献档案' : '导入新档案'}
        </button>

        {/* 工作区目录 (Research Topics) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-2">
            <h3 className="text-ash text-[10px] font-bold tracking-[0.15em] uppercase">
              {isFan ? '我的追更' : isReview ? '研究范式目录' : isHist ? '工作区目录' : '我的项目'}
            </h3>
            <button 
              onClick={() => setIsAddingTopic(!isAddingTopic)}
              className="text-ash/40 hover:text-charcoal transition-colors"
              title="新增研究课题"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
            </button>
          </div>
          
          <div className="flex flex-col gap-1">
            <div 
              onClick={() => onThemeSelect(null)}
              className={`flex items-center gap-3 px-2 py-2 rounded-md font-semibold cursor-pointer transition-all ${
                activeThemeId === null 
                  ? (isFan ? 'bg-pink-100 text-pink-600' : isReview ? 'bg-slate-review-200 text-slate-review-800' : isHist ? 'bg-black/5 text-[#3A352F]' : 'bg-black/5 text-charcoal') 
                  : 'text-ash/60 hover:bg-black/[0.02]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              <span className="text-xs">全部文献库</span>
            </div>

            {themes.map(topic => (
              <div 
                key={topic.id}
                onClick={() => onThemeSelect(topic.id)}
                className={`flex items-center gap-3 px-2 py-2 rounded-md font-semibold cursor-pointer transition-all group ${
                  activeThemeId === topic.id 
                    ? (isFan ? 'bg-pink-100 text-pink-600' : isReview ? 'bg-slate-review-200 text-slate-review-800' : isHist ? 'bg-black/5 text-[#3A352F]' : 'bg-black/5 text-charcoal') 
                    : 'text-ash/60 hover:bg-black/[0.02]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] opacity-60">folder_shared</span>
                <span className="text-xs truncate flex-1">{topic.name}</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => handleManageClick(e, topic.id)}
                    className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-60 hover:opacity-100 hover:text-blue-500 transition-all"
                    title="管理并设置课题"
                  >
                    settings
                  </button>
                  <span className="text-[9px] opacity-20 font-bold px-1.5 py-0.5 rounded-sm bg-black/5 group-hover:opacity-100 transition-opacity">
                    {topic.docIds.length}
                  </span>
                </div>
              </div>
            ))}

            {isAddingTopic && (
              <div className="mt-2 flex gap-1 p-1">
                <input 
                  autoFocus
                  type="text" 
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTopicSubmit()}
                  placeholder="新课题名称..."
                  className="flex-1 text-[10px] bg-black/5 border-none rounded p-1.5 focus:ring-0"
                />
                <button onClick={handleAddTopicSubmit} className="material-symbols-outlined text-[16px] text-green-500">check</button>
              </div>
            )}
          </div>
        </div>

        {/* 分类矩阵 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-2">
            <h3 className="text-ash text-[10px] font-bold tracking-[0.15em] uppercase">
              {isFan ? '分类检索' : isReview ? '学术谱系矩阵' : isHist ? '分类矩阵' : '标签矩阵'}
            </h3>
          </div>
          <div className="flex flex-col gap-6">
            {categories.map(cat => (
              <div key={cat.label}>
                <div className="flex items-center gap-2 mb-2 text-ash/40">
                  <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{cat.label}</span>
                </div>
                <div className="space-y-1">
                  {cat.tags.length === 0 && (
                    <p className="text-[9px] italic text-ash/30 pl-6 leading-relaxed">
                      {activeThemeId ? '此课题下无匹配标签' : '暂无档案标签'}
                    </p>
                  )}
                  {cat.tags.map(tag => (
                    <label key={tag.name} className="flex items-center gap-3 py-1 cursor-pointer group">
                      <input 
                        checked={selectedTags.includes(tag.name)}
                        onChange={() => onTagToggle(tag.name)}
                        className={`h-3.5 w-3.5 rounded border-gray-300 focus:ring-opacity-50 transition-all ${
                          isFan ? 'text-pink-500' : isReview ? 'text-slate-review-600' : isHist ? 'text-[#5B554D]' : 'text-charcoal'
                        }`} 
                        type="checkbox"
                      />
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className={`text-[13px] truncate transition-colors ${
                          selectedTags.includes(tag.name) 
                            ? (isFan ? 'text-pink-600 font-bold' : isReview ? 'text-slate-review-700 font-bold' : isHist ? 'text-[#3A352F] font-bold' : 'text-charcoal font-bold') 
                            : 'text-ash group-hover:text-charcoal'
                        }`}>
                          {tag.name}
                        </span>
                        {isDataShared && !tag.isNative && (
                          <span className={`text-[9px] px-1 rounded-sm shrink-0 font-bold ${
                            tag.origin.includes(ThemeMode.FAN) ? 'bg-pink-100 text-pink-500' :
                            tag.origin.includes(ThemeMode.REVIEW) ? 'bg-slate-review-200 text-slate-review-600' :
                            tag.origin.includes(ThemeMode.HISTORICAL) ? 'bg-stone-200 text-stone-600' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {tag.origin.map(m => modeSuffix[m]).join('/')}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
