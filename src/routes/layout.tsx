import { Head, Layout } from "rakkasjs";
import "@unocss/reset/tailwind.css";
import "uno.css";

const MainLayout: Layout = ({ children }) => (
  <>
    {/* Rakkas relies on react-helmet-async for managing the document head */}
    {/* See their documentation: https://github.com/staylor/react-helmet-async#readme */}
    <Head title="Planetsheet" />

    {children}
  </>
);

export default MainLayout;
