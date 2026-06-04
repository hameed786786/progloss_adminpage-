import { RoleModel } from '../models/role.model';
import { UserModel } from '../models/user.model';

export class RoleService {
  async create(payload: any): Promise<any> {
    const doc = new RoleModel(payload);
    await doc.save();
    return doc.toObject();
  }

  async findByName(name: string): Promise<any | null> {
    return RoleModel.findOne({ name }).lean<any>().exec();
  }

  async list(): Promise<any[]> {
    const [roles, userCounts] = await Promise.all([
      RoleModel.find().lean<any>().exec(),
      UserModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);
    const countMap = Object.fromEntries(userCounts.map((u) => [u._id, u.count]));
    return roles.map((role: any) => ({
      id: role.id ?? `ROL-${role.name.slice(0, 3).toUpperCase()}`,
      name: role.name,
      desc: role.desc ?? '',
      color: role.color ?? 'neutral',
      users: countMap[role.name] ?? role.userCount ?? 0,
      matrix: role.matrix ?? {},
    }));
  }

  async updateMatrix(name: string, matrix: Record<string, Record<string, boolean>>): Promise<any | null> {
    return RoleModel.findOneAndUpdate({ name }, { matrix, updatedAt: new Date() }, { upsert: true, new: true }).lean<any>().exec();
  }

  async deleteByName(name: string) {
    return RoleModel.deleteOne({ name });
  }
}

export const roleService = new RoleService();
