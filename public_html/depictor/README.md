== Technical design ==
Depictor is based on the premise that you want a simple way to quickly vet a large selection of images on Commons, and see if they are the same for a given Wikidata item.

Every session on Depictor always starts with a ***query***. This query results in a list of triples that will be fed to the user in the interface. Every triple always consists of the same three elements:

MID (Commons mediafile) -> Structured Data Property -> QID (Wikidata item)

For now, the only allowed structured data property is P180 (depicts), but this might be expanded in the future.

A ***query*** generates a list of these triples. A single triple is called a ***candidate***. This candidate is then shown in the user interface, consisting of a thumbnail of the Commons file (the ***candidateFile***) and the image (P18) connected to the Wikidata ite (the ***candidateItem***). A user may then choose one of four actions:

1) true
2) prominent-true
3) skip
4) false

Both 1) and 2) will create a structured data statement on the Commons media item. The only difference is that 2) will mark that statement as prominent. This is useful for things like close-up portraits of people (with no other people in the same image).

3) and 4) will not create a structured statement. The difference is that when marked with 'false', the candidateFile will never show up again for other users, while candidateFiles marked 'skip' will. Unfortunately it is not possible in the current data model of Wikibase and, hence, Structured Data on Commons, to indicate that something is **not** true, e.g. that somebody is **not** depicted on an image.

=== Queries ===
A query can be constructed from multiple sources:

1) A Wikidata SPARQL query
2) A JSON file or HTTP API endpoint providing a JSON-formatted response