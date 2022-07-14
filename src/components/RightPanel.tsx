import { CellSelectionType } from "@/components/Table/types";
import { useTableData } from "@/routes/app/db/TableRoute";
import { LocationGenerics } from "@/routes/locationGenerics";
import { trpc } from "@/utils/trpc";
import { ArrayElementType } from "@/utils/types";
import { TableDataInputValidator } from "@/validators/TableDataInput";
import { useNavigate, useSearch } from "@tanstack/react-location";
import { format } from "date-fns";
import { debounce, type DebouncedFunc } from "lodash-es";
import { useEffect, useMemo, useRef, useState } from "react";

function DynamicInputField(props: {
  column: ArrayElementType<ReturnType<typeof useTableData>["columns"]>;
  value: any;
  onChange?: (newValue: any) => void;
  id?: string;
}) {
  const placeholder = props.column?.is_nullable ? "NULL" : "";

  switch (props.column?.data_type) {
    case "text": {
      return (
        <input
          id={props.id}
          type="text"
          className="w-full border text-xs rounded-sm p-1"
          value={props.value}
          placeholder={placeholder}
          onChange={(e) => props.onChange?.(e.target.value)}
        />
      );
    }
    case "integer": {
      return (
        <input
          id={props.id}
          type="number"
          className="w-full border text-xs rounded-sm p-1"
          value={props.value}
          placeholder={placeholder}
          onChange={(e) => props.onChange?.(e.target.valueAsNumber)}
        />
      );
    }
    case "boolean": {
      return (
        <select
          id={props.id}
          className="w-full border text-xs rounded-sm p-1 bg-white"
          value={props.value}
          onChange={(e) => props.onChange?.(e.target.value)}
        >
          <option value="true">TRUE</option>
          <option value="false">FALSE</option>
          {/* <hr /> */}
          <option value="null">NULL</option>
          <option value="default">DEFAULT</option>
        </select>
      );
    }
    case "timestamp without time zone": {
      return (
        <input
          id={props.id}
          type="datetime-local"
          className="w-full border text-xs rounded-sm p-1 bg-white"
          value={format(new Date(props.value), "yyyy-MM-dd'T'hh:mm:ss")}
          placeholder={placeholder}
          onChange={(e) => props.onChange?.(e.target.valueAsDate)}
        />
      );
    }
    case "jsonb": {
      return (
        <textarea
          id={props.id}
          className="w-full border text-xs rounded-sm p-1"
          rows={10}
          value={JSON.stringify(props.value, null, 2)}
          placeholder={placeholder}
          onChange={(e) => props.onChange?.(e.target.value)}
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
          id={props.id}
          type="text"
          className="w-full border text-xs rounded-sm p-1"
          value={value}
          placeholder={placeholder}
          onChange={(e) => props.onChange?.(e.target.value)}
        />
      );
    }
  }
}

