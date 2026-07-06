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
var Enquiry_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enquiry = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let Enquiry = Enquiry_1 = class Enquiry extends sequelize_typescript_1.Model {
    static async generateSequentialId(instance) {
        if (!instance.id || instance.id.startsWith('enq_') || instance.id.startsWith('e_')) {
            const all = await Enquiry_1.findAll();
            let nextNum = 1;
            all.forEach(item => {
                const match = item.id.match(/^e(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num < 100000 && num >= nextNum) {
                        nextNum = num + 1;
                    }
                }
            });
            instance.id = `e${nextNum}`;
        }
    }
};
exports.Enquiry = Enquiry;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        allowNull: false
    }),
    __metadata("design:type", String)
], Enquiry.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], Enquiry.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], Enquiry.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], Enquiry.prototype, "phone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false
    }),
    __metadata("design:type", String)
], Enquiry.prototype, "message", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: "General"
    }),
    __metadata("design:type", String)
], Enquiry.prototype, "projectAssociation", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true
    }),
    __metadata("design:type", String)
], Enquiry.prototype, "projectName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], Enquiry.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM("New", "In Progress", "Completed"),
        allowNull: false,
        defaultValue: "New"
    }),
    __metadata("design:type", String)
], Enquiry.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true
    }),
    __metadata("design:type", String)
], Enquiry.prototype, "notes", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Enquiry.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Enquiry.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.BeforeValidate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Enquiry]),
    __metadata("design:returntype", Promise)
], Enquiry, "generateSequentialId", null);
exports.Enquiry = Enquiry = Enquiry_1 = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "enquiries" })
], Enquiry);
//# sourceMappingURL=Enquiry.js.map