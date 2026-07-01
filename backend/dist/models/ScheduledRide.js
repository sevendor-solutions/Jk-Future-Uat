"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledRide = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Customer_1 = require("./Customer");
const VehicleType_1 = require("./VehicleType");
let ScheduledRide = class ScheduledRide extends sequelize_typescript_1.Model {
};
exports.ScheduledRide = ScheduledRide;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true
    }),
    __metadata("design:type", String)
], ScheduledRide.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Customer_1.Customer),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], ScheduledRide.prototype, "customerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Customer_1.Customer),
    __metadata("design:type", Customer_1.Customer)
], ScheduledRide.prototype, "customer", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => VehicleType_1.VehicleType),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], ScheduledRide.prototype, "vehicleTypeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => VehicleType_1.VehicleType),
    __metadata("design:type", VehicleType_1.VehicleType)
], ScheduledRide.prototype, "vehicleType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ScheduledRide.prototype, "pickupLocation", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 6), allowNull: false }),
    __metadata("design:type", Number)
], ScheduledRide.prototype, "pickupLatitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 6), allowNull: false }),
    __metadata("design:type", Number)
], ScheduledRide.prototype, "pickupLongitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ScheduledRide.prototype, "dropoffLocation", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 6), allowNull: false }),
    __metadata("design:type", Number)
], ScheduledRide.prototype, "dropoffLatitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 6), allowNull: false }),
    __metadata("design:type", Number)
], ScheduledRide.prototype, "dropoffLongitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], ScheduledRide.prototype, "scheduledTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('one-time', 'daily', 'weekly'),
        defaultValue: 'one-time'
    }),
    __metadata("design:type", String)
], ScheduledRide.prototype, "recurrence", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], ScheduledRide.prototype, "estimatedFare", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('scheduled', 'confirmed', 'cancelled', 'completed'),
        defaultValue: 'scheduled'
    }),
    __metadata("design:type", String)
], ScheduledRide.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: true }),
    __metadata("design:type", String)
], ScheduledRide.prototype, "rideId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], ScheduledRide.prototype, "cancelledAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], ScheduledRide.prototype, "cancellationReason", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: true }),
    __metadata("design:type", Boolean)
], ScheduledRide.prototype, "reminderEnabled", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 15 }),
    __metadata("design:type", Number)
], ScheduledRide.prototype, "reminderMinutes", void 0);
exports.ScheduledRide = ScheduledRide = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "scheduled_rides" })
], ScheduledRide);
//# sourceMappingURL=ScheduledRide.js.map