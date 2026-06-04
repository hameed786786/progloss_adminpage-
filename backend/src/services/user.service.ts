import { UserModel } from '../models/user.model';

export class UserService {
  async findByEmail(email: string): Promise<any | null> {
    return UserModel.findOne({ email }).lean<any>().exec();
  }

  async findById(id: string): Promise<any | null> {
    return UserModel.findById(id).lean<any>().exec();
  }

  async create(payload: any): Promise<any> {
    const doc = new UserModel(payload);
    await doc.save();
    return doc.toObject();
  }

  async update(id: string, patch: any): Promise<any | null> {
    return UserModel.findByIdAndUpdate(id, patch, { new: true }).lean<any>().exec();
  }
}

export const userService = new UserService();
