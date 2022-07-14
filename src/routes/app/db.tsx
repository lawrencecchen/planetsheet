import { trpc } from "@/utils/trpc";
import { Outlet } from "@tanstack/react-location";
import LeftPanel from "./components/LeftPanel";

export default function DbRoute() {
  const { data: schemas, isLoading } = trpc.useQuery([
    "information_schema.tables",
  ]);

  if (!schemas || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen max-h-screen">
      <LeftPanel schemas={schemas} />
      <Outlet />
      {/* <RightPanel /> */}
    </div>
  );
}
