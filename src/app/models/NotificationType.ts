export class NotificationType {

    id: number = 0;
    description: string = '';
    name: string = '';
}

export interface NotificationTypeInfoRequest {
    id: number;
    notificationTypeId: number;
    minutes: string;
    sendReminderType: string;
    reminderType: string;
    status: string;
  }
