import React, { useState, useEffect } from 'react';
import { HistoricalDoc, ThemeMode } from '../types';
import { parseHistoricalText } from '../geminiService';

interface IngestModalProps {
  themeMode: ThemeMode;
  initialDoc?: HistoricalDoc;
  onClose: () => void;
  onSave: (doc: HistoricalDoc) => void;
}

const IngestModal: React.FC<IngestModalProps> = ({ themeMode, initialDoc, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [lunarDate, setLunarDate] = useState('');
  const [solarDate, setSolarDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const isFan = themeMode === ThemeMode.FAN;
  const isHist = themeMode === ThemeMode.HISTORICAL;
  const isReview = themeMode === ThemeMode.REVIEW;

  // 如果是编辑模式，初始化字段
  useEffect(() => {
    if (initialDoc) {
      setContent(initialDoc.content.join('\n'));
      setTitle(initialDoc.title);
      setSource(initialDoc.source);
      setLunarDate(initialDoc.lunarDate);
      setSolarDate(initialDoc.solarDate);
      setImageUrl(initialDoc.imageUrl || '');
      setTags(initialDoc.tags);
    }
  }, [initialDoc]);

  const handleAISmartParse = async () => {
    if (!content.trim()) return;
    setIsParsing(true);
    const parsed = await parseHistoricalText(content, themeMode);
    if (parsed) {
      setTitle(parsed.title || '');
      setSource(parsed.source || '');
      setLunarDate(parsed.lunarDate || '');
      setSolarDate(parsed.solarDate || '');
      // 合并现有标签并去重
      const mergedTags = Array.from(new Set([...tags, ...(parsed.tags || [])]));
      setTags(mergedTags);
    }
    setIsParsing(false);
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    const newDoc: HistoricalDoc = {
      id: initialDoc?.id || `doc-${Date.now()}`,
      title: title || '未命名档案',
      source: source || '未知来源',
      solarDate: solarDate || '未知',
      lunarDate: lunarDate || '未知',
      content: content.split('\n').filter(p => p.trim() !== ''),
      tags: tags,
      imageUrl: imageUrl || 'https://picsum.photos/id/400/800/600',
      originMode: initialDoc?.originMode || themeMode, // 维持原始模式
      isDeleted: initialDoc?.isDeleted || false
    };
    onSave(newDoc);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 transition-all duration-300">
      <div className={`w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col border transition-all animate-in zoom-in-95 duration-300 ${
        isFan ? 'bg-[#FFF9FB] border-pink-100' : 
        isHist ? 'bg-[#FDFBF7] border-[#D1CEC4]' : 
        isReview ? 'bg-slate-review-50 border-slate-review-200' :
        'bg-white border-black/10'
      }`}>
        {/* Header */}
        <div className={`px-10 py-6 border-b flex justify-between items-center ${
          isFan ? 'bg-pink-50 border-pink-100' : 
          isHist ? 'bg-[#F2EFE8] border-[#D1CEC4]' : 
          isReview ? 'bg-slate-review-100 border-slate-review-200' :
          'bg-white border-black/5'
        }`}>
          <div className="flex flex-col gap-1">
            <h2 className={`text-2xl font-black flex items-center gap-3 ${
              isHist ? 'font-serif text-[#3A352F]' : 
              isFan ? 'text-pink-600' : 
              isReview ? 'text-slate-review-700' : 
              'text-charcoal'
            }`}>
              <span className="material-symbols-outlined text-[28px]">
                {initialDoc ? 'edit_note' : (isFan ? 'favorite' : isReview ? 'library_books' : 'history_edu')}
              </span>
              {initialDoc ? '修改案卷详情' : (isFan ? '入坑记录安利' : isReview ? '录入综述文献' : '录入新史料卷宗')}
            </h2>
            <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest pl-10">
              {initialDoc ? `正在更新档案 ID: ${initialDoc.id}` : '创建一份新的数字化研究存根'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-all">
            <span className="material-symbols-outlined text-[24px] text-ash">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-ash/60 uppercase tracking-widest">
                {isFan ? '文本详情' : isReview ? '文献原文/摘要' : '原始史料文本'}
              </label>
              <span className="text-[10px] font-bold opacity-20">{content.length} 字符</span>
            </div>
            <textarea
              className={`flex-1 min-h-[400px] w-full border-2 rounded-2xl p-6 text-lg leading-loose focus:ring-4 transition-all resize-none placeholder:italic placeholder:opacity-20 ${
                isHist ? 'font-serif bg-[#FDFBF7] border-[#DCD3C1] focus:ring-[#8C7456]/10 focus:border-[#8C7456]' : 
                isFan ? 'bg-white border-pink-100 focus:ring-pink-50 focus:border-pink-400' : 
                isReview ? 'bg-white border-slate-review-200 focus:ring-slate-review-100 focus:border-slate-review-600' :
                'bg-black/5 border-black/10 focus:ring-charcoal/5 focus:border-charcoal'
              }`}
              placeholder={isFan ? "请在此描述那些令人难忘的名场面..." : isReview ? "请粘贴学术文献原文、摘要或研究评论..." : "请在此输入或粘贴原始文献、碑刻拓片或地方志文本..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              onClick={handleAISmartParse}
              disabled={isParsing || !content}
              className={`w-full flex items-center justify-center gap-3 py-4 text-white rounded-xl text-sm font-black shadow-lg transition-all active:scale-95 disabled:opacity-30 ${
                isFan ? 'bg-pink-500 hover:bg-pink-600' : 
                isHist ? 'bg-[#5B554D] hover:bg-[#4A453E]' : 
                isReview ? 'bg-slate-review-600 hover:bg-slate-review-700' :
                'bg-charcoal hover:bg-black'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isParsing ? 'animate-spin' : ''}`}>
                {isParsing ? 'progress_activity' : 'auto_awesome'}
              </span>
              {isParsing ? 'AI 正在研读解析...' : 'AI 智能提取元数据'}
            </button>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ash/60 uppercase tracking-widest block">
                  {isFan ? '标题' : isReview ? '文献标题' : '研究标题'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full border-2 rounded-xl p-3 text-sm transition-all focus:ring-4 ${
                    isHist ? 'font-serif bg-white border-[#DCD3C1] focus:ring-[#8C7456]/10 focus:border-[#8C7456]' : 
                    isReview ? 'bg-white border-slate-review-200 focus:ring-slate-review-100 focus:border-slate-review-600' :
                    'bg-white border-black/5 focus:border-charcoal'
                  }`}
                  placeholder={isFan ? "起个好听的名字" : isReview ? "文献完整题目" : "例如：万历五年夺情疏"}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ash/60 uppercase tracking-widest block">
                  {isReview ? '出版/载体' : '文献出处'}
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className={`w-full border-2 rounded-xl p-3 text-sm transition-all focus:ring-4 ${
                    isHist ? 'font-serif bg-white border-[#DCD3C1] focus:ring-[#8C7456]/10 focus:border-[#8C7456]' : 
                    isReview ? 'bg-white border-slate-review-200 focus:ring-slate-review-100 focus:border-slate-review-600' :
                    'bg-white border-black/5 focus:border-charcoal'
                  }`}
                  placeholder={isReview ? "期刊名称/著作信息" : "例如：《明实录》卷三十"}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ash/60 uppercase tracking-widest block">
                    {isReview ? '卷号/期号' : '原始纪年'}
                  </label>
                  <input
                    type="text"
                    value={lunarDate}
                    onChange={(e) => setLunarDate(e.target.value)}
                    className={`w-full border-2 rounded-xl p-3 text-sm transition-all focus:ring-4 ${
                      isHist ? 'font-serif bg-white border-[#DCD3C1] focus:ring-[#8C7456]/10 focus:border-[#8C7456]' : 
                      isReview ? 'bg-white border-slate-review-200 focus:ring-slate-review-100 focus:border-slate-review-600' :
                      'bg-white border-black/5 focus:border-charcoal'
                    }`}
                    placeholder={isReview ? "Vol.X No.Y" : "如：万历元年"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ash/60 uppercase tracking-widest block">
                    {isReview ? '出版年份' : '公历对照'}
                  </label>
                  <input
                    type="text"
                    value={solarDate}
                    onChange={(e) => setSolarDate(e.target.value)}
                    className={`w-full border-2 rounded-xl p-3 text-sm transition-all focus:ring-4 ${
                      isHist ? 'font-serif bg-white border-[#DCD3C1] focus:ring-[#8C7456]/10 focus:border-[#8C7456]' : 
                      isReview ? 'bg-white border-slate-review-200 focus:ring-slate-review-100 focus:border-slate-review-600' :
                      'bg-white border-black/5 focus:border-charcoal'
                    }`}
                    placeholder="如：2023"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ash/60 uppercase tracking-widest block">
                  {isReview ? '封面图/配图' : '影印本/插图 URL'}
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={`w-full border-2 rounded-xl p-3 text-xs transition-all focus:ring-4 ${
                    isHist ? 'bg-white border-[#DCD3C1] focus:ring-[#8C7456]/10 focus:border-[#8C7456]' : 
                    isReview ? 'bg-white border-slate-review-200 focus:ring-slate-review-100 focus:border-slate-review-600' :
                    'bg-white border-black/5 focus:border-charcoal'
                  }`}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-ash/60 uppercase tracking-widest block">研究分类标签</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className={`group flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black border-2 rounded-lg shadow-sm transition-all hover:brightness-95 cursor-default ${
                    isFan ? 'bg-pink-50 text-pink-500 border-pink-100' : 
                    isHist ? 'bg-[#5B554D]/5 text-[#3A352F] border-[#DCD3C1]' : 
                    isReview ? 'bg-slate-review-100 text-slate-review-700 border-slate-review-200' :
                    'bg-black/5 text-charcoal border-black/5'
                  }`}>
                    #{tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
                
                <div className="flex items-center gap-2 mt-1 w-full">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="输入新标签..."
                    className={`flex-1 text-[10px] border-none rounded-lg p-2 focus:ring-0 placeholder:opacity-40 transition-all ${
                      isHist ? 'bg-white font-serif' : isReview ? 'bg-white' : 'bg-black/5'
                    }`}
                  />
                  <button 
                    onClick={handleAddTag}
                    title="点击添加标签"
                    className={`size-8 flex items-center justify-center rounded-lg transition-colors shadow-sm active:scale-90 ${
                      isFan ? 'bg-pink-500 text-white' : 
                      isHist ? 'bg-[#5B554D] text-white' : 
                      isReview ? 'bg-slate-review-600 text-white' :
                      'bg-charcoal text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>

                {tags.length === 0 && !newTagInput && (
                  <p className="text-[10px] italic opacity-20">暂无标签，建议使用 AI 解析自动提取</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-10 py-8 border-t flex justify-end gap-6 ${
          isFan ? 'bg-pink-50 border-pink-100' : 
          isHist ? 'bg-[#F2EFE8] border-[#D1CEC4]' : 
          isReview ? 'bg-slate-review-100 border-slate-review-200' :
          'bg-black/[0.02] border-black/5'
        }`}>
          <button onClick={onClose} className="px-8 py-3 text-sm text-ash font-black uppercase tracking-widest hover:text-charcoal transition-all">
            放弃
          </button>
          <button
            onClick={handleSave}
            disabled={!content || !title}
            className={`px-12 py-3 text-white text-sm font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl transition-all active:scale-95 disabled:opacity-20 ${
              isFan ? 'bg-pink-500 hover:bg-pink-600' : 
              isHist ? 'bg-[#5B554D] hover:bg-[#4A453E]' : 
              isReview ? 'bg-slate-review-600 hover:bg-slate-review-700' :
              'bg-charcoal hover:bg-black'
            }`}
          >
            {initialDoc ? '保存并更新' : '正式入档'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IngestModal;