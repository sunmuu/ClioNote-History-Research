
import React from 'react';
import { ThemeMode } from '../types';

interface FooterProps {
  themeMode: ThemeMode;
}

const Footer: React.FC<FooterProps> = ({ themeMode }) => {
  const isFan = themeMode === ThemeMode.FAN;
  const isHist = themeMode === ThemeMode.HISTORICAL;
  const isReview = themeMode === ThemeMode.REVIEW;

  return (
    <footer className={`h-8 border-t px-6 flex items-center justify-between shrink-0 z-50 transition-colors ${
      isFan ? 'bg-pink-50 border-pink-100' : 
      isHist ? 'bg-[#EBE7DD] border-[#DCD3C1]' : 
      isReview ? 'bg-slate-review-50 border-slate-review-200' :
      'bg-cream border-border-muted'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-1.5 text-[9px] font-bold ${
          isFan ? 'text-pink-400' : 
          isReview ? 'text-slate-review-600' :
          'text-ash/60'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            isFan ? 'bg-pink-500' : 
            isReview ? 'bg-blue-400' :
            'bg-green-500'
          }`}></span>
          {isFan ? '糖分监控中' : isReview ? '理性构建 · 范式转移' : isHist ? '灵台清明' : '数据库已连接'}
        </div>
      </div>
      <div className="flex items-center gap-4 text-[9px] font-bold text-ash/40">
        <span className="tracking-widest uppercase">{
          isFan ? 'CLIO LOVE ENGINE v1.0' : 
          isReview ? 'Review Protocol v3.0' :
          isHist ? 'ClioNote 乾坤版' : 
          'CLIONOTE OS 2.4.0'
        }</span>
      </div>
    </footer>
  );
};

export default Footer;
