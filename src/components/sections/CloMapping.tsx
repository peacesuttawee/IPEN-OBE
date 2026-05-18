import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FALLBACK_PO, FALLBACK_PI, BLOOM_LEVELS } from '../../data/constants';
import { Plus, Trash2 } from 'lucide-react';

export const CloMapping: React.FC<{ clos: any[], refresh: () => void }> = ({ clos, refresh }) => {
  const [cloRows, setCloRows] = useState<any[]>([]);
  const [status, setStatus] = useState<{message: string, type: 'ok'|'error'} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cloRows.length === 0) {
      handleAddRow();
    }
  }, []);

  const handleAddRow = () => {
    const nextNo = clos.length + cloRows.length + 1;
    setCloRows(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      cloNo: `CLO${nextNo}`,
      bloomLevel: '',
      assessmentMethod: '',
      cloStatement: '',
      poNo: '',
      piNo: ''
    }]);
  };

  const handleRemoveRow = (id: string) => {
    setCloRows(prev => prev.filter(r => r.id !== id));
  };

  const handleChange = (id: string, field: string, value: string) => {
    setCloRows(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        if (field === 'poNo') updated.piNo = ''; // reset PI when PO changes
        return updated;
      }
      return r;
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus({ message: 'กำลังบันทึก CLO Mapping...', type: 'ok' });
    try {
      await api.saveCLOBatch({ items: cloRows });
      setStatus({ message: 'บันทึก CLO Mapping เรียบร้อยแล้ว', type: 'ok' });
      refresh();
      setCloRows([]);
      setTimeout(() => handleAddRow(), 0);
    } catch (err: any) {
      setStatus({ message: `Error: ${err.message}`, type: 'error' });
    }
    setLoading(false);
  };

  const handleEditCLO = (clo: any) => {
    setCloRows([{
      id: clo.CLOID,
      cloNo: clo.CLONo,
      bloomLevel: clo.BloomLevel,
      assessmentMethod: clo.AssessmentMethod,
      cloStatement: clo.CLOStatement,
      poNo: clo.PONo,
      piNo: clo.PINo
    }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCLO = async (cloId: string, cloNo: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${cloNo}?`)) {
      setLoading(true);
      try {
        await api.deleteCLO(cloId);
        setStatus({ message: `ลบ ${cloNo} เรียบร้อยแล้ว`, type: 'ok' });
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
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-extrabold text-slate-800 m-0">2. CLO Mapping</h3>
          <button className="btn-secondary py-1.5 text-sm flex items-center gap-1" onClick={handleAddRow}>
            <Plus className="w-4 h-4" /> Add CLO
          </button>
        </div>
        <p className="text-slate-500 text-sm mb-6">กรอก CLO โดยไม่ต้องเลือกหรือโหลด Course จากส่วนที่ 1</p>
        
        <div className="space-y-4">
          {cloRows.map((row) => {
            const availablePIs = FALLBACK_PI.filter(pi => !row.poNo || pi.PONo === row.poNo);
            const selectedPI = FALLBACK_PI.find(pi => pi.PINo === row.piNo);

            return (
              <div key={row.id} className="clo-row relative group bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <button 
                  onClick={() => handleRemoveRow(row.id)}
                  className="absolute -right-3 -top-3 bg-white text-rose-500 hover:text-white hover:bg-rose-500 border border-slate-200 hover:border-rose-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label>CLO Code (รหัส CLO)
                    <input value={row.cloNo} readOnly className="bg-slate-50 cursor-not-allowed font-bold" />
                  </label>
                  <label>Bloom Level (ระดับ Bloom)
                    <select value={row.bloomLevel} onChange={e => handleChange(row.id, 'bloomLevel', e.target.value)}>
                      <option value="">Select Bloom Level</option>
                      {BLOOM_LEVELS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </label>
                  <label>Assessment Method (วิธีการประเมิน)
                    <input placeholder="Exam / Assignment / Project" value={row.assessmentMethod} onChange={e => handleChange(row.id, 'assessmentMethod', e.target.value)} />
                  </label>
                </div>
                
                <label className="mt-4">CLO Statement (รายละเอียด CLO)
                  <textarea className="min-h-[80px]" placeholder="ระบุ CLO" value={row.cloStatement} onChange={e => handleChange(row.id, 'cloStatement', e.target.value)} />
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <label>Mapped PO (เลือก PO)
                    <select value={row.poNo} onChange={e => handleChange(row.id, 'poNo', e.target.value)}>
                      <option value="">Select PO</option>
                      {FALLBACK_PO.map(po => <option key={po.PONo} value={po.PONo}>{po.PONo} - {po.POName}</option>)}
                    </select>
                  </label>
                  <label>Mapped PI (เลือก PI)
                    <select value={row.piNo} onChange={e => handleChange(row.id, 'piNo', e.target.value)} disabled={!row.poNo}>
                      <option value="">Select PI</option>
                      {availablePIs.map(pi => (
                        <option key={pi.PINo} value={pi.PINo}>{pi.PINo} - {pi.PIDescription.substring(0,40)}...</option>
                      ))}
                    </select>
                  </label>
                </div>
                
                {selectedPI && (
                  <div className="info-box mt-4 animate-in fade-in bg-indigo-50/50 border-indigo-100">
                    <p className="font-bold text-indigo-900 mb-1">PI Detail</p>
                    <p className="text-slate-600 mb-3 leading-relaxed">{selectedPI.PIDescription}</p>
                    <div className="flex gap-2">
                      <span className="badge bg-white border border-indigo-100">TK: {selectedPI.TK || '-'}</span>
                      <span className="badge bg-white border border-indigo-100">Bloom: {selectedPI.BloomLevel || '-'}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
          <button className="btn-primary" onClick={handleSave} disabled={loading || cloRows.length === 0}>
            {loading ? 'Saving...' : 'Save CLO Mapping'}
          </button>
        </div>
        
        {status && (
          <div className={status.type === 'ok' ? 'status-ok' : 'status-error'}>
            {status.message}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-extrabold text-slate-800 mb-6">Saved CLOs</h3>
        {clos.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-slate-500 font-medium">ยังไม่มี CLO ที่บันทึกไว้</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">CLO</th>
                  <th className="p-4">CLO Statement</th>
                  <th className="p-4">Bloom</th>
                  <th className="p-4">Assessment</th>
                  <th className="p-4">PO</th>
                  <th className="p-4">PI</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clos.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{r.CLONo}</td>
                    <td className="p-4 min-w-[200px]">{r.CLOStatement}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium text-xs border border-purple-100">{r.BloomLevel}</span>
                    </td>
                    <td className="p-4">{r.AssessmentMethod}</td>
                    <td className="p-4">
                      <div className="font-bold">{r.PONo}</div>
                      <div className="text-xs text-slate-500 mt-1 max-w-[150px] line-clamp-2">{r.POName}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold">{r.PINo}</div>
                      <div className="text-xs text-slate-500 mt-1 max-w-[200px] line-clamp-2">{r.PIDescription}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => handleEditCLO(r)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                          disabled={loading}
                        >
                          แก้ไข
                        </button>
                        <button 
                          onClick={() => handleDeleteCLO(r.CLOID, r.CLONo)}
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
