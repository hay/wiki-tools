import os, datetime, re, urllib, lxml.etree, requests, json

urlapi =  "http://beeldengeluidwiki.nl/api.php"
API_ENDPOINT = urlapi

def get_infobox(page):
    page = get_page(page)

    if not page:
        return False

    templates = parse_templates(page["text"])

    if len(templates['templates']) > 0:
        return templates['templates'][0][1]
    else:
        return False

def get_page(name):
    r = requests.get(API_ENDPOINT,
        params = {
            "format" : "json",
            "action" : "query",
            "prop" : "revisions",
            "rvprop" : "timestamp|user|comment|content",
            "titles" : name
        }
    )

    data = r.json()

    # Sigh.. awful Wikipedia API crap
    id_ = data['query']['pages'].keys()[0]

    if "-1" in data["query"]["pages"]:
        return False
    else :
        return {
            "id" : id_,
            "name" : name,
            "text" : data['query']['pages'][id_]['revisions'][0]['*']
        }

def get_category(categoryname):
    "Downloads all/some names and metadata of pages in given category"
    params = {"action":"query", "format":"xml", "generator":"categorymembers", "prop":"info", "gcmlimit":100 }
    params["gcmtitle"] = "Category:%s" % categoryname.encode("utf8")
    result = [ ]
    while True:
        url = "%s?%s" % (urlapi, urllib.urlencode(params))
        tree = lxml.etree.parse(urllib.urlopen(url))
        for page in tree.xpath('//page'):
            pdata = dict(page.attrib.items())
            if "redirect" in pdata:   # case of the redirect page having a category, eg Paviland_Cave
                continue
            pdata.pop("new", None)
            assert pdata.keys() == ['lastrevid', 'pageid', 'title', 'counter', 'length', 'touched', 'ns'], (pdata.keys(), pdata)
            pdata['length'] = int(pdata['length'])
            if pdata["title"][:5] == "File:":
                continue
            pdata["link"] = "http://en.wikipedia.org/wiki/%s" % urllib.quote(pdata["title"].replace(" ", "_"))
            result.append(pdata)
        cmcontinue = tree.xpath('//query-continue/categorymembers') # attrib.get("gcmcontinue") is fed back in as gmcontinue parameter
        if not cmcontinue:
            break
        params["gcmcontinue"] = cmcontinue[0].get("gcmcontinue")
    return result


def get_category_recursive(categoryname):
    "Downloads everything in a given category and all the subcategories"
    prestack = [ categoryname ]
    usedcategories = set()
    result = [ ]
    while prestack:
        lcategoryname = prestack.pop()
        if lcategoryname in usedcategories:
            continue
        for d in GetWikipediaCategory(lcategoryname):
            if d["title"][:9] == "Category:":
                prestack.append(d["title"][9:])
            else:
                result.append(d)
        usedcategories.add(lcategoryname)  # avoids infinite loops
    return result


def parse_templates(text):
    "Extract all the templates/infoboxes from the text into a list"
    res = { "templates":[ ], "categories":[ ], "images":[ ], "wikilinks":[ ], "flattext":[ ] }
    templstack = [ ]
    for tt in re.split("(\{\{\{|\}\}\}|\{\{|\}\}|\[\[|\]\]|\|)", text):
        if tt in ["{{{", "{{", "[["]:
            templstack.append([tt, [ [ ] ] ])
        elif templstack and tt in ["}}}", "}}", "]]"]:
            templstack[-1][1][-1] = "".join(templstack[-1][1][-1])
            templstack[-1].append(tt)
            if len(templstack) == 1:
                if templstack[-1][0] == "{{":
                    ltempl = [ ]
                    for i, param in enumerate(templstack[-1][1]):
                        k, e, v = param.partition("=")
                        if e:
                            ltempl.append((k.strip(), v.strip()))
                        else:
                            ltempl.append((i, k.strip()))
                    if ltempl:
                        res["templates"].append((ltempl[0][1], dict(ltempl)))
                elif templstack[-1][0] == "[[":
                    llink = templstack[-1][1]
                    if llink:
                        llink0, cllink, cllink1 = llink[0].partition(":")
                        if llink[0][0] == ':':   # eg [[:Category:something]]
                            res["wikilinks"].append(llink[-1])
                            res["flattext"].append(llink[0][1:])  # the [[what you see|actual link]]
                        elif cllink:
                            if llink0 == "Category":
                                res["categories"].append(cllink1.strip())
                            elif llink0 in ["Image", "File"]:
                                res["images"].append(cllink1.strip())
                            elif len(llink0) == 2:
                                pass  # links to other languages
                            else:
                                print "Unrecognized", llink
                        else:
                            res["wikilinks"].append(llink[-1])
                            res["flattext"].append(llink[0])  # the [[what you see|actual link]]
            else:
                templstack[-2][1][-1].append(templstack[-1][0])
                templstack[-2][1][-1].append("|".join(templstack[-1][1]))
                templstack[-2][1][-1].append(templstack[-1][2])
            del templstack[-1]
        elif tt == "|" and templstack:
            templstack[-1][1][-1] = "".join(templstack[-1][1][-1])
            templstack[-1][1].append([ ])
        elif templstack:
            templstack[-1][1][-1].append(tt)
        else:
            res["flattext"].append(tt)
    res["flattext"] = "".join(res["flattext"])
    return res

