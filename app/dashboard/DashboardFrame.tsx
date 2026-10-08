"use client";

import { usePathname } from "next/navigation";

export default function DashboardFrame({
  children,
  shell,
}: {
  children: React.ReactNode;
  shell: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard/page-editor")) {
    return <>{children}</>;
  }

  return <>{shell}</>;
}
