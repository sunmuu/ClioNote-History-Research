
import React, { useState, useMemo } from 'react';
import { ResearchTopic, HistoricalDoc, ThemeMode } from '../types';

interface TopicManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic: ResearchTopic;
  allDocs: Record<string, HistoricalDoc>;
  onUpdateTopic: (topicId: string, updates: Partial<ResearchTopic>) => void;
  themeMode: ThemeMode;
}

const TopicManagerModal: React.FC<TopicManagerModalProps> = ({
  isOpen,
  onClose,
  currentTopic,
  allDocs,
  onUpdateTopic,
  themeMode
}) => {
  const [tempName, setTempName] = useState(currentTopic.name);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const isFan = themeMode === ThemeMode.FAN;
  const isHist = themeMode === ThemeMode.HISTORICAL;

  // 搜索并过滤掉已经在课题中的档案
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return Object.values(allDocs).filter(doc => {
      // 排除已删除或已在课题中的档案
      if (doc.isDeleted || currentTopic.docIds.includes(doc.id)) return false;
      
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.tags.some(t => t.toLowerCase().includes(q)) ||
        doc.content.some(c => c.toLowerCase().includes(q))
      );
    });
  }, [allDocs, searchQuery, currentTopic.docIds]);

  const handleToggleSelect = (docId: string) => {
    setSelectedDocIds(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleSaveName = () => {
    if (tempName.trim() && tempName !== currentTopic.name) {
      onUpdateTopic(currentTopic.id, { name: tempName.trim() });
    }
  };

  const handleAddSelected = () => {
    if (selectedDocIds.length > 0) {
      const newDocIds = Array.from(new Set([...currentTopic.docIds, ...selectedDocIds]));
      onUpdateTopic(currentTopic.id, { docIds: newDocIds });
      setSelectedDocIds([]);
      setSearchQuery('');
      alert(`成功将 ${selectedDocIds.length} 份档案加入课题！`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className={`w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col border transition-all animate-in zoom-in-95 duration-300 ${
        isFan ? 'bg-[#FFF9FB] border-pink-100' : isHist ? 'bg-[#FDFBF7] border-[#D1CEC4]' : 'bg-white border-black/10'
      }`}>
        {/* Header */}
        <div className={`px-8 py-5 border-b flex justify-between items-center shrink-0 ${
          isFan ? 'bg-pink-50 border-pink-100' : isHist ? 'bg-[#F2EFE8] border-[#D1CEC4]' : 'bg-white border-black/5'
        }`}>
          <div className="flex flex-col gap-0.5">
            <h2 className={`text-xl font-black flex items-center gap-2.5 ${isHist ? 'font-serif text-[#3A352F]' : isFan ? 'text-pink-600' : 'text-charcoal'}`}>
              <span className="material-symbols-outlined text-[24px]">folder_managed</span>
              管理研究课题
            </h2>
            <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest pl-9">
              配置课题元数据与批量收录档案
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-all text-ash">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10 custom-scrollbar">
          
          {/* Section 1: 重命名 */}
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black text-ash/60 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">edit</span>
              课题基本信息
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="请输入课题名称..."
                className={`flex-1 border-2 rounded-xl px-4 py-2.5 text-sm transition-all focus:ring-4 ${
                  isHist ? 'font-serif bg-white border-[#DCD3C1] focus:ring-[#8C7456]/10 focus:border-[#8C7456]' : 'bg-white border-black/5 focus:border-charcoal'
                }`}
              />
              <button 
                onClick={handleSaveName}
                disabled={!tempName.trim() || tempName === currentTopic.name}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm transition-all disabled:opacity-20 ${
                  isFan ? 'bg-pink-500 text-white' : isHist ? 'bg-[#5B554D] text-white' : 'bg-charcoal text-white'
                }`}
              >
                保存名称
              </button>
            </div>
          </div>

          {/* Section 2: 批量收录 */}
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black text-ash/60 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add_task</span>
              批量收录档案
            </label>
            
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-ash/30 group-focus-within:text-charcoal transition-colors">search</span>
              <input 
                type="text"
                placeholder="搜索档案标题、标签或内容进行关联..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 text-sm transition-all focus:ring-0 ${
                  isHist ? 'bg-white border-[#DCD3C1] font-serif focus:border-[#8C7456]' : 
                  isFan ? 'bg-white border-pink-100 focus:border-pink-400' : 
                  'bg-black/5 border-transparent focus:bg-white focus:border-charcoal'
                }`}
              />
            </div>

            {/* 搜索结果列表 */}
            <div className={`min-h-[200px] max-h-[300px] overflow-y-auto border-2 rounded-2xl p-2 flex flex-col gap-1 transition-colors ${
              isHist ? 'bg-white/50 border-[#DCD3C1]' : 'bg-black/5 border-transparent'
            }`}>
              {searchResults.length > 0 ? searchResults.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => handleToggleSelect(doc.id)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedDocIds.includes(doc.id) 
                      ? (isFan ? 'bg-pink-50 border border-pink-200' : 'bg-blue-50 border border-blue-200')
                      : 'hover:bg-white border border-transparent'
                  }`}
                >
                  <div className={`size-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedDocIds.includes(doc.id)
                      ? (isFan ? 'bg-pink-500 border-pink-500' : 'bg-blue-500 border-blue-500')
                      : 'bg-white border-black/10'
                  }`}>
                    {selectedDocIds.includes(doc.id) && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{doc.title}</div>
                    <div className="text-[10px] opacity-40 flex items-center gap-2">
                      <span>{doc.source}</span>
                      <span>·</span>
                      <span>{doc.solarDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {doc.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/5 opacity-40">#{tag}</span>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-10">
                  <span className="material-symbols-outlined text-[40px] mb-2">{searchQuery ? 'search_off' : 'manage_search'}</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest">{searchQuery ? '无匹配结果' : '输入关键词寻找档案'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-6 border-t flex justify-between items-center shrink-0 ${
          isFan ? 'bg-pink-50 border-pink-100' : isHist ? 'bg-[#F2EFE8] border-[#D1CEC4]' : 'bg-black/[0.02] border-black/5'
        }`}>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">已选待收录:</span>
             <span className={`text-sm font-black ${selectedDocIds.length > 0 ? (isFan ? 'text-pink-600' : 'text-blue-600') : 'opacity-20'}`}>
                {selectedDocIds.length} 份档案
             </span>
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-2 text-sm text-ash font-black uppercase tracking-widest hover:text-charcoal transition-all">
              取消
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedDocIds.length === 0}
              className={`px-10 py-3 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-20 ${
                isFan ? 'bg-pink-500 hover:bg-pink-600' : 
                isHist ? 'bg-[#5B554D] hover:bg-[#4A453E]' : 
                'bg-charcoal hover:bg-black'
              }`}
            >
              确 认 收 录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicManagerModal;
