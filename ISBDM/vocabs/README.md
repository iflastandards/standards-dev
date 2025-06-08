# ISBDM RDF Vocabularies

This directory contains the published RDF vocabularies for the International Standard Bibliographic Description for Manifestations (ISBDM).

## Available Formats

RDF vocabularies will be available in multiple serialization formats:
- Turtle (`.ttl`)
- RDF/XML (`.rdf`)
- JSON-LD (`.jsonld`)
- N-Triples (`.nt`)

## Vocabulary Structure

Each vocabulary file follows the naming convention:
- Elements vocabulary: `isbdm-elements.[format]`
- Value vocabularies: `isbdm-values-[vocabulary-id].[format]`

## Usage

These vocabularies can be directly referenced in semantic web applications and linked data systems. URLs follow the pattern:
- `/vocabs/isbdm-elements.ttl`
- `/vocabs/isbdm-values-1275.ttl`

## Source Materials

The vocabularies are generated from:
- CSV source files: `/data/CSV/`
- DCTAP profiles: `/data/DCTAP/`
- JSON-LD contexts: `/data/contexts/`

## Version Information

Vocabulary versions are maintained in alignment with the ISBDM specification version.