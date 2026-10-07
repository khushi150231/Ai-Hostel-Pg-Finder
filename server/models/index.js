import { initStudentModel, Student } from './Student.js';
import { initFavouriteModel, Favourite } from './Favourite.js';
import { initSearchModel, Search } from './Search.js';
import { initStudentFeedbackModel, StudentFeedback } from './StudentFeedback.js';
import { initHostelModel, Hostel } from './Hostel.js';
import { initOwnerModel, Owner } from './Owner.js';
import { initReviewModel, Review } from './Review.js';
import { initEnquiryModel, Enquiry } from './Enquiry.js';
import { initCollegeModel, College } from './College.js';
import { initAreaModel, Area } from './Area.js';

export const initAllModels = ({ studentDb, hostelDb }) => {
  // student_finder_db models
  initStudentModel(studentDb);
  initFavouriteModel(studentDb);
  initSearchModel(studentDb);
  initStudentFeedbackModel(studentDb);

  // hostel_finder_db models
  initHostelModel(hostelDb);
  initOwnerModel(hostelDb);
  initReviewModel(hostelDb);
  initEnquiryModel(hostelDb);
  initCollegeModel(hostelDb);
  initAreaModel(hostelDb);

  console.log('All Mongoose models initialized across student_finder_db and hostel_finder_db.');
};

export {
  Student,
  Favourite,
  Search,
  StudentFeedback,
  Hostel,
  Owner,
  Review,
  Enquiry,
  College,
  Area,
};
