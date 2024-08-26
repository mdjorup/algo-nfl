import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

const MainNav = () => {
  return (


    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
            >
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/scores" legacyBehavior passHref>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
            >
              Scores
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/standings" legacyBehavior passHref>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
            >
              Standings
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/playoff-picture" legacyBehavior passHref>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
            >
              Playoff Picture
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/rankings" legacyBehavior passHref>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
            >
              Power Rankings
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/algorithm" legacyBehavior passHref>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
            >
              Algorithm
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNav;
