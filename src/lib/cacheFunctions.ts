//

import { unstable_cache } from "next/cache";
import { getCurrentWeekEventsWithOdds } from "./dbFns";

export const getCurrentWeekEventsWithOdds_cached = unstable_cache(
    getCurrentWeekEventsWithOdds,
    [],
    {
        revalidate: 60 * 5,
    }
);
