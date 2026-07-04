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
var SiteVisit_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteVisit = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let SiteVisit = SiteVisit_1 = class SiteVisit extends sequelize_typescript_1.Model {
    static async generateSequentialId(instance) {
        if (!instance.id) {
            const all = await SiteVisit_1.findAll();
            let nextNum = 1;
            all.forEach(item => {
                const match = item.id.match(/^sv(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num >= nextNum) {
                        nextNum = num + 1;
                    }
                }
            });
            instance.id = `sv${nextNum}`;
        }
    }
};
exports.SiteVisit = SiteVisit;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        allowNull: false
    }),
    __metadata("design:type", String)
], SiteVisit.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], SiteVisit.prototype, "customerName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], SiteVisit.prototype, "customerEmail", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], SiteVisit.prototype, "customerPhone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], SiteVisit.prototype, "projectAssociation", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], SiteVisit.prototype, "projectName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING, // YYYY-MM-DD
        allowNull: false
    }),
    __metadata("design:type", String)
], SiteVisit.prototype, "visitDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING, // HH:MM
        allowNull: false
    }),
    __metadata("design:type", String)
], SiteVisit.prototype, "visitTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM("Pending", "Sent", "Failed", "Skipped"),
        allowNull: false,
        defaultValue: "Pending"
    }),
    __metadata("design:type", String)
], SiteVisit.prototype, "emailStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true
    }),
    __metadata("design:type", String)
], SiteVisit.prototype, "emailSentDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true
    }),
    __metadata("design:type", String)
], SiteVisit.prototype, "assignedAgent", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], SiteVisit.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], SiteVisit.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SiteVisit]),
    __metadata("design:returntype", Promise)
], SiteVisit, "generateSequentialId", null);
exports.SiteVisit = SiteVisit = SiteVisit_1 = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "site_visits" })
], SiteVisit);
//# sourceMappingURL=SiteVisit.js.map