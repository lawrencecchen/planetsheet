import DbRoute from "@/routes/app/db";
import TableRoute from "@/routes/app/db/TableRoute";
import { LocationGenerics } from "@/routes/locationGenerics";
import { trpc } from "@/utils/trpc";
import { ReactLocation, Router } from "@tanstack/react-location";
import type { NextPage } from "next";
import Head from "next/head";
import Empty from "./app/db/Empty";
import { Sheet } from "./sheet";

const location = new ReactLocation<LocationGenerics>();

const App: NextPage = () => {
  const utils = trpc.useContext();

  return (
    <div>
      <Head>
        <title>Planetsheet</title>
        <meta name="description" content="amazing sql editor." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Router
        location={location}
        routes={[
          {
            path: "app/sheet",
            element: <Sheet />,
          },
          {
            path: "app/:db",
            element: <DbRoute />,
            loader: async () => {
              utils.prefetchQuery(["information_schema.tables"]);
              return {};
            },
            children: [
              {
                id: "db-empty",
                path: "/",
                search: (search) => !search.schema && !search.table,
                element: <Empty />,
              },
              {
                id: "db-table",
                path: "/",
                search: (search) => search.schema && search.table,
                element: <TableRoute />,
                loader: async ({ search }) => {
                  if (!search.table || !search.schema) {
                    throw new Error('"table" and "schema" are required');
                  }
                  Promise.all([
                    utils.prefetchQuery([
                      "information_schema.columns",
                      { table_name: search.table, table_schema: search.schema },
                    ]),
                    utils.prefetchQuery([
                      "tableData",
                      {
                        table_name: search.table,
                        table_schema: search.schema,
                        limit: search.limit,
                        offset: search.offset,
                      },
                    ]),
                  ]);
                  return {};
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default App;
