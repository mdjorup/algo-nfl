//

import { unstable_cache } from "next/cache";
import { getCurrentWeekEventsWithOdds, getEvent, getEventOdds } from "./dbFns";

export const getCurrentWeekEventsWithOdds_cached = unstable_cache(
    getCurrentWeekEventsWithOdds,
    [],
    {
        revalidate: 60 * 5,
    }
);

export const getEvent_cached = unstable_cache(getEvent, [], {
    revalidate: 60 * 2,
});

export const getEventOdds_cached = unstable_cache(getEventOdds, [], {
    revalidate: 60 * 5,
});
