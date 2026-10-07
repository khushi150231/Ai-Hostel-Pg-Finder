import { initDatabases } from './dbManager.js';

let studentDbInstance = null;

export const getStudentDb = async () => {
  if (!studentDbInstance) {
    const { studentDb } = await initDatabases();
    studentDbInstance = studentDb;
  }
  return studentDbInstance;
};

export default getStudentDb;
