import { inferQueryResponse } from "@/backend/router";
import { CellSelectionType } from "@/components/Table/types";
import { LocationGenerics } from "@/routes/locationGenerics";
import { trpc } from "@/utils/trpc";
import { useNavigate, useSearch } from "@tanstack/react-location";
import {
  createTable,
  getCoreRowModel,
  RowSelectionState,
  useTableInstance,
} from "@tanstack/react-table";
import clsx from "clsx";
import { HTMLProps, useEffect, useMemo, useRef, useState } from "react";
import { useEventListener } from "usehooks-ts";
import { z } from "zod";

const table = createTable().setRowType<any>();

function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={clsx(className, "cursor-pointer align-middle")}
      {...rest}
    />
  );
}
function getAttributeRecursively(
  el: HTMLElement,
  attr: string,
  depth: number = 3
): { attr: string; ref: HTMLElement } | null {
  if (depth === 0) {
    return null;
  }
  const result = el.getAttribute(attr);
  if (result) {
    return { attr: result, ref: el };
  }
  if (el.parentElement) {
    return getAttributeRecursively(el.parentElement, attr, depth - 1);
  }
  return null;
}
const CellMetaValidator = z.object({
  columnId: z.string(),
  rowId: z.string(),
});

function CellSelection(props: {
  cellSelection: CellSelectionType;
  columnStartPositions: number[];
  rowHeight: number;
  headerHeight: number;
}) {
  const height = props.rowHeight;
  const width =
    props.columnStartPositions[props.cellSelection.column + 1] -
    props.columnStartPositions[props.cellSelection.column];
  const y = props.rowHeight * props.cellSelection.row + props.headerHeight;
  const x = props.columnStartPositions[props.cellSelection.column];
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute top-0 left-0 border-2 border-blue-600"
        style={{
          width: width + 1,
          height: height + 1,
          transform: `translate(${x - 1}px, ${y - 1}px)`,
        }}
      />
    </div>
  );
}

