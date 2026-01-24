
import React, { useState, useMemo } from 'react';
import { ThemeMode, HistoricalDoc, AppView } from '../types';

interface DashboardViewProps {
  themeMode: ThemeMode;
  allDocs: Record<string, HistoricalDoc>;
  isDataShared: boolean;
  onDocSelect: (docId: string) => void;
  onDocRestore: (docId: string) => void;
  onDocPermanentDelete: (docId: string) => void;
  onEmptyBin: () => void;
  onViewChange: (view: AppView) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  themeMode, 
  allDocs, 
  isDataShared,
  onDocSelect, 
  onDocRestore,
  onDocPermanentDelete,
  onEmptyBin,
  onViewChange 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isFan = themeMode === ThemeMode.FAN;
  const isHist = themeMode === ThemeMode.HISTORICAL;

  // 根据共享策略过滤档案源
  const policyFilteredDocs = useMemo(() => {
    const docs = Object.values(allDocs);
    if (isDataShared) return docs;
    return docs.filter(doc => doc.originMode === themeMode);
  }, [allDocs, isDataShared, themeMode]);

  // 数据统计
  const activeDocs = useMemo(() => policyFilteredDocs.filter(d => !d.isDeleted), [policyFilteredDocs]);
  const deletedDocs = useMemo(() => policyFilteredDocs.filter(d => d.isDeleted), [policyFilteredDocs]);

  const stats = useMemo(() => {
    const allTags = activeDocs.flatMap(d => d.tags);
    return {
      docCount: activeDocs.length,
      tagCount: new Set(allTags).size,
      tagsWithFreq: allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [activeDocs]);

  // 最近5个活跃档案
  const recentDocs = useMemo(() => {
    return activeDocs.slice(-5).reverse();
  }, [activeDocs]);

  // 搜索过滤
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return activeDocs.filter(d => 
      d.title.toLowerCase().includes(query) || 
      d.tags.some(t => t.toLowerCase().includes(query)) ||
      d.source.toLowerCase().includes(query)
    );
  }, [activeDocs, searchQuery]);

