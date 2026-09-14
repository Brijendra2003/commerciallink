import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · CommercialLink Admin" },
  robots: { index: false, follow: false },
};

/**
 * Bare shell for everything under /admin, including the login screen. The
 * auth gate and the panel chrome live one level down in (panel)/layout.tsx so
 * that /admin/login can render without them — otherwise the gate would
 * redirect the login page to itself.
 */
export default function AdminRootLayout({
  children,
}: LayoutProps<"/admin">) {
  return children;
}
