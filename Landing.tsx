import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Wrench, Clock, BookOpen, Shield, BarChart3 } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Dern-Support</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/knowledge-base">
              <Button variant="ghost">Knowledge Base</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-accent/5 py-24">
        <div className="container text-center">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-foreground">
            Professional IT Support<br />You Can Rely On
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Fast, reliable computer repair services for businesses and individuals. Submit a request, book an appointment, and track your repair — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="px-8">Submit a Request</Button>
            </Link>
            <Link to="/knowledge-base">
              <Button size="lg" variant="outline">Browse Knowledge Base</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">How We Help</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Wrench, title: "Expert Repairs", desc: "Hardware and software fixes for desktops, laptops, and peripherals." },
              { icon: Clock, title: "Fast Turnaround", desc: "Priority scheduling and real-time tracking of your repair status." },
              { icon: BookOpen, title: "Self-Help Guides", desc: "Browse our knowledge base to troubleshoot common issues yourself." },
              { icon: Shield, title: "Business Accounts", desc: "Dedicated support plans for businesses with multiple devices." },
              { icon: BarChart3, title: "Transparent Pricing", desc: "Automated cost estimates before we begin any repair work." },
              { icon: Monitor, title: "On-Site & In-Shop", desc: "We come to you or you bring it in — your choice." },
            ].map((f) => (
              <Card key={f.title} className="border bg-card transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-start gap-3 p-6">
                  <f.icon className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 Dern-Support. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
