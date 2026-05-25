import prisma from "prisma-orm";
import { HttpError } from "../classes/HttpError.js";

export type AssignedStudentsSort = "lastLogin" | "name" | "xp";

export interface AssignedStudentRow {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    groupId: string;
    xp: number;
    lastLoginAt: Date | null;
    loginLogs: { id: number; loggedInAt: Date }[];
}

const SORT_VALUES: AssignedStudentsSort[] = ["lastLogin", "name", "xp"];

export const parseAssignedStudentsSort = (value: unknown): AssignedStudentsSort => {
    if (typeof value === "string" && SORT_VALUES.includes(value as AssignedStudentsSort)) {
        return value as AssignedStudentsSort;
    }
    return "lastLogin";
};

const sortAssignedStudents = (rows: AssignedStudentRow[], sortBy: AssignedStudentsSort): void => {
    if (sortBy === "name") {
        rows.sort((a, b) => {
            const byLast = a.lastName.localeCompare(b.lastName, "fi");
            if (byLast !== 0) {
                return byLast;
            }
            return a.firstName.localeCompare(b.firstName, "fi");
        });
        return;
    }

    if (sortBy === "xp") {
        rows.sort((a, b) => b.xp - a.xp || b.id - a.id);
        return;
    }

    rows.sort((a, b) => {
        const aTime = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const bTime = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        return bTime - aTime || b.id - a.id;
    });
};

export const getAssignedStudentsForTeacher = async (
    teacherUserId: number,
    sortBy: AssignedStudentsSort = "lastLogin"
): Promise<AssignedStudentRow[]> => {
    const teacher = await prisma.teacher.findUnique({
        where: { userId: teacherUserId },
        select: {
            studentGroups: {
                select: {
                    groupName: true,
                    students: {
                        include: {
                            users: {
                                include: {
                                    loginLogs: {
                                        orderBy: { loggedInAt: "desc" },
                                        take: 50,
                                        select: { id: true, loggedInAt: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!teacher) {
        throw new HttpError(404, "Teacher not found");
    }

    const seen = new Set<number>();
    const rows: AssignedStudentRow[] = [];

    for (const group of teacher.studentGroups) {
        for (const student of group.students) {
            if (seen.has(student.userId)) {
                continue;
            }
            seen.add(student.userId);

            const loginLogs = student.users.loginLogs;

            rows.push({
                id: student.userId,
                firstName: student.users.firstName,
                lastName: student.users.lastName,
                email: student.users.email,
                groupId: group.groupName,
                xp: student.xp,
                lastLoginAt: loginLogs[0]?.loggedInAt ?? null,
                loginLogs
            });
        }
    }

    sortAssignedStudents(rows, sortBy);
    return rows;
};
