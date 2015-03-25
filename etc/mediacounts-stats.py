import unicodecsv, json, argparse, sys, re, datetime
# Requires wikitools 1.3+ to use generators
try:
    from wikitools import wiki, category, api
except ImportError:
    print "No wikitools library found for the web API! Can't use -cat."

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
    parser.add_argument('-i', '--input', help="Path to TSV file. Better if sorted", required = True)
    parser.add_argument('-o', '--output', help="Path to output CSV file", required = True)
    parser.add_argument('-cat', '--category', help="Name of a Wikimedia Commons category of files to search for")
    parser.add_argument('-q', '--query', help="Media file to search for")
    parser.add_argument('-qf', '--queryfile', help="Path to a newline separated file of files to search for")
    parser.add_argument('-v', '--verbose', help="Output verbose results", action="store_true")

    return parser.parse_args()

def log(msg):
    if args.verbose:
        print msg

def process():
    csvfile = open(args.output, "w")
    writer = unicodecsv.writer(csvfile)
    rowwritten = False

    for path in query():
        # FIXME: Should search for sorted titles and continue seeking where it left.
        tsvfile = open(args.input)
        reader = unicodecsv.reader(tsvfile, delimiter="\t")

        #print "Looking for " + path
        for row in reader:
            #print "Inspecting row " + row[0]
            if row[0].strip().startswith(path.strip()):
                log("MATCH " + row[0])
                if not rowwritten:
                    writer.writerow(FIELDS)
                    rowwritten = True

                writer.writerow(row)
                break
        tsvfile.close()
    csvfile.close()

def query():
    if args.queryfile:
        for l in open(args.queryfile):
            yield l.strip()
    elif args.query:
        yield args.query
    elif args.category:
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
    log("Starting " + datetime.datetime.now().isoformat())
    process()
    log("Ending " + datetime.datetime.now().isoformat())

if __name__ == "__main__":
    main()
