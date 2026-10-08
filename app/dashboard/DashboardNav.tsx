"use client";

import { usePathname } from "next/navigation";

type Props = {
  platformAdmin: boolean;
};

export default function DashboardNav({ platformAdmin }: Props) {
  const pathname = usePathname();

  function active(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  function linkClass(href: string) {
    return active(href) ? "active" : undefined;
  }

  return (
    <nav className="dashboard-nav">
      <a className={linkClass("/dashboard")} href="/dashboard">
        Visão geral
      </a>

      <a className={linkClass("/dashboard/page-editor")} href="/dashboard/page-editor">
        Página pública
      </a>

      <a className={linkClass("/dashboard/organizations")} href="/dashboard/organizations">
        Trocar empresa
      </a>

      {platformAdmin && (
        <>
          <a className={linkClass("/admin/operations")} href="/admin/operations">
            Operação da plataforma
          </a>

          <a className={linkClass("/admin/reconciliation")} href="/admin/reconciliation">
            Conciliação Asaas
          </a>

          <a className={linkClass("/admin/security")} href="/admin/security">
            Segurança e sessões
          </a>
        </>
      )}

      <a className={linkClass("/dashboard/analytics")} href="/dashboard/analytics">
        Analytics
      </a>

      <a className={linkClass("/dashboard/insights")} href="/dashboard/insights">
        Insights
      </a>

      <a className={linkClass("/dashboard/billing")} href="/dashboard/billing">
        Plano e cobrança
      </a>

      <a className={linkClass("/dashboard/settings")} href="/dashboard/settings">
        Configurações
      </a>
    </nav>
  );
}

