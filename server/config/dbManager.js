import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

let studentDbConnection = null;
let hostelDbConnection = null;
let memoryServer = null;

const buildUri = (baseUri, dbName) => {
  if (!baseUri) return null;
  // If baseUri already contains database query params
  try {
    const url = new URL(baseUri.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://'));
    // If path is specified
    const protocol = baseUri.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
    const authAndHost = baseUri.slice(protocol.length).split('/')[0].split('?')[0];
    const query = baseUri.includes('?') ? '?' + baseUri.split('?')[1] : '';
    return `${protocol}${authAndHost}/${dbName}${query}`;
  } catch {
    const cleanBase = baseUri.replace(/\/+$/, '');
    return `${cleanBase}/${dbName}`;
  }
};

export const initDatabases = async () => {
  if (studentDbConnection && hostelDbConnection) {
    return { studentDb: studentDbConnection, hostelDb: hostelDbConnection };
  }

  const baseUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  let studentUri = process.env.STUDENT_DB_URI || buildUri(baseUri, process.env.STUDENT_DB_NAME || 'student_finder_db');
  let hostelUri = process.env.HOSTEL_DB_URI || buildUri(baseUri, process.env.HOSTEL_DB_NAME || 'hostel_finder_db');

  const mongooseOpts = {
    serverSelectionTimeoutMS: 4000,
  };

  try {
    console.log(`Connecting to Student DB: ${studentUri.replace(/:[^:]*@/, ':****@')}`);
    studentDbConnection = await mongoose.createConnection(studentUri, mongooseOpts).asPromise();
    console.log(`Connected to Student Database: ${studentDbConnection.name}`);

    console.log(`Connecting to Hostel DB: ${hostelUri.replace(/:[^:]*@/, ':****@')}`);
    hostelDbConnection = await mongoose.createConnection(hostelUri, mongooseOpts).asPromise();
    console.log(`Connected to Hostel Database: ${hostelDbConnection.name}`);
  } catch (err) {
    console.warn(`\n[Database Notice] Could not connect to primary MongoDB at ${baseUri}: ${err.message}`);
    console.log('[Database Fallback] Initializing in-memory MongoDB instance for local testing & development...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();

      studentUri = `${memUri}student_finder_db`;
      hostelUri = `${memUri}hostel_finder_db`;

      studentDbConnection = await mongoose.createConnection(studentUri).asPromise();
      hostelDbConnection = await mongoose.createConnection(hostelUri).asPromise();
      console.log(`Connected to in-memory databases (student_finder_db & hostel_finder_db).`);
    } catch (memErr) {
      console.error('Fatal: Could not initialize database connection.', memErr);
      throw memErr;
    }
  }

  studentDbConnection.on('error', (err) => console.error('Student DB Error:', err));
  hostelDbConnection.on('error', (err) => console.error('Hostel DB Error:', err));

  return { studentDb: studentDbConnection, hostelDb: hostelDbConnection };
};

export const closeDatabases = async () => {
  if (studentDbConnection) await studentDbConnection.close();
  if (hostelDbConnection) await hostelDbConnection.close();
  if (memoryServer) await memoryServer.stop();
  studentDbConnection = null;
  hostelDbConnection = null;
  memoryServer = null;
};