function useSelectedRow(props: {
  rowSelection: [number, number][] | undefined;
  cellSelection: CellSelectionType | undefined;
  data: any[] | undefined;
}) {
  const selectedRow = useMemo(() => {
    const { data, rowSelection, cellSelection } = props;
    if (!data) {
      return null;
    }
    if (cellSelection) {
      return data[cellSelection.row];
    }
    if (rowSelection) {
      const selectedRows = [] as number[];
      for (const [row, col] of rowSelection) {
        for (let i = row; i < col; i++) {
          selectedRows.push(i);
        }
      }
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

// export function useMutateCell() {
//   const mutation = trpc.useMutation(["editCell"]);
//   const utils = trpc.useContext();

//   type MutateArgs = Parameters<typeof mutation.mutate>

//   function mutate(data: MutateArgs[0]) {
//     mutation.mutate(data);
//     utils.setQueryData(
//       [
//         "tableData",
//         {
//           table_name: props.metadata.table,
//           table_schema: props.metadata.schema,
//           limit: props.metadata.limit,
//           offset: props.metadata.offset,
//         },
//       ],
//       (oldData: any) => {
//         if (!oldData) {
//           console.log("no oldData");
//           return;
//         }
//         const newData = oldData.map((row: any) => {
//           if (row.id === dataRow.id) {
//             return {
//               ...row,
//               [key]: newValue.data,
//             };
//           }
//           return row;
//         });
//         return newData;
//       }
//     );
//   }

// }

function ColumnInputItem(props: {
  column: Exclude<
    ArrayElementType<ReturnType<typeof useTableData>["columns"]>,
    undefined
  >;
  selectedRow: any;
  onDebouncedChange?: (newValue: any) => void;
  onChange?: (newValue: any) => void;
}) {
  const initialValue = props.selectedRow[props.column.column_name];
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const debouncedRef = useRef<DebouncedFunc<() => void | undefined>>();

  function onChange(newValue: any) {
    setValue(newValue);
    props.onChange?.(newValue);
    debouncedRef.current?.cancel?.();
    const debounced = debounce(() => {
      props.onDebouncedChange?.(newValue);
    }, 300);
    debounced();
    debouncedRef.current = debounced;
  }

  return (
    <li>
      <div className="flex justify-between text-xs text-neutral-600 cursor-default">
        <label htmlFor={`${props.column.column_name}-input`}>
          {props.column.column_name}
        </label>
        <div>{props.column.data_type}</div>
      </div>
      <div className="text-sm mt-0.5">
        <DynamicInputField
          id={`${props.column.column_name}-input`}
          column={props.column}
          value={value ?? ""}
          onChange={onChange}
        />
      </div>
    </li>
  );
}

export default function RightPanel() {
  const search = useSearch<LocationGenerics>();
  const navigate = useNavigate();
  if (!search.table || !search.schema) {
    throw navigate({ to: "/app", replace: true });
  }
  const mutation = trpc.useMutation(["editCell"]);
  const utils = trpc.useContext();
  const { columns, data } = useTableData({
    table_name: search.table,
    table_schema: search.schema,
  });

  const selectedRow = useSelectedRow({
    rowSelection: search.rowSelection,
    cellSelection: search.cellSelection,
    data,
  });

  if (!columns || !data) {
    return <div>Loading...</div>;
  }

  if (!selectedRow || selectedRow.____new_planetsheet_row) {
    return null;
  }
  const tableDataKey = TableDataInputValidator.parse({
    table_name: search.table,
    table_schema: search.schema,
    limit: search.limit,
    offset: search.offset,
  });

  function onDebouncedChange(props: { newValue: any; column: string }) {
    mutation.mutate({
      table_name: tableDataKey.table_name,
      table_schema: tableDataKey.table_schema,
      column: props.column,
      identifier_column: "id",
      identifier_value: selectedRow.id,
      value: props.newValue,
    });
    console.log(["tableData", tableDataKey]);
  }

  function onChange(props: { newValue: any; column: string }) {
    utils.setQueryData(["tableData", tableDataKey], (oldData: any) => {
      if (!oldData) {
        console.log("no oldData");
        return;
      }
      const newData = oldData.map((row: any) => {
        if (row.id === selectedRow.id) {
          return {
            ...row,
            [props.column]: props.newValue,
          };
        }
        return row;
      });
      return newData;
    });
  }

  return (
    <div
      className="border-l h-screen p-2 bg-neutral-100 overflow-y-auto overflow-x-hidden"
      style={{ minWidth: 300, width: 300 }}
      key={selectedRow}
    >
      {selectedRow ? (
        <ul className="space-y-2">
          {columns.map((column) => (
            <ColumnInputItem
              key={column.column_name}
              column={column}
              selectedRow={selectedRow}
              onDebouncedChange={(newValue) =>
                onDebouncedChange({
                  column: column.column_name,
                  newValue,
                })
              }
              onChange={(newValue) =>
                onChange({
                  column: column.column_name,
                  newValue,
                })
              }
            />
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
