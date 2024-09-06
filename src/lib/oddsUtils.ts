export const convertDecimalToAmerican = (decimal: number): string => {
    if (decimal <= 1) {
        return "-100";
    }

    if (decimal >= 2) {
        const americanOdds = (decimal - 1) * 100;
        return `+${Math.round(americanOdds)}`;
    } else {
        const americanOdds = -100 / (decimal - 1);
        return `${Math.round(americanOdds)}`;
    }
};
