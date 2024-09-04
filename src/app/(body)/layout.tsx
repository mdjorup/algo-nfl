import { Header } from "@/components/header";

const BodyLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Header />
      <main className="px-2 py-6 md:px-16 lg:px-32 xl:px-48">
        {children}
      </main>


    </>
  );
}

export default BodyLayout
