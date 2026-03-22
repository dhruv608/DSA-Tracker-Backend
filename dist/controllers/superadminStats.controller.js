"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuperAdminStats = void 0;
const superadminStats_service_1 = require("../services/superadminStats.service");
const getSuperAdminStats = async (req, res) => {
    try {
        const stats = await (0, superadminStats_service_1.getSuperAdminStatsService)();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error("System stats controller error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch system statistics"
        });
    }
};
exports.getSuperAdminStats = getSuperAdminStats;
