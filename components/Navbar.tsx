import React, { useState, useRef, useEffect } from 'react';
import { AppView, ThemeMode } from '../types';

interface NavbarProps {
  currentView: AppView;
  themeMode: ThemeMode;
  onViewChange: (view: AppView) => void;
  onSettingsOpen: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, themeMode, onViewChange, onSettingsOpen }) => {
  const isFan = themeMode === ThemeMode.FAN;
  const isHist = themeMode === ThemeMode.HISTORICAL;
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化时从本地存储加载头像
  useEffect(() => {
    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result);
        localStorage.setItem('user_avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const navItems = [
    { id: AppView.DASHBOARD, label: isFan ? '主页' : isHist ? '总览索引' : '总览' },
    { id: AppView.WORKBENCH, label: isFan ? '产出区' : isHist ? '史料文献' : '工作台' }
  ];

  return (
    <header className={`flex items-center justify-between border-b px-6 py-3 shrink-0 z-50 transition-colors ${
      isFan ? 'bg-pink-50 border-pink-100' : isHist ? 'bg-[#F2EFE8] border-[#D1CEC4]' : 'bg-white border-border-muted'
    }`}>
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3">
          <div className={`size-8 rounded-md flex items-center justify-center text-white ${
            isFan ? 'bg-pink-500' : isHist ? 'bg-[#5B554D]' : 'bg-charcoal'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {isFan ? 'favorite' : isHist ? 'history_edu' : 'biotech'}
            </span>
          </div>
          <h2 className={`text-lg font-bold tracking-tight ${isHist ? 'font-serif text-[#3A352F]' : ''}`}>ClioNote</h2>
        </div>
        <nav className="flex items-center gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`text-xs font-semibold transition-all px-3 py-1.5 rounded-full ${
                currentView === item.id 
                  ? (isFan ? 'bg-pink-500 text-white' : isHist ? 'bg-[#5B554D] text-white' : 'bg-charcoal text-white')
                  : 'text-ash hover:bg-black/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex gap-4">
          <button onClick={onSettingsOpen} className="text-ash/60 hover:text-charcoal transition-all">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
        <div className="h-4 w-[1px] bg-black/10 mx-1"></div>
        
        {/* 用户头像上传逻辑 */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleAvatarChange} 
        />
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="size-7 bg-black/5 rounded-full border border-black/10 flex items-center justify-center text-[10px] font-bold text-ash cursor-pointer hover:border-black/30 transition-all overflow-hidden relative group"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>JD</span>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="material-symbols-outlined text-white text-[12px]">upload</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;