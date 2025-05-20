import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: String,
    hasBeenRead: { type: Boolean, default: false },
    time: { type: Date, default: Date.now },
}, { discriminatorKey: "kind" });

notificationSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject.__v;
        delete returnedObject._id;
    }
});

export const Notification = mongoose.model('Notification', notificationSchema);

export const ProjectReturnNotification = Notification.discriminator("ProjectReturnNotification",
    new mongoose.Schema({ projectId: Number, returnerStudentId: String }, { discriminatorKey: "kind" }));

export const ProjectUpdateNotification = Notification.discriminator("ProjectUpdateNotification",
    new mongoose.Schema({ projectId: Number, updateMessage: String }, { discriminatorKey: "kind" }
));
