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
exports.CommissionSettings = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Area_1 = require("./Area");
const Shop_1 = require("./Shop");
let CommissionSettings = class CommissionSettings extends sequelize_typescript_1.Model {
};
exports.CommissionSettings = CommissionSettings;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Area_1.Area),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        comment: 'null = global settings, otherwise specific to area or shop'
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "areaId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Shop_1.Shop),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        comment: 'If provided, these settings override area and global'
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "shopId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 10
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "handlingFee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 40
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "baseDeliveryFee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 5
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "baseDeliveryKmRange", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 15
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "perKmFee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 100
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "minimumOrderAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 12,
        comment: 'Commission percentage'
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "shopCommission", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 1.0
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "surgeMultiplier", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 2
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "platformFee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 25.0,
        comment: 'Platform percentage cut from delivery fee'
    }),
    __metadata("design:type", Number)
], CommissionSettings.prototype, "deliveryCutPercentage", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Area_1.Area),
    __metadata("design:type", Area_1.Area)
], CommissionSettings.prototype, "area", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Shop_1.Shop),
    __metadata("design:type", Shop_1.Shop)
], CommissionSettings.prototype, "shop", void 0);
exports.CommissionSettings = CommissionSettings = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'commission_settings',
        timestamps: true
    })
], CommissionSettings);
//# sourceMappingURL=CommissionSettings.js.map