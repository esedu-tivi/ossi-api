import { Schema, model } from "mongoose";

const notificationSchema = new Schema({
    recipient: String,
    hasBeenRead: { type: Boolean, default: false },
    time: { type: Date, default: Date.now },
    id: Schema.Types.ObjectId,
}, { discriminatorKey: "kind" });

notificationSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject.__v;
        delete returnedObject._id;
    }
});

export const Notification = model('Notification', notificationSchema);

export const ProjectReturnNotification = Notification.discriminator("ProjectReturnNotification",
    new Schema({ projectId: Number, returnerStudentId: String }, { discriminatorKey: "kind" }));

export const ProjectUpdateNotification = Notification.discriminator("ProjectUpdateNotification",
    new Schema({ projectId: Number, updateMessage: String }, { discriminatorKey: "kind" }
    ));
