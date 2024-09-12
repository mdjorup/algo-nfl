import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    safelist: [
        {
            pattern: /^from-/, // This will include all classes starting with 'bg-'
        },
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)", ...fontFamily.sans],
            },
            colors: {
                "arizona-cardinals": "#97233F",
                "atlanta-falcons": "#A71930",
                "baltimore-ravens": "#241773",
                "buffalo-bills": "#00338D",
                "carolina-panthers": "#0085CA",
                "chicago-bears": "#0B162A",
                "cincinnati-bengals": "#FB4F14",
                "cleveland-browns": "#311D00",
                "dallas-cowboys": "#041E42",
                "denver-broncos": "#002244",
                "detroit-lions": "#0076B6",
                "green-bay-packers": "#203731",
                "houston-texans": "#03202F",
                "indianapolis-colts": "#002C5F",
                "jacksonville-jaguars": "#006778",
                "kansas-city-chiefs": "#E31837",
                "las-vegas-raiders": "#000000",
                "los-angeles-chargers": "#0080C6",
                "los-angeles-rams": "#003594",
                "miami-dolphins": "#008E97",
                "minnesota-vikings": "#4F2683",
                "new-england-patriots": "#002244",
                "new-orleans-saints": "#D3BC8D",
                "new-york-giants": "#0B2265",
                "new-york-jets": "#125740",
                "philadelphia-eagles": "#004C54",
                "pittsburgh-steelers": "#FFB612",
                "san-francisco-49ers": "#AA0000",
                "seattle-seahawks": "#002244",
                "tampa-bay-buccaneers": "#D50A0A",
                "tennessee-titans": "#0C2340",
                "washington-commanders": "#773141",
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
