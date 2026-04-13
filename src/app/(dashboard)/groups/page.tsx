"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Trash2, Edit2, Send, RefreshCw, Users, Grid, List as ListIcon, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newChatId, setNewChatId] = useState("");
  const [newGroupType, setNewGroupType] = useState("group");
  const [editingGroup, setEditingGroup] = useState<any>(null);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/groups");
      if (res.ok) setGroups((await res.json()).groups);
    } catch (error) { toast.error("Failed to fetch groups"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newGroupName, chatId: newChatId, type: newGroupType }) });
      if (res.ok) { toast.success("Group added"); setIsAddOpen(false); setNewGroupName(""); setNewChatId(""); fetchGroups(); }
      else { const data = await res.json(); toast.error(data.message || "Failed"); }
    } catch (error) { toast.error("An error occurred"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold tracking-tight">Group Management</h2><p className="text-muted-foreground">Manage your Telegram groups and channels.</p></div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Add New Group</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Group</DialogTitle></DialogHeader>
            <form onSubmit={handleAddGroup} className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Group Name</label><Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} required /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Chat ID</label><Input value={newChatId} onChange={(e) => setNewChatId(e.target.value)} required /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Type</label><Select value={newGroupType} onValueChange={setNewGroupType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="group">Group</SelectItem><SelectItem value="channel">Channel</SelectItem></SelectContent></Select></div>
              <DialogFooter><Button type="submit">Add Group</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="grid gap-6 md:grid-cols-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div> : (
        groups.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card key={group.id}>
                <CardHeader className="pb-2"><CardTitle className="text-lg font-bold">{group.name}</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="capitalize">{group.type}</Badge>
                    <span className="text-xs font-mono text-muted-foreground">{group.chatId}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No groups found</h3>
            <p className="text-muted-foreground">Add your first group to start sending.</p>
          </div>
        )
      )}
    </div>
  );
}
