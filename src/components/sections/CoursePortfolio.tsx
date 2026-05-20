import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { UploadCloud } from 'lucide-react';

export const CoursePortfolio: React.FC<{ clos: any[], refresh: () => void, activeCourse?: any, data?: any }> = ({ clos, refresh, activeCourse, data }) => {
  const [portfolioData, setPortfolioData] = useState<any>({});
  const [status, setStatus] = useState<{message: string, type: 'ok'|'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  const filteredClos = clos.filter(c => c.CourseCode === activeCourse?.CourseCode);

  useEffect(() => {
    const existingPortfolio = activeCourse ? data?.portfolioList?.find((p: any) => p.CourseCode === activeCourse.CourseCode)?.items : null;
    const initialData: any = {};
    
    filteredClos.forEach(c => {
      const existing = existingPortfolio?.find((ep: any) => ep.cloId === c.CLOID);
      initialData[c.CLOID] = {
        expected: existing?.expectedPercent || 50,
        actual: existing?.actualPercent || '',
        average: existing?.averageScorePercent || '',
        comment: existing?.instructorComment || '',
        files: existing?.files || {}
      };
    });
    setPortfolioData(initialData);
  }, [clos, activeCourse, data]);

  const handleDataChange = (cloId: string, field: string, value: string) => {
    setPortfolioData((prev: any) => ({
      ...prev,
      [cloId]: { ...prev[cloId], [field]: value }
    }));
  };

  const handleFileUpload = async (cloId: string, fileId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileKey = `${cloId}_${fileId}`;
      setUploadingFiles(prev => ({ ...prev, [fileKey]: true }));
      
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });

        const base64Content = base64Data.split(',')[1];
        const res = await api.uploadFile(base64Content, file.name, file.type);
        
        if (res.success && res.url) {
          setPortfolioData((prev: any) => ({
            ...prev,
            [cloId]: {
              ...prev[cloId],
              files: {
                ...(prev[cloId]?.files || {}),
                [fileId]: res.url
              }
            }
          }));
          setStatus({ message: 'อัปโหลดไฟล์ไปที่ Google Drive สำเร็จ', type: 'ok' });
        }
      } catch (err: any) {
        setStatus({ message: `Upload error: ${err.message}`, type: 'error' });
      } finally {
        setUploadingFiles(prev => ({ ...prev, [fileKey]: false }));
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus({ message: 'กำลังบันทึก Portfolio...', type: 'ok' });
    try {
      const items = filteredClos.map(c => ({
        cloId: c.CLOID,
        cloNo: c.CLONo,
        poNo: c.PONo,
        piNo: c.PINo,
        expectedPercent: portfolioData[c.CLOID]?.expected,
        actualPercent: portfolioData[c.CLOID]?.actual,
        averageScorePercent: portfolioData[c.CLOID]?.average,
        instructorComment: portfolioData[c.CLOID]?.comment,
        files: portfolioData[c.CLOID]?.files
      }));
      await api.savePortfolio({ 
        courseCode: activeCourse?.CourseCode, 
        academicYear: activeCourse?.AcademicYear,
        semester: activeCourse?.Semester,
        items 
      });
      setStatus({ message: 'บันทึก Portfolio และหลักฐานเรียบร้อยแล้ว', type: 'ok' });
      refresh();
    } catch (err: any) {
      setStatus({ message: `Error: ${err.message}`, type: 'error' });
    }
    setLoading(false);
  };

  if (filteredClos.length === 0) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-800 mb-2">ยังไม่มีข้อมูล CLO</h3>
          <p className="text-slate-500">
            ยังไม่มี CLO จากส่วนที่ 2 หรือข้อมูลยังไม่ถูก Refresh กรุณากลับไปบันทึก CLO แล้วกด Refresh
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="card">
        <h3 className="text-lg font-extrabold text-slate-800 mb-2">4. Course Portfolio</h3>
        <p className="text-slate-500 text-sm mb-6">ส่วนนี้ดึง CLO จากส่วนที่ 2 มาแสดง เป้าหมายเริ่มต้น 50%</p>
        
        <div className="status-ok mb-6 flex items-center justify-between">
          <span className="font-bold">Loaded CLO from Part 2</span>
          <span className="badge bg-emerald-200 text-emerald-800 m-0 px-3 py-1">{filteredClos.length} รายการ</span>
        </div>

        <div className="space-y-6">
          {filteredClos.map(c => (
            <div key={c.CLOID} className="portfolio-item bg-white shadow-sm border border-slate-200 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-200 hover:shadow-md transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1">{c.CLONo}: {c.CLOStatement}</h3>
              <p className="text-sm text-slate-500 mb-5 pb-4 border-b border-slate-100">
                <span className="font-semibold text-slate-700">PO:</span> {c.PONo} <span className="mx-2 text-slate-300">|</span> 
                <span className="font-semibold text-slate-700">PI:</span> {c.PINo} - {c.PIDescription}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label>Target (%)</label>
                  <div className="relative">
                    <input type="number" value={portfolioData[c.CLOID]?.expected ?? ''} onChange={e => handleDataChange(c.CLOID, 'expected', e.target.value)} className="pr-8" />
                    <span className="absolute right-3 top-[18px] text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <div>
                  <label>Attainment (%)</label>
                  <div className="relative">
                    <input type="number" value={portfolioData[c.CLOID]?.actual || ''} onChange={e => handleDataChange(c.CLOID, 'actual', e.target.value)} placeholder="เช่น 72" className="pr-8" />
                    <span className="absolute right-3 top-[18px] text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <div>
                  <label>Average Score (%)</label>
                  <div className="relative">
                    <input type="number" value={portfolioData[c.CLOID]?.average || ''} onChange={e => handleDataChange(c.CLOID, 'average', e.target.value)} placeholder="เช่น 75.5" className="pr-8" />
                    <span className="absolute right-3 top-[18px] text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { id: 'Question_Paper_File_URL', label: '1. ไฟล์ข้อสอบที่ใช้วัด' },
                  { id: 'Answer_File_URL', label: '2. ไฟล์ตัวอย่างกระดาษคำตอบ' },
                  { id: 'Exam_File_URL', label: '3. ไฟล์คะแนน/ผลประเมิน' }
                ].map(fileReq => {
                  const hasFile = portfolioData[c.CLOID]?.files?.[fileReq.id];
                  const fileName = hasFile ? (hasFile.includes('drive.google.com') ? 'Google Drive Link' : decodeURIComponent(hasFile.split('/').pop() || '')) : '';
                  const fileKey = `${c.CLOID}_${fileReq.id}`;
                  const isUploading = uploadingFiles[fileKey];

                  return (
                    <div key={fileReq.id} className={`border ${hasFile ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'} rounded-xl p-3 flex flex-col justify-between group/upload hover:border-purple-300 transition-colors relative`}>
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center rounded-xl">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-700 mb-2"></div>
                          <span className="text-[10px] text-purple-700 font-bold">Uploading...</span>
                        </div>
                      )}
                      
                      <label className="text-xs mb-2 font-medium">{fileReq.label}</label>
                      
                      {hasFile && (
                        <a href={hasFile} target="_blank" rel="noreferrer" className="mb-2 text-[10px] text-emerald-700 bg-emerald-100 p-1.5 rounded-md truncate hover:underline cursor-pointer block text-center" title={hasFile}>
                          ✅ {fileName}
                        </a>
                      )}
                      
                      <div className="relative overflow-hidden mt-auto">
                        <input 
                          type="file" 
                          onChange={(e) => handleFileUpload(c.CLOID, fileReq.id, e)}
                          className={`absolute inset-0 w-full h-full opacity-0 z-10 ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`} 
                          disabled={isUploading}
                        />
                        <div className={`bg-white border ${hasFile ? 'border-emerald-200' : 'border-slate-300'} rounded-lg p-2 text-center flex flex-col items-center gap-1 group-hover/upload:border-purple-400 group-hover/upload:bg-purple-50 transition-colors`}>
                          <UploadCloud className={`w-4 h-4 ${hasFile ? 'text-emerald-500' : 'text-slate-400'} group-hover/upload:text-purple-500`} />
                          <span className="text-[10px] text-slate-500 font-medium">{hasFile ? 'เปลี่ยนไฟล์' : 'Choose File'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <label>ความเห็นผู้สอนใน CLO นี้
                <textarea 
                  value={portfolioData[c.CLOID]?.comment || ''} 
                  onChange={e => handleDataChange(c.CLOID, 'comment', e.target.value)} 
                  placeholder="ข้อคิดเห็น จุดแข็ง จุดอ่อน แนวทางปรับปรุง" 
                  className="min-h-[80px]"
                />
              </label>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Course Portfolio'}
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
