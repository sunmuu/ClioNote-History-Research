
import React from 'react';
import { ThemeMode } from '../types';

interface CollectionViewProps {
  themeMode: ThemeMode;
}

const CollectionView: React.FC<CollectionViewProps> = ({ themeMode }) => {
  const isFan = themeMode === ThemeMode.FAN;
  const isHist = themeMode === ThemeMode.HISTORICAL;

  return (
    <div className={`flex-1 flex flex-col p-12 overflow-y-auto transition-colors ${
      isFan ? 'bg-[#FFF9FB]' : isHist ? 'bg-[#FDFBF7]' : 'bg-white'
    }`}>
      <div className="max-w-6xl mx-auto w-full">
        <h1 className={`text-3xl font-bold mb-2 ${isHist ? 'font-serif text-[#4A3B2A]' : isFan ? 'text-pink-600' : 'text-charcoal'}`}>收藏档案</h1>
        <p className="text-ash text-sm mb-12">已标记为高优先级的原始存根与研究记录。</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="group cursor-pointer">
              <div className={`aspect-[3/4] border rounded-xl shadow-sm mb-4 relative overflow-hidden flex items-center justify-center transition-all ${
                isFan ? 'bg-white border-pink-100 group-hover:border-pink-300 group-hover:shadow-pink-100' : 
                isHist ? 'bg-[#F4F1EA] border-[#DCD3C1] group-hover:border-[#8C7456]' : 
                'bg-[#F8F9FA] border-black/5 group-hover:border-black/20'
              }`}>
                <div className="p-8 text-center opacity-10 group-hover:opacity-100 transition-opacity">
                   <span className={`material-symbols-outlined text-[40px] mb-4 ${
                     isFan ? 'text-pink-500' : isHist ? 'text-[#8C7456]' : 'text-charcoal'
                   }`}>description</span>
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em]">ARCHIVE_RES_00{i}</p>
                </div>
              </div>
              <h3 className={`font-bold text-sm transition-colors ${
                isHist ? 'font-serif text-[#4A3B2A]' : 
                isFan ? 'text-charcoal group-hover:text-pink-600' : 
                'text-charcoal group-hover:text-accent'
              }`}>归档项目档案 #1024-{i}</h3>
              <p className="text-[10px] text-ash/50 mt-1 uppercase tracking-widest font-bold">Updated · 2 hours ago</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionView;
