import express, { json } from "express";
import jsonwebtoken from "jsonwebtoken";
import { Notification, ProjectReturnNotification, ProjectUpdateNotification } from '../models/notification.js';

const router = express()

router.use(json());

router.get("/unread_notification_count", async (req, res) => {
    const user = jsonwebtoken.decode(req.headers.authorization) as any;

    return res.json({
        success: true,
        status: 200,
        count: await Notification.countDocuments({ recipient: user.id, hasBeenRead: false })
    });
});

router.get("/:id", async (req, res) => {
    const user = jsonwebtoken.decode(req.headers.authorization) as any;

    const notification = await Notification.findOne({
        _id: req.params.id,
        recipient: user.id
    });

    if (!notification) {
        return res.json({
            success: false,
            status: 404,
            message: "Notification not found"
        });
    }

    return res.json({
        success: true,
        status: 200,
        notification: notification
    });
});

router.get("/", async (req, res) => {
    const user = jsonwebtoken.decode(req.headers.authorization) as any;

    const notifications = await Notification.find({
        recipient: user.id
    });

    return res.json({
        success: true,
        status: 200,
        notifications: notifications
    });
});

router.post("/:id/mark_as_read", async (req, res) => {
    const user = jsonwebtoken.decode(req.headers.authorization) as any;

    const notification = await Notification.findOneAndUpdate({
        _id: req.params.id,
        recipient: user.id
    }, {
        hasBeenRead: true
    });
    
    if (!notification) {
        return res.json({
            success: false,
            status: 404,
            message: "Notification not found"
        });
    }

    return res.json({
        success: true,
        status: 200 
    });
});



router.post("/send_notification", (req, res) => {
    const recipients = req.body.recipients;
    const requestNotification = req.body.notification;
    
    let notifications;

    if (requestNotification.type == "ProjectReturn") {
        notifications = recipients.map(recipient => new ProjectReturnNotification({
            recipient,
            ...requestNotification
        }));
    } else if (requestNotification.type == "ProjectUpdate") {
        notifications = recipients.map(recipient => new ProjectUpdateNotification({
            recipient,
            ...requestNotification
        }));
    } else {
        throw Error();
    }
    
    notifications.forEach(async notification => await notification.save())

    res.json({});
});

export const NotificationRouter = router;
