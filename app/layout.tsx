import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MiTAC Catalog",
  description: "MiTAC Computing SKU catalog"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                MiTAC Catalog Explorer
              </h1>
              <p className="text-sm text-slate-600">
                SKU harvesting, comparison, and configuration workspace.
              </p>
            </div>
            <nav className="flex items-center gap-3 text-sm text-slate-600">
              <a className="hover:text-slate-900" href="/">
                Catalog
              </a>
              <a className="hover:text-slate-900" href="/catalog">
                Data
              </a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
