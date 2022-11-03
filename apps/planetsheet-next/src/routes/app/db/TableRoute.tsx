import { inferQueryResponse } from "@/backend/router";
import RightPanel from "@/components/RightPanel";
import { LocationGenerics, RowSelection } from "@/routes/locationGenerics";
import { trpc } from "@/utils/trpc";
import { ArrayElementType } from "@/utils/types";
import { TableDataInputValidator } from "@/validators/TableDataInput";
import DataEditor, {
  EditableGridCell,
  GridCell,
  GridCellKind,
  GridColumn,
  GridSelection,
  Item,
} from "@glideapps/glide-data-grid";
import { gray, yellow } from "@radix-ui/colors";
import { useNavigate, useSearch } from "@tanstack/react-location";
import { format, isDate } from "date-fns";
import produce from "immer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "styled-components";
import { z } from "zod";
import cuid from "cuid";

export function useTableMetadata() {
  const search = useSearch<LocationGenerics>();
  const metadata = useMemo(
    () =>
      TableDataInputValidator.parse({
        table_name: search.table,
        table_schema: search.schema,
        limit: search.limit,
        offset: search.offset,
        orderBy: search.orderBy,
      }),
    [search]
  );

  return metadata;
}
type TableMetadata = z.infer<typeof TableDataInputValidator>;

export function useTableData(props: {
  table_name: string;
  table_schema: string;
  limit?: number;
  offset?: number;
}) {
  const { data: columns, isLoading } = trpc.useQuery([
    "information_schema.columns",
    { table_name: props.table_name, table_schema: props.table_schema },
  ]);

  const metadata = useTableMetadata();

  const { data, isLoading: isLoadingTableData } = trpc.useQuery([
    "tableData",
    metadata,
  ]);

  return {
    columns,
    data,
  };
}

function initColumns(
  columns: inferQueryResponse<"information_schema.columns">
): GridColumn[] {
  return columns.map((column) => {
    return {
      title: column.column_name,
      id: column.column_name,
    };
  });
}

const editableKinds = new Set([GridCellKind.Text, GridCellKind.Boolean]);

const defaultValues = {
  text: "",
  boolean: false,
  jsonb: "{}",
  integer: "",
  "timestamp without time zone": new Date().toString(),
} as Record<string, any>;
function getDefaultValue(
  column: ArrayElementType<inferQueryResponse<"information_schema.columns">>
) {
  const columnDataType = column.data_type;
  if (column.column_name === "id") {
    return cuid();
  }
  if (column.column_default) {
    console.log("has default", column);
    return column.column_default;
  }
  if (columnDataType in defaultValues) {
    return defaultValues[columnDataType];
  }
  // if (column.is_nullable) {
  //   return "";
  // }
  console.log("unknown columnDataType", columnDataType);
  return "";
}

