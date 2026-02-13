import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const Appointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedRequest, setSelectedRequest] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    const [apptRes, reqRes] = await Promise.all([
      supabase.from("appointments").select("*").eq("customer_id", user.id).order("scheduled_date", { ascending: true }),
      supabase.from("support_requests").select("id, device_type, problem_category").eq("customer_id", user.id).in("status", ["pending", "diagnosed", "in_progress"]),
    ]);
    setAppointments(apptRes.data || []);
    setRequests(reqRes.data || []);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleBook = async () => {
    if (!user || !selectedDate || !selectedTime) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("appointments").insert({
        customer_id: user.id,
        request_id: selectedRequest || null,
        scheduled_date: format(selectedDate, "yyyy-MM-dd"),
        scheduled_time: selectedTime,
        notes,
      });
      if (error) throw error;
      toast({ title: "Appointment booked!" });
      setSelectedDate(undefined);
      setSelectedTime("");
      setNotes("");
      setSelectedRequest("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Appointments</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking */}
        <Card>
          <CardHeader><CardTitle>Book an Appointment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Date</Label>
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6} className="rounded-md border" />
            </div>
            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger><SelectValue placeholder="Pick a time" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {requests.length > 0 && (
              <div className="space-y-2">
                <Label>Link to Request (optional)</Label>
                <Select value={selectedRequest} onValueChange={setSelectedRequest}>
                  <SelectTrigger><SelectValue placeholder="Select a request" /></SelectTrigger>
                  <SelectContent>
                    {requests.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.device_type} — {r.problem_category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." />
            </div>
            <Button onClick={handleBook} disabled={loading || !selectedDate || !selectedTime} className="w-full">
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader><CardTitle>Your Appointments</CardTitle></CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments yet.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{a.scheduled_date} at {a.scheduled_time}</p>
                      <p className="text-sm text-muted-foreground">{a.notes || "—"}</p>
                    </div>
                    <Badge variant="outline">{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;
