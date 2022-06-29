import { CellSelectionType } from "@/components/Table/types";
import { OrderByValidator } from "@/validators/TableDataInput";
import { GridSelection } from "@glideapps/glide-data-grid";
import { MakeGenerics } from "@tanstack/react-location";
import { z } from "zod";

export type RowSelection = [number, number][] | [];

export type LocationGenerics = MakeGenerics<{
  Search: {
    schema?: string;
    table?: string;
    limit?: number;
    offset?: number;
    orderBy?: z.infer<typeof OrderByValidator>;
    rowSelection?: RowSelection;
    cellSelection?: CellSelectionType;
    gridSelection?: GridSelection;
  };
}>;
