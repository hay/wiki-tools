import csv, json, argparse, sys, datetime, os

# These are taken from
# http://dumps.wikimedia.org/other/mediacounts/README.txt
FIELDS = [
    "filename",
    "total_response_bytes",
    "total_transfers",
    "total_transfers_raw",
    "total_transfers_audio",
    "reserved6",
    "reserved7",
    "total_transfers_image",
    "total_transfers_image_0x199",
    "total_transfers_image_200x399",
    "total_transfers_image_400x599",
    "total_transfers_image_600x799",
    "total_transfers_image_800x999",
    "total_transfers_image_1000plus",
    "reserved15",
    "reserved16",
    "total_transfers_movie",
    "total_transfers_movie_0x239",
    "total_transfers_movie_240x479",
    "total_transfers_movie_480plus",
    "reserved21",
    "reserved22",
    "total_transfers_refer_wmf",
    "total_transfers_refer_nonwmf",
    "total_transfers_refer_invalid"
]

args = None

def init_argparse():
    parser = argparse.ArgumentParser(
        description='Get mediacounts for a specific media file or list of files'
    )
    parser.add_argument('-i', '--input', help="Path to TSV file", required = True)
    parser.add_argument('-o', '--output', help="Path to output CSV file", required = True)
    parser.add_argument('-q', '--query', help="Media file to search for")
    parser.add_argument('-qf', '--queryfile', help="Path to a newline separated file of files to search for")
    parser.add_argument('-v', '--verbose', help="Output verbose results", action="store_true")
    parser.add_argument('-p', '--progress', help="Show progress", action="store_true")

    return parser.parse_args()

def log(msg):
    if args.verbose:
        print msg

def process():
    tsvfile = open(args.input)
    tsvfilesize = os.path.getsize(args.input)
    csvfile = open(args.output, "w")
    writer = csv.writer(csvfile)
    rowwritten = False

    if args.queryfile:
        query = [l.strip() for l in open(args.queryfile)]
    elif args.query:
        query = [args.query]
    else:
        sys.exit("No query given")

    for index, line in enumerate(tsvfile):
        if args.progress:
            if index % 200000 == 0:
                percent = tsvfile.tell() / float(tsvfilesize)
                print "{0:.2f}%".format(percent * 100)

        row = line.split("\t")
        filename = row[0].split("/")[-1]

        if filename not in query:
            continue

        log("MATCH " + row[0])

        if not rowwritten:
            writer.writerow(FIELDS)
            rowwritten = True

        writer.writerow(row)

def main():
    global args
    args = init_argparse()
    log("Starting " + datetime.datetime.now().isoformat())
    process()
    log("Ending " + datetime.datetime.now().isoformat())

if __name__ == "__main__":
    main()