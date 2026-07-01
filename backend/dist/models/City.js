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
var City_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.City = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const LocationMaster_1 = require("./LocationMaster");
let City = City_1 = class City extends sequelize_typescript_1.Model {
    static async generateSequentialId(instance) {
        if (!instance.id || instance.id.startsWith('c_')) {
            const all = await City_1.findAll();
            let nextNum = 1;
            all.forEach(item => {
                const match = item.id.match(/^c(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num < 100000 && num >= nextNum) {
                        nextNum = num + 1;
                    }
                }
            });
            instance.id = `c${nextNum}`;
        }
    }
};
exports.City = City;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        allowNull: false
    }),
    __metadata("design:type", String)
], City.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], City.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => LocationMaster_1.LocationMaster),
    __metadata("design:type", Array)
], City.prototype, "locations", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], City.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], City.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [City]),
    __metadata("design:returntype", Promise)
], City, "generateSequentialId", null);
exports.City = City = City_1 = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "cities" })
], City);
//# sourceMappingURL=City.js.map