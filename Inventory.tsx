import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const Inventory = () => {
  const { toast } = useToast();
  const [parts, setParts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "", quantity: 0, min_stock: 5, unit_cost: 0, supplier: "" });

  const fetchParts = async () => {
    const { data } = await supabase.from("inventory_parts").select("*").order("name");
    let filtered = data || [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((p: any) => p.name.toLowerCase().includes(s) || (p.category || "").toLowerCase().includes(s));
    }
    setParts(filtered);
  };

  useEffect(() => { fetchParts(); }, [search]);

  const openAdd = () => { setEditing(null); setForm({ name: "", description: "", category: "", quantity: 0, min_stock: 5, unit_cost: 0, supplier: "" }); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ name: p.name, description: p.description || "", category: p.category || "", quantity: p.quantity, min_stock: p.min_stock, unit_cost: p.unit_cost, supplier: p.supplier || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (editing) {
      const { error } = await supabase.from("inventory_parts").update(form).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Part updated" });
    } else {
      const { error } = await supabase.from("inventory_parts").insert(form);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Part added" });
    }
    setDialogOpen(false);
    fetchParts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("inventory_parts").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Part deleted" }); fetchParts(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Button className="gap-2" onClick={openAdd}><Plus className="h-4 w-4" /> Add Part</Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search parts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category || "—"}</TableCell>
                  <TableCell>
                    <span className={p.quantity <= p.min_stock ? "font-semibold text-destructive" : ""}>
                      {p.quantity}
                    </span>
                    {p.quantity <= p.min_stock && <Badge variant="destructive" className="ml-2">Low</Badge>}
                  </TableCell>
                  <TableCell>${p.unit_cost}</TableCell>
                  <TableCell>{p.supplier || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {parts.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No parts found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Part" : "Add Part"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Supplier</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Min Stock</Label><Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Unit Cost ($)</Label><Input type="number" step="0.01" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={!form.name}>{editing ? "Update" : "Add"} Part</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
