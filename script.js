const fs = require("fs");
const https = require("https");
const path = require("path");

const urls = [
    "https://sportslogohistory.com/wp-content/uploads/2017/12/cleveland_browns_2015-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/dallas_cowboys_1964-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/denver_broncos_1997-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/detroit_lions-2017-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/green_bay_packers_1980-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/houston_texans_2006-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/indianapolis_colts_2002-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/jacksonville_jaguars_2013-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2018/04/kansas_city_chiefs_1972-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2020/02/las_vegas_raiders_2020-present-1.png",
    "https://sportslogohistory.com/wp-content/uploads/2020/03/los_angeles-chargers_2020-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2020/03/los_angeles_rams_2020-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2018/04/miami_dolphins_2018-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2020/09/minnesota_vikings_2013-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2018/02/new_england_patriots_2000-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2018/04/new_orleans_saints_2017-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/new_york_giants_2000-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2019/04/new_york_jets_2019-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/philadelphia_eagles_1996-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/05/pittsburgh_steelers_2002-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/san_francisco_49ers_2009-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/seattle_seahawks_2012-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2020/04/tampa_bay_buccaneers_2020-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2017/12/tennessee_titans_1999-pres.png",
    "https://sportslogohistory.com/wp-content/uploads/2022/02/washington_commanders_2022-pres.png",
];

for (const url of urls) {
    const team_name = url
        .split("/")
        .pop()
        .split("_")
        .slice(0, -1)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    console.log(team_name);
    https
        .get(url, (response) => {
            const filePath = path.join(__dirname, `public/${team_name}.png`);
            const fileStream = fs.createWriteStream(filePath);

            response.pipe(fileStream);

            fileStream.on("finish", () => {
                fileStream.close();
                console.log(
                    `Downloaded and saved ${team_name} logo to ${filePath}`
                );
            });
        })
        .on("error", (err) => {
            console.error(
                `Error downloading ${team_name} logo: ${err.message}`
            );
        });
}
