import prisma, { Prisma } from "prisma-orm";
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
    totalWorktimeMinutes: number;
    worktimeLogs: { id: number; projectId: number; durationMinutes: number; recordedAt: Date }[];
}

const SORT_VALUES: AssignedStudentsSort[] = ["lastLogin", "name", "xp"];
const LOGIN_LOG_LIMIT = 10;
const WORKTIME_LOG_LIMIT = 10;

export const parseAssignedStudentsSort = (value: unknown): AssignedStudentsSort => {
    if (value === undefined || value === null || value === "") {
        return "lastLogin";
    }

    if (typeof value === "string" && SORT_VALUES.includes(value as AssignedStudentsSort)) {
        return value as AssignedStudentsSort;
    }

    console.warn(`Invalid assignedStudents sortBy: ${String(value)}`);
    throw new HttpError(
        400,
        `Invalid sortBy. Allowed values: ${SORT_VALUES.join(", ")}`
    );
};

export const sortAssignedStudentRows = (
    rows: AssignedStudentRow[],
    sortBy: AssignedStudentsSort
): AssignedStudentRow[] => {
    const sorted = [...rows];

    if (sortBy === "name") {
        return sorted.sort((a, b) => {
            const byLast = a.lastName.localeCompare(b.lastName, "fi");
            if (byLast !== 0) {
                return byLast;
            }
            return a.firstName.localeCompare(b.firstName, "fi");
        });
    }

    if (sortBy === "xp") {
        return sorted.sort((a, b) => b.xp - a.xp || b.id - a.id);
    }

    return sorted.sort((a, b) => {
        const aTime = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const bTime = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        return bTime - aTime || b.id - a.id;
    });
};

const fetchLastLoginAtByUserIds = async (userIds: number[]): Promise<Map<number, Date>> => {
    if (userIds.length === 0) {
        return new Map();
    }

    const grouped = await prisma.studentLoginLog.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _max: { loggedInAt: true },
    });

    return new Map(
        grouped
            .filter((entry) => entry._max.loggedInAt !== null)
            .map((entry) => [entry.userId, entry._max.loggedInAt as Date])
    );
};

const fetchRecentLoginLogsByUserIds = async (
    userIds: number[]
): Promise<Map<number, { id: number; loggedInAt: Date }[]>> => {
    const logsByUser = new Map<number, { id: number; loggedInAt: Date }[]>();

    if (userIds.length === 0) {
        return logsByUser;
    }

    const rows = await prisma.$queryRaw<
        { id: number; user_id: number; logged_in_at: Date }[]
    >(Prisma.sql`
        SELECT id, user_id, logged_in_at
        FROM (
            SELECT id, user_id, logged_in_at,
                ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY logged_in_at DESC) AS rn
            FROM student_login_logs
            WHERE user_id IN (${Prisma.join(userIds)})
        ) ranked
        WHERE rn <= ${LOGIN_LOG_LIMIT}
        ORDER BY user_id, logged_in_at DESC
    `);

    for (const row of rows) {
        const existing = logsByUser.get(row.user_id) ?? [];
        existing.push({ id: row.id, loggedInAt: row.logged_in_at });
        logsByUser.set(row.user_id, existing);
    }

    return logsByUser;
};

const fetchWorktimeSummaryByUserIds = async (
    userIds: number[]
): Promise<{
    totalMinutesByUser: Map<number, number>;
    recentLogsByUser: Map<number, { id: number; projectId: number; durationMinutes: number; recordedAt: Date }[]>;
}> => {
    const totalMinutesByUser = new Map<number, number>();
    const recentLogsByUser = new Map<number, { id: number; projectId: number; durationMinutes: number; recordedAt: Date }[]>();

    if (userIds.length === 0) {
        return { totalMinutesByUser, recentLogsByUser };
    }

    const totals = await prisma.studentWorktimeLog.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _sum: { durationMinutes: true }
    });

    for (const entry of totals) {
        totalMinutesByUser.set(entry.userId, entry._sum.durationMinutes ?? 0);
    }

    const rows = await prisma.$queryRaw<
        { id: number; user_id: number; project_id: number; duration_minutes: number; recorded_at: Date }[]
    >(Prisma.sql`
        SELECT id, user_id, project_id, duration_minutes, recorded_at
        FROM (
            SELECT id, user_id, project_id, duration_minutes, recorded_at,
                ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY recorded_at DESC) AS rn
            FROM student_worktime_logs
            WHERE user_id IN (${Prisma.join(userIds)})
        ) ranked
        WHERE rn <= ${WORKTIME_LOG_LIMIT}
        ORDER BY user_id, recorded_at DESC
    `);

    for (const row of rows) {
        const existing = recentLogsByUser.get(row.user_id) ?? [];
        existing.push({
            id: row.id,
            projectId: row.project_id,
            durationMinutes: row.duration_minutes,
            recordedAt: row.recorded_at
        });
        recentLogsByUser.set(row.user_id, existing);
    }

    return { totalMinutesByUser, recentLogsByUser };
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
                            users: true
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

            rows.push({
                id: student.userId,
                firstName: student.users.firstName,
                lastName: student.users.lastName,
                email: student.users.email,
                groupId: group.groupName,
                xp: student.xp,
                lastLoginAt: null,
                loginLogs: [],
                totalWorktimeMinutes: 0,
                worktimeLogs: []
            });
        }
    }

    const studentIds = rows.map((row) => row.id);
    const [lastLoginByUser, loginLogsByUser, worktimeSummary] = await Promise.all([
        fetchLastLoginAtByUserIds(studentIds),
        fetchRecentLoginLogsByUserIds(studentIds),
        fetchWorktimeSummaryByUserIds(studentIds)
    ]);

    for (const row of rows) {
        row.lastLoginAt = lastLoginByUser.get(row.id) ?? null;
        row.loginLogs = loginLogsByUser.get(row.id) ?? [];
        row.totalWorktimeMinutes = worktimeSummary.totalMinutesByUser.get(row.id) ?? 0;
        row.worktimeLogs = worktimeSummary.recentLogsByUser.get(row.id) ?? [];
    }

    return sortAssignedStudentRows(rows, sortBy);
};
