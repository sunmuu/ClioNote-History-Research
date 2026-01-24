
import React from 'react';
import { ThemeMode } from '../types';

interface SettingsModalProps {
  currentTheme: ThemeMode;
  isDataShared: boolean;
  onClose: () => void;
  onThemeChange: (theme: ThemeMode) => void;
  onDataSharedChange: (isShared: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  currentTheme, 
  isDataShared, 
  onClose, 
  onThemeChange,
  onDataSharedChange
}) => {
  const options = [
    { 
      id: ThemeMode.MODERN, 
      label: '现代研究 (Modern)', 
      desc: '专业、沉稳、高效。适用于企业背调、法律合规与现代叙事分析。',
      icon: 'architecture',
      color: 'bg-charcoal'
    },
    { 
      id: ThemeMode.HISTORICAL, 
      label: '史学研究 (Historical)', 
      desc: '严谨、系统、深厚。适用于古代史、近现代史、世界史等多种学术语境下的档案整理与辨析。',
      icon: 'history_edu',
      color: 'bg-[#5B554D]'
    },
    { 
      id: ThemeMode.REVIEW, 
      label: '学术综述 (Literature Review)', 
      desc: '客观、理性、结构化。适用于梳理学术史脉络、方法论对比与核心范式转移。',
      icon: 'library_books',
      color: 'bg-slate-review-600'
    },
    { 
      id: ThemeMode.FAN, 
      label: '同人嗑糖 (Fan/CP)', 
      desc: '感性、活泼、唯美。适用于名场面整理、糖点挖掘、角色心路分析。',
      icon: 'favorite',
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-border-muted flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border-muted flex justify-between items-center bg-cream shrink-0">
          <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">settings</span>
            系统配置与预设
          </h2>
          <button onClick={onClose} className="text-ash hover:text-charcoal transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-8 overflow-y-auto">
          {/* Section: Scenario Engine */}
          <div>
            <h3 className="text-[10px] font-bold text-ash/60 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">palette</span>
              场景预设模式
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {options.map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => onThemeChange(opt.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 hover:shadow-md ${
                    currentTheme === opt.id ? 'border-charcoal bg-cream' : 'border-border-muted hover:border-ash/30'
                  }`}
                >
                  <div className={`size-10 rounded-lg ${opt.color} flex items-center justify-center text-white`}>
                    <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-charcoal">{opt.label}</h4>
                    <p className="text-[10px] text-ash mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                  {currentTheme === opt.id && (
                    <span className="material-symbols-outlined text-charcoal">check_circle</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Data Management */}
          <div>
            <h3 className="text-[10px] font-bold text-ash/60 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">database</span>
              数据存储策略
            </h3>
            <div className="p-5 rounded-xl border border-border-muted bg-cream/50">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-charcoal">全场景数据共享</h4>
                  <p className="text-[10px] text-ash mt-1 leading-relaxed">
                    开启后，所有模式下的档案和轨迹将合并显示。关闭则仅显示当前模式下录入的数据。
                  </p>
                </div>
                <button 
                  onClick={() => onDataSharedChange(!isDataShared)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isDataShared ? 'bg-charcoal' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 size-4 bg-white rounded-full shadow-sm transition-all ${isDataShared ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              <div className={`text-[9px] font-medium p-2 rounded ${isDataShared ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                {isDataShared 
                  ? "当前状态：[全量共享] - 适用于跨场景综合分析" 
                  : "当前状态：[严格隔离] - 确保各研究领域互不干扰 (推荐)"}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-cream border-t border-border-muted text-center shrink-0">
          <p className="text-[9px] text-ash/60 font-medium uppercase tracking-[0.2em]">ClioNote Scenario Engine v2.6 | Data Isolated By Default</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
