import {
  Outlet,
  createReactRouter,
  createRouteConfig,
} from "@tanstack/react-router";
import { z } from "zod";
import TablePage from "./:table/page";
import AppPage from "./page";

const routeConfig = createRouteConfig().createChildren((createRoute) => [
  createRoute({ path: "/", element: <div>something went wrong</div> }),
  createRoute({ path: "app", element: <AppPage /> }).createChildren(
    (createRoute) => [
      createRoute({
        path: ":table",
        parseParams: (params) => ({
          table: z.string().min(1).parse(params.table),
        }),
        stringifyParams: ({ table }) => ({ table: `${table}` }),
        element: <TablePage />,
      }),
    ]
  ),
]);

export const router = createReactRouter({
  routeConfig,
  basepath: "/app",
});
