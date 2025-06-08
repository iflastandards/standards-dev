# ISBDM Data Resources

This directory contains downloadable data resources for the ISBDM project.

## Directory Structure

### `/CSV/`
Source CSV files for ISBDM vocabularies. These files define controlled vocabulary terms used throughout the ISBDM specification.

### `/DCTAP/`
Dublin Core Tabular Application Profiles (DCTAP) that define the structure and constraints for ISBDM metadata:
- `isbdm-elements-profile.csv` - Profile for ISBDM element metadata
- `isbdm-values-profile.csv` - Profile for ISBDM value vocabulary metadata
- `isbdm-values-profile-revised.csv` - Updated version of the values profile

### `/contexts/`
JSON-LD context files for semantic web applications:
- `isbdm-elements-context.jsonld` - Context for ISBDM elements
- `isbdm-values-context.jsonld` - Context for ISBDM value vocabularies

## Usage

All files in this directory are directly downloadable via their path. For example:
- DCTAP profiles: `/data/DCTAP/isbdm-elements-profile.csv`
- Contexts: `/data/contexts/isbdm-elements-context.jsonld`
- CSV vocabularies: `/data/CSV/[vocabulary-name].csv`

## Related Resources

- RDF vocabularies: `/vocabs/`
- Documentation: `/docs/`