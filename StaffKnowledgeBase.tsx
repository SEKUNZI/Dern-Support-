import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const StaffKnowledgeBase = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "general", device_type: "", problem_type: "" });

  const fetchArticles = async () => {
    const { data } = await supabase.from("knowledge_base_articles").select("*").order("created_at", { ascending: false });
    setArticles(data || []);
  };

  useEffect(() => { fetchArticles(); }, []);

  const openAdd = () => { setEditing(null); setForm({ title: "", content: "", category: "general", device_type: "", problem_type: "" }); setDialogOpen(true); };
  const openEdit = (a: any) => { setEditing(a); setForm({ title: a.title, content: a.content, category: a.category, device_type: a.device_type || "", problem_type: a.problem_type || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (editing) {
      const { error } = await supabase.from("knowledge_base_articles").update(form).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Article updated" });
    } else {
      const { error } = await supabase.from("knowledge_base_articles").insert(form);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Article created" });
    }
    setDialogOpen(false);
    fetchArticles();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("knowledge_base_articles").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Article deleted" }); fetchArticles(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Knowledge Base Management</h1>
        <Button className="gap-2" onClick={openAdd}><Plus className="h-4 w-4" /> New Article</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {articles.map((a) => (
          <Card key={a.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{a.title}</CardTitle>
                <div className="mt-1 flex gap-2">
                  <Badge variant="secondary">{a.category}</Badge>
                  {!a.published && <Badge variant="destructive">Draft</Badge>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-sm text-muted-foreground">{a.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Article" : "New Article"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Device Type</Label><Input value={form.device_type} onChange={(e) => setForm({ ...form, device_type: e.target.value })} /></div>
              <div className="space-y-2"><Label>Problem Type</Label><Input value={form.problem_type} onChange={(e) => setForm({ ...form, problem_type: e.target.value })} /></div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={!form.title || !form.content}>{editing ? "Update" : "Create"} Article</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffKnowledgeBase;
