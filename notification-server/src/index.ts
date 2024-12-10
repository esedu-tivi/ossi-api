import 'dotenv/config'
import express, { json } from 'express';
import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";
import { Notification } from 'pg';

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

app.get("/get_unread_notification_count", (req, res) => {

});

app.get("/notification/:id", (req, res) => {

});

app.get("/get_notifications", async (req, res) => {
    const id = req.headers.authorization;

    return res.json(await Notification.find({}));
});

// Should not be exposed on the internet
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

app.listen(3000)
