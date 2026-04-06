import { z, ZodError } from "zod";

const envSchema = z.object({
    TCL_USERNAME: z.string(),
    TCL_PASSWORD: z.string(),
    TCL_APP_ID: z.string(),
    TCL_LOGIN_URL: z.url(),
    TCL_CLOUD_URL: z.url(),
    REDIS_URL: z.url(),
    DATABASE_URL: z.url(),
    NODE_ENV: z.enum(["development", "production"]),
    PORT: z.coerce.number().int().positive(),
    ADMIN_PASSWORD: z.string(),
    JWT_SECRET: z.string().min(32),
});

export default class ENV {
    static TCL_USERNAME: string;
    static TCL_PASSWORD: string;
    static TCL_APP_ID: string;
    static TCL_LOGIN_URL: string;
    static TCL_CLOUD_URL: string;
    static REDIS_URL: string;
    static DATABASE_URL: string;
    static NODE_ENV: "development" | "production";
    static PORT: number;
    static ADMIN_PASSWORD: string;
    static JWT_SECRET: string;
    public static configEnvironment() {
        try {
            if (!process.env.NODE_ENV) process.env.NODE_ENV = "development";
            const env = envSchema.parse(process.env);
            this.TCL_USERNAME = env.TCL_USERNAME;
            this.TCL_PASSWORD = env.TCL_PASSWORD;
            this.TCL_APP_ID = env.TCL_APP_ID;
            this.TCL_LOGIN_URL = env.TCL_LOGIN_URL;
            this.TCL_CLOUD_URL = env.TCL_CLOUD_URL;
            this.REDIS_URL = env.REDIS_URL;
            this.DATABASE_URL = env.DATABASE_URL;
            this.NODE_ENV = env.NODE_ENV;
            this.PORT = env.PORT;
            this.ADMIN_PASSWORD = env.ADMIN_PASSWORD;
            this.JWT_SECRET = env.JWT_SECRET;
            console.log("Environment configuration loaded successfully");
        } catch (error) {
            const issues = (error as ZodError).issues.map((issue) => {
                const path = issue.path.join(".") || "body";
                const message =
                    issue.message.split(":")[1]?.trim() || issue.message;
                const code = issue.code;
                return {
                    path,
                    message,
                    code,
                };
            });
            console.error("Environment configuration errors:", issues);
            process.exit(1);
        }
    }
}
