"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DashboardFrame({
  children,
  shell,
}: {
  children: React.ReactNode;
  shell: React.ReactNode;
}) {
  const pathname = usePathname();

useEffect(() => {
  document.documentElement.classList.remove("dark");
  localStorage.removeItem("taplink-theme");
}, []);

  if (pathname.startsWith("/dashboard/page-editor")) {
    return <>{children}</>;
  }

  return <>{shell}</>;
}
