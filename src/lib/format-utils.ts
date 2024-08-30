export const formatAsPercent = (value: number, toFixed: number = 2): string => {
    return (100 * value).toFixed(toFixed) + "%";
};
