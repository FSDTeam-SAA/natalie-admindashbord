"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export default function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-[80px] items-center justify-between gap-4  bg-[#141417] px-6 lg:left-[300px]">
      <div className="min-w-0">
       
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Avatar className="size-11 shadow-sm">
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
