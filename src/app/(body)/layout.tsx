import { Header } from "@/components/header";

export default function BodyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="px-48 py-10">
        {children}
      </main>


    </>
  );
}
