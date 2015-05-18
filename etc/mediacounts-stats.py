import csv, json, argparse, sys, datetime, os, re, time, bz2

# Requires wikitools 1.3+ to use generators
try:
    from wikitools import wiki, category, api
except ImportError:
    HAS_WIKITOOLS = False
else:
    HAS_WIKITOOLS = True

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
    parser.add_argument('-i', '--input', help="Path(s) to TSV file(s), separated by space", required = True)
    parser.add_argument('-o', '--output', help="Path to output CSV file", required = True)
    parser.add_argument('-q', '--query', help="Media file to search for")
    parser.add_argument('-qf', '--queryfile', help="Path to a newline separated file of files to search for")
    parser.add_argument('-cat', '--category', help="Name of a Wikimedia Commons category of files to search for")
    parser.add_argument('-v', '--verbose', help="Output verbose results", action="store_true")
    parser.add_argument('-p', '--progress', help="Show progress", action="store_true")

    return parser.parse_args()

def log(msg):
    if args.verbose:
        print msg

def process(datafile, out, query):
    log("Doing %s" % datafile)
    if datafile.endswith("bz2"):
        tsvfile = bz2.BZ2File(datafile, "r")
    else:
        tsvfile = open(datafile)
    tsvfilesize = os.path.getsize(datafile)
    csvfile = open(out, "a")
    writer = csv.writer(csvfile)
    rowwritten = False

    # Actually benefit from the generator, e.g. batch
    query = frozenset(query)

    for index, line in enumerate(tsvfile):
        if args.progress:
            if index % 200000 == 0:
                percent = tsvfile.tell() / float(tsvfilesize)
                print "{0:.2f}%".format(percent * 100)

        row = line.split("\t")
        if args.category:
            filename = row[0]
        else:
            filename = row[0].split("/")[-1]

        if filename not in query:
            continue

        log("MATCH " + row[0])

        if not rowwritten:
            writer.writerow(FIELDS)
            rowwritten = True

        writer.writerow(row)

    tsvfile.close()
    csvfile.close()

def queries():
    if args.queryfile:
        for l in open(args.queryfile):
            yield l.strip()
    elif args.query:
        yield args.query
    elif args.category and not HAS_WIKITOOLS:
        sys.exit("-cat option given, but wikitools package is not present, see < https://github.com/alexz-enwp/wikitools >")
    elif args.category and HAS_WIKITOOLS:
        site = wiki.Wiki("https://commons.wikimedia.org/w/api.php")
        query = []
        params = {
            'action': 'query',
            'prop': 'imageinfo',
            'iiprop': 'url',
            'generator': 'categorymembers',
            'gcmtitle': 'Category:' + args.category,
            'gcmnamespace': '6',
            'gcmprop': 'title'
        }

        req = api.APIRequest(site, params)

        for data in req.queryGen():
            keys = data['query']['pages'].keys()

            for key in keys:
                url = data['query']['pages'][key]['imageinfo'][0]['url']
                yield re.sub("https://upload.wikimedia.org", "", url)
    else:
        sys.exit("No query given")

def main():
    global args
    args = init_argparse()
    now = time.time()
    log("Starting " + datetime.datetime.now().isoformat())
    query = [ l for l in queries() ]
    log("Searching statistics for %d files" % len(query))
    for datafile in args.input.split(" "):
        process(datafile, args.output, query)
    log("Ending " + datetime.datetime.now().isoformat())
    log("Query took %s seconds" % round(time.time() - now, 2))

if __name__ == "__main__":
    main()