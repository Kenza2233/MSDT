"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success("Account created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-indigo-700 to-indigo-800 flex-col justify-center p-12 text-white relative overflow-hidden">
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
              Join the future of <span className="text-violet-200 italic">bulk sending.</span>
            </h1>
            <p className="text-indigo-100 text-xl font-medium max-w-lg leading-relaxed">
              Create an account and start managing your Telegram media campaigns in minutes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-all">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="font-bold text-lg">Centralized Media Gallery</p>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-all">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="font-bold text-lg">Smart Retry Engine</p>
            </div>
          </div>
        </motion.div>

        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
      </div>

      {/* Right side - Register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 relative overflow-y-auto">
        <motion.div
          className="w-full max-w-md space-y-10 my-10"
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1 } }
          }}
        >
          <motion.div variants={fadeInUp} className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Get Started</h2>
            <p className="text-slate-500 font-medium">Create your account to continue</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={fadeInUp} className="space-y-1.5 group">
              <Label htmlFor="name" className="text-sm font-bold text-slate-700 group-focus-within:text-indigo-600">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-1.5 group">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700 group-focus-within:text-indigo-600">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-1.5 group">
              <Label htmlFor="password" title="At least 8 characters" className="text-sm font-bold text-slate-700 group-focus-within:text-indigo-600">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-1.5 group">
              <Label htmlFor="confirmPassword" title="Repeat your password" className="text-sm font-bold text-slate-700 group-focus-within:text-indigo-600">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={fadeInUp} className="text-center">
            <p className="text-slate-500 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -z-10" />
      </div>
    </div>
  );
}
