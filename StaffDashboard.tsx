import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Package, AlertTriangle, CheckCircle } from "lucide-react";

const StaffDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, lowStock: 0 });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [reqRes, invRes] = await Promise.all([
        supabase.from("support_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("inventory_parts").select("*"),
      ]);
      const reqs = reqRes.data || [];
      const inv = invRes.data || [];
      setStats({
        total: reqs.length,
        pending: reqs.filter((r: any) => r.status === "pending").length,
        inProgress: reqs.filter((r: any) => r.status === "in_progress").length,
        completed: reqs.filter((r: any) => r.status === "completed").length,
        lowStock: inv.filter((p: any) => p.quantity <= p.min_stock).length,
      });
      setRecentJobs(reqs.slice(0, 8));
    };
    fetch();
  }, []);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    diagnosed: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 p-6"><ClipboardList className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Jobs</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-6"><AlertTriangle className="h-8 w-8 text-yellow-500" /><div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-sm text-muted-foreground">Pending</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-6"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{stats.completed}</p><p className="text-sm text-muted-foreground">Completed</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-6"><Package className="h-8 w-8 text-destructive" /><div><p className="text-2xl font-bold">{stats.lowStock}</p><p className="text-sm text-muted-foreground">Low Stock Items</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Jobs</CardTitle></CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jobs yet.</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((r) => (
                <Link key={r.id} to={`/staff/jobs/${r.id}`} className="block">
                  <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <div>
                      <p className="font-medium">{r.device_type} — {r.problem_category}</p>
                      <p className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()} · {r.urgency}</p>
                    </div>
                    <Badge className={statusColors[r.status] || ""}>{r.status.replace("_", " ")}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;
