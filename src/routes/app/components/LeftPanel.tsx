import * as Accordion from "@radix-ui/react-accordion";
import { Link, useSearch } from "@tanstack/react-location";
import clsx from "clsx";
import { inferQueryResponse } from "@/backend/router";
import { LocationGenerics } from "@/routes/locationGenerics";

export default function LeftPanel(props: {
  schemas: inferQueryResponse<"information_schema.tables">;
}) {
  const search = useSearch<LocationGenerics>();
  const sortedSchemas = Object.entries(props.schemas).sort((a, _b) =>
    a[0] === "public" ? -1 : 1
  );

  return (
    <div
      className="border-r h-full overflow-hidden flex flex-col"
      style={{ minWidth: 240, width: 240 }}
    >
      <div className="py-2 h-full flex flex-col">
        <Accordion.Root
          type="multiple"
          defaultValue={["tables"]}
          className="grow flex flex-col overflow-auto"
        >
          <Accordion.Item value="tables" className="grow flex flex-col">
            <Accordion.Header className="sticky top-0 bg-white z-20">
              <Accordion.Trigger className="px-1 py-0.5 w-full text-left cursor-default flex items-center group">
                <div className="i-material-symbols-chevron-right-rounded group-radix-state-open:rotate-90 text-base"></div>
                <div className="ml-2 text-xs font-bold">Tables</div>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="">
              <ul className="">
                <Accordion.Root
                  type="multiple"
                  defaultValue={[search.schema ?? sortedSchemas[0]?.[0]]}
                >
                  {sortedSchemas.map(([schema, tables]) => (
                    <Accordion.Item value={schema} asChild key={schema}>
                      <li>
                        <Accordion.Header className="sticky top-5 bg-white z-10">
                          <Accordion.Trigger className="text-sm px-3 py-0.5 w-full text-left cursor-default flex items-center group">
                            <div
                              className={clsx(
                                "i-material-symbols-folder group-radix-state-closed:block group-radix-state-open:hidden text-neutral-700"
                              )}
                            />
                            <div
                              className={clsx(
                                "i-material-symbols-folder-open group-radix-state-closed:hidden group-radix-state-open:block text-neutral-700"
                              )}
                            />
                            <div className="ml-1">{schema}</div>
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content>
                          <ul>
                            {tables.map((table) => (
                              <li
                                key={`${table.table_schema}.${table.table_name}`}
                              >
                                <Link
                                  search={{
                                    schema: table.table_schema,
                                    table: table.table_name,
                                  }}
                                  draggable={false}
                                  className={clsx(
                                    "flex items-center w-full px-3 cursor-default py-0.5 group pl-7",
                                    {
                                      "text-neutral-900 active:bg-blue-600 active:text-neutral-50":
                                        search.table !== table.table_name,
                                      "bg-neutral-200/80 focus:bg-blue-600 focus:text-neutral-50":
                                        search.table === table.table_name,
                                    }
                                  )}
                                >
                                  <div
                                    className={clsx(
                                      "i-material-symbols-table text-lg text-neutral-600 group-active:text-neutral-50 min-w-[18px]",
                                      {
                                        "group-focus:text-neutral-50":
                                          search.table === table.table_name,
                                      }
                                    )}
                                  />
                                  <div className="text-[13px] ml-1 text-ellipsis overflow-hidden">
                                    {table.table_name}
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </Accordion.Content>
                      </li>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    </div>
  );
}
