import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className="h-[100dvh] w-[100dvw] overflow-hidden bg-white text-black">
      <Component {...pageProps} />
    </main>
  );
};

export default api.withTRPC(MyApp);
