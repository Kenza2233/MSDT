"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bot, CheckCircle2, ChevronRight, ExternalLink, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
export default function BotSetupPage() {
  const [botToken, setBotToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [botInfo, setBotInfo] = useState<any>(null);
  const router = useRouter();
  const { checkSession } = useAuth();
  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/bot-token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ botToken }) });
      if (res.ok) { setBotInfo((await res.json()).bot); setIsSuccess(true); toast.success("Bot verified"); await checkSession(); }
      else toast.error("Invalid token");
    } finally { setIsLoading(false); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader><CardTitle>Connect Your Telegram Bot</CardTitle></CardHeader>
        <CardContent>
          {!isSuccess ? <div className="space-y-4">
            <Label htmlFor="botToken">Paste your Bot Token here</Label>
            <div className="flex gap-2"><Input id="botToken" value={botToken} onChange={(e) => setBotToken(e.target.value)} /><Button onClick={handleVerify} disabled={isLoading}>Verify</Button></div>
          </div> : <div className="text-center py-6">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" /><h3 className="text-xl font-bold text-green-700">Bot Connected!</h3>
            <p>@{botInfo?.username}</p>
          </div>}
        </CardContent>
        <CardFooter className="flex justify-between"><Button variant="ghost" onClick={() => router.push("/")}>Skip</Button>{isSuccess && <Button onClick={() => router.push("/")}>Continue</Button>}</CardFooter>
      </Card>
    </div>
  );
}
