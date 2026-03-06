import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/landing/Footer";

const blogPosts = [
  {
    slug: "how-contractowl-works",
    title: "How ContractOwl Protects Small Businesses from Bad Contracts",
    description:
      "Auto-renewals, hidden fees, termination traps — learn how ContractOwl's AI scanner catches dangerous clauses before you sign.",
    readTime: "5 min read",
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-owl.png" alt="ContractOwl" className="h-7 w-7" />
            <span className="text-xl font-bold tracking-tight text-foreground">ContractOwl</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/blog" className="text-foreground font-medium">Blog</Link>
            <Link to="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
            <Link to="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              ContractOwl <span className="text-gradient">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Guides and insights for small business owners
            </p>
          </div>

          <div className="grid gap-8">
            {blogPosts.map((post) => (
              <Card key={post.slug} className="gradient-card border-border/50 hover:border-primary/40 transition-colors shadow-card overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-foreground">{post.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{post.description}</p>
                  <Button asChild variant="outline" className="group">
                    <Link to={`/blog/${post.slug}`}>
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
