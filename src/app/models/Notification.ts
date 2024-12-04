export class Notification{
    id: number = 0;
    message: string = '';
    title: string = '';
    isRead: number = 0;
    newNotificationCount:number = 0;
    createdDate: Date = new Date();
    notificationType: String='';
}
