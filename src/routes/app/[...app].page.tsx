import { ClientSuspense } from "rakkasjs";
import { lazy } from "react";

const ClientApp = lazy(() => import("~/app"));

export default function ClientOnlyApp() {
  return (
    <ClientSuspense fallback="Loading client app...">
      {<ClientApp />}
    </ClientSuspense>
  );
}
