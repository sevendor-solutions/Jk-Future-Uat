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
exports.ServiceRate = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Area_1 = require("./Area");
let ServiceRate = class ServiceRate extends sequelize_typescript_1.Model {
};
exports.ServiceRate = ServiceRate;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true
    }),
    __metadata("design:type", String)
], ServiceRate.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: false }),
    __metadata("design:type", String)
], ServiceRate.prototype, "serviceType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: false }),
    __metadata("design:type", String)
], ServiceRate.prototype, "vehicleTypeId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Area_1.Area),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "areaId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Area_1.Area),
    __metadata("design:type", Area_1.Area)
], ServiceRate.prototype, "area", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "baseFare", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "baseDistance", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "perKmRate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), defaultValue: 1.0 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "nightSurcharge", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), defaultValue: 0 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "platformFee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(5, 2), defaultValue: 0 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "taxes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(5, 2), defaultValue: 0 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "commission", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(5, 2), defaultValue: 2.0 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "longPickupLimit", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), defaultValue: 0 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "longPickupRate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), defaultValue: 0 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "minFare", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), defaultValue: 0 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "timeRate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 3 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "waitingFreeLimit", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), defaultValue: 0 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "waitingRate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), defaultValue: 0 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "cancellationFee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSON, defaultValue: [] }),
    __metadata("design:type", Object)
], ServiceRate.prototype, "distanceTiers", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), defaultValue: 0 }),
    __metadata("design:type", Number)
], ServiceRate.prototype, "platformFeeFixed", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false }),
    __metadata("design:type", Boolean)
], ServiceRate.prototype, "isPlatformFeeFixed", void 0);
exports.ServiceRate = ServiceRate = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "service_rates" })
], ServiceRate);
//# sourceMappingURL=ServiceRate.js.map