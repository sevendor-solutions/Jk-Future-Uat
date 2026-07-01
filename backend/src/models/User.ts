import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, BeforeCreate } from "sequelize-typescript";

@Table({ tableName: "users" })
export class User extends Model {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        allowNull: false
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    username!: string;

    @Column({
        type: DataType.ENUM("Admin", "Moderator", "ProjectOwner", "MarketingOwner"),
        allowNull: false,
        defaultValue: "Admin"
    })
    role!: "Admin" | "Moderator" | "ProjectOwner" | "MarketingOwner";

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        set(val: string) {
            const encoded = Buffer.from(val).toString("base64");
            this.setDataValue("password", encoded);
        }
    })
    password!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('allowedScreens');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('allowedScreens', value ? JSON.stringify(value) : JSON.stringify([]));
        }
    })
    allowedScreens!: string[];

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

    @BeforeCreate
    static async generateSequentialId(instance: User) {
        if (!instance.id || instance.id.startsWith('u_')) {
            const all = await User.findAll();
            let nextNum = 1;
            all.forEach(item => {
                const match = item.id.match(/^u(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num < 100000 && num >= nextNum) {
                        nextNum = num + 1;
                    }
                }
            });
            instance.id = `u${nextNum}`;
        }
    }
}
