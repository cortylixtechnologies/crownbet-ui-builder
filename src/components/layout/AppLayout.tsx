import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export const AppLayout = ({
  children,
  headerVariant,
  hideHeader,
}: {
  children: ReactNode;
  headerVariant?: "default" | "games" | "search";
  hideHeader?: boolean;
}) => {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {!hideHeader && <Header variant={headerVariant} />}
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
};
