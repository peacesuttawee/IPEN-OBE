import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { UploadCloud } from 'lucide-react';

export const CoursePortfolio: React.FC<{ clos: any[], refresh: () => void }> = ({ clos, refresh }) => {
  const [portfolioData, setPortfolioData] = useState<any>({});
  const [status, setStatus] = useState<{message: string, type: 'ok'|'error'} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize data from clos
    const initialData: any = {};
    clos.forEach(c => {
      initialData[c.CLOID] = {
        expected: 50,
        actual: '',
        comment: '',
        files: {}
      };
    });
    setPortfolioData(initialData);
  }, [clos]);

  const handleDataChange = (cloId: string, field: string, value: string) => {
    setPortfolioData((prev: any) => ({
      ...prev,
      [cloId]: { ...prev[cloId], [field]: value }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus({ message: 'กำลังบันทึก Portfolio...', type: 'ok' });
    try {
      const items = clos.map(c => ({
        cloId: c.CLOID,
        cloNo: c.CLONo,
        poNo: c.PONo,
        piNo: c.PINo,
        expectedPercent: portfolioData[c.CLOID]?.expected,
        actualPercent: portfolioData[c.CLOID]?.actual,
        instructorComment: portfolioData[c.CLOID]?.comment
      }));
      await api.savePortfolio({ items });
      setStatus({ message: 'บันทึก Portfolio และหลักฐานเรียบร้อยแล้ว', type: 'ok' });
      refresh();
    } catch (err: any) {
      setStatus({ message: `Error: ${err.message}`, type: 'error' });
    }
    setLoading(false);
  };

  if (clos.length === 0) {
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
          <span className="badge bg-emerald-200 text-emerald-800 m-0 px-3 py-1">{clos.length} รายการ</span>
        </div>

        <div className="space-y-6">
          {clos.map(c => (
            <div key={c.CLOID} className="portfolio-item bg-white shadow-sm border border-slate-200 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-200 hover:shadow-md transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1">{c.CLONo}: {c.CLOStatement}</h3>
              <p className="text-sm text-slate-500 mb-5 pb-4 border-b border-slate-100">
                <span className="font-semibold text-slate-700">PO:</span> {c.PONo} <span className="mx-2 text-slate-300">|</span> 
                <span className="font-semibold text-slate-700">PI:</span> {c.PINo} - {c.PIDescription}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label>Expected %</label>
                  <div className="relative">
                    <input type="number" value={portfolioData[c.CLOID]?.expected || 50} onChange={e => handleDataChange(c.CLOID, 'expected', e.target.value)} className="pr-8" />
                    <span className="absolute right-3 top-[18px] text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <div>
                  <label>Actual CLO Result %</label>
                  <div className="relative">
                    <input type="number" value={portfolioData[c.CLOID]?.actual || ''} onChange={e => handleDataChange(c.CLOID, 'actual', e.target.value)} placeholder="เช่น 72" className="pr-8" />
                    <span className="absolute right-3 top-[18px] text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { id: 'q', label: '1. Upload ข้อสอบที่ใช้วัด' },
                  { id: 'h', label: '2A. ตัวอย่างกระดาษคำตอบ คะแนนสูง' },
                  { id: 'm', label: '2B. ตัวอย่างกระดาษคำตอบ คะแนนกลาง' },
                  { id: 'l', label: '2C. ตัวอย่างกระดาษคำตอบ คะแนนต่ำ' }
                ].map(fileReq => (
                  <div key={fileReq.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col justify-between group/upload hover:border-purple-300 transition-colors">
                    <label className="text-xs mb-3">{fileReq.label}</label>
                    <div className="relative overflow-hidden">
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="bg-white border border-slate-300 rounded-lg p-2 text-center flex flex-col items-center gap-1 group-hover/upload:border-purple-400 group-hover/upload:bg-purple-50 transition-colors">
                        <UploadCloud className="w-5 h-5 text-slate-400 group-hover/upload:text-purple-500" />
                        <span className="text-[10px] text-slate-500 font-medium">Choose File</span>
                      </div>
                    </div>
                  </div>
                ))}
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
