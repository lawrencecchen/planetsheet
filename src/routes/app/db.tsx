import { CellSelectionType } from "@/components/Table/types";
import { trpc } from "@/utils/trpc";
import { Outlet, useNavigate, useSearch } from "@tanstack/react-location";
import { RowSelectionState } from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo } from "react";
import { LocationGenerics } from "../locationGenerics";
import LeftPanel from "./components/LeftPanel";
import { useTableData } from "./db/TableRoute";

type ArrayElementType<T> = T extends (infer E)[] ? E : T;

function DynamicInputField(props: {
  column: ArrayElementType<ReturnType<typeof useTableData>["columns"]>;
  value: any;
}) {
  const placeholder = props.column?.is_nullable ? "NULL" : "";

  switch (props.column?.data_type) {
    case "text": {
      return (
        <input
          type="text"
          className="w-full border text-xs rounded-sm p-1"
          defaultValue={props.value}
          key={props.value}
          placeholder={placeholder}
        />
      );
    }
    case "integer": {
      return (
        <input
          type="number"
          className="w-full border text-xs rounded-sm p-1"
          defaultValue={props.value}
          key={props.value}
          placeholder={placeholder}
        />
      );
    }
    case "boolean": {
      return (
        <select className="w-full border text-xs rounded-sm p-1 bg-white">
          <option>TRUE</option>
          <option>FALSE</option>
          {/* <hr /> */}
          <option>NULL</option>
          <option>DEFAULT</option>
        </select>
      );
    }
    case "timestamp without time zone": {
      return (
        <input
          type="datetime-local"
          className="w-full border text-xs rounded-sm p-1 bg-white"
          defaultValue={format(new Date(props.value), "yyyy-MM-dd'T'hh:mm:ss")}
          key={props.value}
          placeholder={placeholder}
        />
      );
    }
    case "jsonb": {
      return (
        <textarea
          className="w-full border text-xs rounded-sm p-1"
          rows={10}
          defaultValue={JSON.stringify(props.value, null, 2)}
          key={props.value}
          placeholder={placeholder}
        ></textarea>
      );
    }
    default: {
      const value =
        typeof props.value === "string"
          ? props.value
          : JSON.stringify(props.value);
      return (
        <input
          type="text"
          className="w-full border text-xs rounded-sm p-1"
          defaultValue={value}
          key={props.value}
          placeholder={placeholder}
        />
      );
    }
  }
}

function useSelectedRow(props: {
  rowSelection: RowSelectionState | undefined;
  cellSelection: CellSelectionType | undefined;
  data: any[] | undefined;
}) {
  const selectedRow = useMemo(() => {
    // console.log("memoed");
    const { data, rowSelection, cellSelection } = props;
    if (!data) {
      return null;
    }
    if (cellSelection) {
      return data[cellSelection.row];
    }
    if (rowSelection) {
      const selectedRows = Object.keys(rowSelection).map(Number);
      if (selectedRows.length === 1) {
        return data[selectedRows[0]];
      } else {
        return null;
      }
    }
    return null;
  }, [props]);
  return selectedRow;
}

function RightPanel() {
  const search = useSearch<LocationGenerics>();
  const navigate = useNavigate();
  if (!search.table || !search.schema) {
    throw navigate({ to: "/app", replace: true });
  }
  const { columns, data } = useTableData({
    table: search.table,
    schema: search.schema,
  });

  if (!columns || !data) {
    return <div>Loading...</div>;
  }

  const selectedRow = useSelectedRow({
    rowSelection: search.rowSelection,
    cellSelection: search.cellSelection,
    data,
  });

  return (
    <div
      className="border-l h-screen p-2 bg-neutral-100/80 overflow-y-auto overflow-x-hidden"
      style={{ minWidth: 300, width: 300 }}
      key={selectedRow}
    >
      {selectedRow ? (
        <ul className="space-y-2">
          {columns.map((column) => (
            <li key={column.column_name}>
              <div className="flex justify-between text-xs text-neutral-600">
                <div>{column.column_name}</div>
                <div>{column.data_type}</div>
              </div>
              <div className="text-sm mt-0.5">
                <DynamicInputField
                  column={column}
                  value={selectedRow[column.column_name]}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-4 text-sm text-neutral-700 text-center">
          Nothing selected
        </div>
      )}
    </div>
  );
}

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
      <RightPanel />
    </div>
  );
}
