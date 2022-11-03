import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, RouterProvider } from "@tanstack/react-router";
import { useState } from "react";
import { trpc, trpcClient as _trpcClient } from "~/utils/trpc";
import { router } from "./router";

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => _trpcClient);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {/* <SessionProvider>{props.children}</SessionProvider> */}
        <RouterProvider router={router}>
          <Outlet />
        </RouterProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
