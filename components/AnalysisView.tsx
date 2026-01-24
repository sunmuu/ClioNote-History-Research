
import React from 'react';
import { ThemeMode } from '../types';

interface AnalysisViewProps {
  themeMode: ThemeMode;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ themeMode }) => {
  const isFan = themeMode === ThemeMode.FAN;
  const isHist = themeMode === ThemeMode.HISTORICAL;

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto px-10 py-8 transition-colors ${
      isFan ? 'bg-pink-50/30' : isHist ? 'bg-[#FDFBF7]' : 'bg-[#F8F9FA]'
    }`}>
       <div className="flex flex-wrap gap-2 items-center text-xs tracking-wider uppercase text-ash/60 mb-8">
        <span className="hover:text-charcoal cursor-pointer">研究中心</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-charcoal font-medium">分析洞察视图</span>
      </div>

      <div className={`flex flex-wrap justify-between items-end gap-6 border-b pb-8 mb-8 ${
        isFan ? 'border-pink-100' : isHist ? 'border-[#DCD3C1]' : 'border-black/5'
      }`}>
        <div className="flex flex-col gap-2">
          <h1 className={`text-4xl font-bold tracking-tight ${
            isHist ? 'font-serif text-[#4A3B2A]' : isFan ? 'text-pink-600' : 'text-charcoal'
          }`}>明代：丝绸之路贸易综合分析</h1>
          <p className="text-ash text-sm font-light">跨界比对《明实录》与地方志史料（1368–1644）</p>
        </div>
        <div className="flex gap-4">
          <button className={`flex items-center gap-2 rounded h-10 px-5 border transition-colors text-sm font-medium ${
            isFan ? 'border-pink-500 text-pink-500 hover:bg-pink-50' : 
            isHist ? 'border-[#8C7456] text-[#8C7456] hover:bg-[#8C7456]/5' : 
            'border-charcoal text-charcoal hover:bg-black/5'
          }`}>
            <span className="material-symbols-outlined text-[18px]">history_edu</span>
            <span>保存工作区</span>
          </button>
          <button className={`flex items-center gap-2 rounded h-10 px-5 text-white text-sm font-medium transition-colors shadow-sm ${
            isFan ? 'bg-pink-500 hover:bg-pink-600' : 
            isHist ? 'bg-[#8C7456] hover:bg-[#745E44]' : 
            'bg-charcoal hover:bg-accent'
          }`}>
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span>导出分析报告</span>
          </button>
        </div>
      </div>

      <div className={`rounded shadow-sm border overflow-hidden mb-8 transition-colors ${
        isFan ? 'bg-white border-pink-100' : isHist ? 'bg-[#FDFBF7] border-[#DCD3C1]' : 'bg-white border-black/5'
      }`}>
        <div className="flex items-center justify-between px-8 pt-6 pb-4">
          <h2 className={`text-lg font-bold flex items-center gap-3 ${isHist ? 'font-serif text-[#4A3B2A]' : isFan ? 'text-pink-600' : 'text-charcoal'}`}>
            <span className={`material-symbols-outlined ${isFan ? 'text-pink-500' : isHist ? 'text-[#8C7456]' : 'text-charcoal'}`}>analytics</span>
            史料密度热力图
          </h2>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${isFan ? 'bg-pink-200' : 'bg-ash/20'}`}></span>
              <span className="text-[11px] text-ash">官方正史</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${isFan ? 'bg-pink-500' : isHist ? 'bg-[#8C7456]' : 'bg-charcoal'}`}></span>
              <span className="text-[11px] text-ash">史料峰值</span>
            </div>
          </div>
        </div>
        <div className="px-8 pb-8">
          <div className={`flex flex-col gap-4 rounded border p-8 ${
            isFan ? 'bg-pink-50/50 border-pink-100' : isHist ? 'bg-black/5 border-[#DCD3C1]' : 'bg-black/5 border-black/5'
          }`}>
            <div className="flex justify-between items-baseline mb-4">
              <div>
                <p className="text-ash text-[11px] font-medium uppercase tracking-[0.2em] mb-1">时间轴史料记录频率</p>
                <p className={`text-4xl font-bold ${isHist ? 'font-serif' : ''}`}>24,815 <span className="text-sm font-sans font-normal text-ash/70 ml-2">条已验证记录</span></p>
              </div>
              <div className="text-right">
                <span className={`border px-2 py-0.5 text-[10px] font-bold tracking-wider rounded ${
                  isFan ? 'border-pink-500 text-pink-500' : isHist ? 'border-[#8C7456] text-[#8C7456]' : 'border-charcoal text-charcoal'
                }`}>相关性 +18.4%</span>
              </div>
            </div>
            <div className="h-32 w-full relative">
              <svg fill="none" className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 478 120">
                <path d="M0 100C30 100 45 20 75 20C105 20 120 80 150 80C180 80 195 40 225 40C255 40 270 110 300 110C330 110 345 5 375 5C405 5 435 90 472 90V120H0V100Z" fill={`url(#heatmap_gradient_${themeMode})`}></path>
                <path d="M0 100C30 100 45 20 75 20C105 20 120 80 150 80C180 80 195 40 225 40C255 40 270 110 300 110C330 110 345 5 375 5C405 5 435 90 472 90" stroke={isFan ? '#EC4899' : isHist ? '#8C7456' : '#2D2D2D'} strokeDasharray="0" strokeLinecap="round" strokeWidth="1.5"></path>
                <defs>
                  <linearGradient gradientUnits="userSpaceOnUse" id={`heatmap_gradient_${themeMode}`} x1="236" x2="236" y1="5" y2="120">
                    <stop stopColor={isFan ? '#EC4899' : isHist ? '#8C7456' : '#2D2D2D'} stopOpacity="0.15"></stop>
                    <stop offset="1" stopColor={isFan ? '#EC4899' : isHist ? '#8C7456' : '#2D2D2D'} stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex justify-between border-t border-black/5 pt-4">
              <p className="text-ash text-[10px] font-medium">1368 (洪武)</p>
              <p className="text-ash text-[10px] font-medium">1420 (永乐)</p>
              <p className="text-ash text-[10px] font-medium">1500 (弘治)</p>
              <p className="text-ash text-[10px] font-medium">1570 (万历)</p>
              <p className="text-ash text-[10px] font-medium">1644 (崇祯)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
           <div className={`p-10 rounded border transition-colors ${
             isFan ? 'bg-white border-pink-100' : isHist ? 'bg-[#FDFBF7] border-[#DCD3C1]' : 'bg-white border-black/5'
           }`}>
              <h2 className={`text-3xl font-bold mt-0 border-l-4 pl-4 mb-8 ${
                isHist ? 'font-serif border-[#8C7456] text-[#4A3B2A]' : 
                isFan ? 'border-pink-500 text-pink-600' : 
                'border-charcoal text-charcoal'
              }`}>历史贸易波动与地方自治权</h2>
              <p className={`leading-loose text-[15px] mb-6 ${isHist ? 'font-serif' : 'text-ash'}`}>
                  根据《明实录》与新索引的地方志数据综合显示，万历中期出现明显的“灰色市场”扩张模式。虽然官方依然维持“海禁”政策，但史料密度热力图显示，与港口税收相关的行政纠纷记录出现显著激增 [ID: 1024]。
              </p>
              <div className={`border-l-2 p-8 my-10 rounded ${
                isFan ? 'bg-pink-50 border-pink-500' : 
                isHist ? 'bg-[#8C7456]/5 border-[#8C7456]' : 
                'bg-black/5 border-charcoal'
              }`}>
                <h4 className={`font-bold mt-0 mb-3 flex items-center gap-2 ${
                  isHist ? 'font-serif text-[#8C7456]' : isFan ? 'text-pink-600' : 'text-charcoal'
                }`}>
                  <span className="material-symbols-outlined text-xl">lightbulb</span> AI 深度推演
                </h4>
                <p className="italic text-ash text-sm leading-relaxed mb-0">
                  1570-1590年间的“记录断层”可能反映了地方官僚为规避“一条鞭法”改革而进行的系统性瞒报。非官方史料的密度在官方记录下降处出现波峰，表明了历史叙述权的微妙转移。
                </p>
              </div>
           </div>
        </div>
        <div className="space-y-6">
           <div className={`rounded border p-6 shadow-sm transition-colors ${
             isFan ? 'bg-pink-50 border-pink-100' : isHist ? 'bg-[#FDFBF7] border-[#DCD3C1]' : 'bg-white border-black/5'
           }`}>
             <h4 className="text-xs font-bold text-charcoal mb-5 flex items-center gap-2 uppercase tracking-widest">
               <span className="material-symbols-outlined text-[18px]">ios_share</span> 数据导出
             </h4>
             <div className="space-y-2">
                <button className="flex items-center justify-between w-full p-3 rounded bg-white border border-black/5 hover:border-black/20 transition-all group">
                  <span className="text-sm font-medium text-ash">Microsoft Word</span>
                  <span className={`material-symbols-outlined opacity-40 group-hover:opacity-100 text-[16px] ${isFan ? 'text-pink-500' : isHist ? 'text-[#8C7456]' : 'text-charcoal'}`}>download</span>
                </button>
                <button className="flex items-center justify-between w-full p-3 rounded bg-white border border-black/5 hover:border-black/20 transition-all group">
                  <span className="text-sm font-medium text-ash">研究级 PDF</span>
                  <span className={`material-symbols-outlined opacity-40 group-hover:opacity-100 text-[16px] ${isFan ? 'text-pink-500' : isHist ? 'text-[#8C7456]' : 'text-charcoal'}`}>download</span>
                </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
