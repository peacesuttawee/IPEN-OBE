import React, { useState } from 'react';
import { api } from '../../services/api';

export const CourseInformation: React.FC<{ courses: any[], refresh: () => void, setActiveCourse?: (c: any) => void, setActiveTab?: (t: string) => void }> = ({ courses, refresh, setActiveCourse, setActiveTab }) => {
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    instructorName: '',
    email: '',
    semester: '',
    academicYear: '',
    programName: '',
    courseDescription: ''
  });
  
  const [status, setStatus] = useState<{message: string, type: 'ok'|'error'} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClear = () => {
    setFormData({
      courseCode: '', courseName: '', instructorName: '', email: '',
      semester: '', academicYear: '', programName: '', courseDescription: ''
    });
    setStatus(null);
  };

  const handleSave = async () => {
    if (!formData.courseCode || !formData.courseName || !formData.instructorName || !formData.email || !formData.semester || !formData.academicYear) {
      setStatus({ message: 'กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน', type: 'error' });
      return;
    }

    setLoading(true);
    setStatus({ message: 'กำลังบันทึกข้อมูล...', type: 'ok' });
    try {
      await api.saveCourse(formData);
      setStatus({ message: 'บันทึกข้อมูลรายวิชาเรียบร้อยแล้ว โดยยังคงข้อมูลในฟอร์มไว้', type: 'ok' });
      if (setActiveCourse) {
        setActiveCourse({
          CourseCode: formData.courseCode,
          CourseName: formData.courseName,
          InstructorName: formData.instructorName,
          Email: formData.email,
          Semester: formData.semester,
          AcademicYear: formData.academicYear,
          ProgramName: formData.programName,
          CourseDescription: formData.courseDescription,
        });
      }
      if (setActiveTab) setActiveTab('cloMapping');
      refresh();
    } catch (err: any) {
      setStatus({ message: `Error: ${err.message}`, type: 'error' });
    }
    setLoading(false);
  };

  const handleDeleteCourse = async (courseCode: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชา ${courseCode}?`)) {
      setLoading(true);
      try {
        await api.deleteCourse(courseCode);
        setStatus({ message: `ลบรายวิชา ${courseCode} เรียบร้อยแล้ว`, type: 'ok' });
        refresh();
      } catch (err: any) {
        setStatus({ message: `Error: ${err.message}`, type: 'error' });
      }
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="card">
        <h3 className="text-lg font-extrabold text-slate-800 mb-2">1. Course Information</h3>
        <p className="text-slate-500 text-sm mb-6">กด Save แล้วข้อมูลในฟอร์มจะไม่ถูกเคลียร์</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <label>Course Code (รหัสวิชา) <span>*</span>
            <input name="courseCode" value={formData.courseCode} onChange={handleChange} placeholder="เช่น EIM313" />
          </label>
          <label>Course Name (ชื่อวิชา) <span>*</span>
            <input name="courseName" value={formData.courseName} onChange={handleChange} placeholder="เช่น Digital Signal Processing" />
          </label>
          <label>Instructor Name (ชื่อผู้สอน) <span>*</span>
            <input name="instructorName" value={formData.instructorName} onChange={handleChange} placeholder="ชื่อผู้สอน" />
          </label>
          <label>Email (อีเมล) <span>*</span>
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@tu.ac.th" />
          </label>
          <label>Semester (ภาคการศึกษา) <span>*</span>
            <input name="semester" value={formData.semester} onChange={handleChange} placeholder="เช่น 1 หรือ 1/2567" />
          </label>
          <label>Academic Year (ปีการศึกษา) <span>*</span>
            <input name="academicYear" value={formData.academicYear} onChange={handleChange} placeholder="เช่น 2567" />
          </label>
          <label className="md:col-span-3">Program Name (ชื่อหลักสูตร)
            <input name="programName" value={formData.programName} onChange={handleChange} placeholder="เช่น วิศวกรรมอิเล็กทรอนิกส์และเทคโนโลยีอัจฉริยะ" />
          </label>
        </div>
        
        <label className="mt-5">Course Description (คำอธิบายรายวิชา)
          <textarea name="courseDescription" value={formData.courseDescription} onChange={handleChange} placeholder="คำอธิบายรายวิชา" />
        </label>
        
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
          <button className="btn-secondary" onClick={handleClear} disabled={loading}>Clear Form</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Course Information'}
          </button>
        </div>
        
        {status && (
          <div className={status.type === 'ok' ? 'status-ok' : 'status-error'}>
            {status.message}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-extrabold text-slate-800 mb-6">Saved Courses</h3>
        {courses.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลรายวิชา</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Course Code</th>
                  <th className="p-4">Course Name</th>
                  <th className="p-4">Instructor</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Semester</th>
                  <th className="p-4">Academic Year</th>
                  <th className="p-4">Program Name</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{c.CourseCode}</td>
                    <td className="p-4">{c.CourseName}</td>
                    <td className="p-4">{c.InstructorName}</td>
                    <td className="p-4 text-slate-500">{c.Email}</td>
                    <td className="p-4">{c.Semester}</td>
                    <td className="p-4">{c.AcademicYear}</td>
                    <td className="p-4">{c.ProgramName}</td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => {
                            if (setActiveCourse) setActiveCourse(c);
                            if (setActiveTab) setActiveTab('cloMapping');
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                          disabled={loading}
                        >
                          เลือก
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(c.CourseCode)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                          disabled={loading}
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
