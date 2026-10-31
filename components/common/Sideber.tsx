"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ImageDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  Box,
  Coins,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Box },
   { name: "Companions", href: "/companions", icon: ImageDown },
  { name: "Subscriptions", href: "/subscriptions", icon: User  },
  { name: "Credits", href: "/credits", icon: Coins },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    await signOut({ callbackUrl: "/sign-in", redirect: true });
  };

  return (
    <>
    
      {!isMobileMenuOpen && (
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-[#212121] text-white shadow-lg hover:bg-[#313131] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

    
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex h-screen sticky bottom-0 top-0 flex-col bg-[#141417] z-50 transition-transform duration-300 overflow-auto",
          // Mobile এ
          "fixed lg:static",
          "w-[260px] lg:w-[300px]",
          // Mobile এ hide/show control
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="relative flex h-[145px] items-start justify-center px-4 pt-8">
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={1000}
              height={1000}
              priority
              className="h-auto w-[150px] object-contain sm:w-[165px] lg:w-[180px]"
            />
          </Link>

        
          {isMobileMenuOpen && (
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white hover:bg-slate-600/50 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-3 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex h-[56px] w-full items-center justify-start gap-3 px-8 text-[18px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#C2384F] text-white"
                    : "text-white hover:bg-[#C2384F] hover:text-white",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                    isActive ? "text-white" : "",
                  )}
                />
                <span
                  className={cn(
                    "text-base font-normal leading-[120%] transition-colors duration-200 lg:text-[18px]",
                    isActive ? "font-semibold text-white" : "text-white",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 pt-4">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="mx-auto flex w-[90%] items-center justify-start gap-2 rounded-lg px-3 py-2 text-[18px] font-medium text-[#B42318] transition-all duration-200 hover:bg-[#B42318] hover:text-white"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6" />
            <span className="text-sm font-normal leading-[120%] sm:text-base">
              Logout
            </span>
          </button>
        </div>
      </div>

      <Dialog
        open={isLogoutModalOpen}
        onOpenChange={(open) => {
          setIsLogoutModalOpen(open);
          if (!open) setIsLoggingOut(false);
        }}
      >
        <DialogContent
          overlayClassName="bg-black/60 backdrop-blur-[2px]"
          className="max-w-[440px] border border-gray-200 bg-white p-6 text-black shadow-2xl ring-0 [&_[data-slot=dialog-close]]:text-black [&_[data-slot=dialog-close]]:hover:bg-gray-100"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-2xl font-semibold text-[#000000]">
              Logout confirmation
            </DialogTitle>
            <DialogDescription className="mt-2 text-base leading-6 text-[#7D7D7D]">
              Are you sure you want to logout from the admin dashboard?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 border-gray-200 bg-gray-50 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isLoggingOut}
              onClick={() => setIsLogoutModalOpen(false)}
              className="h-[44px] min-w-[110px] border-gray-300 bg-white text-base font-medium text-black hover:bg-gray-100 hover:text-black"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="h-[44px] min-w-[110px] bg-[#B42318] text-base font-medium text-white hover:bg-[#9F1F16]"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
