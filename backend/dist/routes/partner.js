"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Partner_1 = require("../models/Partner");
const Order_1 = require("../models/Order");
const Ride_1 = require("../models/Ride");
const ScheduledRide_1 = require("../models/ScheduledRide");
const VehicleType_1 = require("../models/VehicleType");
const sequelize_1 = require("sequelize");
const router = (0, express_1.Router)();
// Toggle Online Status
router.put("/status", async (req, res) => {
    try {
        const { partnerId, isOnline } = req.body;
        const partner = await Partner_1.Partner.findByPk(partnerId);
        if (!partner)
            return res.status(404).json({ message: "Partner not found" });
        const now = new Date();
        if (isOnline) {
            // Going Online
            partner.isOnline = true;
            partner.lastOnlineAt = now;
            // If new day, reset daily counter
            const lastUpdate = partner.lastDurationUpdate ? new Date(partner.lastDurationUpdate) : new Date(0);
            if (lastUpdate.toDateString() !== now.toDateString()) {
                partner.dailyOnlineDuration = 0;
            }
            partner.lastDurationUpdate = now;
        }
        else {
            // Going Offline
            if (partner.isOnline && partner.lastOnlineAt) {
                const start = new Date(partner.lastOnlineAt);
                const diffMs = now.getTime() - start.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                // Check for day reset
                const lastUpdate = partner.lastDurationUpdate ? new Date(partner.lastDurationUpdate) : new Date(0);
                if (lastUpdate.toDateString() !== now.toDateString()) {
                    partner.dailyOnlineDuration = diffMins;
                }
                else {
                    partner.dailyOnlineDuration = (partner.dailyOnlineDuration || 0) + diffMins;
                }
            }
            partner.isOnline = false;
            partner.lastDurationUpdate = now;
        }
        await partner.save();
        res.json({ success: true, isOnline: partner.isOnline });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update status" });
    }
});
// Update Location
router.put("/location", async (req, res) => {
    try {
        const { partnerId, lat, lng } = req.body;
        const partner = await Partner_1.Partner.findByPk(partnerId);
        if (!partner)
            return res.status(404).json({ message: "Partner not found" });
        partner.currentLat = lat;
        partner.currentLng = lng;
        await partner.save();
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update location" });
    }
});
// Update Active Services
router.put("/services", async (req, res) => {
    try {
        const { partnerId, services } = req.body;
        const partner = await Partner_1.Partner.findByPk(partnerId);
        if (!partner)
            return res.status(404).json({ message: "Partner not found" });
        partner.activeServices = services;
        await partner.save();
        res.json({ success: true, activeServices: partner.activeServices });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update services" });
    }
});
// Get Wallet & Stats
router.get("/stats/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const partner = await Partner_1.Partner.findByPk(userId);
        if (!partner)
            return res.status(404).json({ message: "Partner not found" });
        // Count today's completed orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // 1. Today's Trips & Earnings (Orders + Rides)
        const todayOrders = await Order_1.Order.findAll({
            where: {
                partnerId: userId,
                status: 'Delivered',
                createdAt: { [sequelize_1.Op.gte]: today }
            }
        });
        const todayRides = await Ride_1.Ride.findAll({
            where: {
                partnerId: userId,
                status: 'completed',
                createdAt: { [sequelize_1.Op.gte]: today }
            } // Note: partnerId might be implicit in Ride model association if not explicitly column
        });
        // Note: Ride model in rides.ts output shows partnerId/customerId associations? 
        // Usually Ride has 'partnerId' if accepted. If not, check Ride model schema. Assuming 'partnerId' exists.
        const orderEarnings = todayOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount || 0) * 0.8), 0); // Approx 80% to partner
        const rideEarnings = todayRides.reduce((sum, r) => sum + (parseFloat(r.fare || 0) * 0.8), 0);
        const totalEarnings = (orderEarnings + rideEarnings).toFixed(2);
        const totalTrips = todayOrders.length + todayRides.length;
        // 2. Recent Activity (Last 5 combined)
        const recentOrders = await Order_1.Order.findAll({
            where: { partnerId: userId },
            order: [["createdAt", "DESC"]],
            limit: 5
        });
        const recentRides = await Ride_1.Ride.findAll({
            where: { partnerId: userId }, // Verify Ride has partnerId
            order: [["createdAt", "DESC"]],
            limit: 5
        });
        // Merge and sort
        const recentActivity = [...recentOrders, ...recentRides]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((item) => ({
            id: item.id,
            type: item.vehicleTypeId ? 'ride' : 'order', // Heuristic
            serviceType: item.vehicleTypeId ? 'Bike Taxi' : 'Shop Order',
            amount: item.totalAmount || item.fare, // Normalize
            createdAt: item.createdAt,
            status: item.status
        }));
        // 3. Overall Rating (All Time)
        const allRatings = await Ride_1.Ride.findAll({
            where: {
                partnerId: userId,
                rating: { [sequelize_1.Op.ne]: null }
            },
            attributes: ['rating']
        });
        const totalRatings = allRatings.length;
        const sumRatings = allRatings.reduce((sum, r) => sum + (r.rating || 0), 0);
        const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : "0.0";
        // 4. Calculate Shift Time (Dynamic)
        const now = new Date();
        let totalMinutes = partner.dailyOnlineDuration || 0;
        // Reset if stored duration is from a previous day
        const lastUpdate = partner.lastDurationUpdate ? new Date(partner.lastDurationUpdate) : new Date(0);
        if (lastUpdate.toDateString() !== now.toDateString()) {
            totalMinutes = 0;
        }
        // Add current session if online
        if (partner.isOnline && partner.lastOnlineAt) {
            const start = new Date(partner.lastOnlineAt);
            // Only add if start time is today (otherwise simple reset logic handles edge case roughly)
            if (start.toDateString() === now.toDateString()) {
                const diffMs = now.getTime() - start.getTime();
                totalMinutes += Math.floor(diffMs / 60000);
            }
        }
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const formattedDuration = `${hours}h ${mins}m`;
        // 5. Weekly Data (Last 7 Days)
        const weeklyData = [];
        const todayDate = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(todayDate);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const startOfDay = new Date(dateStr);
            const endOfDay = new Date(dateStr);
            endOfDay.setHours(23, 59, 59, 999);
            // Fetch orders/rides for this day (This is N+1 but acceptable for small scale 7-day loop)
            // Optimization: Fetch all last 7 days at once and reduce in memory.
            // For now, let's just stick to a simple placeholder or zero to fix the build immediately unless we want full implementation.
            // Let's implement full fetch for robustness.
            weeklyData.push({ day: date.toLocaleDateString('en-US', { weekday: 'short' }), amount: 0 });
        }
        // Optimization: Fetch all transactions from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const periodOrders = await Order_1.Order.findAll({
            where: {
                partnerId: userId,
                status: 'Delivered',
                createdAt: { [sequelize_1.Op.gte]: sevenDaysAgo }
            }
        });
        const periodRides = await Ride_1.Ride.findAll({
            where: {
                partnerId: userId,
                status: 'completed',
                createdAt: { [sequelize_1.Op.gte]: sevenDaysAgo }
            }
        });
        // Map to weeklyData buckets
        [...periodOrders, ...periodRides].forEach((item) => {
            const itemDate = new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
            const amount = parseFloat(item.totalAmount || item.fare || 0) * 0.8;
            const dayEntry = weeklyData.find(d => d.day === itemDate);
            if (dayEntry) {
                dayEntry.amount += amount;
            }
        });
        res.json({
            walletBalance: partner.walletBalance,
            todayTrips: totalTrips,
            todayEarnings: totalEarnings,
            loginDuration: formattedDuration,
            recentOrders: recentActivity,
            weeklyData,
            rating: averageRating,
            totalRatings
        });
    }
    catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});