function Table(props: {
  columns: inferQueryResponse<"information_schema.columns">;
  data: inferQueryResponse<"tableData">;
}) {
  const tableColumns = useMemo(() => {
    if (!props.columns) return [];
    const columns = [];
    columns.push(
      table.createDisplayColumn({
        id: "select",
        enableResizing: false,
        maxSize: 50,
        header: ({ instance }) => (
          <div className="w-full grid place-content-center">
            <IndeterminateCheckbox
              {...{
                checked: instance.getIsAllRowsSelected(),
                indeterminate: instance.getIsSomeRowsSelected(),
                onChange: instance.getToggleAllRowsSelectedHandler(),
                className: "mx-auto",
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="w-full grid place-content-center">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      })
    );
    for (const column of props.columns) {
      columns.push(
        table.createDataColumn(column.column_name, {
          id: column.column_name,
          cell: (info) => {
            const value = info.getValue();
            if (!value) {
              return <span className="text-neutral-400">-</span>;
            }
            if (
              column.data_type.includes("timestamp") ||
              column.data_type.includes("datetime")
            ) {
              return new Date(value).toLocaleString();
            }
            if (typeof value === "string") {
              return value;
            }
            return JSON.stringify(info.getValue()) ?? "";
          },
          header: (props) => {
            return props.column.id;
          },
        })
      );
    }
    return columns;
  }, [props.columns]);
  const navigate = useNavigate();
  const search = useSearch<LocationGenerics>();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    search.rowSelection ?? {}
  );

  const [cellSelection, setCellSelection] = useState<CellSelectionType>();
  useEffect(() => {
    if (cellSelection) {
      navigate({
        search: (old) => ({
          ...old,
          cellSelection,
        }),
      });
    } else {
      navigate({
        search: (old) => ({
          ...old,
          cellSelection: undefined,
        }),
      });
    }
  }, [cellSelection]);
  const cellRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (Object.keys(rowSelection).length > 0) {
      navigate({
        search: (old) => ({
          ...old,
          rowSelection,
        }),
        replace: true,
      });
    } else {
      navigate({
        search: (old) => ({
          ...old,
          rowSelection: undefined,
        }),
        replace: true,
      });
    }
  }, [rowSelection]);
  const instance = useTableInstance(table, {
    data: props.data ?? [],
    columns: tableColumns,
    state: {
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    columnResizeMode: "onChange",
    enableColumnResizing: true,
  });

  const columnStartPositions = instance
    .getHeaderGroups()
    .flatMap((headerGroup) =>
      headerGroup.headers.map((header) => header.getStart())
    );

  function handleMouseDown(e: React.MouseEvent<HTMLTableElement>) {
    const result = getAttributeRecursively(
      e.target as HTMLElement,
      "data-ps-table-meta"
    );
    if (!result) {
      return;
      // throw new Error("could not find data-ps-table-meta");
    }
    const { attr, ref } = result;

    const cellMeta = CellMetaValidator.parse(JSON.parse(attr));
    if (cellMeta.columnId === "select") {
      return;
    }
    const column = tableColumns.findIndex(
      (column) => column.id === cellMeta.columnId
    );
    if (!column) {
      throw new Error("invalid column id");
    }
    setCellSelection({
      ...cellMeta,
      column,
      row: Number(cellMeta.rowId),
    });
    cellRef.current = ref;
  }
  const containerRef = useRef<HTMLDivElement>(null);

  useEventListener("mouseup", () => {
    document.body.style.cursor = "";
  });
  useEventListener("touchend", () => {
    document.body.style.cursor = "";
  });

  return (
    <div className="select-none relative" ref={containerRef}>
      <table
        className="border-separate border-spacing-0 table-fixed w-full"
        onMouseDown={handleMouseDown}
        style={{
          width: instance.getCenterTotalSize(),
        }}
      >
        <thead>
          {instance.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className="font-medium text-xs py-1.5 border-b px-4 sticky top-0 bg-neutral-100 w-fit border-r"
                  style={{
                    width: header.getSize(),
                  }}
                >
                  {header.isPlaceholder ? null : header.renderHeader()}
                  {header.column.getCanResize() && (
                    <div className="group absolute -right-px w-6 h-full top-0 z-20 bg-transparent">
                      <div
                        onMouseDown={(e) => {
                          document.body.style.cursor = "col-resize";
                          header.getResizeHandler()(e);
                        }}
                        onTouchStart={(e) => {
                          document.body.style.cursor = "col-resize";
                          header.getResizeHandler()(e);
                        }}
                        className={clsx(
                          "absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none touch-none",
                          {
                            "bg-blue-500 opacity-100":
                              header.column.getIsResizing(),
                            "bg-blue-500/60 hidden group-hover:block":
                              !header.column.getIsResizing(),
                          }
                        )}
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {instance.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={clsx(
                    "whitespace-nowrap border-r border-b max-w-lg overflow-ellipsis overflow-hidden text-[13px] h-6 px-4"
                  )}
                  style={{
                    width: cell.column.getSize(),
                  }}
                  data-ps-table-meta={JSON.stringify({
                    columnId: cell.column.id,
                    rowId: cell.row.id,
                  })}
                >
                  {cell.renderCell()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {/* <tfoot>
        {instance.getFooterGroups().map((footerGroup) => (
          <tr key={footerGroup.id}>
            {footerGroup.headers.map((header) => (
              <th key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder ? null : header.renderFooter()}
              </th>
            ))}
          </tr>
        ))}
      </tfoot> */}
      </table>
      {cellSelection && (
        <CellSelection
          cellSelection={cellSelection}
          columnStartPositions={columnStartPositions}
          rowHeight={24}
          headerHeight={29}
        />
      )}
    </div>
  );
}

export function useTableData(props: {
  table: string;
  schema: string;
  limit?: number;
  offset?: number;
}) {
  const { data: columns, isLoading } = trpc.useQuery([
    "information_schema.columns",
    { table_name: props.table, table_schema: props.schema },
  ]);
  const { data, isLoading: isLoadingTableData } = trpc.useQuery([
    "tableData",
    {
      table_name: props.table,
      table_schema: props.schema,
      limit: props.limit,
      offset: props.offset,
    },
  ]);

  return {
    columns,
    data,
  };
}

export default function TableRoute() {
  const search = useSearch<LocationGenerics>();
  const navigate = useNavigate();

  if (!search.table || !search.schema) {
    throw navigate({ to: "/app", replace: true });
  }
  const { columns, data } = useTableData({
    table: search.table,
    schema: search.schema,
    limit: search.limit,
    offset: search.offset,
  });

  if (!columns || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-auto grow">
      <Table columns={columns} data={data} />
    </div>
  );
}
