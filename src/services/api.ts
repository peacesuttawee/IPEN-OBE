// Mock data store using localStorage to simulate Google Sheets backend
import { FALLBACK_PO, FALLBACK_PI } from '../data/constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getFromStorage = (key: string, defaultValue: any) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const saveToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0d5tMUhDxvRKC9e7Z81HhLPerEs5RhcAMfl48gQggQAqBlPBkGx0B4Vi1CEn6xEA6/exec';

const syncToGoogleSheets = async (action: string, data: any) => {
  try {
    // ใช้ text/plain เพื่อเลี่ยงปัญหา CORS preflight ในบราวเซอร์
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, data })
    });
  } catch (error) {
    console.error('Failed to sync to Google Sheets:', error);
  }
};

export const api = {
  async getInitialData() {
    await delay(500); // simulate network
    return {
      po: FALLBACK_PO,
      pi: FALLBACK_PI,
      courses: getFromStorage('ipen_courses', []),
      cloMapped: getFromStorage('ipen_clo', []),
      syllabusList: getFromStorage('ipen_syllabus_list', []),
      portfolioList: getFromStorage('ipen_portfolio_list', []),
    };
  },

  async saveCourse(courseData: any) {
    await delay(600);
    const courses = getFromStorage('ipen_courses', []);
    // Simple update or add
    const existingIndex = courses.findIndex((c: any) => c.CourseCode === courseData.courseCode);
    const formatted = {
      CourseCode: courseData.courseCode,
      CourseName: courseData.courseName,
      InstructorName: courseData.instructorName,
      Email: courseData.email,
      Semester: courseData.semester,
      AcademicYear: courseData.academicYear,
      ProgramName: courseData.programName,
      CourseDescription: courseData.courseDescription,
    };

    if (existingIndex > -1) {
      courses[existingIndex] = formatted;
    } else {
      courses.push(formatted);
    }
    saveToStorage('ipen_courses', courses);
    
    // Sync to Google Sheets
    const syncPayload = {
      CourseID: `${courseData.courseCode}-${courseData.academicYear}-${courseData.semester}`,
      AcademicYear: courseData.academicYear,
      Semester: courseData.semester,
      CourseCode: courseData.courseCode,
      CourseName: courseData.courseName,
      'Instructor Name': courseData.instructorName,
      'Instructor Email': courseData.email,
      CourseDescription: courseData.courseDescription,
      ProgramName: courseData.programName,
      Status: 'Draft'
    };
    syncToGoogleSheets('saveCourse', syncPayload);
    
    return { success: true };
  },

  async deleteCourse(courseCode: string) {
    await delay(300);
    const courses = getFromStorage('ipen_courses', []);
    const updatedCourses = courses.filter((c: any) => c.CourseCode !== courseCode);
    saveToStorage('ipen_courses', updatedCourses);
    
    // Cascade delete related CLOs
    const clos = getFromStorage('ipen_clo', []);
    const updatedClos = clos.filter((c: any) => c.CourseCode !== courseCode);
    saveToStorage('ipen_clo', updatedClos);

    // Delete syllabus (since it's a single object right now, maybe we make it an array? No, the code says saveToStorage('ipen_syllabus', payload). We need to change that to an array or map)
    const syllabusAll = getFromStorage('ipen_syllabus_list', []);
    const updatedSyllabus = syllabusAll.filter((s: any) => s.CourseCode !== courseCode);
    saveToStorage('ipen_syllabus_list', updatedSyllabus);
    
    const portfoliosAll = getFromStorage('ipen_portfolio_list', []);
    const updatedPortfolios = portfoliosAll.filter((p: any) => p.CourseCode !== courseCode);
    saveToStorage('ipen_portfolio_list', updatedPortfolios);

    // Sync to Google Sheets
    syncToGoogleSheets('deleteCourse', { CourseCode: courseCode });
    
    return { success: true };
  },

  async saveCLOBatch(payload: any) {
    await delay(600);
    const existingClos = getFromStorage('ipen_clo', []);

    const newItems = payload.items.map((item: any) => {
      const piData = FALLBACK_PI.find(p => p.PINo === item.piNo) || {} as any;
      const poData = FALLBACK_PO.find(p => p.PONo === item.poNo) || {} as any;
      return {
        CourseCode: payload.courseCode,
        CLONo: item.cloNo,
        CLOStatement: item.cloStatement,
        BloomLevel: item.bloomLevel,
        AssessmentMethod: item.assessmentMethod,
        PONo: item.poNo,
        POName: poData.POName || '',
        PINo: item.piNo,
        PIDescription: piData.PIDescription || '',
        CLOID: item.id || Math.random().toString(36).substr(2, 9)
      };
    });
    
    // Merge logic
    const updatedClos = [...existingClos];
    newItems.forEach((newItem: any) => {
      const idx = updatedClos.findIndex((c: any) => c.CLOID === newItem.CLOID);
      if (idx > -1) {
        updatedClos[idx] = newItem;
      } else {
        updatedClos.push(newItem);
      }
    });

    saveToStorage('ipen_clo', updatedClos);
    
    // Sync to Google Sheets
    const syncItems = newItems.map((item: any) => ({
      CourseCode: payload.courseCode,
      CLO_Number: item.CLONo,
      CLO_Description: item.CLOStatement,
      PO: item.PONo,
      PI: item.PINo,
      PI_Description: item.PIDescription,
      PO_Description: item.POName,
      Assessment_Method: item.AssessmentMethod
    }));
    syncToGoogleSheets('saveCLOBatch', syncItems);
    
    return { success: true };
  },

  async deleteCLO(cloId: string) {
    await delay(300);
    const clos = getFromStorage('ipen_clo', []);
    const updatedClos = clos.filter((c: any) => c.CLOID !== cloId);
    saveToStorage('ipen_clo', updatedClos);
    
    // Sync to Google Sheets
    syncToGoogleSheets('deleteCLO', { CLOID: cloId });
    
    return { success: true };
  },

  async saveSyllabus(payload: any) {
    await delay(600);
    const list = getFromStorage('ipen_syllabus_list', []);
    const idx = list.findIndex((s: any) => s.CourseCode === payload.courseCode);
    const formatted = { CourseCode: payload.courseCode, ...payload };
    if (idx > -1) {
      list[idx] = formatted;
    } else {
      list.push(formatted);
    }
    saveToStorage('ipen_syllabus_list', list);
    
    // Sync to Google Sheets
    syncToGoogleSheets('saveSyllabus', formatted);
    
    return { success: true };
  },

  async savePortfolio(payload: any) {
    await delay(600);
    const list = getFromStorage('ipen_portfolio_list', []);
    const idx = list.findIndex((p: any) => p.CourseCode === payload.courseCode);
    const formatted = { CourseCode: payload.courseCode, ...payload };
    if (idx > -1) {
      list[idx] = formatted;
    } else {
      list.push(formatted);
    }
    saveToStorage('ipen_portfolio_list', list);
    
    const syncItems = payload.items.map((item: any) => ({
      CourseCode: payload.courseCode,
      CLO_Number: item.cloNo,
      Target_Percent: item.expectedPercent,
      Attainment_Percent: item.actualPercent,
      Average_Score_Percent: item.averageScorePercent,
      Exam_File_URL: item.files?.Exam_File_URL || '',
      Question_Paper_File_URL: item.files?.Question_Paper_File_URL || '',
      Answer_File_URL: item.files?.Answer_File_URL || '',
      Comment: item.instructorComment
    }));
    syncToGoogleSheets('savePortfolio', syncItems);
    
    return { success: true };
  },

  async getDebugInfo() {
    await delay(300);
    return {
      courses: { count: getFromStorage('ipen_courses', []).length },
      clos: { count: getFromStorage('ipen_clo', []).length }
    };
  }
};
