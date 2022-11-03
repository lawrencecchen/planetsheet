import dynamic from "next/dynamic";

const DynamicComponentWithNoSSR = dynamic(() => import("@/routes/app"), {
  ssr: false,
});

export default function App() {
  return <DynamicComponentWithNoSSR />;
}
