/**
 * Re-seeds ONLY the roles collection.
 * Does NOT touch customers, invoices, staff, or any other data.
 */
import mongoose, { connect } from '../config/database';
import { RoleModel } from '../models/role.model';
import { ROLES, PERM_MATRIX } from '../data/seed-data';

async function main() {
  await connect();

  await RoleModel.deleteMany({});
  await RoleModel.insertMany(
    ROLES.map((role) => ({
      id: role.id,
      name: role.name,
      desc: role.desc,
      color: role.color,
      userCount: role.users,
      matrix: PERM_MATRIX[role.name] ?? {},
    })),
  );

  console.log(JSON.stringify({
    success: true,
    message: 'Roles re-seeded successfully (other collections untouched)',
    roles: ROLES.length,
  }, null, 2));

  process.exit(0);
}

void main().catch((error) => {
  console.error('Role seed failed');
  console.error(error);
  process.exit(1);
}).finally(() => mongoose.disconnect().catch(() => undefined));
