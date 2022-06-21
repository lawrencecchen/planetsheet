import { CellSelectionType } from "@/components/Table/types";
import { MakeGenerics } from "@tanstack/react-location";
import { RowSelectionState } from "@tanstack/react-table";

export type LocationGenerics = MakeGenerics<{
  Search: {
    schema?: string;
    table?: string;
    limit?: number;
    offset?: number;
    rowSelection?: RowSelectionState;
    cellSelection?: CellSelectionType;
  };
}>;
