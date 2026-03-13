import prisma from "../config/prisma";

export const getStudentProfileService = async (studentId: number) => {
    try {

        // 1️⃣ Get student basic info + leaderboard
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                city: true,
                batch: true,
                leaderboards: true,
                _count: {
                    select: {
                        progress: true
                    }
                }
            }
        });

        if (!student) {
            throw new Error("Student not found");
        }

        const leaderboard = student.leaderboards;

        // 2️⃣ Get recent activity
        const recentActivity = await prisma.studentProgress.findMany({
            where: { student_id: studentId },
            include: {
                question: {
                    select: {
                        question_name: true,
                        level: true
                    }
                }
            },
            orderBy: {
                sync_at: "desc"
            },
            take: 5
        });

        // 3️⃣ Heatmap
        const heatmap = await prisma.$queryRaw`
      SELECT DATE(sync_at) as date, COUNT(*) as count
      FROM "StudentProgress"
      WHERE student_id = ${studentId}
      GROUP BY DATE(sync_at)
      ORDER BY date DESC
    ` as any[];

        return {
            student: {
                name: student.name,
                username: student.username,
                email: student.email,
                enrollmentId: student.enrollment_id,
                city: student.city?.city_name || null,
                batch: student.batch?.batch_name || null,
                github: student.github,
                linkedin: student.linkedin,
                leetcode: student.leetcode_id,
                gfg: student.gfg_id
            },

            codingStats: {
                totalSolved: student._count.progress
            },

            streak: {
                currentStreak: leaderboard?.current_streak || 0,
                maxStreak: leaderboard?.max_streak || 0
            },

            leaderboard: {
                globalRank: leaderboard?.alltime_global_rank || 0,
                cityRank: leaderboard?.alltime_city_rank || 0,
                totalScore:
                    (leaderboard?.hard_solved || 0) * 3 +
                    (leaderboard?.medium_solved || 0) * 2 +
                    (leaderboard?.easy_solved || 0) * 1
            },

            heatmap: heatmap.map((h) => ({
                date: h.date,
                count: Number(h.count)
            })),

            recentActivity: recentActivity.map((a) => ({
                problemTitle: a.question.question_name,
                difficulty: a.question.level,
                solvedAt: a.sync_at
            }))
        };

    } catch (error) {
        throw new Error(
            "Student profile retrieval failed: " +
            (error instanceof Error ? error.message : String(error))
        );
    }
};


export const getPublicStudentProfileService = async (username: string) => {

    const student = await prisma.student.findUnique({
        where: { username },
        include: {
            city: true,
            batch: true,
            leaderboards: true,
            _count: {
                select: {
                    progress: true
                }
            }
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    const studentId = student.id;

    const recentActivity = await prisma.studentProgress.findMany({
        where: { student_id: studentId },
        include: {
            question: {
                select: {
                    question_name: true,
                    level: true
                }
            }
        },
        orderBy: {
            sync_at: "desc"
        },
        take: 5
    });

    const heatmap = await prisma.$queryRaw`
      SELECT DATE(sync_at) as date, COUNT(*) as count
      FROM "StudentProgress"
      WHERE student_id = ${studentId}
      GROUP BY DATE(sync_at)
      ORDER BY date DESC
    ` as any[];

    const leaderboard = student.leaderboards;

    return {
        student: {
            name: student.name,
            username: student.username,
            city: student.city?.city_name || null,
            batch: student.batch?.batch_name || null,
            github: student.github,
            linkedin: student.linkedin,
            leetcode: student.leetcode_id,
            gfg: student.gfg_id
        },

        codingStats: {
            totalSolved: student._count.progress
        },

        streak: {
            currentStreak: leaderboard?.current_streak || 0,
            maxStreak: leaderboard?.max_streak || 0
        },

        leaderboard: {
            globalRank: leaderboard?.alltime_global_rank || 0,
            cityRank: leaderboard?.alltime_city_rank || 0,
            totalScore:
                (leaderboard?.hard_solved || 0) * 3 +
                (leaderboard?.medium_solved || 0) * 2 +
                (leaderboard?.easy_solved || 0) * 1
        },

        heatmap: heatmap.map((h) => ({
            date: h.date,
            count: Number(h.count)
        })),

        recentActivity: recentActivity.map((a) => ({
            problemTitle: a.question.question_name,
            difficulty: a.question.level,
            solvedAt: a.sync_at
        }))
    };
};