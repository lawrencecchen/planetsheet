import { trpc } from "@/utils/trpc";
import type { NextPage } from "next";

const Table: NextPage = () => {
  const { data, isLoading } = trpc.useQuery([
    "information_schema.tables",
    { schema: "public" },
  ]);

  console.log(data);

  return (
    <div>
      <div className="">table</div>
    </div>
  );
};

export default Table;
