"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Bell, Menu, Sparkles, LogOut, UserCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

interface NavbarProps {
  onMobileMenuClick?: () => void
}

const recentSearches = [
  { id: 1, type: "patient", name: "John Doe", info: "ID: P-1234" },
  { id: 2, type: "patient", name: "Sarah Wilson", info: "ID: P-5678" },
  { id: 3, type: "diagnosis", name: "Cardiac Analysis", info: "ECG Report" },
  { id: 4, type: "report", name: "MRI Scan Results", info: "Brain Imaging" },
]

const notifications = [
  { id: 1, title: "Critical Alert", message: "Patient John Doe - Abnormal ECG detected", time: "2 min ago", critical: true },
  { id: 2, title: "New Report", message: "X-ray analysis completed for Sarah Wilson", time: "15 min ago", critical: false },
  { id: 3, title: "AI Diagnosis", message: "Low confidence warning - Review required", time: "1 hour ago", critical: true },
  { id: 4, title: "Appointment", message: "Upcoming: Michael Brown at 3:00 PM", time: "2 hours ago", critical: false },
]

export function Navbar({ onMobileMenuClick }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, signOut } = useAuth()

  const criticalCount = notifications.filter(n => n.critical).length

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Search */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-64 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
            >
              <Search className="h-4 w-4" />
              <span>Search patients, reports...</span>
              <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Upgrade Button */}
          <Link href="/signup">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2 border-primary/30 text-primary hover:bg-primary/10">
              <Sparkles className="h-4 w-4" />
              Upgrade
            </Button>
          </Link>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {criticalCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {criticalCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary" className="text-xs">
                  {notifications.length} new
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        notification.critical ? "bg-destructive" : "bg-primary"
                      )}
                    />
                    <span className="font-medium text-sm">{notification.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-4">
                    {notification.message}
                  </p>
                  <span className="text-xs text-muted-foreground/70 pl-4">
                    {notification.time}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 sm:px-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium leading-none">
                    {user?.name ?? "Dr. Smith"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role ?? "Cardiologist"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex-col items-start">
                <span className="font-medium">{user?.name ?? "Dr. Smith"}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email ?? "dr.smith@aarogyam.ai"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command/Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search patients, diagnoses, reports..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Recent Searches">
            {recentSearches.map((item) => (
              <CommandItem key={item.id} className="flex items-center gap-3 cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-medium uppercase">
                  {item.type[0]}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.info}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
