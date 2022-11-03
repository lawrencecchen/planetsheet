import { memo, useMemo } from "react";
import { trpc } from "~/utils/trpc";
import { router } from "../router";
import Table from "./Table";

const TableMemo = memo(Table);

export default function TablePage() {
  const { params } = router.useMatch("/app/:table");
  const route = router.location;
  const tableName = useMemo(
    () => (params as any).table,
    // () => route.pathname.split("/").pop() as string,
    [route]
  );
  const tablesQuery = trpc.db.tables.useQuery();
  const table = tablesQuery.data?.filter(
    (table) => table.name === tableName
  )?.[0];

  if (tablesQuery.isLoading) {
    return <div>loading...</div>;
  }

  if (!table) {
    return <div>Table not found</div>;
  }
  // console.log(tableName);

  return (
    <div
      className="flex grow flex-col"
      style={{ height: `calc(100vh - 45px)` }} // todo: remove this
    >
      {/* <div className="flex text-sm">
    {table.columns.map((column) => (
      <div key={column.name}>{column.name}</div>
    ))}
  </div> */}
      <div className="border-b py-3 px-4">random controls {tableName}</div>
      <div className="flex-0 flex flex-col">
        <TableMemo tableName={tableName} />
        {/* <Table tableName={"posts"} /> */}
        {/* {tableName} */}
      </div>
    </div>
  );
}
