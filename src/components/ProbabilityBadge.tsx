import { formatAsPercent } from '@/lib/format-utils';
import { Badge } from './ui/badge';

const getBackgroundColor = (probability: number) => {
  // Red: hsl(0, 84.2%, 60.2%)
  // Light Grey: hsl(0, 0%, 75%)
  // Green: hsl(142.1, 76.2%, 36.3%)

  const redHue = 0;
  const redSaturation = 84.2;
  const redLightness = 60.2;

  const greyHue = 0;
  const greySaturation = 0;
  const greyLightness = 75;

  const greenHue = 142.1;
  const greenSaturation = 76.2;
  const greenLightness = 36.3;

  // Sigmoid function for non-linear interpolation
  const sigmoid = (x: number): number => {
    return 1 / (1 + Math.exp(-12 * (x - 0.5)));
  };

  // Apply sigmoid function to probability
  const t = sigmoid(probability);

  let hue, saturation, lightness;

  if (probability <= 0.5) {
    // Interpolate between red and light grey
    hue = redHue;
    saturation = redSaturation + (greySaturation - redSaturation) * t * 2;
    lightness = redLightness + (greyLightness - redLightness) * t * 2;
  } else {
    // Interpolate between light grey and green
    hue = greyHue + (greenHue - greyHue) * (t - 0.5) * 2;
    saturation = greySaturation + (greenSaturation - greySaturation) * (t - 0.5) * 2;
    lightness = greyLightness + (greenLightness - greyLightness) * (t - 0.5) * 2;
  }

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const ProbabilityBadge = ({ probability }: { probability: number }) => (
  <Badge
    style={{
      backgroundColor: getBackgroundColor(probability),
      color: 'white',
    }}
    className="ml-4"
  >
    {formatAsPercent(probability)}
  </Badge>
);


export default ProbabilityBadge