"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { toast } from "sonner";
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    setIsLoading(true);
    try { await register(name, email, password); toast.success("Account created"); }
    catch (error: any) { toast.error(error.message || "Registration failed"); }
    finally { setIsLoading(false); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2"><div className="bg-primary p-2 rounded-lg"><Send className="h-6 w-6 text-white" /></div></div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter details below to create your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Register"}</Button>
            <div className="text-center text-sm">Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link></div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
