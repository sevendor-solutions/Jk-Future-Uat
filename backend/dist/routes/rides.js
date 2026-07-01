"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Ride_1 = require("../models/Ride");
const ScheduledRide_1 = require("../models/ScheduledRide");
const RideTracking_1 = require("../models/RideTracking");
const VehicleType_1 = require("../models/VehicleType");
const Customer_1 = require("../models/Customer");
const Partner_1 = require("../models/Partner");
const CancelReason_1 = require("../models/CancelReason");
const sequelize_1 = require("sequelize");
const router = (0, express_1.Router)();
console.log("🚕 Rides Routes Initialized");
// Helper function to generate OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}
// Helper function to calculate fare
function calculateFare(distance, vehicleType) {
    const baseFare = parseFloat(vehicleType.baseFare);
    const perKmRate = parseFloat(vehicleType.perKmRate);
    const fare = Math.max(baseFare, baseFare + (perKmRate * distance));
    const platformFee = fare * 0.05; // 5% platform fee
    const taxes = fare * 0.05; // 5% taxes
    const totalAmount = fare + platformFee + taxes;
    return {
        fare: Math.round(fare * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
        taxes: Math.round(taxes * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
    };
}
// GET /api/rides/rates - Get vehicle rates
router.get('/rates', async (req, res) => {
    try {
        const vehicleTypes = await VehicleType_1.VehicleType.findAll({
            where: { active: true },
            attributes: ['id', 'name', 'icon', 'baseFare', 'perKmRate', 'description']
        });
        res.json({
            success: true,
            data: vehicleTypes
        });
    }
    catch (error) {
        console.error('Error fetching vehicle rates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vehicle rates'
        });
    }
});
// POST /api/rides/book - Create new ride booking
router.post('/book', async (req, res) => {
    try {
        const { customerId, vehicleTypeId, pickupLocation, pickupLatitude, pickupLongitude, dropoffLocation, dropoffLatitude, dropoffLongitude, distance, estimatedDuration, paymentMethod = 'cash' } = req.body;
        // Validate required fields
        if (!customerId || !vehicleTypeId || !pickupLocation || !dropoffLocation || !distance) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        // Get vehicle type
        const vehicleType = await VehicleType_1.VehicleType.findByPk(vehicleTypeId);
        if (!vehicleType) {
            return res.status(404).json({
                success: false,
                error: 'Vehicle type not found'
            });
        }
        // Calculate fare
        const pricing = calculateFare(distance, vehicleType);
        // Generate OTP
        const otp = generateOTP();
        // Create ride
        const ride = await Ride_1.Ride.create({
            customerId,
            vehicleTypeId,
            pickupLocation,
            pickupLatitude: pickupLatitude || 0,
            pickupLongitude: pickupLongitude || 0,
            dropoffLocation,
            dropoffLatitude: dropoffLatitude || 0,
            dropoffLongitude: dropoffLongitude || 0,
            distance,
            estimatedDuration: estimatedDuration || 0,
            fare: pricing.fare,
            platformFee: pricing.platformFee,
            taxes: pricing.taxes,
            totalAmount: pricing.totalAmount,
            otp,
            paymentMethod,
            status: 'pending',
            paymentStatus: 'pending'
        });
        // Fetch complete ride data with associations
        const rideData = await Ride_1.Ride.findByPk(ride.id, {
            include: [
                { model: VehicleType_1.VehicleType, attributes: ['id', 'name', 'icon'] },
                { model: Customer_1.Customer, attributes: ['id', 'fullName', 'phone'] }
            ]
        });
        res.json({
            success: true,
            data: rideData,
            message: 'Ride booked successfully. Searching for nearby drivers...'
        });
    }
    catch (error) {
        console.error('Error booking ride:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to book ride'
        });
    }
});
// GET /api/rides/history - Get customer ride history
router.get('/history', async (req, res) => {
    try {
        const { customerId, page = 1, limit = 20, status } = req.query;
        if (!customerId) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID is required'
            });
        }
        const where = { customerId };
        if (status) {
            where.status = status;
        }
        const offset = (Number(page) - 1) * Number(limit);
        const { rows: rides, count } = await Ride_1.Ride.findAndCountAll({
            where,
            include: [
                { model: VehicleType_1.VehicleType, attributes: ['id', 'name', 'icon'] },
                { model: Partner_1.Partner, attributes: ['id', 'fullName', 'phone', 'vehicleNumber'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset
        });
        res.json({
            success: true,
            data: rides,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error fetching ride history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ride history'
        });
    }
});
// PUT /api/rides/:id/cancel - Cancel ride
router.put('/:id/cancel', async (req, res) => {
    console.log(`[Ride Cancel] Request for ID: ${req.params.id}`);
    try {
        const { id } = req.params;
        const { reasonId, reason: customReason } = req.body;
        const ride = await Ride_1.Ride.findByPk(id);
        if (!ride) {
            return res.status(404).json({
                success: false,
                error: 'Ride not found'
            });
        }
        if (ride.status === 'completed' || ride.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: `Cannot cancel a ${ride.status} ride`
            });
        }
        let finalReason = customReason || 'Cancelled by customer';
        if (reasonId) {
            const cancelReason = await CancelReason_1.CancelReason.findByPk(reasonId);
            if (cancelReason) {
                finalReason = cancelReason.reason;
            }
        }
        console.log(`[Ride Cancel] Found ride ${ride.id} with status ${ride.status}. Updating to cancelled...`);
        await ride.update({
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelReasonId: reasonId || null,
            cancellationReason: finalReason,
            paymentStatus: 'refunded'
        });
        console.log(`[Ride Cancel] Ride ${ride.id} status updated to: ${ride.status}`);
        res.json({
            success: true,
            data: ride,
            message: 'Ride cancelled successfully'
        });
    }
    catch (error) {
        console.error('Error cancelling ride:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel ride'
        });
    }
});
// POST /api/rides/schedule - Create scheduled ride
router.post('/schedule', async (req, res) => {
    try {
        const { customerId, vehicleTypeId, pickupLocation, pickupLatitude, pickupLongitude, dropoffLocation, dropoffLatitude, dropoffLongitude, scheduledTime, recurrence = 'one-time', reminderEnabled = true, reminderMinutes = 15 } = req.body;
        // Validate required fields
        if (!customerId || !vehicleTypeId || !pickupLocation || !dropoffLocation || !scheduledTime) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        // Validate scheduled time is in future
        const scheduledDate = new Date(scheduledTime);
        if (scheduledDate <= new Date()) {
            return res.status(400).json({
                success: false,
                error: 'Scheduled time must be in the future'
            });
        }
        // Get vehicle type for fare estimation
        const vehicleType = await VehicleType_1.VehicleType.findByPk(vehicleTypeId);
        if (!vehicleType) {
            return res.status(404).json({
                success: false,
                error: 'Vehicle type not found'
            });
        }
        // Estimate distance (in real app, calculate from coordinates)
        const estimatedDistance = 5; // Default 5km for now
        const pricing = calculateFare(estimatedDistance, vehicleType);
        // Create scheduled ride
        const scheduledRide = await ScheduledRide_1.ScheduledRide.create({
            customerId,
            vehicleTypeId,
            pickupLocation,
            pickupLatitude: pickupLatitude || 0,
            pickupLongitude: pickupLongitude || 0,
            dropoffLocation,
            dropoffLatitude: dropoffLatitude || 0,
            dropoffLongitude: dropoffLongitude || 0,
            scheduledTime: scheduledDate,
            recurrence,
            estimatedFare: pricing.totalAmount,
            reminderEnabled,
            reminderMinutes,
            status: 'scheduled'
        });
        // Fetch complete data
        const scheduledRideData = await ScheduledRide_1.ScheduledRide.findByPk(scheduledRide.id, {
            include: [
                { model: VehicleType_1.VehicleType, attributes: ['id', 'name', 'icon'] },
                { model: Customer_1.Customer, attributes: ['id', 'fullName', 'phone'] }
            ]
        });
        res.json({
            success: true,
            data: scheduledRideData,
            message: 'Ride scheduled successfully'
        });
    }
    catch (error) {
        console.error('Error scheduling ride:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to schedule ride'
        });
    }
});
// GET /api/rides/scheduled - Get all scheduled rides
router.get('/scheduled/list', async (req, res) => {
    try {
        const { customerId, upcoming = 'true' } = req.query;
        if (!customerId) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID is required'
            });
        }
        const where = { customerId };
        if (upcoming === 'true') {
            where.status = { [sequelize_1.Op.in]: ['scheduled', 'confirmed'] };
        }
        const scheduledRides = await ScheduledRide_1.ScheduledRide.findAll({
            where,
            include: [
                { model: VehicleType_1.VehicleType, attributes: ['id', 'name', 'icon'] }
            ],
            order: [['scheduledTime', 'ASC']]
        });
        res.json({
            success: true,
            data: scheduledRides
        });
    }
    catch (error) {
        console.error('Error fetching scheduled rides:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch scheduled rides'
        });
    }
});
// PUT /api/rides/scheduled/:id - Update scheduled ride
router.put('/scheduled/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduledTime, pickupLocation, dropoffLocation, recurrence } = req.body;
        const scheduledRide = await ScheduledRide_1.ScheduledRide.findByPk(id);
        if (!scheduledRide) {
            return res.status(404).json({
                success: false,
                error: 'Scheduled ride not found'
            });
        }
        if (scheduledRide.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                error: 'Cannot update a non-scheduled ride'
            });
        }
        const updates = {};
        if (scheduledTime) {
            const newScheduledDate = new Date(scheduledTime);
            if (newScheduledDate <= new Date()) {
                return res.status(400).json({
                    success: false,
                    error: 'Scheduled time must be in the future'
                });
            }
            updates.scheduledTime = newScheduledDate;
        }
        if (pickupLocation)
            updates.pickupLocation = pickupLocation;
        if (dropoffLocation)
            updates.dropoffLocation = dropoffLocation;
        if (recurrence)
            updates.recurrence = recurrence;
        await scheduledRide.update(updates);
        res.json({
            success: true,
            data: scheduledRide,
            message: 'Scheduled ride updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating scheduled ride:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update scheduled ride'
        });
    }
});
// DELETE /api/rides/scheduled/:id - Delete scheduled ride
router.delete('/scheduled/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const scheduledRide = await ScheduledRide_1.ScheduledRide.findByPk(id);
        if (!scheduledRide) {
            return res.status(404).json({
                success: false,
                error: 'Scheduled ride not found'
            });
        }
        await scheduledRide.update({
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: 'Cancelled by customer'
        });
        res.json({
            success: true,
            message: 'Scheduled ride cancelled successfully'
        });
    }
    catch (error) {
        console.error('Error deleting scheduled ride:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete scheduled ride'
        });
    }
});
// GET /api/rides/reasons - Get cancel reasons
router.get('/reasons', async (req, res) => {
    try {
        const reasons = await CancelReason_1.CancelReason.findAll({
            where: { active: true },
            attributes: ['id', 'reason']
        });
        res.json({
            success: true,
            data: reasons
        });
    }
    catch (error) {
        console.error('Error fetching cancel reasons:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cancel reasons'
        });
    }
});
// GET /api/rides/active - Get all active rides for a customer
router.get('/active', async (req, res) => {
    console.log(`[Ride Active] Fetching for customer: ${req.query.customerId}`);
    try {
        const { customerId } = req.query;
        if (!customerId) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID is required'
            });
        }
        const rides = await Ride_1.Ride.findAll({
            where: {
                customerId: Number(customerId),
                status: {
                    [sequelize_1.Op.in]: ['pending', 'accepted', 'in_progress']
                }
            },
            include: [
                { model: VehicleType_1.VehicleType, attributes: ['id', 'name', 'icon'] },
                { model: Partner_1.Partner, attributes: ['id', 'fullName', 'phone', 'vehicleNumber'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({
            success: true,
            data: rides
        });
    }
    catch (error) {
        console.error('Error fetching active rides:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch active rides'
        });
    }
});
// GET /api/rides/:id - Get specific ride details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // If id is "active" or "reasons", this shouldn't happen if they are defined above,
        // but let's be safe and check if it's a UUID
        const ride = await Ride_1.Ride.findByPk(id, {
            include: [
                { model: VehicleType_1.VehicleType, attributes: ['id', 'name', 'icon'] },
                { model: Partner_1.Partner, attributes: ['id', 'fullName', 'phone', 'vehicleNumber'] },
                { model: Customer_1.Customer, attributes: ['id', 'fullName', 'phone'] }
            ]
        });
        if (!ride) {
            return res.status(404).json({
                success: false,
                error: 'Ride not found'
            });
        }
        res.json({
            success: true,
            data: ride
        });
    }
    catch (error) {
        console.error('Error fetching ride:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ride details'
        });
    }
});
// GET /api/rides/:id/tracking - Get live tracking data
router.get('/:id/tracking', async (req, res) => {
    try {
        const { id } = req.params;
        const tracking = await RideTracking_1.RideTracking.findOne({
            where: { rideId: id },
            include: [
                { model: Partner_1.Partner, attributes: ['id', 'fullName', 'phone', 'vehicleNumber'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        if (!tracking) {
            return res.status(404).json({
                success: false,
                error: 'Tracking data not found'
            });
        }
        res.json({
            success: true,
            data: tracking
        });
    }
    catch (error) {
        console.error('Error fetching tracking data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tracking data'
        });
    }
});
exports.default = router;
//# sourceMappingURL=rides.js.map