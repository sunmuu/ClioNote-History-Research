
import React, { useState, useMemo, useEffect } from 'react';
import { AppView, HistoricalDoc, ThemeMode, TimelineEvent, ResearchTopic } from './types';
import Workbench from './components/Workbench';
import DashboardView from './components/DashboardView';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import IngestModal from './components/IngestModal';
import SettingsModal from './components/SettingsModal';
import TopicManagerModal from './components/TopicManagerModal';
import { MOCK_TIMELINE_EVENTS, MOCK_DOCS } from './constants.tsx';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeMode.HISTORICAL);
  const [isDataShared, setIsDataShared] = useState(false);
  
  const [allDocs, setAllDocs] = useState<Record<string, HistoricalDoc>>(MOCK_DOCS);
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>(MOCK_TIMELINE_EVENTS);
  const [activeDoc, setActiveDoc] = useState<HistoricalDoc | null>(null);
  
  const [researchTopics, setResearchTopics] = useState<ResearchTopic[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [managingTopicId, setManagingTopicId] = useState<string | null>(null);

  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<HistoricalDoc | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    setActiveDoc(null);
  }, [themeMode]);

  // 1. 核心删除函数：软删除 handleDocDelete
  const handleDocDelete = (docId: string) => {
    console.log('App 正在执行删除逻辑', docId);
    setAllDocs(prev => ({
      ...prev,
      [docId]: { ...prev[docId], isDeleted: true }
    }));
    // 强制关闭详情页
    setActiveDoc(null);
  };

  // 2. 过滤逻辑（确保时间轴不显示已删除的文档）
  const filteredEvents = useMemo(() => {
    if (selectedTags.length === 0) return [];

    // 先计算当前“池子”里的文档（权限 + 主题 + 未删除）
    const availableDocs = Object.values(allDocs).filter(doc => {
      // 基础权限过滤
      const isModeMatch = isDataShared || doc.originMode === themeMode;
      if (!isModeMatch) return false;

      // 课题过滤
      const activeTopic = researchTopics.find(t => t.id === activeThemeId);
      if (activeThemeId && activeTopic && !activeTopic.docIds.includes(doc.id)) return false;

      // 排除已删除
      return !doc.isDeleted;
    });

    // 提取有效 ID 列表用于快速查找
    const availableDocIds = new Set(availableDocs.map(d => d.id));

    // 过滤事件
    return allEvents.filter(event => {
      if (!availableDocIds.has(event.docId)) return false;
      return selectedTags.some(tag => event.tags.includes(tag));
    });
  }, [allDocs, allEvents, isDataShared, themeMode, activeThemeId, researchTopics, selectedTags]);

  const handleEventSelect = (docId: string) => {
    if (!docId || (activeDoc && activeDoc.id === docId)) {
      setActiveDoc(null);
    } else if (allDocs[docId] && !allDocs[docId].isDeleted) {
      setActiveDoc(allDocs[docId]);
    }
  };

  const handleDocSave = (doc: HistoricalDoc) => {
    const isEdit = !!editingDoc;
    const newEvent: TimelineEvent = {
      id: isEdit ? (allEvents.find(e => e.docId === doc.id)?.id || `evt-${Date.now()}`) : `evt-${Date.now()}`,
      year: parseInt(doc.solarDate) || 0,
      era: doc.lunarDate,
      title: doc.title,
      description: doc.content[0]?.substring(0, 100) + '...',
      solarDate: doc.solarDate,
      tags: doc.tags,
      docId: doc.id,
      originMode: isEdit ? (editingDoc?.originMode || themeMode) : themeMode
    };

    setAllDocs(prev => ({ ...prev, [doc.id]: doc }));
    if (isEdit) {
      setAllEvents(prev => prev.map(e => e.docId === doc.id ? newEvent : e));
    } else {
      setAllEvents(prev => [newEvent, ...prev]);
    }
    setActiveDoc(doc);
    setCurrentView(AppView.WORKBENCH);
    setIsIngestModalOpen(false);
    setEditingDoc(null);
  };

  const handleDocRestore = (docId: string) => {
    setAllDocs(prev => ({
      ...prev,
      [docId]: { ...prev[docId], isDeleted: false }
    }));
  };

  const handleDocPermanentDelete = (docId: string) => {
    setAllDocs(prev => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    setAllEvents(prev => prev.filter(e => e.docId !== docId));
  };

  const handleEmptyBin = () => {
    const deletedIds = Object.keys(allDocs).filter(id => allDocs[id].isDeleted);
    setAllDocs(prev => {
      const next = { ...prev };
      deletedIds.forEach(id => delete next[id]);
      return next;
    });
    setAllEvents(prev => prev.filter(e => !deletedIds.includes(e.docId)));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const openEditModal = (doc: HistoricalDoc) => {
    setEditingDoc(doc);
    setIsIngestModalOpen(true);
  };

  const handleAddTopic = (name: string) => {
    const newTopic: ResearchTopic = {
      id: `topic-${Date.now()}`,
      name,
      description: '',
      docIds: []
    };
    setResearchTopics(prev => [...prev, newTopic]);
    return newTopic.id;
  };

  const handleUpdateTopic = (topicId: string, updates: Partial<ResearchTopic>) => {
    setResearchTopics(prev => prev.map(topic => {
      if (topic.id !== topicId) return topic;
      const updated = { ...topic, ...updates };
      if (updates.docIds) {
        updated.docIds = Array.from(new Set([...topic.docIds, ...updates.docIds]));
      }
      return updated;
    }));
  };

  const handleToggleDocInTopic = (topicId: string, docId: string) => {
    setResearchTopics(prev => prev.map(t => {
      if (t.id !== topicId) return t;
      const docIds = t.docIds.includes(docId) 
        ? t.docIds.filter(id => id !== docId)
        : [...t.docIds, docId];
      return { ...t, docIds };
    }));
  };

  const managingTopic = useMemo(() => 
    researchTopics.find(t => t.id === managingTopicId), 
    [researchTopics, managingTopicId]
  );

  return (
    <div className={`h-screen flex flex-col relative transition-colors duration-500 ${
      themeMode === ThemeMode.HISTORICAL ? 'bg-[#F4F1EA]' : 
      themeMode === ThemeMode.FAN ? 'bg-[#FFF0F5]' : 
      themeMode === ThemeMode.REVIEW ? 'bg-slate-review-100' :
      'bg-[#F8F9FA]'
    }`}>
      <Navbar 
        themeMode={themeMode} 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onSettingsOpen={() => setIsSettingsOpen(true)}
      />
      
      <main className="flex flex-1 overflow-hidden">
        <Sidebar 
          themeMode={themeMode}
          isDataShared={isDataShared}
          allEvents={allEvents.filter(e => !allDocs[e.docId]?.isDeleted)}
          onIngestClick={() => { setEditingDoc(null); setIsIngestModalOpen(true); }} 
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          themes={researchTopics}
          activeThemeId={activeThemeId}
          onThemeSelect={setActiveThemeId}
          onAddTheme={handleAddTopic}
          onManageTopic={setManagingTopicId}
          allDocs={allDocs}
          onToggleDocInTheme={handleToggleDocInTopic}
        />
        <div className="flex-1 flex overflow-hidden">
          {currentView === AppView.WORKBENCH ? (
            <Workbench 
              themeMode={themeMode}
              activeDoc={activeDoc} 
              filteredEvents={filteredEvents} 
              onEventSelect={handleEventSelect}
              selectedTags={selectedTags}
              onDocEdit={openEditModal}
              onDocDelete={handleDocDelete}
              themes={researchTopics}
              onToggleDocInTheme={handleToggleDocInTopic}
              onAddTheme={handleAddTopic}
            />
          ) : (
            <DashboardView 
              themeMode={themeMode} 
              allDocs={allDocs}
              isDataShared={isDataShared}
              onDocSelect={(id) => setActiveDoc(allDocs[id])}
              onDocRestore={handleDocRestore}
              onDocPermanentDelete={handleDocPermanentDelete}
              onEmptyBin={handleEmptyBin}
              onViewChange={setCurrentView}
            />
          )}
        </div>
      </main>

      <Footer themeMode={themeMode} />

      {isIngestModalOpen && (
        <div className="fixed inset-0 z-[500]">
          <IngestModal 
            themeMode={themeMode}
            initialDoc={editingDoc || undefined}
            onClose={() => { setIsIngestModalOpen(false); setEditingDoc(null); }} 
            onSave={handleDocSave} 
          />
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[600]">
          <SettingsModal 
            currentTheme={themeMode} 
            isDataShared={isDataShared}
            onClose={() => setIsSettingsOpen(false)} 
            onThemeChange={setThemeMode} 
            onDataSharedChange={setIsDataShared}
          />
        </div>
      )}

      {managingTopicId && managingTopic && (
        <TopicManagerModal
          isOpen={!!managingTopicId}
          onClose={() => setManagingTopicId(null)}
          currentTopic={managingTopic}
          allDocs={allDocs}
          onUpdateTopic={handleUpdateTopic}
          themeMode={themeMode}
        />
      )}
    </div>
  );
};

export default App;
