#!/usr/bin/env python3
from dataknead import Knead
import sys

class Parser:
    def __init__(self, data):
        self.data = data
        self.defs = {}
        self.out = []

    def run(self):
        for line in self.data:
            row = []
            curdef = False

            for cell in line:
                cell = cell.strip()

                # If we have a backslash as the very first character, it's
                # a command. Do something with it
                if len(cell) == 0 or cell[0] != "\\":
                    if curdef:
                        self.defs[curdef].append(cell)
                    else:
                        row.append(cell)

                    continue

                # The command is delimited by a space
                if " " in cell:
                    parts = cell.split(" ", 1)
                    cmd = parts[0][1:] # Cut off the \
                    val = parts[1]
                else:
                    cmd = cell[1:]
                    val = None

                if cmd == "rem":
                    # Remark, do nothing
                    continue
                elif cmd == "quote":
                    val = f'"{val}"'
                elif cmd == "year":
                    val = f"+{val}-00-00T00:00:00Z/9"
                elif cmd == "month":
                    val = f"+{val}-00T00:00:00Z/10"
                elif cmd == "date":
                    val = f"+{val}T00:00:00Z/11"
                elif cmd == "def":
                    # Define a macro
                    curdef = val
                    self.defs[curdef] = []
                    continue
                elif cmd in self.defs:
                    # Expand the macro, don't put it in the final output!
                    row = row + self.defs[cmd]
                else:
                    raise Exception(f"Unknown command: {cmd}")

                if curdef:
                    self.defs[curdef].append(val)
                else:
                    row.append(val)

            curdef = False
            self.out.append(row)

        # Remove empty lines and cells
        self.out = [row for row in self.out if row]

def parse(in_path, out_path):
    data = Knead(in_path).data()
    parser = Parser(data)
    parser.run()
    write_tsv(out_path, parser.out)

def write_tsv(path, data):
    # We do our own tsv writing here, because QuickStatements's
    # format is not *exactly* TSV
    with open(path, "w") as f:
        for line in data:
            # Remove falsy values
            line = [cell for cell in line if cell]

            # And only print lines that have something
            if line:
                f.write("\t".join(line) + "\n")

if __name__ == "__main__":
    parse(sys.argv[1], sys.argv[2])