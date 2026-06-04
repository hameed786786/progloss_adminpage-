import { AuditLogModel } from '../models/auditLog.model';
import { userService } from '../services/user.service';
import { emit } from '../integrations/socket';

export async function logAudit(
  userId: string | undefined,
  role: string | undefined,
  action: string,
  ip: string | undefined
) {
  let actor = 'System';
  if (userId) {
    try {
      const user = await userService.findById(userId);
      if (user) {
        actor = user.name || user.email || 'System';
      }
    } catch (err) {
      console.error('Audit user lookup failed', err);
    }
  }

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ts = `Today ${hours}:${minutes}`;

  try {
    const log = await AuditLogModel.create({
      ts,
      actor,
      role: role || 'System',
      action,
      ip: ip || '—'
    });

    // Fetch list and emit to update audit tables in real-time
    const list = await AuditLogModel.find().sort({ createdAt: -1 }).lean();
    emit('audit:update', list);
    return log;
  } catch (err) {
    console.error('Failed to save audit log', err);
  }
}
