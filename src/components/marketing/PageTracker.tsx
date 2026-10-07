"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPageView } from "@/app/[locale]/(marketing)/marketing-actions";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      recordPageView(pathname).catch(console.error);
    }
  }, [pathname]);

  return null;
}
