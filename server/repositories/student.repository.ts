import { StudentModel } from '../models/Student';

export class StudentRepository {
  /**
   * Find student by unique student ID or custom field `studentId` or `id`
   */
  async findByIdOrStudentId(id: string) {
    return await StudentModel.findOne({
      $or: [
        { id },
        { studentId: id }
      ]
    });
  }

  /**
   * Find student by MongoDB standard ID
   */
  async findById(id: string) {
    return await StudentModel.findById(id);
  }

  /**
   * Save student document
   */
  async save(studentDoc: any) {
    return await studentDoc.save();
  }
}

export const studentRepository = new StudentRepository();
