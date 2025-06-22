export interface VocabularyConfigOptions {
  prefix: string;
  numberPrefix?: string;
  uriStyle?: string;
  profile?: string;
  elementUri?: string;
  elementProfile?: string;
  rdfLabelMappings?: {
    en?: string[];
  };
  rdfCommentMappings?: {
    en?: string[];
  };
}

/**
 * Factory function to create vocabulary configuration for standards sites
 * This is a pure function that returns consistent vocabulary configuration
 */
export function createVocabularyConfig(options: VocabularyConfigOptions) {
  const {
    prefix,
    numberPrefix,
    uriStyle,
    profile,
    elementUri,
    elementProfile,
    rdfLabelMappings,
    rdfCommentMappings,
  } = options;

  const vocabularyDefaults: any = {
    prefix,
    ...(numberPrefix && { numberPrefix }),
    ...(uriStyle && { uriStyle }),
    ...(profile && { profile }),
  };

  if (elementUri || elementProfile) {
    vocabularyDefaults.elementDefaults = {};
    if (elementUri) vocabularyDefaults.elementDefaults.uri = elementUri;
    if (elementProfile) vocabularyDefaults.elementDefaults.profile = elementProfile;
  }

  if (rdfLabelMappings || rdfCommentMappings) {
    vocabularyDefaults.RDF = {};
    if (rdfLabelMappings) vocabularyDefaults.RDF.label = rdfLabelMappings;
    if (rdfCommentMappings) vocabularyDefaults.RDF.comment = rdfCommentMappings;
  }

  return vocabularyDefaults;
}