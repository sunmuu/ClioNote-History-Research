import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HistoricalDoc, TimelineEvent, ThemeMode, ResearchTopic } from '../types';
import TimelineItem from './TimelineItem';
import DocumentViewer from './DocumentViewer';
import AIAssistant from './AIAssistant';
import * as htmlToImage from 'html-to-image';

interface WorkbenchProps {
  themeMode: ThemeMode;
  activeDoc: HistoricalDoc | null;
  filteredEvents: TimelineEvent[];
  onEventSelect: (docId: string) => void;
  selectedTags: string[];
  onDocEdit: (doc: HistoricalDoc) => void;
  onDocDelete: (docId: string) => void;
  themes: ResearchTopic[];
  onToggleDocInTheme: (themeId: string, docId: string) => void;
  onAddTheme: (name: string) => string;
}

type Orientation = 'vertical' | 'horizontal';
type SplitBy = 'none' | 'People' | 'Topics';
type ExportFormat = 'png' | 'pdf' | 'word' | 'excel';

const PEOPLE_TAGS = ['张居正', '万历皇帝', '穆宗', '高拱'];

const Workbench: React.FC<WorkbenchProps> = ({ 
  themeMode, 
  activeDoc, 
  filteredEvents, 
  onEventSelect, 
  selectedTags,
  onDocEdit,
  onDocDelete,
  themes,
  onToggleDocInTheme,
  onAddTheme
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [orientation, setOrientation] = useState<Orientation>('vertical');
  const [splitBy, setSplitBy] = useState<SplitBy>('none');
  
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>(['png']);
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [isPaidUser, setIsPaidUser] = useState(false);
  
  const isHist = themeMode === ThemeMode.HISTORICAL;
  const isFan = themeMode === ThemeMode.FAN;
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsPaidUser(hasKey);
        if (hasKey) setIncludeWatermark(false); 
      }
    };
    checkStatus();
  }, [showExportMenu]);

  const centerScroll = () => {
    const container = scrollContainerRef.current;
    if (container && viewMode === 'timeline') {
      const centerX = (container.scrollWidth - container.clientWidth) / 2;
      const centerY = (container.scrollHeight - container.clientHeight) / 2;
      container.scrollTo({ left: centerX, top: centerY, behavior: 'auto' });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => requestAnimationFrame(centerScroll));
    const canvas = canvasRef.current;
    if (canvas) observer.observe(canvas);
    observer.observe(container);
    const timer = setTimeout(centerScroll, 100);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [viewMode, orientation, filteredEvents.length, activeDoc === null]);

  const runExportTasks = async () => {
    if (!canvasRef.current || isExporting) return;
    setIsExporting(true);
    const timestamp = new Date().toLocaleString();
    const fileName = `ClioNote-${Date.now()}`;
    const sortedData = [...filteredEvents].sort((a, b) => a.year - b.year);
    try {
      for (const format of selectedFormats) {
        if (format === 'png') {
          const forceWatermark = !isPaidUser || includeWatermark;
          let watermark: HTMLDivElement | null = null;
          if (forceWatermark) {
            watermark = document.createElement('div');
            watermark.innerHTML = `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:100px;color:rgba(0,0,0,0.06);font-weight:900;pointer-events:none;z-index:9999;white-space:nowrap;font-family:sans-serif;">CLIONOTE PREVIEW<br/>${timestamp}</div>`;
            canvasRef.current.appendChild(watermark);
          }
          const dataUrl = await htmlToImage.toPng(canvasRef.current, {
            backgroundColor: isHist ? '#F9F7F2' : isFan ? '#FFF5F8' : '#FFFFFF',
            style: { transform: 'scale(1)', padding: '120px' },
            pixelRatio: 2.5,
          });
          const link = document.createElement('a');
          link.download = `${fileName}.png`;
          link.href = dataUrl;
          link.click();
          if (watermark) canvasRef.current.removeChild(watermark);
        }
        if (format === 'excel') {
          const headers = '年份,干支,事件标题,史料摘要,公历对照,标签\n';
          const csvContent = sortedData.map(e => `"${e.year}","${e.era}","${e.title}","${e.description.replace(/"/g, '""')}","${e.solarDate}","${e.tags.join(';')}"`).join('\n');
          const blob = new Blob(['\ufeff' + headers + csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${fileName}.csv`;
          link.click();
        }
        if (format === 'word') {
          const html = `<html><head><meta charset='utf-8'><title>报告</title></head><body><h1>ClioNote 报告 - ${timestamp}</h1>${sortedData.map(e => `<div><h3>${e.title}</h3><p>${e.description}</p></div>`).join('')}</body></html>`;
          const blob = new Blob([html], { type: 'application/msword' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${fileName}.doc`;
          link.click();
        }
        if (format === 'pdf') {
          const dataUrl = await htmlToImage.toPng(canvasRef.current, { backgroundColor: '#FFFFFF', pixelRatio: 2 });
          const win = window.open('', '_blank');
          win?.document.write(`<html><body style="margin:0;"><img src="${dataUrl}" style="width:100%;" onload="window.print();window.close();"></body></html>`);
        }
      }
    } catch (err) {
      alert('导出错误');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const responsiveScale = useMemo(() => activeDoc ? 0.82 : 1.0, [activeDoc]);

  const activeTagsInView = useMemo(() => {
    return new Set(filteredEvents.flatMap(e => e.tags));
  }, [filteredEvents]);

  const availableSplitOptions = useMemo(() => {
    const options: { id: SplitBy; label: string }[] = [{ id: 'none', label: '全局合并' }];
    const activeSelectedTags = selectedTags.filter(t => activeTagsInView.has(t));
    const hasPeople = activeSelectedTags.some(t => PEOPLE_TAGS.includes(t));
    const hasTopics = activeSelectedTags.some(t => !PEOPLE_TAGS.includes(t));
    if (hasPeople && activeSelectedTags.filter(t => PEOPLE_TAGS.includes(t)).length > 1) options.push({ id: 'People', label: '按人物' });
    if (hasTopics && activeSelectedTags.filter(t => !PEOPLE_TAGS.includes(t)).length > 1) options.push({ id: 'Topics', label: '按专题' });
    return options;
  }, [selectedTags, activeTagsInView]);

  const trackTags = useMemo(() => {
    if (splitBy === 'none') return [];
    return selectedTags
      .filter(t => activeTagsInView.has(t))
      .filter(t => splitBy === 'People' ? PEOPLE_TAGS.includes(t) : !PEOPLE_TAGS.includes(t));
  }, [splitBy, selectedTags, activeTagsInView]);

  const timelineTracks = useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) => a.year - b.year);
    if (trackTags.length <= 1) {
      const groups: Record<number, TimelineEvent[]> = {};
      sorted.forEach(e => {
        if (!groups[e.year]) groups[e.year] = [];
        groups[e.year].push(e);
      });
      return [{ id: 'merged', label: '', groups }];
    }
    return trackTags.map(cat => {
      const groups: Record<number, TimelineEvent[]> = {};
      sorted.filter(e => e.tags.includes(cat)).forEach(e => {
        if (!groups[e.year]) groups[e.year] = [];
        groups[e.year].push(e);
      });
      return { id: cat, label: cat, groups };
    });
  }, [filteredEvents, trackTags]);

  const globalYears = useMemo(() => {
    if (filteredEvents.length === 0) return [];
    return Array.from(new Set(filteredEvents.map(e => e.year))).sort((a, b) => a - b);
  }, [filteredEvents]);

  const getTrackGrowthDir = (index: number) => {
    if (splitBy === 'none') return null; 
    return index < Math.ceil(timelineTracks.length / 2); 
  };

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <section className={`flex flex-col border-r relative transition-all duration-700 h-full overflow-hidden shrink-0 shadow-sm z-10 ${
        activeDoc ? 'w-[450px] xl:w-[500px]' : 'flex-1'
      } ${isFan ? 'bg-pink-50/20' : isHist ? 'bg-[#F9F7F2]' : 'bg-white'}`}>
        
        <div className="p-4 flex items-center justify-between border-b border-black/5 z-[60] bg-inherit/90 backdrop-blur-md shrink-0">
          <h2 className={`text-[10px] font-black uppercase tracking-widest px-4 ${isHist ? 'font-serif text-[#3A352F]' : 'text-charcoal'}`}>
             {viewMode === 'list' ? '档案列表' : timelineTracks.length > 1 ? `对勘视角 (${timelineTracks.length})` : '时空轨迹'}
          </h2>
          
          <div className="flex items-center gap-2">
            <div className="relative" ref={exportMenuRef}>
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={filteredEvents.length === 0}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 bg-white shadow-sm hover:bg-black/5 transition-all disabled:opacity-30`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isExporting ? 'animate-spin' : ''}`}>
                  {isExporting ? 'progress_activity' : 'cloud_download'}
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest">导出</span>
              </button>
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-black/10 shadow-2xl rounded-2xl overflow-hidden z-[200]">
                  <div className="p-3 space-y-1">
                    {['word', 'excel', 'pdf', 'png'].map(f => (
                      <label key={f} className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 cursor-pointer group">
                        <input type="checkbox" checked={selectedFormats.includes(f as ExportFormat)} onChange={() => setSelectedFormats(prev => prev.includes(f as ExportFormat) ? prev.filter(x => x !== f) : [...prev, f as ExportFormat])} />
                        <span className="text-xs font-bold">{f.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={runExportTasks} className="w-full p-4 bg-charcoal text-white text-[11px] font-black uppercase tracking-[0.2em]">确认导出</button>
                </div>
              )}
            </div>
            <div className="h-6 w-[1px] bg-black/10 mx-1"></div>
            <div className="flex bg-black/5 p-1 rounded-md">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'opacity-40'}`}><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
              <button onClick={() => setViewMode('timeline')} className={`p-1.5 rounded-md ${viewMode === 'timeline' ? 'bg-white shadow-sm' : 'opacity-40'}`}><span className="material-symbols-outlined text-[18px]">reorder</span></button>
            </div>
          </div>
        </div>
        
        <div ref={scrollContainerRef} className="flex-1 overflow-auto relative custom-scrollbar bg-black/[0.02] min-h-0 scroll-smooth">
          {filteredEvents.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center opacity-40 text-center">
              <span className="material-symbols-outlined text-[100px] mb-6">history_edu</span>
              <p className="text-sm font-black uppercase">请在左侧勾选标签</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="p-6 space-y-3">
              {filteredEvents.map(event => (
                <div key={event.id} onClick={() => onEventSelect(event.docId)} className="p-4 rounded-xl border bg-white border-black/5 cursor-pointer">
                  <h4 className="text-xs font-bold">{event.title}</h4>
                  <p className="text-[9px] opacity-40 mt-1">{event.solarDate} · {event.era}</p>
                </div>
              ))}
            </div>
          ) : (
            <div ref={canvasRef} className={`inline-flex items-start justify-start transition-all duration-700 ${activeDoc ? 'p-[400px]' : 'p-[1000px]'}`}>
              <div className={`flex transition-transform duration-700 origin-top-left ${orientation === 'horizontal' ? 'flex-col' : 'flex-row'}`} style={{ transform: `scale(${zoomLevel * responsiveScale})` }}>
                {timelineTracks.map((track, trackIdx) => {
                  const currentDir = getTrackGrowthDir(trackIdx);
                  let trackGlobalCounter = 0;
                  return (
                    <div key={track.id} className={`relative flex items-center justify-start shrink-0 ${orientation === 'horizontal' ? 'flex-row h-[4px]' : 'flex-col w-[4px]'}`} style={{ [orientation === 'horizontal' ? 'marginBottom' : 'marginRight']: trackIdx < timelineTracks.length - 1 ? '400px' : '0' }}>
                      <div className={`absolute pointer-events-none z-10 ${orientation === 'horizontal' ? 'left-0 right-0 top-1/2 h-[4px] -translate-y-1/2' : 'top-0 bottom-0 left-1/2 w-[4px] -translate-x-1/2'} ${isHist ? 'bg-[#8C7456]' : 'bg-charcoal'} opacity-40 rounded-full`}></div>
                      <div className={`flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'}`}>
                        {globalYears.map((year) => {
                          const items = track.groups[year] || [];
                          return (
                            <div key={year} className={`flex relative items-center justify-center shrink-0 ${orientation === 'horizontal' ? 'w-80 h-4' : 'h-80 w-4'}`}>
                              <div className={`shrink-0 z-30 absolute ${orientation === 'horizontal' ? 'top-1/2 -translate-y-1/2' : 'left-1/2 -translate-x-1/2'}`}>
                                <div className={`px-4 py-1 rounded-full text-[11px] font-black ${isHist ? 'bg-[#5B554D] text-white' : 'bg-charcoal text-white'} ${items.length > 0 ? 'scale-110' : 'scale-75 opacity-20'}`}>{year}</div>
                              </div>
                              {items.length > 0 && (
                                <div className={`absolute flex gap-12 ${orientation === 'horizontal' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'}`}>
                                  {items.map((event) => {
                                    let isToLeftOrTop = splitBy === 'none' ? (trackGlobalCounter++ % 2 === 0) : (currentDir === true);
                                    const directionClass = orientation === 'horizontal' ? (isToLeftOrTop ? 'bottom-full mb-12 flex-col-reverse' : 'top-full mt-12 flex-col') : (isToLeftOrTop ? 'right-full mr-12 flex-row-reverse' : 'left-full ml-12 flex-row');
                                    return (
                                      <div key={event.id} onClick={() => onEventSelect(event.docId)} className={`flex items-center absolute ${directionClass} shrink-0 cursor-pointer z-40`}><TimelineItem themeMode={themeMode} event={event} isReverse={isToLeftOrTop} isHorizontal={orientation === 'horizontal'} isSelected={event.id === selectedEventId} /></div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={`shrink-0 border-t z-[150] shadow-md relative ${isHist ? 'bg-[#F2EFE8]/95' : 'bg-white/95'} backdrop-blur-md`}>
          <div className={`flex items-center justify-between gap-3 px-4 py-3 ${activeDoc ? 'flex-col items-stretch' : 'flex-row'}`}>
            <div className="flex items-center gap-3">
              <div className="flex bg-black/5 p-1 rounded-lg">
                <button onClick={() => setOrientation('vertical')} className={`px-3 py-1.5 rounded text-[10px] font-black ${orientation === 'vertical' ? 'bg-white shadow-sm' : 'opacity-40'}`}>纵</button>
                <button onClick={() => setOrientation('horizontal')} className={`px-3 py-1.5 rounded text-[10px] font-black ${orientation === 'horizontal' ? 'bg-white shadow-sm' : 'opacity-40'}`}>横</button>
              </div>
              <div className="flex items-center bg-black/5 p-1 rounded-lg">
                  <button onClick={() => setZoomLevel(prev => Math.max(0.05, prev - 0.1))} className="size-8 flex items-center justify-center rounded"><span className="material-symbols-outlined text-sm">remove</span></button>
                  <input type="number" value={Math.round(zoomLevel * 100)} onChange={(e) => setZoomLevel(Math.min(2, Math.max(0.01, parseInt(e.target.value) / 100)))} className="w-12 bg-transparent border-none text-[10px] font-black text-center focus:ring-0 p-0" />
                  <button onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))} className="size-8 flex items-center justify-center rounded"><span className="material-symbols-outlined text-sm">add</span></button>
              </div>
            </div>
            {availableSplitOptions.length > 1 && (
              <div className="flex items-center gap-2 bg-white/60 p-1 pl-4 rounded-xl border border-black/10">
                 <span className="text-[9px] font-black opacity-60 uppercase">对勘</span>
                 <select value={splitBy} onChange={(e) => setSplitBy(e.target.value as SplitBy)} className="text-[10px] font-black bg-transparent border-none focus:ring-0 py-1 pl-1 pr-8 cursor-pointer">
                    {availableSplitOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                 </select>
              </div>
            )}
          </div>
        </div>
      </section>

      {activeDoc && (
        <section className="flex-1 flex overflow-hidden bg-white relative shadow-2xl z-[120]">
          {/* 核心修正：显式传递 onDelete 回调 */}
          <DocumentViewer 
            themeMode={themeMode} 
            doc={activeDoc} 
            onEdit={() => onDocEdit(activeDoc)} 
            onDelete={() => {
              console.log('Workbench 接收到删除请求', activeDoc.id);
              onDocDelete(activeDoc.id);
            }} 
            onClose={() => onEventSelect('')}
            themes={themes} 
            onToggleDocInTheme={onToggleDocInTheme} 
            onAddTheme={onAddTheme} 
          />
          {isAiOpen && <AIAssistant themeMode={themeMode} docContent={activeDoc.content.join('\n')} docTitle={activeDoc.title} filteredEvents={filteredEvents} />}
          <button onClick={() => setIsAiOpen(!isAiOpen)} className={`absolute bottom-8 right-8 z-[130] size-14 rounded-2xl shadow-xl flex items-center justify-center ${isAiOpen ? 'bg-charcoal text-white' : 'bg-[#5B554D] text-white'}`}><span className="material-symbols-outlined text-[28px]">{isAiOpen ? 'keyboard_double_arrow_right' : 'auto_awesome'}</span></button>
        </section>
      )}
    </div>
  );
};

export default Workbench;