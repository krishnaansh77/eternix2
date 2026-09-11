"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  rightPanel?: React.ReactNode
}

export function DashboardLayout({ children, rightPanel }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation menu</SheetTitle>
            <SheetDescription>
              Displays the mobile navigation sidebar.
            </SheetDescription>
          </SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64 transition-all duration-300">
        <Navbar onMobileMenuClick={() => setMobileMenuOpen(true)} />
        
        <div className="flex">
          {/* Main Area */}
          <main className={cn("flex-1 p-4 lg:p-6", rightPanel && "lg:pr-[320px]")}>
            {children}
          </main>

          {/* Right Panel (optional) */}
          {rightPanel && (
            <aside className="hidden lg:block fixed right-0 top-16 w-[320px] h-[calc(100vh-4rem)] border-l border-border bg-card overflow-y-auto">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
