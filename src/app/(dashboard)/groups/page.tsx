"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  RefreshCw,
  Send,
  ShieldCheck,
  LayoutGrid,
  Table as TableIcon,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const dynamic = 'force-dynamic';

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // New Group State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newChatId, setNewChatId] = useState("");
  const [newType, setNewType] = useState("group");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups);
      }
    } catch (err) {
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddGroup = async () => {
    if (!newName || !newChatId) return toast.error("Please fill in all fields");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, chatId: newChatId, type: newType }),
      });
      if (res.ok) {
        toast.success("Group added successfully");
        setIsAddOpen(false);
        setNewName("");
        setNewChatId("");
        fetchGroups();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to add group");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.chatId.includes(search);
    const matchesType = typeFilter === "all" || g.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Manage Groups</h2>
          <p className="text-slate-500 font-medium mt-1">Configure your target Telegram groups and channels</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl font-bold shadow-lg shadow-indigo-500/20 gap-2 transition-all hover:scale-105 active:scale-95">
              <Plus className="h-5 w-5" /> Add New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Add Telegram Group</DialogTitle>
                <p className="text-indigo-100 text-sm font-medium mt-2">Enter the destination details for your bot messages.</p>
              </DialogHeader>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Internal Name</label>
                <Input
                  placeholder="e.g. Marketing Main Channel"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-xl h-12 border-slate-200 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Chat ID</label>
                <Input
                  placeholder="e.g. -100123456789"
                  value={newChatId}
                  onChange={(e) => setNewChatId(e.target.value)}
                  className="rounded-xl h-12 border-slate-200 font-mono focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic px-1">
                  Tip: Get Chat ID by forwarding a message from the group to @userinfobot or similar bots.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Type</label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="rounded-xl h-12 border-slate-200 focus:ring-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="group" className="rounded-lg">Group</SelectItem>
                    <SelectItem value="supergroup" className="rounded-lg">Supergroup</SelectItem>
                    <SelectItem value="channel" className="rounded-lg">Channel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button
                  onClick={handleAddGroup}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold"
                >
                  {isSubmitting ? "Adding..." : "Confirm & Save"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Search groups or chat IDs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm focus:shadow-md"
              />
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="bg-slate-100/50 p-1 rounded-xl flex">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={cn("rounded-lg h-9 w-9", viewMode === "grid" && "bg-white shadow-sm")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                  className={cn("rounded-lg h-9 w-9", viewMode === "table" && "bg-white shadow-sm")}
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <SelectValue placeholder="Type" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="group">Groups</SelectItem>
                  <SelectItem value="channel">Channels</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={fetchGroups} className="h-11 w-11 rounded-xl border-slate-200 bg-white hover:text-indigo-600">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-48 rounded-[2rem] border-none shadow-sm animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : filteredGroups.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredGroups.map((group, i) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group/card bg-white h-full flex flex-col">
                    <CardHeader className="p-6 pb-0 flex flex-row items-start justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner group-hover/card:scale-110 group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all duration-500">
                        <Users className="h-6 w-6" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl p-2">
                          <DropdownMenuItem className="rounded-lg text-indigo-600 font-bold focus:bg-indigo-50 focus:text-indigo-700">
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg text-rose-600 font-bold focus:bg-rose-50 focus:text-rose-700">
                            Delete Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover/card:text-indigo-600 transition-colors">{group.name}</h3>
                        <p className="text-xs font-mono text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded-md">{group.chatId}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                          {group.type}
                        </Badge>
                        {group.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-none rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest flex gap-1 items-center">
                            <div className="h-1 w-1 rounded-full bg-emerald-500" /> Active
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500 border-none rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                            Inactive
                          </Badge>
                        )}
                      </div>

                      <div className="mt-auto flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 gap-2">
                          <ShieldCheck className="h-4 w-4" /> Test
                        </Button>
                        <Button className="flex-1 rounded-xl font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border-none shadow-none gap-2">
                          <Send className="h-4 w-4" /> Send
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">Name & Chat ID</th>
                    <th className="px-8 py-5">Type</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Members</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            {group.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{group.name}</p>
                            <p className="text-xs font-mono text-slate-400">{group.chatId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase">
                          {group.type}
                        </Badge>
                      </td>
                      <td className="px-8 py-5">
                         {group.isActive ? (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Inactive</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-sm font-bold text-slate-600">{group.memberCount || "—"}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex justify-end gap-2">
                           <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                             <ShieldCheck className="h-4 w-4" />
                           </Button>
                           <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center px-6 bg-white/50 border-4 border-dashed border-slate-200 rounded-[3rem]">
          <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Users className="h-12 w-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">No groups found</h3>
          <p className="text-slate-500 font-medium max-w-sm mb-8">You haven't added any Telegram groups yet. Add your first one to start sending messages.</p>
          <Button onClick={() => setIsAddOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl font-bold">
            Add Your First Group
          </Button>
        </div>
      )}
    </div>
  );
}
