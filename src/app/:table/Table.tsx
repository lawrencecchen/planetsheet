import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  Row,
  Table as TableType,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TableMetadata } from "kysely";
import { Type } from "lucide-react";
import { Fragment, useMemo, useRef, useState } from "react";
import { trpc } from "~/utils/trpc";

type Cell = [number, number];
type TableMetaState = {
  editingCell: Cell | null;
  selectedCell: Cell | null;
  columnWidths: Array<number>;
};

const columnHelper = createColumnHelper<unknown>();

function TableBody<T>(props: {
  data: any[];
  table: TableType<T>;
  tableMetaState: TableMetaState;
}) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const { rows } = props.table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28.5,
    overscan: 1,
  });

  return (
    <div
      style={{
        height: `calc(100vh - 45px - 49px - 28.5px)`,
      }}
      className="w-screen max-w-full overflow-auto text-[13px] font-normal"
      ref={parentRef}
    >
      <div
        style={{ height: rowVirtualizer.getTotalSize() }}
        className="relative"
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index] as Row<unknown>;
          // console.log({ row });
          return (
            <Fragment key={row.id}>
              {row.getVisibleCells().map((cell, i) => {
                const width = props.tableMetaState.columnWidths[i]!; // TODO: fix typescript
                return (
                  <div
                    key={cell.id}
                    className="inline select-none border-r border-b py-1 px-2 text-[13px]"
                    id={cell.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: width,
                      height: `${virtualRow.size}px`,
                      transform: `translate(${width * i}px,${
                        virtualRow.start
                      }px)`,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                );
              })}
            </Fragment>
          );
        })}
        {/* {props.table.getRowModel().rows.map((row) => (
          <Fragment key={row.id}>
            {row.getVisibleCells().map((cell, i) => {
              const width = props.tableMetaState.columnWidths[i]!; // TODO: fix typescript
              return (
                <div
                  key={cell.id}
                  className="select-none border-r border-b py-1 px-2 text-[13px]"
                  id={cell.id}
                  // style={{ width }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              );
            })}
          </Fragment>
        ))} */}
      </div>
    </div>
  );
}

export default function Table(props: { tableName: string }) {
  const tablesQuery = trpc.db.tables.useQuery();
  const tableData = tablesQuery.data?.filter(
    (table) => table.name === props.tableName
  )?.[0] as TableMetadata;
  const columns = useMemo(
    () =>
      tableData?.columns.map((column) =>
        columnHelper.accessor(column.name as any, {
          cell: (info) => info.getValue(),
        })
      ) ?? [],
    [tableData]
  );
  const tableQuery = trpc.db.table.useQuery({ tableName: props.tableName });
  const data = tableQuery.data ?? [];
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  console.log("rerender");

  const [tableMetaState, setTableMetaState] = useState<TableMetaState>({
    // selectedCoordinates: {} as Record<string>
    editingCell: null,
    selectedCell: null,
    columnWidths: columns.map(() => 200) ?? [],
  });
  const gridTemplateColumns = tableMetaState.columnWidths
    .map((width) => `${width}px`)
    .join(" ");

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    // console.log("click", e.target);
    const target = e.target as HTMLElement;
    // console.log(target.nodeName);
    if (target.nodeName === "TD") {
      console.log("HI");
    }
  }

  return (
    <div className="flex grow flex-col" onClick={handleClick}>
      <div>
        {table.getHeaderGroups().map((headerGroup) => (
          <div
            key={headerGroup.id}
            style={{ gridTemplateColumns }}
            className="inline-grid bg-neutral-100/80 text-[13px] font-normal"
          >
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="inline-flex select-none items-center gap-2 border-b border-r border-neutral-300/80 py-1 px-3"
              >
                <Type className="h-4 w-4" />
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <TableBody data={data} table={table} tableMetaState={tableMetaState} />

      {/* <div className="absolute"></div> */}
    </div>
  );
}
