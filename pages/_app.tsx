import { AppRouter } from "@/backend/router";
import { getBaseUrl } from "@/utils/trpc";
import { withTRPC } from "@trpc/next";
import type { AppProps } from "next/app";
import "../styles/globals.css";
// import "../styles/test.css";
import "../styles/uno.css";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

// export default MyApp;

// export default MyApp
export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