  const handleDocClick = (id: string) => {
    onDocSelect(id);
    onViewChange(AppView.WORKBENCH);
  };

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto transition-colors custom-scrollbar ${
      isFan ? 'bg-[#FFF9FB]' : isHist ? 'bg-[#FDFBF7]' : 'bg-white'
    }`}>
      <div className="max-w-6xl mx-auto w-full p-12">
        {/* 顶部标题与检索 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="flex flex-col gap-2">
            <h1 className={`text-4xl font-black tracking-tight ${isHist ? 'font-serif text-[#4A3B2A]' : isFan ? 'text-pink-600' : 'text-charcoal'}`}>
              {isFan ? '热爱档案中心' : isHist ? '史料总览索引' : '档案控制台'}
            </h1>
            <p className="text-ash text-sm opacity-60">
              {isDataShared ? '当前正在查看所有模式下的共享案卷' : (isHist ? '当前馆藏典籍与出土文献的数字化交联概览' : '记录你的每一个心动瞬间与考据细节')}
            </p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-ash/40 group-focus-within:text-charcoal transition-colors">search</span>
            <input 
              type="text"
              placeholder="通过关键词、标签或出处检索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border text-sm transition-all focus:ring-0 ${
                isHist ? 'bg-white border-[#DCD3C1] font-serif focus:border-[#8C7456]' : 
                isFan ? 'bg-white border-pink-100 focus:border-pink-400' : 
                'bg-black/5 border-transparent focus:bg-white focus:border-charcoal'
              }`}
            />
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 bg-black/[0.02] border-b border-black/5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase opacity-40">检索结果 ({filteredDocs.length})</span>
                  <button onClick={() => setSearchQuery('')} className="material-symbols-outlined text-[14px] opacity-40 hover:opacity-100">close</button>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredDocs.length > 0 ? filteredDocs.map(d => (
                    <div key={d.id} onClick={() => handleDocClick(d.id)} className="p-4 hover:bg-black/5 cursor-pointer flex items-center gap-4 transition-colors">
                      <div className="size-10 rounded-lg bg-cover bg-center shrink-0 border border-black/5" style={{backgroundImage: `url(${d.imageUrl})`}}></div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{d.title}</div>
                        <div className="text-[10px] opacity-40 truncate">
                          {isDataShared && <span className="mr-1 opacity-60">[{d.originMode === ThemeMode.HISTORICAL ? '史' : d.originMode === ThemeMode.FAN ? '同' : '现'}]</span>}
                          {d.source} · {d.solarDate}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-[10px] font-bold opacity-20">未找到相关档案</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 核心指标统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className={`p-8 rounded-3xl border transition-all ${isHist ? 'bg-[#F4F1EA] border-[#DCD3C1]' : isFan ? 'bg-white border-pink-100' : 'bg-black/5 border-transparent'}`}>
            <span className="material-symbols-outlined text-ash/30 mb-4">folder_open</span>
            <div className="text-3xl font-black mb-1">{stats.docCount}</div>
            <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">
              {isDataShared ? '全场景总案卷' : '当前模式案卷'}
            </div>
          </div>
          <div className={`p-8 rounded-3xl border transition-all ${isHist ? 'bg-[#F4F1EA] border-[#DCD3C1]' : isFan ? 'bg-white border-pink-100' : 'bg-black/5 border-transparent'}`}>
            <span className="material-symbols-outlined text-ash/30 mb-4">sell</span>
            <div className="text-3xl font-black mb-1">{stats.tagCount}</div>
            <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">特征标签分布</div>
          </div>
          <div className={`md:col-span-2 p-8 rounded-3xl border flex flex-col gap-4 overflow-hidden transition-all ${isHist ? 'bg-[#F4F1EA] border-[#DCD3C1]' : isFan ? 'bg-white border-pink-100' : 'bg-black/5 border-transparent'}`}>
            <div className="flex items-center gap-2 text-ash/30 mb-2">
              <span className="material-symbols-outlined text-sm">cloud</span>
              <span className="text-[10px] font-black uppercase tracking-widest">高频关键词云</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {Object.entries(stats.tagsWithFreq).sort((a,b) => b[1] - a[1]).slice(0, 12).map(([tag, freq]) => (
                <span key={tag} className={`font-black hover:opacity-100 transition-opacity cursor-default ${
                  freq > 2 ? 'text-lg opacity-100' : freq > 1 ? 'text-sm opacity-60' : 'text-xs opacity-30'
                } ${isHist ? 'font-serif text-[#8C7456]' : isFan ? 'text-pink-500' : 'text-charcoal'}`}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 最近5张导入文献 */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-lg font-bold flex items-center gap-3 ${isHist ? 'font-serif' : ''}`}>
              <span className="material-symbols-outlined opacity-30">history</span>
              近期入藏案卷
            </h3>
            <button onClick={() => onViewChange(AppView.WORKBENCH)} className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity">查看全部列表 →</button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar scroll-smooth">
            {recentDocs.length > 0 ? recentDocs.map(doc => (
              <div 
                key={doc.id}
                onClick={() => handleDocClick(doc.id)}
                className={`w-72 shrink-0 group cursor-pointer transition-all rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 ${
                  isHist ? 'bg-white border-[#DCD3C1]' : isFan ? 'bg-white border-pink-100' : 'bg-white border-black/5'
                }`}
              >
                <div className="h-40 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700" style={{backgroundImage: `url(${doc.imageUrl})`}}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[9px] font-black opacity-30 uppercase tracking-tighter">{doc.lunarDate}</div>
                    {isDataShared && <span className={`text-[8px] font-black px-1 rounded-sm ${doc.originMode === ThemeMode.HISTORICAL ? 'bg-stone-100 text-stone-500' : 'bg-pink-100 text-pink-500'}`}>{doc.originMode === ThemeMode.HISTORICAL ? '史料' : '同人'}</span>}
                  </div>
                  <h4 className={`text-sm font-bold mb-3 leading-tight line-clamp-2 ${isHist ? 'font-serif' : ''}`}>{doc.title}</h4>
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm bg-black/5 opacity-40">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )) : (
              <div className={`w-full h-40 flex items-center justify-center border-2 border-dashed rounded-3xl opacity-20 ${isHist ? 'border-[#DCD3C1]' : 'border-black/10'}`}>
                <span className="text-xs font-bold uppercase tracking-widest">当前环境暂无案卷</span>
              </div>
            )}
          </div>
        </section>

        {/* 回收站板块 - 只有当有被删除档案时才显示 */}
        {deletedDocs.length > 0 && (
          <section className="mb-16 animate-in slide-in-from-bottom-6 duration-700 border-t pt-16">
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col gap-1">
                 <h3 className={`text-xl font-bold flex items-center gap-3 text-ash/80 ${isHist ? 'font-serif' : ''}`}>
                    <span className="material-symbols-outlined text-red-400">delete_sweep</span>
                    案卷回收站
                    <span className="text-xs font-black px-2 py-0.5 bg-red-50 text-red-400 rounded-full">{deletedDocs.length}</span>
                 </h3>
                 <p className="text-[10px] text-ash/40 font-bold uppercase tracking-widest pl-10">已被标记为“软删除”的档案可在此找回或彻底抹除</p>
              </div>
              <button 
                onClick={() => { if(confirm('确定要清空回收站吗？这将永久删除所有暂存档案，不可撤销。')) onEmptyBin(); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border border-red-200 text-red-400 hover:bg-red-50 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">auto_delete</span>
                清空回收站
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {deletedDocs.map(doc => (
                <div 
                  key={doc.id}
                  className={`group relative p-6 rounded-2xl border bg-black/[0.02] border-black/5 flex flex-col gap-5 hover:bg-white hover:border-red-100 hover:shadow-xl transition-all duration-500`}
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className={`text-sm font-bold truncate opacity-50 group-hover:opacity-100 ${isHist ? 'font-serif' : ''}`}>{doc.title}</h4>
                       {isDataShared && (
                         <span className={`text-[7px] font-black px-1 rounded uppercase ${
                           doc.originMode === ThemeMode.HISTORICAL ? 'bg-stone-200 text-stone-500' : 'bg-pink-100 text-pink-500'
                         }`}>
                           {doc.originMode === ThemeMode.HISTORICAL ? '史' : '同'}
                         </span>
                       )}
                    </div>
                    <p className="text-[10px] opacity-30 group-hover:opacity-60 truncate">{doc.source} · {doc.solarDate}</p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0 opacity-40 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => onDocRestore(doc.id)}
                      className="flex-1 py-2.5 rounded-xl bg-white border border-black/5 text-[10px] font-black uppercase tracking-widest hover:border-green-300 hover:text-green-600 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">history</span>
                      还原
                    </button>
                    <button 
                      onClick={() => { if(confirm('确定要永久删除此档案吗？此操作无法撤销。')) onDocPermanentDelete(doc.id); }}
                      className="size-10 flex items-center justify-center rounded-xl bg-red-50 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="永久删除"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 底部装饰 */}
        <div className="pt-20 border-t border-black/5 text-center opacity-10 select-none">
          <span className="material-symbols-outlined text-[100px]">history_edu</span>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-4">ClioNote Archival Intelligence</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
