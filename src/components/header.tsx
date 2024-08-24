import Image from "next/image";
import MainNav from "./main-nav";
export const Header = () => {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 justify-between">
        <Image src={"/next.svg"} alt="Logo" width={50} height={50} />
        <div>
          <MainNav />

        </div>
        <div className="w-[50px]"></div>
      </div>

    </div>

  );
};
