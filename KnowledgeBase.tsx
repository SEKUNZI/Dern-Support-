import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Monitor, ArrowLeft } from "lucide-react";

const KnowledgeBase = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      let query = supabase.from("knowledge_base_articles").select("*").eq("published", true).order("created_at", { ascending: false });
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,category.ilike.%${search}%`);
      }
      const { data } = await query;
      setArticles(data || []);
    };
    fetchArticles();
  }, [search]);

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl py-8">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => setSelectedArticle(null)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="mb-2 text-3xl font-bold">{selectedArticle.title}</h1>
          <div className="mb-4 flex gap-2">
            <Badge>{selectedArticle.category}</Badge>
            {selectedArticle.device_type && <Badge variant="outline">{selectedArticle.device_type}</Badge>}
          </div>
          <div className="prose max-w-none text-foreground">
            {selectedArticle.content.split("\n").map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
          </div>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        {articles.length === 0 ? (
          <p className="text-center text-muted-foreground">No articles found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <Card key={a.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setSelectedArticle(a)}>
                <CardHeader>
                  <CardTitle className="text-lg">{a.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{a.content}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{a.category}</Badge>
                    {a.device_type && <Badge variant="outline">{a.device_type}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
