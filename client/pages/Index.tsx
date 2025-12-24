import { Link } from "react-router-dom";
import { Package, MapPin, Tag, TrendingUp, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user } = useAuth();
  const features = [
    {
      icon: Package,
      title: "Track Everything",
      description: "Keep a comprehensive inventory of all your possessions in one place",
    },
    {
      icon: MapPin,
      title: "Organize by Location",
      description: "Categorize items by storage locations like drawers, bags, and rooms",
    },
    {
      icon: Tag,
      title: "Smart Tagging",
      description: "Add custom tags for price, item type, importance, and more",
    },
    {
      icon: Search,
      title: "Quick Search",
      description: "Find items instantly with powerful search and filtering",
    },
    {
      icon: Zap,
      title: "Instant Access",
      description: "Mobile-first design for access anywhere, anytime",
    },
    {
      icon: TrendingUp,
      title: "Insights",
      description: "Understand your belongings with visual organization",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <header className="border-b border-border/40 bg-card/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold gradient-heading hidden sm:inline">
                Stowage
              </span>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <Link to="/inventory">
                  <Button variant="ghost" className="text-sm">
                    Open App
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" className="text-sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 sm:pb-20">
        <div className="text-center mb-12 sm:mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 text-sm font-semibold">
            <Zap className="w-4 h-4" />
            <span>The smarter way to organize</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 gradient-heading leading-tight">
            Never Lose Track of
            <br className="hidden sm:block" />
            Your Belongings Again
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Stowage helps you organize, track, and find all your physical
            possessions with ease. Keep your items tagged, located, and always
            accessible.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={user ? "/inventory" : "/auth"}>
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
              >
                <Package className="w-5 h-5" />
                {user ? "Go to Inventory" : "Start Organizing"}
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </a>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative mt-12 sm:mt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-3xl" />
          <div className="relative bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-4 sm:p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <Package className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-sm sm:text-base mb-1">
                  Items Tracked
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300">
                  0
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <MapPin className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-sm sm:text-base mb-1">
                  Storage Spaces
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-300">
                  0
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
                <Tag className="w-8 h-8 text-amber-600 mb-3" />
                <h3 className="font-semibold text-sm sm:text-base mb-1">
                  Categories
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-300">
                  0
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
      >
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features to help you manage your possessions efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 sm:p-8 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
          <div className="relative px-6 sm:px-12 py-12 sm:py-16 text-center text-primary-foreground">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to organize your life?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Start tracking your belongings today. It only takes a moment to
              set up.
            </p>
            <Link to={user ? "/inventory" : "/auth"}>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 font-semibold"
              >
                <Package className="w-5 h-5" />
                {user ? "Open Your Inventory" : "Get Started Now"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Stowage</span>
            </div>
            <p className="text-center sm:text-right">
              © 2024 Stowage. Organize. Track. Find.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
