import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';

export const CourseSyllabus: React.FC<{ activeCourse?: any, data?: any }> = ({ activeCourse, data }) => {
  const [formData, setFormData] = useState({
    teachingDayTime: '',
    teachingMaterials: '',
    other: ''
  });
  
  const [teachingPlans, setTeachingPlans] = useState<any[]>([]);
  const [assessmentPlans, setAssessmentPlans] = useState<any[]>([]);
  
  const [status, setStatus] = useState<{message: string, type: 'ok'|'error'} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeCourse) {
      const syllabusData = data?.syllabusList?.find((s: any) => s.CourseCode === activeCourse.CourseCode);
      if (syllabusData) {
        setFormData({
          teachingDayTime: syllabusData.teachingDayTime || '',
          teachingMaterials: syllabusData.teachingMaterials || '',
          other: syllabusData.other || ''
        });
        setTeachingPlans(syllabusData.teachingPlan?.length > 0 ? syllabusData.teachingPlan : [{ id: Math.random().toString(), week: '', topic: '', clo: '', activity: '' }]);
        setAssessmentPlans(syllabusData.assessmentPlan?.length > 0 ? syllabusData.assessmentPlan : [{ id: Math.random().toString(), method: '', weight: '', clo: '', pi: '' }]);
      } else {
        handleClear();
      }
    } else {
      handleClear();
    }
  }, [activeCourse, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddTeachingPlan = () => {
    setTeachingPlans(prev => [...prev, { id: Math.random().toString(), week: '', topic: '', clo: '', activity: '' }]);
  };

  const handleAddAssessmentPlan = () => {
    setAssessmentPlans(prev => [...prev, { id: Math.random().toString(), method: '', weight: '', clo: '', pi: '' }]);
  };

  const handlePlanChange = (setter: any, id: string, field: string, value: string) => {
    setter((prev: any[]) => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRemovePlan = (setter: any, id: string) => {
    setter((prev: any[]) => prev.filter(p => p.id !== id));
  };

  const handleClear = () => {
    setFormData({ teachingDayTime: '', teachingMaterials: '', other: '' });
    setTeachingPlans([]);
    setAssessmentPlans([]);
    setStatus(null);
    setTimeout(() => {
      handleAddTeachingPlan();
      handleAddAssessmentPlan();
    }, 0);
  };

  const handleSave = async () => {
    if (!formData.teachingDayTime) {
      setStatus({ message: 'กรุณากรอกวันเวลาสอน', type: 'error' });
      return;
    }

    setLoading(true);
    setStatus({ message: 'กำลังบันทึก Course Syllabus...', type: 'ok' });
    try {
      const payload = {
        courseCode: activeCourse?.CourseCode,
        teachingDayTime: formData.teachingDayTime,
        teachingPlan: teachingPlans,
        assessmentPlan: assessmentPlans,
        teachingMaterials: formData.teachingMaterials,
        other: formData.other
      };
      await api.saveSyllabus(payload);
      setStatus({ message: 'บันทึก Course Syllabus เรียบร้อยแล้ว', type: 'ok' });
    } catch (err: any) {
      setStatus({ message: `Error: ${err.message}`, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="card">
        <h3 className="text-lg font-extrabold text-slate-800 mb-2">3. Course Syllabus</h3>
        <p className="text-slate-500 text-sm mb-6">ส่วนนี้ไม่โหลดข้อมูลอัตโนมัติ ผู้สอนกรอกเอง</p>
        
        <label>วันเวลาสอน <span>*</span>
          <input name="teachingDayTime" value={formData.teachingDayTime} onChange={handleChange} placeholder="เช่น Monday 09:00-12:00" />
        </label>
        
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h3 className="text-md font-bold text-slate-800 m-0 border-l-4 border-purple-500 pl-3">Teaching Plan</h3>
          <button className="btn-secondary py-1 text-sm flex items-center gap-1" onClick={handleAddTeachingPlan}>
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>
        
        <div className="space-y-3">
          {teachingPlans.map(row => (
            <div key={row.id} className="plan-row group relative grid grid-cols-1 md:grid-cols-4 gap-4 hover:shadow-md transition-shadow bg-white">
              <button 
                onClick={() => handleRemovePlan(setTeachingPlans, row.id)}
                className="absolute -right-2 -top-2 bg-white text-rose-500 hover:text-white hover:bg-rose-500 border border-slate-200 hover:border-rose-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <label className="mb-0 text-xs">Week / ครั้งที่
                <input value={row.week} onChange={e => handlePlanChange(setTeachingPlans, row.id, 'week', e.target.value)} placeholder="Week 1" />
              </label>
              <label className="mb-0 text-xs">Topic / หัวข้อ
                <input value={row.topic} onChange={e => handlePlanChange(setTeachingPlans, row.id, 'topic', e.target.value)} placeholder="หัวข้อการสอน" />
              </label>
              <label className="mb-0 text-xs">CLO (รหัส CLO)
                <input value={row.clo} onChange={e => handlePlanChange(setTeachingPlans, row.id, 'clo', e.target.value)} placeholder="เช่น CLO1" />
              </label>
              <label className="mb-0 text-xs">Activity (กิจกรรม)
                <input value={row.activity} onChange={e => handlePlanChange(setTeachingPlans, row.id, 'activity', e.target.value)} placeholder="Lecture / Lab / Discussion" />
              </label>
            </div>
          ))}
        </div>

        <div className="mt-8 mb-4 flex items-center justify-between">
          <h3 className="text-md font-bold text-slate-800 m-0 border-l-4 border-emerald-500 pl-3">Assessment Plan</h3>
          <button className="btn-secondary py-1 text-sm flex items-center gap-1" onClick={handleAddAssessmentPlan}>
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>
        
        <div className="space-y-3">
          {assessmentPlans.map(row => (
            <div key={row.id} className="plan-row group relative grid grid-cols-1 md:grid-cols-4 gap-4 hover:shadow-md transition-shadow bg-white">
               <button 
                onClick={() => handleRemovePlan(setAssessmentPlans, row.id)}
                className="absolute -right-2 -top-2 bg-white text-rose-500 hover:text-white hover:bg-rose-500 border border-slate-200 hover:border-rose-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <label className="mb-0 text-xs">Assessment Method (วิธีการประเมิน)
                <input value={row.method} onChange={e => handlePlanChange(setAssessmentPlans, row.id, 'method', e.target.value)} placeholder="Exam / Assignment / Project" />
              </label>
              <label className="mb-0 text-xs">Weight (สัดส่วนคะแนน)
                <input value={row.weight} onChange={e => handlePlanChange(setAssessmentPlans, row.id, 'weight', e.target.value)} placeholder="30%" />
              </label>
              <label className="mb-0 text-xs">CLO (รหัส CLO)
                <input value={row.clo} onChange={e => handlePlanChange(setAssessmentPlans, row.id, 'clo', e.target.value)} placeholder="เช่น CLO1" />
              </label>
              <label className="mb-0 text-xs">PI (รหัส PI)
                <input value={row.pi} onChange={e => handlePlanChange(setAssessmentPlans, row.id, 'pi', e.target.value)} placeholder="เช่น PI2.3" />
              </label>
            </div>
          ))}
        </div>
        
        <label className="mt-8">เอกสารประกอบการสอน
          <textarea name="teachingMaterials" value={formData.teachingMaterials} onChange={handleChange} placeholder="หนังสือ เอกสาร เว็บไซต์ ซอฟต์แวร์ หรือแหล่งเรียนรู้อื่น ๆ" />
        </label>
        
        <label className="mt-4">อื่น ๆ
          <textarea name="other" value={formData.other} onChange={handleChange} placeholder="ข้อมูลเพิ่มเติม" className="min-h-[60px]" />
        </label>
        
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
          <button className="btn-secondary" onClick={handleClear} disabled={loading}>Clear Syllabus</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Course Syllabus'}
          </button>
        </div>
        
        {status && (
          <div className={status.type === 'ok' ? 'status-ok' : 'status-error'}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};
