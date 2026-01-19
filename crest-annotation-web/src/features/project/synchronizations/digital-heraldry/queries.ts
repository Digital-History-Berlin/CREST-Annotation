export const defaultPullQuery = `
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

PREFIX dhor: <http://digitalheraldry.org/dho/representation#>
PREFIX dhoo: <http://digitalheraldry.org/dho/object#>
PREFIX dhoe: <http://digitalheraldry.org/dho/entity#>

PREFIX iiif: <http://iiif.io/api/presentation/2#>
PREFIX oa: <http://www.w3.org/ns/oa#>
PREFIX dhoh: <http://digitalheraldry.org/dho/heraldry#>

SELECT ?annotationImageFile ?blazon ?blazonType ?blazonTextAnnotation
WHERE {
  ?manuscriptIRI a dhoo:Manuscript ;
           dhoo:hasIIIFResource <{{manifestIRI}}> .
  
  # Load annotations
  ?coaRepresentation dhoo:locatedOnFolio <{{manuscriptFolio}}> ;
                      dhoo:hasImageFile ?annotationImageFile .
  
  # Load KG entity that describes the annotation
  OPTIONAL {
    ?coaRepresentation dhor:hasBlazoningAct ?blazonAct .
    ?blazonAct dhor:hasBlazon ?blazon .
    
    # Load annotation label
    OPTIONAL {
      ?blazon dhoh:hasBlazonFromOMA ?blazonTextAnnotation .
      
      ?blazon rdf:type ?blazonType .
    }
  }
}`;
