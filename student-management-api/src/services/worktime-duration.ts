import prisma from "prisma-orm";
import { HttpError } from "../classes/HttpError.js";

export const calculateWorktimeDurationMinutes = (
    startDate: Date | string,
    endDate: Date | string
): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new HttpError(400, "invalid worktime dates");
    }

    if (end.getTime() <= start.getTime()) {
        throw new HttpError(400, "endDate must be after startDate");
    }

    return Math.round((end.getTime() - start.getTime()) / 60000);
};

export const recordStudentWorktimeLog = async (input: {
    userId: number;
    projectId: number;
    worktimeEntryId: number;
    startDate: Date | string;
    endDate: Date | string;
}) => {
    const durationMinutes = calculateWorktimeDurationMinutes(input.startDate, input.endDate);

    console.log(JSON.stringify({
        event: "student_worktime",
        userId: input.userId,
        projectId: input.projectId,
        worktimeEntryId: input.worktimeEntryId,
        durationMinutes
    }));

    return prisma.studentWorktimeLog.create({
        data: {
            userId: input.userId,
            projectId: input.projectId,
            worktimeEntryId: input.worktimeEntryId,
            durationMinutes
        }
    });
};
