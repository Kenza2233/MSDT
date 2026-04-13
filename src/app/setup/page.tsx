"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Bot,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SetupPage() {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { refreshSession } = useAuth();
  const router = useRouter();

  const handleTestAndSave = async () => {
    if (!token) return toast.error("Please enter a bot token");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/bot-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to verify bot");

      setSuccess(true);
      toast.success("Bot connected successfully!");
      await refreshSession();
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-indigo-600 text-white p-8 md:p-10">
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                 <Bot className="h-8 w-8 text-white" />
               </div>
               <div>
                 <CardTitle className="text-3xl font-black tracking-tight">Bot Setup</CardTitle>
                 <CardDescription className="text-indigo-100 font-medium">Connect your Telegram bot to get started</CardDescription>
               </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 md:p-10 space-y-8">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { icon: <ExternalLink />, text: "Open @BotFather on Telegram" },
                      { icon: <Copy />, text: "Use /newbot and get the API token" },
                      { icon: <ShieldCheck />, text: "Paste the token here below" }
                    ].map((step, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-3 items-center text-center">
                        <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600">
                          {step.icon}
                        </div>
                        <p className="text-xs font-bold text-slate-600 leading-tight">{step.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2 group">
                      <Label htmlFor="token" className="text-sm font-bold text-slate-700 group-focus-within:text-indigo-600 transition-colors">HTTP API Token</Label>
                      <div className="relative">
                        <Input
                          id="token"
                          type={showToken ? "text" : "password"}
                          placeholder="123456789:ABCDefGhIJKlmNoPQRstuVwxyZ"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          className="h-14 bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 pr-12 font-mono text-sm"
                        />
                        <button
                          onClick={() => setShowToken(!showToken)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                        >
                          {showToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all text-lg group"
                    onClick={handleTestAndSave}
                    disabled={loading || !token}
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Verifying Connection...</>
                    ) : (
                      <>Save & Test Connection <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 space-y-6 text-center"
                >
                  <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-50 shadow-inner">
                    <CheckCircle className="h-12 w-12 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Connected!</h3>
                    <p className="text-slate-500 font-medium max-w-sm">
                      Your bot is linked. Redirecting you to the dashboard...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-6 flex justify-center italic text-xs text-slate-400">
            You can always change your bot settings later from the configuration menu.
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
