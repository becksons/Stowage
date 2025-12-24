import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Package, MapPin, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-card/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group relative">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Package className="w-6 h-6 text-primary-foreground relative z-10" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-20 blur transition-opacity" />
              </div>
              <span className="hidden sm:inline text-xl font-black gradient-heading">
                Stowage
              </span>
            </Link>

            {/* Mobile Menu */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/inventory"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold",
                  isActive("/inventory")
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <Package className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">Inventory</span>
              </Link>

              <Link
                to="/storage"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold",
                  isActive("/storage")
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <MapPin className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">Storage</span>
              </Link>

              {/* User Menu */}
              {user && (
                <div className="ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-border/40">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg hover:bg-primary/10"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-semibold">
                            {user.email?.[0].toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-semibold truncate">
                          {user.user_metadata?.display_name || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="h-px bg-border/40 my-1" />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all group-hover:scale-110 duration-300">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-bold gradient-heading">Stowage</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
              <Sparkles className="w-4 h-4 text-primary/60 flex-shrink-0" />
              <p>Organize. Track. Find. Your personal inventory companion.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
