import { Link } from "react-router-dom";
import { Home, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Package className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold gradient-heading mb-3">
          404
        </h1>

        <h2 className="text-2xl font-semibold mb-3">Page not found</h2>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist. Let's get you back on
          track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Link to="/inventory">
            <Button className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-secondary">
              <Package className="w-4 h-4" />
              Open App
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
