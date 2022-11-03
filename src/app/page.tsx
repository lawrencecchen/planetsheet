import { Outlet } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { trpc } from "~/utils/trpc";
import { router } from "./router";

export function TablesNav() {
  const { Link } = router.useMatch("/app");
  const tablesQuery = trpc.db.tables.useQuery();

  return (
    <div className="flex items-center border-b border-neutral-300/80 px-2 text-sm font-medium">
      {tablesQuery.data?.map((table) => (
        <Link
          to="/app/:table"
          params={{
            table: table.name,
          }}
          className="px-2 py-3"
          key={table.name}
        >
          {table.name}
        </Link>
      ))}

      <button className="flex items-center gap-1 px-2 text-neutral-800">
        <Plus className="h-4 w-4" />
        Add or import
      </button>
    </div>
  );
}

export default function AppPage() {
  return (
    <div>
      <TablesNav />
      <Outlet />
    </div>
  );
}
