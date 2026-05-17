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

export const api = {
  async getInitialData() {
    await delay(500); // simulate network
    return {
      po: FALLBACK_PO,
      pi: FALLBACK_PI,
      courses: getFromStorage('ipen_courses', []),
      cloMapped: getFromStorage('ipen_clo', []),
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
      PrerequisiteCourse: courseData.prerequisiteCourse,
      Other: courseData.other,
      CourseDescription: courseData.courseDescription,
    };

    if (existingIndex > -1) {
      courses[existingIndex] = formatted;
    } else {
      courses.push(formatted);
    }
    saveToStorage('ipen_courses', courses);
    return { success: true };
  },

  async saveCLOBatch(payload: any) {
    await delay(600);
    const items = payload.items.map((item: any) => {
      const piData = FALLBACK_PI.find(p => p.PINo === item.piNo) || {} as any;
      const poData = FALLBACK_PO.find(p => p.PONo === item.poNo) || {} as any;
      return {
        CLONo: item.cloNo,
        CLOStatement: item.cloStatement,
        BloomLevel: item.bloomLevel,
        AssessmentMethod: item.assessmentMethod,
        PONo: item.poNo,
        POName: poData.POName || '',
        PINo: item.piNo,
        PIDescription: piData.PIDescription || '',
        CLOID: Math.random().toString(36).substr(2, 9)
      };
    });
    
    // For demo, just replace the whole array
    saveToStorage('ipen_clo', items);
    return { success: true };
  },

  async saveSyllabus(payload: any) {
    await delay(600);
    saveToStorage('ipen_syllabus', payload);
    return { success: true };
  },

  async savePortfolio(payload: any) {
    await delay(600);
    saveToStorage('ipen_portfolio', payload);
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