function GlideTable(props: {
  columns: inferQueryResponse<"information_schema.columns">;
  data: inferQueryResponse<"tableData">;
  metadata: TableMetadata;
}) {
  const [columns, setColumns] = useState<GridColumn[]>(
    initColumns(props.columns)
  );
  useEffect(() => {
    setColumns(initColumns(props.columns));
  }, [props.columns]);
  const indexes = useMemo(() => columns.map((c) => c.id), [columns]);
  const navigate = useNavigate();
  const utils = trpc.useContext();
  const editCellMutation = trpc.useMutation("editCell");
  const addRowsMutation = trpc.useMutation("addRows", {
    onSuccess: () => {
      return utils.invalidateQueries(["tableData", props.metadata]);
    },
  });
  // const {data: newRows} = trpc.useQuery([''])
  const [newRows, setNewRows] = useState<any[]>([]);

  async function saveChanges() {
    try {
      await addRowsMutation.mutateAsync({
        table_name: props.metadata.table_name,
        table_schema: props.metadata.table_schema,
        rows: newRows,
      });
      setNewRows([]);
    } catch (e) {
      console.log(e);
    }
  }

  function discardChanges() {
    setNewRows([]);
  }

  const onCellEdited = useCallback(
    (cell: Item, newValue: EditableGridCell) => {
      if (!editableKinds.has(newValue.kind)) {
        console.log("unhandled value kind", newValue);
        return;
      }

      const [col, row] = cell;
      const columnName = props.columns[col].column_name;
      const key = indexes[col];
      const isNewRow = row >= props.data.length;
      if (isNewRow) {
        const iNewRow = row - props.data.length;
        setNewRows(
          produce((draft) => {
            draft[iNewRow][columnName] = newValue.data;
          })
        );
        return;
      }
      const dataRow = props.data[row];
      if (!key || (dataRow && !(key in dataRow))) {
        throw new Error("invalid cell");
      }
      if (!("id" in dataRow)) {
        throw new Error("row does not have id");
      }
      editCellMutation.mutate({
        table_name: props.metadata.table_name,
        table_schema: props.metadata.table_schema,
        column: columnName,
        identifier_column: "id",
        identifier_value: dataRow.id,
        value: newValue.data,
      });
      utils.setQueryData(["tableData", props.metadata], (oldData: any) => {
        if (!oldData) {
          console.log("no oldData");
          return;
        }
        const newData = oldData.map((row: any) => {
          if (row.id === dataRow.id) {
            return {
              ...row,
              [key]: newValue.data,
            };
          }
          return row;
        });
        return newData;
      });
    },
    [indexes, props.data, newRows]
  );

  const getContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell;
      const isNewRow = row >= props.data.length;
      const data = isNewRow ? newRows : props.data;
      const iRow = isNewRow ? row - props.data.length : row;
      const dataRow = data[iRow];
      const key = indexes[col];
      const column = props.columns[col];
      if (!key) {
        throw new Error("key not found");
      }
      const d = dataRow?.[key];

      const themeOverride = isNewRow
        ? {
            bgCell: yellow.yellow4,
          }
        : {};

      switch (column?.data_type) {
        case "text": {
          return {
            kind: GridCellKind.Text,
            displayData: String(d ?? ""),
            allowOverlay: true,
            readonly: false,
            data: d,
            themeOverride,
          };
        }
        case "boolean": {
          return {
            kind: GridCellKind.Boolean,
            allowOverlay: false,
            readonly: false,
            data: Boolean(d),
            themeOverride,
          };
        }
        case "jsonb": {
          return {
            kind: GridCellKind.Text,
            displayData: JSON.stringify(d),
            allowOverlay: true,
            readonly: false,
            data: JSON.stringify(d),
            themeOverride,
          };
        }
        case "timestamp without time zone": {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            displayData:
              (isNewRow && column.column_default) ||
              (isDate(d) ? format(d, "yyyy-MM-dd HH:mm:ss") : ""),
            data: d,
            themeOverride,
          };
        }
        default: {
          return {
            kind: GridCellKind.Text,
            displayData: String(d),
            allowOverlay: true,
            readonly: false,
            data: d,
            themeOverride,
          };
        }
      }
    },
    [indexes, props.data, props.columns, newRows]
  );

  const handleColumnMoved = useCallback(
    (startIndex: number, endIndex: number) => {
      console.log(startIndex, endIndex);
    },
    []
  );

  const [gridSelection, setGridSelection] = useState<
    GridSelection | undefined
  >();
  useEffect(() => {
    const items = (gridSelection?.rows as any)?.items as RowSelection;
    if (gridSelection?.current?.cell) {
      const [col, row] = gridSelection.current.cell;
      navigate({
        search: (old) => ({
          ...old,
          cellSelection: {
            column: col,
            row: row,
          },
          rowSelection: undefined,
        }),
      });
    } else if (items?.length > 0) {
      navigate({
        search: (old) => ({
          ...old,
          cellSelection: undefined,
          rowSelection: items,
        }),
      });
    } else {
      navigate({
        search: (old) => ({
          ...old,
          cellSelection: undefined,
          rowSelection: undefined,
        }),
      });
    }
  }, [gridSelection]);

  function onRowAppended() {
    const newRow = {} as Record<string, any>;
    for (const column of props.columns) {
      newRow[column.column_name] = getDefaultValue(column);
    }
    setNewRows((r) => [...r, newRow]);

    // utils.setQueryData(["tableData", props.metadata], (oldData: any) => {
    //   if (!oldData) {
    //     console.log("no oldData");
    //     return [];
    //   }
    //   const newRow = {
    //     ____new_planetsheet_row: true,
    //   } as Record<string, any>;
    //   for (const column of props.columns) {
    //     newRow[column.column_name] = getDefaultValue(column.data_type);
    //   }
    //   console.log(newRow);
    //   return [...oldData, newRow];
    // });
  }

  const onDelete = (selection: GridSelection): boolean | GridSelection => {
    // const rows = [...selection.rows]
    console.log(selection.rows);
    return true;
  };

  return (
    <>
      <ThemeProvider
        theme={{
          accentColor: gray.gray11,
          accentFg: gray.gray1,
          accentLight: gray.gray3,
          baseFontStyle: "12px",
          headerFontStyle: "bold 12px",
        }}
      >
        <DataEditor
          columns={columns}
          getCellContent={getContent}
          rows={props.data.length + newRows.length}
          smoothScrollX={true}
          smoothScrollY={true}
          height="100%"
          width="100%"
          overscrollX={100}
          rowHeight={24}
          headerHeight={28}
          rowMarkers="both"
          onColumnResize={(column, newSize) => {
            setColumns((columns) =>
              columns.map((c) => {
                if (c.id === column.id) {
                  return {
                    ...c,
                    width: newSize,
                  };
                }
                return c;
              })
            );
          }}
          // onColumnMoved={handleColumnMoved}
          onRowAppended={onRowAppended}
          trailingRowOptions={{
            sticky: false,
            tint: false,
            hint: "New row",
          }}
          onCellEdited={onCellEdited}
          onDelete={onDelete}
          rightElement={<RightPanel />}
          rightElementSticky={true}
          gridSelection={gridSelection}
          onGridSelectionChange={(selection) => setGridSelection(selection)}
        />
      </ThemeProvider>
      {newRows.length > 0 && (
        <div className="bg-yellow-4 absolute bottom-0 inset-x-0 py-1 text-xs px-4 justify-between flex items-center w-full">
          <div className="flex items-center">
            <button
              className="bg-white rounded-md border px-2 py-0.5 select-none cursor-default active:bg-neutral-100"
              onClick={discardChanges}
            >
              Discard changes
            </button>
            <div className="ml-2">
              {newRows.length} new {newRows.length > 1 ? "rows" : "row"}
            </div>
          </div>
          <div>
            <button
              className="bg-white rounded-md border px-2 py-0.5 select-none cursor-default active:bg-neutral-100"
              onClick={saveChanges}
            >
              Save changes
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function TableRoute() {
  const search = useSearch<LocationGenerics>();
  const navigate = useNavigate();

  if (!search.table || !search.schema) {
    throw navigate({ to: "/app", replace: true });
  }
  const metadata = useTableMetadata();
  const { columns, data } = useTableData(metadata);

  if (!columns || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grow relative">
      <GlideTable columns={columns} data={data} metadata={metadata} />
      {/* <Table columns={columns} data={data} /> */}
    </div>
  );
}
