# Comparison of Docusaurus Configurations: MulDiCat vs UNIMARC

## Overall Structure
- Both configurations follow the same general structure and import patterns
- Both use the same environment variables system and site configuration approach

## Site Specific Differences

### Basic Information
- **Title**: MulDiCat vs UNIMARC
- **Tagline**: Different descriptions ("Multilingual Dictionary of Cataloguing Terms and Concepts" vs "Universal MARC Format")
- **Project Name**: "muldicat" vs "unimarc"

### Vocabulary Configuration
- MulDiCat uses prefix "muldicat" while UNIMARC uses "unimarc"
- Different profile files: 
  - MulDiCat: "vocabulary-profile.csv" and "elements-profile.csv"
  - UNIMARC: "unimarc-values-profile.csv" and "unimarc-elements-profile.csv"

### Navbar Configuration
- MulDiCat includes additional navbar items that UNIMARC doesn't have:
  - Locale dropdown
  - Docs version dropdown
  - Search function in the navbar

### Future Configuration
- Both have the same future configuration with `v4: true` and `experimental_faster: true`

### Plugins and Presets
- Both use the same core plugins: 'docusaurus-plugin-sass' and '@easyops-cn/docusaurus-search-local'
- Both have the same preset configuration for docs and blog

### Content and Theme Configuration
- Both use the same footer structure with identical sections (Resources, Community, More)
- Both have the same copyright statement
- Both use the same prism theme configuration

## Conclusion
The configurations are largely identical in structure and approach, with differences mostly related to site-specific information like titles, prefixes, and profile files. The MulDiCat configuration has more navbar items enabled than the UNIMARC configuration.
