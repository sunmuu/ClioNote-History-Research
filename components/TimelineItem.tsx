
import React from 'react';
import { TimelineEvent, ThemeMode } from '../types';

interface TimelineItemProps {
  themeMode: ThemeMode;
  event: TimelineEvent;
  isReverse: boolean; 
  isHorizontal?: boolean;
  isSelected?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ 
  themeMode, 
  event, 
  isReverse, 
  isHorizontal = false, 
  isSelected 
}) => {
  const isHist = themeMode === ThemeMode.HISTORICAL;
  const isFan = themeMode === ThemeMode.FAN;

  const getTextColor = () => isFan ? 'text-pink-600' : isHist ? 'text-[#8C7456]' : 'text-charcoal';
  const getBorderColor = () => isSelected ? (isFan ? 'border-pink-500 ring-[8px] ring-pink-100' : 'border-charcoal ring-[8px] ring-black/10') : 'border-black/5';

  return (
    <div className="relative flex flex-col items-center group pointer-events-auto">
      {/* 物理连接杆：确保在绝对定位坐标系中正确对准轴心 */}
      <div 
        className={`absolute pointer-events-none transition-all duration-500 ${
          isSelected ? 'opacity-100 scale-100' : 'opacity-20 group-hover:opacity-60 scale-95'
        } ${getTextColor().replace('text-', 'bg-')} ${
          isHorizontal 
            ? `w-[3px] left-1/2 -translate-x-1/2 ${isReverse ? 'top-full h-12' : 'bottom-full h-12'}`
            : `h-[3px] top-1/2 -translate-y-1/2 ${isReverse ? 'left-full w-12' : 'right-full w-12'}`
        }`}
      ></div>

      {/* 卡片主体 */}
      <div className={`relative z-20 border transition-all duration-500 rounded-2xl bg-white shadow-xl flex flex-col p-8 ${
        isHorizontal 
          ? 'w-64 min-h-[320px]' 
          : 'w-80 min-h-[160px]'
      } ${
        isSelected ? 'scale-[1.1] z-50 border-charcoal shadow-2xl ring-4 ring-black/5' : 'hover:-translate-y-1'
      } ${getBorderColor()}`}>
        
        <div className="flex items-center justify-between mb-5 shrink-0">
           <span className={`text-[10px] font-black tracking-[0.2em] uppercase opacity-30`}>{event.era}</span>
           <span className={`material-symbols-outlined text-[18px] opacity-20 ${getTextColor()}`}>
             {isSelected ? 'verified' : 'history_edu'}
           </span>
        </div>

        <div className="flex flex-col flex-1 gap-4 overflow-hidden">
            <h4 className={`text-[17px] font-black leading-tight tracking-tight ${isSelected ? getTextColor() : 'text-charcoal'}`}>{event.title}</h4>
            <p className={`text-[13px] text-ash/80 leading-relaxed ${isHist ? 'font-serif' : ''} line-clamp-[10]`}>
                {event.description}
            </p>
        </div>
        
        <div className={`mt-6 pt-5 border-t border-black/5 flex items-center justify-between text-[11px] font-black shrink-0 ${getTextColor()} opacity-60 uppercase tracking-[0.15em]`}>
           <span>{event.solarDate}</span>
           <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
