import math


class RunningAverage:
    def __init__(self):
        self.count = 0
        self.total = 0
        self.total_square = 0
        self.average = 0
        self.variance = 0

    def add(self, value):
        self.count += 1
        self.total += value
        self.total_square += value**2
        self.average = self.total / self.count

        # Variance formula: E(x^2) - (E(x))^2
        if self.count > 1:
            self.variance = (self.total_square / self.count) - (self.average**2)

    def get_average(self):
        return self.average

    def get_variance(self):
        return self.variance

    def get_standard_deviation(self):
        return math.sqrt(self.variance)
