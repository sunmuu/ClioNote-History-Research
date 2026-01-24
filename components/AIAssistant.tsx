import React, { useState, useEffect } from 'react';
import { getHistoricalSummary, analyzeTimelineContext } from '../geminiService';
import { TimelineEvent, ThemeMode } from '../types';

type AITab = 'individual' | 'timeline' | 'history';

interface HistoryItem {
  id: string;
  type: 'individual' | 'timeline';
  title: string;
  content: string;
  timestamp: string;
}

interface AIAssistantProps {
  themeMode: ThemeMode;
  docContent: string;
  docTitle?: string;
  filteredEvents: TimelineEvent[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ themeMode, docContent, docTitle, filteredEvents }) => {
  const [activeTab, setActiveTab] = useState<AITab>('individual');
  const [individualResult, setIndividualResult] = useState<string | null>(null);
  const [timelineResult, setTimelineResult] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  const isFan = themeMode === ThemeMode.FAN;
  const isHist = themeMode === ThemeMode.HISTORICAL;
  const isReview = themeMode === ThemeMode.REVIEW;

  // 每次切换文档，重置单篇分析视图
  useEffect(() => {
    setIndividualResult(null);
  }, [docContent]);

  const addHistory = (type: 'individual' | 'timeline', title: string, content: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      type,
      title,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const handleIndividualAnalyze = async () => {
    if (!docContent || loading) return;
    setLoading(true);
    const result = await getHistoricalSummary(docContent, themeMode);
    if (result) {
      setIndividualResult(result);
      addHistory('individual', docTitle || '当前文献', result);
    }
    setLoading(false);
  };

  const handleTimelineAnalyze = async () => {
    if (filteredEvents.length === 0 || loading) return;
    setLoading(true);
    const result = await analyzeTimelineContext(filteredEvents, themeMode);
    if (result) {
      setTimelineResult(result);
      addHistory('timeline', `时间轴全景 (${filteredEvents.length}节点)`, result);
    }
    setLoading(false);
  };

  const tabConfig = {
    individual: {
      label: isReview ? '学术元分析' : isFan ? '旨归 / 糖点' : isHist ? '旨归 / 研判' : '单件分析',
      icon: isReview ? 'article' : 'psychology'
    },
    timeline: {
      label: isReview ? '学术史综述' : isFan ? '羁绊 / 连结' : isHist ? '纵横 / 比对' : '趋势洞察',
      icon: isReview ? 'account_tree' : 'hub'
    },
    history: {
      label: isFan ? '时光 / 记录' : isHist ? '研判 / 录' : '研判录',
      icon: 'history'
    }
  };

  return (
    <div className={`w-80 border-l flex flex-col overflow-hidden shrink-0 transition-colors shadow-2xl z-[130] ${
      isFan ? 'bg-pink-50 border-pink-100' : 
      isHist ? 'bg-[#FDFBF7] border-[#DCD3C1]' : 
      isReview ? 'bg-slate-review-50 border-slate-review-200' :
      'bg-white border-border-muted'
    }`}>
      {/* Tabs */}
      <div className="flex border-b border-black/5 bg-white/40 backdrop-blur-sm">
        {(['individual', 'timeline', 'history'] as AITab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all relative ${
              activeTab === tab 
                ? (isFan ? 'text-pink-600' : isHist ? 'text-[#8C7456]' : isReview ? 'text-slate-review-700' : 'text-charcoal') 
                : 'text-ash/40 hover:text-ash'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tabConfig[tab].icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{tabConfig[tab].label}</span>
            {activeTab === tab && (
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                isFan ? 'bg-pink-500' : isHist ? 'bg-[#8C7456]' : isReview ? 'bg-slate-review-600' : 'bg-charcoal'
              }`} />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'individual' && (
          <div className="p-5 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black opacity-30 uppercase tracking-tighter">当前研判对象</span>
              <h4 className={`text-sm font-bold truncate ${isHist ? 'font-serif' : ''}`}>{docTitle || '未选择文献'}</h4>
            </div>

            {individualResult ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className={`p-5 rounded-2xl border text-[13px] leading-relaxed shadow-sm ${
                  isFan ? 'bg-white border-pink-100' : isHist ? 'bg-white border-[#DCD3C1] font-serif' : isReview ? 'bg-white border-slate-review-200' : 'bg-white border-black/5'
                }`}>
                  <p className="whitespace-pre-wrap">{individualResult}</p>
                </div>
                <button onClick={() => setIndividualResult(null)} className="mt-4 text-[10px] font-bold opacity-30 hover:opacity-100 transition-opacity underline decoration-dotted">重新研判</button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center gap-6 py-12 px-4 border-2 border-dashed border-black/5 rounded-3xl">
                <div className="size-16 rounded-full bg-black/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] opacity-20">{isReview ? 'article' : 'history_edu'}</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold opacity-60 mb-2">{isReview ? '自动梳理论点与方法论' : isFan ? '深度挖掘此处的糖点与暗线' : isHist ? '对此文献进行史学旨归研判' : '开始智能摘要研判'}</p>
                  <p className="text-[9px] opacity-30 italic leading-relaxed">AI 将根据当前内容，结合{isReview ? '学术规范' : '时代背景'}提供研究综述</p>
                </div>
                <button 
                  disabled={loading || !docContent}
                  onClick={handleIndividualAnalyze}
                  className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-30 ${
                    isFan ? 'bg-pink-500 text-white' : isHist ? 'bg-[#8C7456] text-white' : isReview ? 'bg-slate-review-600 text-white' : 'bg-charcoal text-white'
                  }`}
                >
                  {loading ? '研判中...' : '开始研判'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="p-5 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black opacity-30 uppercase tracking-tighter">{isReview ? '学术演变脉络' : '时间轴全景分析'}</span>
              <h4 className="text-sm font-bold">已加载 {filteredEvents.length} 个分析节点</h4>
            </div>

            {timelineResult ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className={`p-5 rounded-2xl border text-[13px] leading-relaxed shadow-sm ${
                  isFan ? 'bg-white border-pink-100' : isHist ? 'bg-white border-[#DCD3C1] font-serif' : isReview ? 'bg-white border-slate-review-200' : 'bg-white border-black/5'
                }`}>
                  <h5 className="text-[10px] font-black mb-3 opacity-40 border-b pb-2 uppercase tracking-widest">{isReview ? '学术脉络分析报告' : '纵横比对洞察报告'}</h5>
                  <p className="whitespace-pre-wrap">{timelineResult}</p>
                </div>
                <button onClick={() => setTimelineResult(null)} className="mt-4 text-[10px] font-bold opacity-30 hover:opacity-100 transition-opacity underline decoration-dotted">重新生成全局分析</button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center gap-6 py-12 px-4 border-2 border-dashed border-black/5 rounded-3xl">
                <div className="size-16 rounded-full bg-black/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] opacity-20">{isReview ? 'account_tree' : 'analytics'}</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold opacity-60 mb-2">{isReview ? '识别范式转移与研究空白' : isFan ? '扫描全线，寻找情感升华点' : isHist ? '综合多方史料，研判历史脉络' : '分析时间轴全局特征'}</p>
                  <p className="text-[9px] opacity-30 italic leading-relaxed">AI 将读取当前筛选出的所有节点，分析其{isReview ? '学术关联' : '因果链条'}与宏观趋势</p>
                </div>
                <button 
                  disabled={loading || filteredEvents.length === 0}
                  onClick={handleTimelineAnalyze}
                  className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-30 ${
                    isFan ? 'bg-pink-500 text-white' : isHist ? 'bg-[#5B554D] text-white' : isReview ? 'bg-slate-review-600 text-white' : 'bg-charcoal text-white'
                  }`}
                >
                  {loading ? '全景扫描中...' : (isReview ? '开始综述分析' : '启动纵横比对')}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4 flex flex-col gap-4">
            {history.length === 0 ? (
              <div className="py-20 text-center opacity-20">
                <span className="material-symbols-outlined text-4xl mb-4">history_toggle_off</span>
                <p className="text-[10px] font-bold uppercase tracking-widest">暂无研判记录</p>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} className="p-4 rounded-xl border border-black/5 bg-white shadow-sm flex flex-col gap-2 hover:border-black/20 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                      item.type === 'individual' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                    }`}>
                      {item.type === 'individual' ? '旨归' : '纵横'}
                    </span>
                    <span className="text-[8px] font-black opacity-20 group-hover:opacity-100">{item.timestamp}</span>
                  </div>
                  <h5 className={`text-[11px] font-bold truncate ${isHist ? 'font-serif' : ''}`}>{item.title}</h5>
                  <p className="text-[10px] text-ash line-clamp-3 leading-relaxed opacity-60 group-hover:opacity-100">{item.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-black/[0.02] border-t border-black/5 text-center">
        <p className={`text-[8px] font-black uppercase tracking-[0.2em] opacity-20 ${isHist ? 'font-serif' : ''}`}>
          ClioNote AI 研究助理 · 核心引擎 v3.0
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;