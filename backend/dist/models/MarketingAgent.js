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
var MarketingAgent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingAgent = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let MarketingAgent = MarketingAgent_1 = class MarketingAgent extends sequelize_typescript_1.Model {
    static async generateSequentialId(instance) {
        if (!instance.id) {
            const all = await MarketingAgent_1.findAll();
            let nextNum = 1;
            all.forEach(item => {
                const match = item.id.match(/^ma(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num >= nextNum) {
                        nextNum = num + 1;
                    }
                }
            });
            instance.id = `ma${nextNum}`;
        }
    }
};
exports.MarketingAgent = MarketingAgent;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        allowNull: false
    }),
    __metadata("design:type", String)
], MarketingAgent.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], MarketingAgent.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true
    }),
    __metadata("design:type", String)
], MarketingAgent.prototype, "phone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true
    }),
    __metadata("design:type", String)
], MarketingAgent.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true
    }),
    __metadata("design:type", String)
], MarketingAgent.prototype, "designation", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true
    }),
    __metadata("design:type", String)
], MarketingAgent.prototype, "photoUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        defaultValue: "Active"
    }),
    __metadata("design:type", String)
], MarketingAgent.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], MarketingAgent.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], MarketingAgent.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.BeforeValidate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MarketingAgent]),
    __metadata("design:returntype", Promise)
], MarketingAgent, "generateSequentialId", null);
exports.MarketingAgent = MarketingAgent = MarketingAgent_1 = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "marketing_agents" })
], MarketingAgent);
//# sourceMappingURL=MarketingAgent.js.map