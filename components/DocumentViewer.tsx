import React, { useState, useRef, useEffect } from 'react';
import { HistoricalDoc, ThemeMode, ResearchTopic } from '../types';

interface DocumentViewerProps {
  themeMode: ThemeMode;
  doc: HistoricalDoc | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  themes?: ResearchTopic[]; // 接收 App.tsx 传来的 researchTopics
  onToggleDocInTheme?: (themeId: string, docId: string) => void;
  onAddTheme?: (name: string) => string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  themeMode, 
  doc, 
  onEdit, 
  onDelete, 
  onClose,
  themes = [], 
  onToggleDocInTheme, 
  onAddTheme 
}) => {
  const isFan = themeMode === ThemeMode.FAN;
  const isHist = themeMode === ThemeMode.HISTORICAL;
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭课题选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowThemePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!doc) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-10 select-none opacity-10 ${
        isFan ? 'text-pink-600' : isHist ? 'text-[#5B554D]' : 'text-charcoal'
      }`}>
        <span className="material-symbols-outlined text-[120px] mb-6">
          {isFan ? 'favorite' : isHist ? 'auto_stories' : 'inventory_2'}
        </span>
        <p className={`text-xl font-bold tracking-[0.2em] uppercase ${isHist ? 'font-serif' : ''}`}>
          {isFan ? '等待糖点掉落' : isHist ? '待调阅档案文献' : '待选档案详情'}
        </p>
      </div>
    );
  }

  const docInThemes = themes.filter(t => t.docIds.includes(doc.id));

  const handleCreateAndAdd = () => {
    if (newTopicInput.trim() && onAddTheme && onToggleDocInTheme) {
      const id = onAddTheme(newTopicInput);
      onToggleDocInTheme(id, doc.id);
      setNewTopicInput('');
    }
  };

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto p-12 relative transition-colors ${
      isFan ? 'bg-[#FFF9FB]' : isHist ? 'bg-[#FCFAF7]' : 'bg-white'
    }`}>
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-ash/40 font-bold text-[10px] tracking-[0.2em] uppercase">
            <span className="material-symbols-outlined text-[16px]">
              {isFan ? 'auto_awesome' : isHist ? 'content_paste_search' : 'file_open'}
            </span> 
            {isFan ? '绝美名场面存证' : isHist ? '档案文献存根' : '档案原始存根'}
          </div>
          
          <div className="flex items-center gap-3">
            {/* 标签展示 */}
            <div className="flex flex-wrap gap-2 mr-4">
              {doc.tags.map(tag => (
                <span key={tag} className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
                  isFan ? 'bg-pink-100 text-pink-600' : isHist ? 'bg-[#F2EFE8] text-[#3A352F]' : 'bg-charcoal/5 text-charcoal'
                }`}>
                  #{tag}
                </span>
              ))}
            </div>

            {/* 课题管理 */}
            <div className="relative" ref={pickerRef}>
              <button 
                onClick={() => setShowThemePicker(!showThemePicker)}
                title="管理所属研究课题"
                className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${
                  docInThemes.length > 0 
                    ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' 
                    : 'border-black/5 text-ash/60 hover:text-charcoal hover:bg-black/5'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                {docInThemes.length > 0 && <span className="text-[10px] font-black">{docInThemes.length}</span>}
              </button>
              
              {showThemePicker && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-black/10 shadow-2xl rounded-2xl p-4 z-[250] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col gap-1 mb-3">
                    <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">收录至研究课题</span>
                    <p className="text-[9px] text-ash italic">勾选即可将档案关联至特定工作区</p>
                  </div>
                  
                  <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar mb-4 pr-1">
                    {themes.map(t => (
                      <div 
                        key={t.id}
                        onClick={() => onToggleDocInTheme?.(t.id, doc.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                          t.docIds.includes(doc.id) 
                            ? 'bg-blue-50 text-blue-700 font-bold' 
                            : 'hover:bg-black/5 text-ash'
                        }`}
                      >
                        <span className="text-xs truncate">{t.name}</span>
                        {t.docIds.includes(doc.id) && (
                          <span className="material-symbols-outlined text-[16px] text-blue-500">check_circle</span>
                        )}
                      </div>
                    ))}
                    {themes.length === 0 && (
                      <div className="py-6 text-center text-[10px] font-bold opacity-20">尚未创建任何课题</div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-black/5 flex gap-1">
                    <input 
                      type="text" 
                      placeholder="新建课题..."
                      value={newTopicInput}
                      onChange={(e) => setNewTopicInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
                      className="flex-1 text-[10px] border-none bg-black/5 rounded-lg p-2 focus:ring-0 placeholder:opacity-40"
                    />
                    <button 
                      onClick={handleCreateAndAdd}
                      className="size-8 flex items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 编辑/删除/收起按钮组 */}
            <div className="flex gap-2">
              <button 
                onClick={onEdit}
                title="编辑档案元数据"
                className="p-2 rounded-lg border border-black/5 hover:bg-black/5 transition-all text-ash/60 hover:text-charcoal"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
              </button>
              
              {/* 删除按钮：移除 sandbox 禁止的 confirm，直接调用回调 */}
              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  console.log('点击了删除按钮');
                  onDelete?.(); 
                }}
                title="删除档案"
                className="p-2 rounded-lg border border-black/5 hover:bg-red-50 transition-all text-ash/60 hover:text-red-500"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
              
              <div className="h-6 w-[1px] bg-black/5 mx-1"></div>
              
              {/* 收起按钮：正确绑定 onClose */}
              <button 
                onClick={onClose}
                title="收起详情页"
                className="p-2 rounded-lg border border-black/5 hover:bg-black/5 transition-all text-ash/60 hover:text-charcoal"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* 标题 */}
        <h1 className={`text-3xl font-black mb-8 leading-tight tracking-tight ${
          isHist ? 'font-serif text-[#3A352F]' : isFan ? 'text-pink-600' : 'text-charcoal'
        }`}>{doc.title}</h1>
        
        {/* 元数据矩阵 */}
        <div className={`grid grid-cols-3 gap-8 mb-12 border-y py-8 ${
          isFan ? 'border-pink-100' : isHist ? 'border-[#D1CEC4]' : 'border-border-muted'
        }`}>
          <div>
            <p className="text-[9px] font-black opacity-40 uppercase mb-2 tracking-widest">
              {isFan ? '出处 / Source' : '文献出处 / Source'}
            </p>
            <p className={`text-sm font-bold ${isHist ? 'font-serif text-[#3A352F]' : ''}`}>{doc.source}</p>
          </div>
          <div>
            <p className="text-[9px] font-black opacity-40 uppercase mb-2 tracking-widest">
              {isFan ? '时间轴 / Moment' : '时序标识 / Chronology'}
            </p>
            <p className={`text-sm font-bold ${isHist ? 'font-serif text-[#3A352F]' : ''}`}>{doc.solarDate}</p>
          </div>
          <div>
            <p className="text-[9px] font-black opacity-40 uppercase mb-2 tracking-widest">
              {isFan ? '氛围 / Context' : '原始参照 / Context'}
            </p>
            <p className={`text-sm font-bold ${isHist ? 'font-serif text-[#3A352F]' : ''}`}>{doc.lunarDate}</p>
          </div>
        </div>

        {/* 已归属课题标签组 */}
        {docInThemes.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2">
            {docInThemes.map(t => (
              <span key={t.id} className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-2.5 py-1.5 rounded-full bg-blue-500/5 text-blue-600 border border-blue-500/10">
                <span className="material-symbols-outlined text-[12px]">folder_open</span>
                {t.name}
              </span>
            ))}
          </div>
        )}

        {/* 正文内容 */}
        <div className={`space-y-8 mb-20 ${isHist ? 'font-serif text-lg leading-relaxed text-[#3A352F]' : 'text-base leading-relaxed'}`}>
          {doc.content.map((p, idx) => (
            <p key={idx} className="opacity-90">{p}</p>
          ))}
        </div>

        {/* 附件/插图 */}
        <div className={`pt-12 border-t ${isFan ? 'border-pink-100' : isHist ? 'border-[#D1CEC4]' : 'border-border-muted'}`}>
          <div className="flex items-center justify-between mb-8">
             <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
               <span className="material-symbols-outlined text-[18px]">photo_library</span> 
               {isFan ? '直击现场 / 插画' : isHist ? '影印本 / 附件扫描件' : '档案附件'}
             </h4>
          </div>
          <div className="relative group rounded-2xl overflow-hidden border border-black/5 aspect-video bg-black/5 shadow-inner">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105" 
              style={{ backgroundImage: `url('${doc.imageUrl}')` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest">点击预览大图</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;