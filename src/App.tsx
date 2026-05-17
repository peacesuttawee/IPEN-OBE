import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { CourseInformation } from './components/sections/CourseInformation';
import { CloMapping } from './components/sections/CloMapping';
import { CourseSyllabus } from './components/sections/CourseSyllabus';
import { CoursePortfolio } from './components/sections/CoursePortfolio';
import { api } from './services/api';

const titleMap: Record<string, string> = {
  courseInfo: 'Course Information',
  cloMapping: 'CLO Mapping',
  courseSyllabus: 'Course Syllabus',
  coursePortfolio: 'Course Portfolio'
};

const subtitleMap: Record<string, string> = {
  courseInfo: 'ส่วน 1 บันทึกวิชา',
  cloMapping: 'ส่วน 2 กรอก CLO',
  courseSyllabus: 'ส่วน 3 กรอก Syllabus',
  coursePortfolio: 'ส่วน 4 ดึง CLO จากส่วน 2'
};

function App() {
  const [activeTab, setActiveTab] = useState('courseInfo');
  const [data, setData] = useState({ courses: [], cloMapped: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getInitialData();
      setData({ courses: res.courses, cloMapped: res.cloMapped });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDebug = async () => {
    const info = await api.getDebugInfo();
    alert(`Courses: ${info.courses.count} | CLOs: ${info.clos.count}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Topbar 
          title={titleMap[activeTab]} 
          subtitle={subtitleMap[activeTab]} 
          onRefresh={loadData}
          onDebug={handleDebug}
        />
        
        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pb-24">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
            </div>
          ) : (
            <>
              {activeTab === 'courseInfo' && <CourseInformation courses={data.courses} refresh={loadData} />}
              {activeTab === 'cloMapping' && <CloMapping clos={data.cloMapped} refresh={loadData} />}
              {activeTab === 'courseSyllabus' && <CourseSyllabus />}
              {activeTab === 'coursePortfolio' && <CoursePortfolio clos={data.cloMapped} refresh={loadData} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
