import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  diagnosed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const fetchJobs = async () => {
      let query = supabase.from("support_requests").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
      if (priorityFilter !== "all") query = query.eq("urgency", priorityFilter as any);
      const { data } = await query;
      let filtered = data || [];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter((j: any) =>
          j.device_type.toLowerCase().includes(s) ||
          j.problem_category.toLowerCase().includes(s) ||
          j.description.toLowerCase().includes(s)
        );
      }
      setJobs(filtered);
    };
    fetchJobs();
  }, [statusFilter, priorityFilter, search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Job Management</h1>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="diagnosed">Diagnosed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        {jobs.length === 0 ? (
          <p className="text-center text-muted-foreground">No jobs found.</p>
        ) : (
          jobs.map((j) => (
            <Link key={j.id} to={`/staff/jobs/${j.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{j.device_type} — {j.problem_category}</p>
                    <p className="text-sm text-muted-foreground">{j.description.substring(0, 80)}...</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(j.created_at).toLocaleDateString()} · {j.location_type || "in_shop"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusColors[j.status] || ""}>{j.status.replace("_", " ")}</Badge>
                    <Badge variant="outline">{j.urgency}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Jobs;
