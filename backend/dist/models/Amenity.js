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
var Amenity_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Amenity = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let Amenity = Amenity_1 = class Amenity extends sequelize_typescript_1.Model {
    static async generateSequentialId(instance) {
        if (!instance.id || !instance.id.match(/^a\d+$/)) {
            const all = await Amenity_1.findAll();
            let nextNum = 1;
            all.forEach(item => {
                const match = item.id.match(/^a(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num < 100000 && num >= nextNum) {
                        nextNum = num + 1;
                    }
                }
            });
            instance.id = `a${nextNum}`;
        }
    }
};
exports.Amenity = Amenity;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        allowNull: false
    }),
    __metadata("design:type", String)
], Amenity.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], Amenity.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Amenity.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Amenity.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.BeforeValidate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Amenity]),
    __metadata("design:returntype", Promise)
], Amenity, "generateSequentialId", null);
exports.Amenity = Amenity = Amenity_1 = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "amenities" })
], Amenity);
//# sourceMappingURL=Amenity.js.map