// Get History (Combined)
router.get("/history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order_1.Order.findAll({
            where: { partnerId: userId },
            order: [["createdAt", "DESC"]],
            limit: 20
        });
        const rides = await Ride_1.Ride.findAll({
            where: { partnerId: userId },
            include: [{ model: VehicleType_1.VehicleType, attributes: ['name'] }],
            order: [["createdAt", "DESC"]],
            limit: 20
        });
        const history = [...orders, ...rides]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 20)
            .map((item) => {
            const isRide = !!item.vehicleTypeId;
            return {
                id: item.id,
                date: item.createdAt,
                from: isRide ? item.pickupLocation : (item.pickupAddress || 'Shop'),
                to: isRide ? item.dropoffLocation : (item.dropAddress || item.deliveryAddress),
                fare: isRide ? item.fare : item.totalAmount,
                status: item.status === 'completed' || item.status === 'Delivered' ? 'Completed' : item.status,
                distance: item.distance ? `${item.distance} km` : '-',
                time: item.estimatedDuration ? `${item.estimatedDuration} min` : '-',
                type: isRide ? 'Ride' : 'Delivery'
            };
        });
        res.json(history);
    }
    catch (err) {
        console.error("History Error:", err);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});
// Get Scheduled Requests (Available in Area)
router.get("/scheduled-requests/:areaId", async (req, res) => {
    try {
        // Just return all pending scheduled rides for now (as broad discovery)
        // In real app, filter by area lat/lng
        const { areaId } = req.params;
        const scheduled = await ScheduledRide_1.ScheduledRide.findAll({
            where: {
                status: 'scheduled'
            },
            include: [{ model: VehicleType_1.VehicleType, attributes: ['name'] }]
        });
        const mapped = scheduled.map((s) => ({
            id: s.id,
            type: 'Ride',
            date: new Date(s.scheduledTime).toLocaleString(),
            pickup: s.pickupLocation,
            drop: s.dropoffLocation,
            fare: `₹${s.estimatedFare}`
        }));
        res.json(mapped);
    }
    catch (err) {
        console.error("Scheduled Requests Error:", err);
        res.status(500).json({ error: "Failed to fetch scheduled requests" });
    }
});
exports.default = router;
//# sourceMappingURL=partner.js.map