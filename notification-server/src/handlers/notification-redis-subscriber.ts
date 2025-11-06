import { ProjectReturnNotification, ProjectStatusChangeNotification, ProjectUpdateNotification } from '../models/notification.js';

export const notificationSubscriberHandler = async (notificationPayload) => {
    const { recipients, notification } = JSON.parse(notificationPayload);

    let notifications;

    if (notification.type == "ProjectReturn") {
        notifications = recipients.map(recipient => new ProjectReturnNotification({
            recipient,
            ...notification
        }));
    } else if (notification.type == "ProjectUpdate") {
        notifications = recipients.map(recipient => new ProjectUpdateNotification({
            recipient,
            ...notification
        }));
    } else if (notification.type == "ProjectStatusChange") {
        notifications = recipients.map(recipient => new ProjectStatusChangeNotification({
            recipient,
            ...notification
        }))
    } else {
        throw Error();
    }

    notifications.forEach(async notification => await notification.save())
};
