class RunningAverage:
    def __init__(self):
        self.count = 0
        self.total = 0
        self.average = 0

    def add(self, value):
        self.count += 1
        self.total += value
        self.average = self.total / self.count

    def get_average(self):
        return self.average
