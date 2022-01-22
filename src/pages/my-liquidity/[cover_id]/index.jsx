import Head from "next/head";
import { MyLiquidityCoverPage } from "@/components/pages/my-liquidity/details";

export default function MyLiquidityCover() {
  return (
    <main>
      <Head>
        <title>Neptune Mutual</title>
        <meta name="description" content="Generated by create next app" />
      </Head>

      <MyLiquidityCoverPage />
    </main>
  );
}
