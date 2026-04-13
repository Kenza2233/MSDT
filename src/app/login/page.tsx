"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Loader2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* Left side - Illustration/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex-col justify-center p-12 text-white relative overflow-hidden">
        <motion.div
          className="relative z-10 space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md w-fit px-6 py-3 rounded-2xl border border-white/20">
            <div className="bg-white p-2 rounded-xl">
              <Send className="h-8 w-8 text-indigo-600" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">TG Bulk Sender</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl font-black leading-none tracking-tight">
              Send images to Telegram groups <span className="text-indigo-200 italic">effortlessly.</span>
            </h1>
            <p className="text-indigo-100 text-xl font-medium max-w-lg leading-relaxed">
              The ultimate tool for marketers and community managers. Bulk upload, manage gallery, and automate your sending.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 flex flex-col gap-3">
              <Zap className="h-6 w-6 text-yellow-300 fill-yellow-300/20" />
              <h3 className="font-bold text-lg">Fast Delivery</h3>
              <p className="text-indigo-100/80 text-sm">Lightning fast sending with customizable delays.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 flex flex-col gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              <h3 className="font-bold text-lg">Safe & Secure</h3>
              <p className="text-indigo-100/80 text-sm">We use official Telegram Bot API and keep your token private.</p>
            </div>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 relative">
        <motion.div
          className="w-full max-w-md space-y-10"
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1 } }
          }}
        >
          <motion.div variants={fadeInUp} className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-8">
               <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-200">
                  <Send className="h-8 w-8 text-white" />
               </div>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please enter your details to sign in</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={fadeInUp} className="space-y-2 group">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700 group-focus-within:text-indigo-600 transition-colors">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-base px-4"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" title="Enter your password" className="text-sm font-bold text-slate-700 group-focus-within:text-indigo-600 transition-colors">Password</Label>
                <Link href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot password?</Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-base px-4"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={fadeInUp} className="text-center">
            <p className="text-slate-500 font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-indigo-600 font-bold hover:underline underline-offset-4">
                Create Account
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-50 rounded-tl-full -z-10" />
      </div>
    </div>
  );
}
