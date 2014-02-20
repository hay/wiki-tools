import xml2json, requests, json, pdb

API_PPN = "http://opc4.kb.nl/PPN?PPN="
API_ISBN = "http://opc4.kb.nl/DB=1/CMD?ACT=SRCHA&IKT=1007&TRM="
API_SEARCH = "http://opc4.kb.nl/DB=1/SET=8/TTL=1/CMD?ACT=SRCHA&IKT=1016&SRT=YOP&TRM="
NS_PSI = "{http://www.oclcpica.org/xml/}"

class opts:
    pass

opts.pretty = True

def key_replace_deep(d, old, new):
    newdict = {}

    for key, val in d.iteritems():
        if isinstance(val, dict):
            val = key_replace_deep(val, old, new)

        if isinstance(val, list):
            val = map(lambda item: key_replace_deep(item, old, new) if isinstance(item, dict) else item, val)

        newkey = key.replace(old, new)
        newdict[newkey] = val

    return newdict

def as_json(xml):
    xml = xml.encode('utf-8')
    json_data = xml2json.xml2json(xml, opts, strip_ns = 0)
    return json.loads(json_data)

def request(url):
    r = requests.get(url, headers = {
        'User-Agent' : 'Mozilla/5.0'
    })

    if r.status_code == 200:
        data = as_json(r.text)

        # Replace namespaces
        return key_replace_deep(data, NS_PSI, "")
    else:
        return False

def to_map(arr):
    m = {}

    for pair in arr:
        m.update(pair)

    return m

def to_line(val):
    if not val:
        return False

    if "line" in val:
        line = val["line"]
    else:
        return False

    if "text" in line:
        return line["text"]
    else :
        return map(lambda l:l["text"], line)


def to_text(pair):
    key = to_line(pair["labelledLabel"])
    val = to_line(pair["labelledData"])

    if type(val) == list:
        # Really, 'null' in a list? WTF?
        val = map(lambda i:i if i else "", val)

        # Remove deep inheritance
        val = map(lambda i:i["#text"] if isinstance(i, dict) else i, val)

        val = ' '.join(val)

    if key is False or val is False:
        return False
    else:
        key = key.replace(':', '').lower()
        return { key : val }

def parse_single_record(record):
    # print json.dumps(record, indent = 4)
    record = key_replace_deep(record, "@", "")
    rows = record["labelledTable"]["labelledRow"]
    rows = map(to_text, rows)

    # Sigh...
    rows = filter(lambda i:i, rows)

    return to_map(rows)

def parse_multiple_records(record):
    def parse(item):
        item = key_replace_deep(item, "@", "")
        title = map(lambda i:i["text"]["#text"] if isinstance(i["text"], dict) else i["text"], item["line"])
        item["title"] = '\n'.join(title)
        return item

    return map(parse, record)

def do_page_request(url):
    data = request(url)

    if not data:
        return False

    if not data["response"]["records"]:
        return False

    if "record" not in data["response"]["records"]:
        return False

    record = data["response"]["records"]["record"]

    if type(record) == list:
        # Search results
        return parse_multiple_records(record)
    elif "labelledTable" in data["response"]["records"]["record"]:
        # Single record
        return parse_single_record(record)
    else:
        # Invalid something
        return False

def get_search(args):
    url = API_SEARCH + str(args["q"])
    return do_page_request(url)

def get_isbn(args):
    url = API_ISBN + str(args["isbn"])
    return do_page_request(url)

def get_ppn(args):
    url = API_PPN + str(args["ppn"])
    return do_page_request(url)

if __name__ == "__main__":
    print json.dumps(get_ppn(30425022), indent = 4)