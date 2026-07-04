import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from "sequelize-typescript";

@Table({ tableName: "mail_configs" })
export class MailConfig extends Model {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        allowNull: false
    })
    id!: string; // e.g., 'default'

    @Column({
        type: DataType.ENUM("smtp", "simulation"),
        allowNull: false,
        defaultValue: "simulation"
    })
    deliveryMode!: "smtp" | "simulation";

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 5
    })
    triggerWindowDays!: number; // e.g., scheduled within 5 days

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1
    })
    sendBeforeDays!: number; // e.g., send 1 day before

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "smtp.mailtrap.io"
    })
    smtpHost!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 2525
    })
    smtpPort!: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        defaultValue: ""
    })
    smtpUser!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        defaultValue: ""
    })
    smtpPass!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "noreply@jkfutureinfra.com"
    })
    senderEmail!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "Reminder: Scheduled Site Visit for {projectName}"
    })
    emailSubject!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        defaultValue: "Hello {customerName},\n\nThis is a friendly reminder that you have a scheduled site visit for {projectName} on {visitDate} at {visitTime}.\n\nLocation: {location}\n\nOur property consultant {assignedAgent} will guide you.\n\nWarm regards,\nJK Future Infra Team"
    })
    emailTemplate!: string;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;
}
