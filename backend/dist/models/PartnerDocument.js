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
exports.PartnerDocument = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Partner_1 = require("./Partner");
let PartnerDocument = class PartnerDocument extends sequelize_typescript_1.Model {
};
exports.PartnerDocument = PartnerDocument;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Partner_1.Partner),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false
    }),
    __metadata("design:type", Number)
], PartnerDocument.prototype, "partnerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Partner_1.Partner),
    __metadata("design:type", Partner_1.Partner)
], PartnerDocument.prototype, "partner", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], PartnerDocument.prototype, "documentType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], PartnerDocument.prototype, "documentUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    }),
    __metadata("design:type", String)
], PartnerDocument.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true
    }),
    __metadata("design:type", String)
], PartnerDocument.prototype, "rejectionReason", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], PartnerDocument.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], PartnerDocument.prototype, "updatedAt", void 0);
exports.PartnerDocument = PartnerDocument = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'partner_documents',
        timestamps: true,
    })
], PartnerDocument);
//# sourceMappingURL=PartnerDocument.js.map