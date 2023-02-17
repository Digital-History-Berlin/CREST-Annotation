import json
import random


class ColorTable:
    def __init__(self, colors):
        self.colors = colors
        self.len = len(colors)

    def get(self, index=None):
        if index is None:
            # get random color
            index = random.randint(0, self.len - 1)

        return self.colors[index % self.len]

    def jsonify(self):
        return json.dumps(self.colors)


class Colors:
    """
    Color table helper
    """

    def __init__(self):
        self.default = ColorTable(
            [
                "#ff8700",
                "#0aff99",
                "#580aff",
                "#ffd300",
                "#147df5",
                "#a1ff0a",
                "#0aefff",
                "#deff0a",
                "#be0aff",
            ]
        )

    def parse(self, table):
        if table is None:
            return self.default
        return ColorTable(json.loads(table))

    def stringify(self, table):
        if table is None:
            return self.default.jsonify()
        return table.jsonify()
