import { trpc } from "@/utils/trpc";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery([
    "information_schema.tables",
    { schema: "public" },
  ]);

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }
  console.log(data);

  return (
    <div>
      <h1 className="">Schemas</h1>
      <ul>
        {data.map((schema) => (
          <li key={`${schema.table_name}.${schema.table_schema}`}>
            {schema.table_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
