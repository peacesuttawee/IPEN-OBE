import React from 'react';
import { RefreshCw, Bug } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  onDebug: () => void;
  activeCourse?: any;
}

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle, onRefresh, onDebug, activeCourse }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-6 sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="m-0 text-2xl font-extrabold text-slate-800 tracking-tight">
          {title} {activeCourse && <span className="text-purple-600 text-lg ml-2">({activeCourse.CourseCode})</span>}
        </h2>
        <p className="m-0 mt-1 text-sm text-slate-500 font-medium">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onDebug}
          className="btn-secondary flex items-center gap-2 group"
        >
          <Bug className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          Debug
        </button>
        <button 
          onClick={onRefresh}
          className="btn-secondary flex items-center gap-2 group"
        >
          <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
          Refresh
        </button>
      </div>
    </header>
  );
};
