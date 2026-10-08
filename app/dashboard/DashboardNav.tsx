"use client";

import { usePathname } from "next/navigation";

type Props = {
  platformAdmin: boolean;
};

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  return (
    <a
      href={item.href}
      className={active ? "active" : undefined}
      aria-current={active ? "page" : undefined}
    >
      {item.label}
    </a>
  );
}

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="dashboard-nav-group">
      <span className="dashboard-nav-label">{title}</span>

      {items.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}
    </div>
  );
}

export default function DashboardNav({ platformAdmin }: Props) {
  const pathname = usePathname();

  return (
    <nav className="dashboard-nav" aria-label="Navegação principal">
      <NavGroup
        title="Meu negócio"
        pathname={pathname}
        items={[
          {
            href: "/dashboard",
            label: "Visão geral",
            exact: true,
          },
          {
            href: "/dashboard/page-editor",
            label: "Página pública",
          },
          {
            href: "/dashboard/organizations",
            label: "Trocar empresa",
          },
        ]}
      />

      <NavGroup
        title="Desempenho"
        pathname={pathname}
        items={[
          {
            href: "/dashboard/analytics",
            label: "Analytics",
          },
          {
            href: "/dashboard/insights",
            label: "Insights",
          },
        ]}
      />

      <NavGroup
        title="Conta"
        pathname={pathname}
        items={[
          {
            href: "/dashboard/settings",
            label: "Configurações",
          },
          {
            href: "/dashboard/billing",
            label: "Plano e cobrança",
          },
        ]}
      />

      {platformAdmin && (
        <NavGroup
          title="Administração"
          pathname={pathname}
          items={[
            {
              href: "/admin/operations",
              label: "Operação da plataforma",
            },
            {
              href: "/admin/reconciliation",
              label: "Conciliação Asaas",
            },
            {
              href: "/admin/security",
              label: "Segurança e sessões",
            },
          ]}
        />
      )}
    </nav>
  );
}
