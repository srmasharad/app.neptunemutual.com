import { BreadCrumbs } from "@/components/UI/atoms/breadcrumbs";
import { Container } from "@/components/UI/atoms/container";
import { Hero } from "@/components/UI/molecules/Hero";
import { HeroTitle } from "@/components/UI/molecules/HeroTitle";
import Head from "next/head";

export default function MyLiquidityTxs() {
  return (
    <main>
      <Head>
        <title>Neptune Mutual</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Hero>
        <Container className="px-2 py-20">
          <BreadCrumbs
            pages={[
              { name: "My Liquidity", href: "/my-liquidity", current: false },
              { name: "Transaction List", href: "#", current: true },
            ]}
          />
          <HeroTitle>Transaction List</HeroTitle>
        </Container>
        <hr className="border-b border-B0C4DB" />
      </Hero>
    </main>
  );
}
