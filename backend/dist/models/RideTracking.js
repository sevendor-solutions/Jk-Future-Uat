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
exports.RideTracking = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Ride_1 = require("./Ride");
const Partner_1 = require("./Partner");
let RideTracking = class RideTracking extends sequelize_typescript_1.Model {
};
exports.RideTracking = RideTracking;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true
    }),
    __metadata("design:type", String)
], RideTracking.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Ride_1.Ride),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], RideTracking.prototype, "rideId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Ride_1.Ride),
    __metadata("design:type", Ride_1.Ride)
], RideTracking.prototype, "ride", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Partner_1.Partner),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], RideTracking.prototype, "partnerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Partner_1.Partner),
    __metadata("design:type", Partner_1.Partner)
], RideTracking.prototype, "partner", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 6), allowNull: false }),
    __metadata("design:type", Number)
], RideTracking.prototype, "currentLatitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 6), allowNull: false }),
    __metadata("design:type", Number)
], RideTracking.prototype, "currentLongitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], RideTracking.prototype, "updatedEta", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], RideTracking.prototype, "statusUpdate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: true }),
    __metadata("design:type", Number)
], RideTracking.prototype, "distanceToPickup", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: true }),
    __metadata("design:type", Number)
], RideTracking.prototype, "distanceToDropoff", void 0);
exports.RideTracking = RideTracking = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "ride_tracking" })
], RideTracking);
//# sourceMappingURL=RideTracking.js.map