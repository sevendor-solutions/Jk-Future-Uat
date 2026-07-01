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
exports.Parcel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Customer_1 = require("./Customer");
const ParcelCategory_1 = require("./ParcelCategory");
let Parcel = class Parcel extends sequelize_typescript_1.Model {
};
exports.Parcel = Parcel;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true
    }),
    __metadata("design:type", String)
], Parcel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Customer_1.Customer),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Parcel.prototype, "senderId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Customer_1.Customer),
    __metadata("design:type", Customer_1.Customer)
], Parcel.prototype, "sender", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: false }),
    __metadata("design:type", String)
], Parcel.prototype, "receiverName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: false }),
    __metadata("design:type", String)
], Parcel.prototype, "receiverPhone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], Parcel.prototype, "receiverAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ParcelCategory_1.ParcelCategory),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], Parcel.prototype, "parcelCategoryId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ParcelCategory_1.ParcelCategory),
    __metadata("design:type", ParcelCategory_1.ParcelCategory)
], Parcel.prototype, "category", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], Parcel.prototype, "weight", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: false }),
    __metadata("design:type", String)
], Parcel.prototype, "pickupLocation", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: false }),
    __metadata("design:type", String)
], Parcel.prototype, "dropoffLocation", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE }),
    __metadata("design:type", Number)
], Parcel.prototype, "pickupLat", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE }),
    __metadata("design:type", Number)
], Parcel.prototype, "pickupLng", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE }),
    __metadata("design:type", Number)
], Parcel.prototype, "dropoffLat", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE }),
    __metadata("design:type", Number)
], Parcel.prototype, "dropoffLng", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    }),
    __metadata("design:type", String)
], Parcel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2) }),
    __metadata("design:type", Number)
], Parcel.prototype, "fare", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Parcel.prototype, "otp", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Parcel.prototype, "notes", void 0);
exports.Parcel = Parcel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "parcels" })
], Parcel);
//# sourceMappingURL=Parcel.js.map