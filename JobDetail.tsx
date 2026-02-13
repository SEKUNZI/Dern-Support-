import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type RequestStatus = Database["public"]["Enums"]["request_status"];
type PriorityLevel = Database["public"]["Enums"]["priority_level"];

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [hours, setHours] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchJob = async () => {
    if (!id) return;
    const [jobRes, logsRes] = await Promise.all([
      supabase.from("support_requests").select("*").eq("id", id).single(),
      supabase.from("job_logs").select("*").eq("request_id", id).order("created_at", { ascending: false }),
    ]);
    setJob(jobRes.data);
    setLogs(logsRes.data || []);
  };

  useEffect(() => { fetchJob(); }, [id]);

  const updateStatus = async (status: RequestStatus) => {
    const { error } = await supabase.from("support_requests").update({ status }).eq("id", id!);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Status updated to ${status}` });
    fetchJob();
  };

  const updatePriority = async (urgency: PriorityLevel) => {
    const { error } = await supabase.from("support_requests").update({ urgency }).eq("id", id!);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    fetchJob();
  };

  const assignToMe = async () => {
    if (!user) return;
    const { error } = await supabase.from("support_requests").update({ assigned_staff_id: user.id }).eq("id", id!);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Assigned to you" });
    fetchJob();
  };

  const addLog = async () => {
    if (!user || !newNote) return;
    setLoading(true);
    const { error } = await supabase.from("job_logs").insert({
      request_id: id!,
      staff_id: user.id,
      notes: newNote,
      hours_spent: parseFloat(hours) || 0,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Log added" }); setNewNote(""); setHours(""); fetchJob(); }
    setLoading(false);
  };

  const createQuote = async () => {
    if (!id) return;
    // Simple auto-quote based on category
    const laborCosts: Record<string, number> = { "Hardware Failure": 80, "Software Issue": 50, "Virus/Malware": 60, "Network Problem": 70, "Data Recovery": 120, "Setup/Installation": 40, "Performance": 45, "Other": 55 };
    const labor = laborCosts[job?.problem_category] || 50;
    const parts = job?.problem_category === "Hardware Failure" ? 45 : 15;
    const { error } = await supabase.from("quotations").insert({
      request_id: id,
      labor_cost: labor,
      parts_cost: parts,
      total_cost: labor + parts,
      breakdown: [{ item: "Labor", cost: labor }, { item: "Parts estimate", cost: parts }],
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Quote created" });
  };

  if (!job) return <div className="flex items-center justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="gap-2" onClick={() => navigate("/staff/jobs")}>
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Button>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>{job.device_type} — {job.problem_category}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p>{job.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge>{job.status.replace("_", " ")}</Badge>
                <Badge variant="outline">{job.urgency}</Badge>
                <Badge variant="secondary">{job.location_type || "in_shop"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Created: {new Date(job.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>

          {/* Job logs */}
          <Card>
            <CardHeader><CardTitle>Work Log</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add notes..." />
                <div className="flex gap-3">
                  <Input type="number" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hours spent" className="w-32" />
                  <Button onClick={addLog} disabled={loading || !newNote}>Add Log</Button>
                </div>
              </div>
              {logs.map((l) => (
                <div key={l.id} className="rounded-lg border p-3">
                  <p className="text-sm">{l.notes}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{l.hours_spent}h · {new Date(l.created_at).toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={job.status} onValueChange={(v) => updateStatus(v as RequestStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="diagnosed">Diagnosed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={job.urgency} onValueChange={(v) => updatePriority(v as PriorityLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="secondary" className="w-full" onClick={assignToMe}>
                Assign to Me
              </Button>
              <Button variant="outline" className="w-full" onClick={createQuote}>
                Generate Quote
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
