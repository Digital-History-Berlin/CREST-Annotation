QUERY = """
# select-image-urls-from-iiif-manifest.sparql

# Takes an IRI of a IIIF manifest and returns all image URLs that are part of this
# manifest. The order of the images, encoded in the IIIF manifest through the canvases
# is retained in the result.
# 
# The query is intended to be used in conjunction with the Digital Heraldry Ontology,
# so the dhoo:Object that is described through the IIIF manifest is returned
# as well. If you do not want this, just remove the `OPTIONAL` clause in the query.

PREFIX dhoo: <http://digitalheraldry.org/dho/object#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX iiif: <http://iiif.io/api/presentation/2#>
PREFIX oa: <http://www.w3.org/ns/oa#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?manifestIRI ?object ?canvas ?canvasLabel ?imageURL
WHERE {
    #BIND( <{{manifestIRI}}> AS ?manifestIRI ) .
    #BIND( <https://gallica.bnf.fr/iiif/ark:/12148/btv1b55009806h/manifest.json> AS ?manifestIRI ) .
    ?manifestIRI iiif:hasSequences ?sequence .
    ?sequence rdf:rest*/rdf:first ?firstSequence .
    ?firstSequence iiif:hasCanvases ?canvasList .
    ?canvasList rdf:rest*/rdf:first ?canvas .
    ?canvas rdfs:label ?canvasLabel .
    ?canvas iiif:hasImageAnnotations ?annotations .
    ?annotations rdf:rest*/rdf:first ?anno .
    ?anno oa:hasBody ?imageURL .
  
  	OPTIONAL {
    	?object dhoo:hasIIIFResource ?manifestIRI .
  }
}
"""
