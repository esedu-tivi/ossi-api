import 'dotenv/config'
import express, { json } from 'express';
import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";
import { Notification } from 'pg';
import redis from 'redis';

const redisClient = redis.createClient({ url: "redis://redis:6379" });
const redisSubscriber = redisClient.duplicate();

mongoose.connect("mongodb://mongo:27017/");

const notificationSchema = new mongoose.Schema({
    recipient: String,
    hasBeenRead: { type: Boolean, default: false },
    time: { type: Date, default: Date.now },
}, { discriminatorKey: "kind" });

const Notification = mongoose.model('Notification', notificationSchema);

notificationSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject.__v;
        delete returnedObject._id;
    }
});

const ProjectReturnNotification = Notification.discriminator("ProjectReturnNotification",
    new mongoose.Schema({ projectId: Number, returnerStudentId: String }, { discriminatorKey: "kind" }));

const ProjectUpdateNotification = Notification.discriminator("ProjectUpdateNotification",
    new mongoose.Schema({ projectId: Number, updateMessage: String }, { discriminatorKey: "kind" }
));

const app = express();

app.use(json());

app.get("/get_unread_notification_count", async (req, res) => {
    const user = jsonwebtoken.decode(req.headers.authorization) as any;

    return res.json({
        success: true,
        status: 200,
        count: await Notification.countDocuments({ recipient: user.id, hasBeenRead: false })
    });
});

app.get("/notification/:id", async (req, res) => {
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

app.get("/get_notifications", async (req, res) => {
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

app.post("/notification/:id/mark_as_read", async (req, res) => {
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



app.post("/send_notification", (req, res) => {
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

const notificationSubscriberHandler = async (notificationPayload) => {
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
    } else {
        throw Error();
    }

    notifications.forEach(async notification => await notification.save())
};

(async () => {
    app.listen(3000);

    await redisSubscriber.connect();
    await redisSubscriber.subscribe("notification", notificationSubscriberHandler);
})();
