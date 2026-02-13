import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(217, 71%, 45%)", "hsl(199, 89%, 48%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(270, 60%, 50%)"];

const Analytics = () => {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [reqRes, fbRes] = await Promise.all([
        supabase.from("support_requests").select("*"),
        supabase.from("feedback").select("*"),
      ]);
      const reqs = reqRes.data || [];
      const fbs = fbRes.data || [];

      // Category breakdown
      const catMap: Record<string, number> = {};
      reqs.forEach((r: any) => { catMap[r.problem_category] = (catMap[r.problem_category] || 0) + 1; });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      // Status breakdown
      const statMap: Record<string, number> = {};
      reqs.forEach((r: any) => { statMap[r.status] = (statMap[r.status] || 0) + 1; });
      setStatusData(Object.entries(statMap).map(([name, value]) => ({ name: name.replace("_", " "), value })));

      // Location breakdown
      const locMap: Record<string, number> = {};
      reqs.forEach((r: any) => { const loc = r.location_type || "in_shop"; locMap[loc] = (locMap[loc] || 0) + 1; });
      setLocationData(Object.entries(locMap).map(([name, value]) => ({ name: name.replace("_", " "), value })));

      // Feedback over time (avg rating by month)
      const monthMap: Record<string, { total: number; count: number }> = {};
      fbs.forEach((f: any) => {
        const month = f.created_at.substring(0, 7);
        if (!monthMap[month]) monthMap[month] = { total: 0, count: 0 };
        monthMap[month].total += f.rating;
        monthMap[month].count += 1;
      });
      setFeedbackData(Object.entries(monthMap).map(([month, { total, count }]) => ({ month, avg: +(total / count).toFixed(1) })).sort((a, b) => a.month.localeCompare(b.month)));
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Issues by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(217, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Job Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Service Locations</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={locationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {locationData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Customer Satisfaction Trend</CardTitle></CardHeader>
          <CardContent>
            {feedbackData.length === 0 ? (
              <p className="flex h-[300px] items-center justify-center text-muted-foreground">No feedback data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={feedbackData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avg" stroke="hsl(199, 89%, 48%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
