import { Router } from "express";
import { User } from "../models/User";
import { UserSessionLog } from "../models/UserSessionLog";
import jwt from "jsonwebtoken";

const router = Router();

function getDeviceType(userAgent: string | null): string {
    if (!userAgent) return "Unknown";
    const ua = userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "Tablet";
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(ua)) {
        return "Mobile";
    }
    return "Desktop";
}

// Staff Login
router.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        const user = await User.findOne({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid username or staff credential." });
        }

        // Compare password encoded in Base64
        const inputPasswordBase64 = Buffer.from(password).toString("base64");
        let isValid = false;

        if (user.password === inputPasswordBase64) {
            isValid = true;
        } else if (user.password === password) {
            // Fallback for plain text passwords in the database (automatic migration)
            isValid = true;
            try {
                user.password = password; // Trigger setter to convert to Base64
                await user.save();
                console.log(`🔑 Automatically migrated password for ${user.username} to Base64.`);
            } catch (migrationError) {
                console.error(`Failed to migrate password to Base64 for ${user.username}:`, migrationError);
            }
        }

        if (!isValid) {
            return res.status(401).json({ success: false, message: "Incorrect password entered." });
        }

        // Track LOGIN event in UserSessionLog
        try {
            await UserSessionLog.create({
                userId: user.id,
                username: user.username,
                action: "LOGIN",
                ipAddress: req.ip || (req.headers["x-forwarded-for"] as string) || null,
                userAgent: req.headers["user-agent"] || null,
                device: getDeviceType(req.headers["user-agent"] || null)
            });
        } catch (trackError) {
            console.error("Failed to log user login session:", trackError);
        }

        const userResponse = user.toJSON();
        delete userResponse.password;

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || "jk_future_infra_secret_jwt_key_2026",
            { expiresIn: "1d" }
        );

        return res.json({
            success: true,
            user: userResponse,
            token
        });
    } catch (error) {
        next(error);
    }
});

// Staff Logout
router.post("/logout", async (req, res, next) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }

        const user = await User.findOne({
            where: { username }
        });

        if (user) {
            // Track LOGOUT event in UserSessionLog
            try {
                await UserSessionLog.create({
                    userId: user.id,
                    username: user.username,
                    action: "LOGOUT",
                    ipAddress: req.ip || (req.headers["x-forwarded-for"] as string) || null,
                    userAgent: req.headers["user-agent"] || null,
                    device: getDeviceType(req.headers["user-agent"] || null)
                });
            } catch (trackError) {
                console.error("Failed to log user logout session:", trackError);
            }
        }

        return res.json({
            success: true,
            message: "Logout tracked successfully"
        });
    } catch (error) {
        next(error);
    }
});

export default router;
