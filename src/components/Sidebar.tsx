import React from 'react';
import { BookOpen, Map, FileText, Briefcase, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeCourse?: any;
  setActiveCourse?: (course: any) => void;
}

const navItems = [
  { id: 'courseInfo', label: '1. Course Information', icon: BookOpen },
  { id: 'cloMapping', label: '2. CLO Mapping', icon: Map },
  { id: 'courseSyllabus', label: '3. Course Syllabus', icon: FileText },
  { id: 'coursePortfolio', label: '4. Course Portfolio', icon: Briefcase },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, activeCourse, setActiveCourse }) => {
  return (
    <aside className="w-72 bg-white border-r border-slate-200 p-6 hidden md:flex flex-col h-full sticky top-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center relative overflow-hidden group">
          <Sparkles className="w-6 h-6 absolute opacity-20 group-hover:opacity-100 transition-opacity" />
          <span className="z-10 text-lg">iP</span>
        </div>
        <div>
          <h1 className="m-0 text-xl font-extrabold text-slate-800 tracking-tight">OBE System</h1>
          <p className="m-0 text-xs text-slate-500 font-medium">Simplified Flow v7.2</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isDisabled = !activeCourse && item.id !== 'courseInfo';
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (!isDisabled) setActiveTab(item.id);
              }}
              disabled={isDisabled}
              className={`flex items-center gap-3 w-full border-0 text-left font-bold px-4 py-3.5 rounded-2xl transition-all ${
                isActive 
                  ? 'bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-100 cursor-default' 
                  : isDisabled
                  ? 'bg-transparent text-slate-300 cursor-not-allowed'
                  : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800 cursor-pointer'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : isDisabled ? 'text-slate-300' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-slate-100">
        {activeCourse ? (
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-4">
            <p className="text-xs font-bold text-indigo-800 mb-1">Active Course</p>
            <p className="text-sm font-extrabold text-indigo-900 mb-3">{activeCourse.CourseCode}</p>
            <button 
              onClick={() => {
                if (setActiveCourse) setActiveCourse(null);
                setActiveTab('courseInfo');
              }}
              className="w-full py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
            >
              เริ่มวิชาใหม่
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-purple-100/50">
            <p className="text-xs font-bold text-purple-800 mb-1">Teacher Portal</p>
            <p className="text-xs text-purple-600/80">Manage your course specifications efficiently.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
