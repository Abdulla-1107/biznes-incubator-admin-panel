import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/shared/providers/ThemeProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-80 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Qidirish..."
          className="pl-9 h-9 bg-secondary border-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            AD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
