import { initDatabases } from './dbManager.js';

let hostelDbInstance = null;

export const getHostelDb = async () => {
  if (!hostelDbInstance) {
    const { hostelDb } = await initDatabases();
    hostelDbInstance = hostelDb;
  }
  return hostelDbInstance;
};

export default getHostelDb;
