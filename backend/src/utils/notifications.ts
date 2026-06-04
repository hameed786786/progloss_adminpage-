import { NotificationTemplateModel } from '../models/notificationTemplate.model';
import { emit } from '../integrations/socket';

export async function triggerNotification(trigger: string) {
  try {
    const template = await NotificationTemplateModel.findOne({ trigger, status: 'active' });
    if (template) {
      template.sent = (template.sent || 0) + 1;
      template.sent24h = (template.sent24h || 0) + 1;
      if (template.type === 'sms' || template.type === 'push') {
        template.delivered = (template.delivered || 0) + 1;
      }
      await template.save();

      const list = await NotificationTemplateModel.find().lean();
      emit('notificationTemplates:update', list);
    }
  } catch (err) {
    console.error(`Failed to trigger notification for ${trigger}:`, err);
  }
}
