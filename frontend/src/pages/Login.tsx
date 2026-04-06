import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useLogin } from "@/service/tclService";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const loginMutation = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim() && password.trim()) {
            setIsLoading(true);
            try {
                await loginMutation.mutateAsync({ username, password });
            } catch {}

            setIsLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        },
    };

    const logoVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                delay: 0.2,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        },
    };

    const formItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                delay: 0.4 + i * 0.1,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        }),
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 selection:bg-primary/30">
            <div className="w-full max-w-md">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="glass-card rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden"
                >
                    {/* Background glow effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-[80px] -ml-16 -mb-16" />

                    {/* Logo */}
                    <motion.div
                        className="text-center relative z-10"
                        variants={logoVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="text-4xl font-heading font-black italic text-primary tracking-tighter uppercase">
                            TCL<span className="text-on-surface-variant not-italic font-light lowercase text-2xl tracking-normal">_server</span>
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-on-surface-variant mt-2 opacity-60">Neon Observatory v1.0</p>
                    </motion.div>

                    {/* Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-6 relative z-10"
                    >
                        {/* Username Field */}
                        <motion.div
                            className="space-y-2"
                            variants={formItemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                        >
                            <Label htmlFor="username" className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant ml-1">
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="h-14 bg-surface-container-lowest/50 border-white/5 focus-visible:ring-primary/50 text-on-surface rounded-xl px-5"
                                placeholder="TCL ID / Email"
                                required
                            />
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                            className="space-y-2"
                            variants={formItemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                        >
                            <Label htmlFor="password" className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant ml-1">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 bg-surface-container-lowest/50 border-white/5 focus-visible:ring-primary/50 text-on-surface rounded-xl px-5"
                                placeholder="••••••••"
                                required
                            />
                        </motion.div>

                        {/* Login Button */}
                        <motion.div
                            className="pt-4"
                            variants={formItemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={2}
                        >
                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-primary text-on-primary hover:bg-primary-dim font-bold rounded-xl shadow-lg shadow-primary/20 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                                >
                                    {isLoading ? "Synchronizing..." : "Initialize Session"}
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.form>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;

