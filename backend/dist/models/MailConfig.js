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
exports.MailConfig = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let MailConfig = class MailConfig extends sequelize_typescript_1.Model {
};
exports.MailConfig = MailConfig;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        allowNull: false
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM("smtp", "simulation"),
        allowNull: false,
        defaultValue: "simulation"
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "deliveryMode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        defaultValue: 5
    }),
    __metadata("design:type", Number)
], MailConfig.prototype, "triggerWindowDays", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], MailConfig.prototype, "sendBeforeDays", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        defaultValue: "smtp.mailtrap.io"
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "smtpHost", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        defaultValue: 2525
    }),
    __metadata("design:type", Number)
], MailConfig.prototype, "smtpPort", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "smtpUser", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "smtpPass", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        defaultValue: "noreply@jkfutureinfra.com"
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "senderEmail", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        defaultValue: "jkfutureinfra@gmail.com"
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "summaryEmail", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        defaultValue: "Reminder: Scheduled Site Visit for {projectName}"
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "emailSubject", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
        defaultValue: "Hello {customerName},\n\nThis is a friendly reminder that you have a scheduled site visit for {projectName} on {visitDate} at {visitTime}.\n\nLocation: {location}\n\nOur property consultant {assignedAgent} (Phone: {assignedAgentPhone}) will guide you.\n\nWarm regards,\nJK Future Infra Team"
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "emailTemplate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "smsProvider", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "smsApiKey", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "smsSenderId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }),
    __metadata("design:type", Boolean)
], MailConfig.prototype, "smsEnabled", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "whatsappToken", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "whatsappPhoneId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }),
    __metadata("design:type", Boolean)
], MailConfig.prototype, "whatsappEnabled", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: "postgres"
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "dbType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "dbHost", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        defaultValue: 5432
    }),
    __metadata("design:type", Number)
], MailConfig.prototype, "dbPort", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "dbUser", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "dbPassword", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "dbName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        defaultValue: ""
    }),
    __metadata("design:type", String)
], MailConfig.prototype, "jwtSecret", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], MailConfig.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], MailConfig.prototype, "updatedAt", void 0);
exports.MailConfig = MailConfig = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "mail_configs" })
], MailConfig);
//# sourceMappingURL=MailConfig.js.map