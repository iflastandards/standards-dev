import React, { JSX } from 'react';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.scss';

// Type augmentation for TabItem to include children prop
declare module '@theme/TabItem' {
  interface Props {
    children?: React.ReactNode;
    value: string;
    label?: string;
    'data-testid'?: string;
  }
}

interface ElementSubType {
  uri: string;
  url: string;
  label: string;
}

interface ElementSuperType {
  uri: string;
  url: string;
  label: string;
}

interface RDFData {
  language?: string;
  label: string;
  definition: string;
  scopeNote?: string;
  domain?: string;
  range?: string;
  elementSubType?: ElementSubType[];
  elementSuperType?: ElementSuperType[];
  uri?: string;
  type?: string;
  status?: string;
  isDefinedBy?: string;
  subPropertyOf?: string[];
  equivalentProperty?: string[];
  inverseOf?: string[];
  deprecated?: boolean;
  deprecatedInVersion?: string;
  willBeRemovedInVersion?: string;
}

interface ElementReferenceProps {
  frontMatter: any; // Accept any frontmatter structure
}

// Adapter function to convert from new frontmatter structure to component-expected structure
function adaptFrontMatter(frontMatter: any, elementDefaults: any): { RDF: RDFData } {
  
  // Check if frontMatter already has the expected structure with RDF containing required properties
  if (frontMatter.RDF?.definition && 
      !frontMatter.hasOwnProperty('deprecated')) {
    // Already in the expected format, no adaptation needed
    return frontMatter as { RDF: RDFData };
  }

  // Create adapted frontmatter with RDF object
  const adaptedFrontMatter = {
    RDF: {
      ...frontMatter.RDF,
      // Move deprecation info from root level into RDF if it exists
      deprecated: frontMatter.deprecated || false,
      deprecatedInVersion: frontMatter.deprecatedInVersion || "",
      willBeRemovedInVersion: frontMatter.willBeRemovedInVersion || "",
    }
  };
  
  // Handle assembled URI if needed
  if (!adaptedFrontMatter.RDF.uri && frontMatter.id) {
    // Choose prefix based on type (case-insensitive)
    const type = adaptedFrontMatter.RDF.type || "";
    let prefix = elementDefaults.propertyPrefix;
    
    // Use class prefix if type contains 'class'
    if (type.toLowerCase().includes('class')) {
      prefix = elementDefaults.classPrefix;
    }
    
    // Construct URI based on ID and type
    adaptedFrontMatter.RDF.uri = `${elementDefaults.uri}/${prefix}${frontMatter.id}`;
  }
  
  // If label is not in RDF but in root (title), use that
  if (!adaptedFrontMatter.RDF.label && frontMatter.title) {
    adaptedFrontMatter.RDF.label = frontMatter.title;
  }
  
  // Ensure language is present
  if (!adaptedFrontMatter.RDF.language) {
    adaptedFrontMatter.RDF.language = "en"; // Default language
  }
  
  // Ensure status is present
  if (!adaptedFrontMatter.RDF.status) {
    adaptedFrontMatter.RDF.status = "Published"; // Default status
  }
  
  // Ensure isDefinedBy is present
  if (!adaptedFrontMatter.RDF.isDefinedBy) {
    adaptedFrontMatter.RDF.isDefinedBy = elementDefaults.uri + "/";
  }
  
  // Handle elementSuperType conversion to subPropertyOf if needed
  if (adaptedFrontMatter.RDF.elementSuperType && 
      adaptedFrontMatter.RDF.elementSuperType.length > 0 && 
      (!adaptedFrontMatter.RDF.subPropertyOf || adaptedFrontMatter.RDF.subPropertyOf.length === 0)) {
    adaptedFrontMatter.RDF.subPropertyOf = adaptedFrontMatter.RDF.elementSuperType.map(
      (superType: ElementSuperType) => superType.uri
    );
  }
  
  // Ensure required arrays exist
  if (!adaptedFrontMatter.RDF.equivalentProperty) {
    adaptedFrontMatter.RDF.equivalentProperty = [];
  }
  
  if (!adaptedFrontMatter.RDF.inverseOf) {
    adaptedFrontMatter.RDF.inverseOf = [];
  }
  
  if (!adaptedFrontMatter.RDF.elementSubType) {
    adaptedFrontMatter.RDF.elementSubType = [];
  }
  
  if (!adaptedFrontMatter.RDF.elementSuperType) {
    adaptedFrontMatter.RDF.elementSuperType = [];
  }
  
  if (!adaptedFrontMatter.RDF.subPropertyOf) {
    adaptedFrontMatter.RDF.subPropertyOf = [];
  }
  
  return adaptedFrontMatter;
}

export default function ElementReference({
  frontMatter,
}: ElementReferenceProps): JSX.Element {
  // Get config from Docusaurus context
  const {siteConfig} = useDocusaurusContext();
  
  // Extract element defaults from config
  const elementDefaults = siteConfig.customFields?.elementDefaults || {
    uri: "https://www.iflastandards.info/ISBDM/elements",
    prefix: "isbdm",
    classPrefix: "C",
    propertyPrefix: "P",
  };
  
  // Apply adapter to frontMatter before using it
  const adaptedFrontMatter = adaptFrontMatter(frontMatter, elementDefaults);
  
  const {
    language = "en",
    label,
    definition,
    scopeNote = "",
    domain = "",
    range = "",
    elementSubType = [],
    elementSuperType = [],
    uri = "",
    type = "",
    status = "",
    isDefinedBy = "",
    subPropertyOf = [],
    equivalentProperty = [],
    inverseOf = [],
    deprecated = false,
    deprecatedInVersion = "",
    willBeRemovedInVersion = "",
  } = adaptedFrontMatter.RDF;

  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';

  // Pre-process URLs for element sub-types and super-types to avoid calling hooks in callbacks
  const processedElementSubTypes = React.useMemo(() => {
    return elementSubType?.map(subType => ({
      ...subType,
      processedUrl: subType.url
    })) || [];
  }, [elementSubType]);

  const processedElementSuperTypes = React.useMemo(() => {
    return elementSuperType?.map(superType => ({
      ...superType,
      processedUrl: superType.url
    })) || [];
  }, [elementSuperType]);

  // Generate JSON-LD
  const jsonLD = generateJsonLD(adaptedFrontMatter.RDF);

  // Generate Turtle
  const turtle = generateTurtle(adaptedFrontMatter.RDF);

  // Generate RDF/XML
  const rdfXML = generateRdfXml(adaptedFrontMatter.RDF);

  return (
    <div className={styles.elementReference}>
      {/* Display deprecation information when applicable */}
      {deprecated && (
        <div className={styles.deprecationWarning}>
          <p>
            <strong>{`DEPRECATED${deprecatedInVersion ? ` in version ${deprecatedInVersion}` : ''}${willBeRemovedInVersion ? `. Will be removed in version ${willBeRemovedInVersion}` : ''}.`}</strong>
          </p>
        </div>
      )}

      <Tabs>
        <TabItem value="attribute" label="Attribute:Value" data-testid="tab-attribute-value">
          <div className={styles.referenceTable}>
            <div className={styles.row}>
              <div className={styles.label}>Definition</div>
              <div className={styles.value}>{definition}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>Scope note</div>
              <div className={styles.value}>{scopeNote}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>Domain</div>
              <div className={styles.value}>{domain}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>Range</div>
              <div className={styles.value}>{range}</div>
            </div>
            {processedElementSubTypes.length > 0 && (
              <div className={styles.row}>
                <div className={styles.label}>Element sub-type</div>
                <div className={styles.value}>
                  <div className={styles.elementLinks}>
                    {processedElementSubTypes.map((subType) => (
                      <Link
                        key={subType.uri}
                        to={subType.processedUrl}
                        className={styles.elementLink}
                        data-testid="docusaurus-link"
                      >
                        {subType.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {processedElementSuperTypes.length > 0 && (
              <div className={styles.row}>
                <div className={styles.label}>Element super-type</div>
                <div className={styles.value}>
                  <div className={styles.elementLinks}>
                    {processedElementSuperTypes.map((superType) => (
                      <Link
                        key={superType.uri}
                        to={superType.processedUrl}
                        className={styles.elementLink}
                        data-testid="docusaurus-link"
                      >
                        {superType.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className={styles.row}>
              <div className={styles.label}>URI</div>
              <div className={styles.value}>{uri}</div>
            </div>
            {type && (
              <div className={styles.row}>
                <div className={styles.label}>Type</div>
                <div className={styles.value}>{type}</div>
              </div>
            )}
            {status && (
              <div className={styles.row}>
                <div className={styles.label}>Status</div>
                <div className={styles.value}>{status}</div>
              </div>
            )}
            {/* Removed isDefinedBy from table */}
            {/* Removed subPropertyOf from table */}
            {equivalentProperty && equivalentProperty.length > 0 && (
              <div className={styles.row}>
                <div className={styles.label}>Equivalent Property</div>
                <div className={styles.value}>{equivalentProperty.join(', ')}</div>
              </div>
            )}
            {inverseOf && inverseOf.length > 0 && (
              <div className={styles.row}>
                <div className={styles.label}>Inverse Of</div>
                <div className={styles.value}>{inverseOf.join(', ')}</div>
              </div>
            )}
            {deprecated && (
              <>
                <div className={styles.row}>
                  <div className={styles.label}>Deprecated</div>
                  <div className={styles.value}>Yes</div>
                </div>
                {deprecatedInVersion && (
                  <div className={styles.row}>
                    <div className={styles.label}>Deprecated In Version</div>
                    <div className={styles.value}>{deprecatedInVersion}</div>
                  </div>
                )}
                {willBeRemovedInVersion && (
                  <div className={styles.row}>
                    <div className={styles.label}>Will Be Removed In Version</div>
                    <div className={styles.value}>{willBeRemovedInVersion}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabItem>
        <TabItem value="json-ld" label="JSON-LD" data-testid="tab-json-ld">
          <CodeBlock language="json" data-testid="codeblock-json">{jsonLD}</CodeBlock>
        </TabItem>
        <TabItem value="turtle" label="Turtle" data-testid="tab-turtle">
          <CodeBlock language="turtle" data-testid="codeblock-turtle">{turtle}</CodeBlock>
        </TabItem>
        <TabItem value="rdf-xml" label="RDF/XML" data-testid="tab-rdf-xml">
          <CodeBlock language="xml" data-testid="codeblock-xml">{rdfXML}</CodeBlock>
        </TabItem>
      </Tabs>
    </div>
  );
}

// Helper functions to generate RDF formats
function generateJsonLD(rdfData: RDFData): string {
  const {
    language = "en",
    label,
    definition,
    domain,
    uri,
    type,
    subPropertyOf = [],
    isDefinedBy,
    status,
    deprecated,
    deprecatedInVersion,
    willBeRemovedInVersion,
    elementSuperType = []
  } = rdfData;

  const jsonObj = {
    "@context": {
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "owl": "http://www.w3.org/2002/07/owl#",
      "skos": "http://www.w3.org/2004/02/skos/core#",
      "dcterms": "http://purl.org/dc/terms/",
      "ifla": "http://iflastandards.info/ns/isbd/terms/",
      "isbdm": "http://iflastandards.info/ns/isbdm/elements/"
    },
    "@graph": [
      {
        "@id": uri,
        "@type": type?.toLowerCase().includes("class") 
          ? ["rdfs:Class", "owl:Class"] 
          : type?.toLowerCase().includes("object") 
            ? ["rdf:Property", "owl:ObjectProperty"] 
            : ["rdf:Property", "owl:DatatypeProperty"],
        "label": {
          [language]: label
        },
        "description": {
          [language]: definition
        },
        ...(domain ? {
          "domain": {
            "@id": `http://iflastandards.info/ns/isbdm/elements/${domain}`
          }
        } : {}),
        /* Removed upper_value from JSON-LD output */
        ...(subPropertyOf && subPropertyOf.length > 0 ? {
          "subPropertyOf": {
            "@id": subPropertyOf[0]
          }
        } : {}),
        "isDefinedBy": {
          "@id": isDefinedBy,
          "label": "ISBD Manifestation elements"
        },
        "status": {
          "label": status
        },
        ...(deprecated ? {
          "owl:deprecated": deprecated,
          ...(deprecatedInVersion ? { "ifla:deprecatedInVersion": deprecatedInVersion } : {}),
          ...(willBeRemovedInVersion ? { "ifla:willBeRemovedInVersion": willBeRemovedInVersion } : {})
        } : {})
      }
    ]
  };

  return JSON.stringify(jsonObj, null, 2);
}

function generateTurtle(rdfData: RDFData): string {
  const {
    language = "en",
    label,
    definition,
    domain,
    uri,
    type,
    subPropertyOf = [],
    isDefinedBy,
    status,
    deprecated,
    deprecatedInVersion,
    willBeRemovedInVersion
  } = rdfData;

  const prefixes = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix isbdm: <http://iflastandards.info/ns/isbdm/elements/> .
@prefix ifla: <http://iflastandards.info/ns/isbd/terms/> .
`;

  // Determine the resource type based on type value (case insensitive)
  let resourceTypeDeclaration = "";
  if (type?.toLowerCase().includes("class")) {
    resourceTypeDeclaration = `a rdfs:Class, owl:Class`;
  } else {
    resourceTypeDeclaration = `a rdf:Property, owl:DatatypeProperty`;
  }

  let turtleContent = `<${uri}> ${resourceTypeDeclaration} ;
  rdfs:label "${label}"@${language} ;
  rdfs:comment "${definition}"@${language} ;`;

  if (domain) {
    turtleContent += `\n  rdfs:domain isbdm:${domain} ;`;
  }

  if (subPropertyOf && subPropertyOf.length > 0) {
    subPropertyOf.forEach((prop) => {
      turtleContent += `\n  rdfs:subPropertyOf <${prop}> ;`;
    });
  }

  if (isDefinedBy) {
    turtleContent += `\n  rdfs:isDefinedBy <${isDefinedBy}> ;`;
  }

  if (status) {
    turtleContent += `\n  dcterms:status "${status}" ;`;
  }

  if (deprecated) {
    turtleContent += `\n  owl:deprecated true ;`;

    if (deprecatedInVersion) {
      turtleContent += `\n  ifla:deprecatedInVersion "${deprecatedInVersion}" ;`;
    }

    if (willBeRemovedInVersion) {
      turtleContent += `\n  ifla:willBeRemovedInVersion "${willBeRemovedInVersion}" ;`;
    }
  }

  // Replace final semicolon with a period
  turtleContent = turtleContent.replace(/;$/, ".");

  return prefixes + "\n" + turtleContent;
}

function generateRdfXml(rdfData: RDFData): string {
  const {
    language = "en",
    label,
    definition,
    domain,
    uri,
    type,
    subPropertyOf = [],
    isDefinedBy,
    status,
    deprecated,
    deprecatedInVersion,
    willBeRemovedInVersion
  } = rdfData;

  // Determine the proper type
  let rdfXmlContent: string;
  let propertyType;
  
  if (type?.toLowerCase().includes("class")) {
    // Special handling for Class type
    rdfXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  xmlns:owl="http://www.w3.org/2002/07/owl#"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:isbdm="http://iflastandards.info/ns/isbdm/elements/"
  xmlns:ifla="http://iflastandards.info/ns/isbd/terms/">

  <rdfs:Class rdf:about="${uri}">
    <rdf:type rdf:resource="http://www.w3.org/2002/07/owl#Class"/>
    <rdfs:label xml:lang="${language}">${label}</rdfs:label>
    <rdfs:comment xml:lang="${language}">${definition}</rdfs:comment>`;
  } else {
    // For properties
    propertyType = type?.toLowerCase().includes("object") ? "ObjectProperty" : "DatatypeProperty";
    
    rdfXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  xmlns:owl="http://www.w3.org/2002/07/owl#"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:isbdm="http://iflastandards.info/ns/isbdm/elements/"
  xmlns:ifla="http://iflastandards.info/ns/isbd/terms/">

  <rdf:Property rdf:about="${uri}">
    <rdf:type rdf:resource="http://www.w3.org/2002/07/owl#${propertyType}"/>
    <rdfs:label xml:lang="${language}">${label}</rdfs:label>
    <rdfs:comment xml:lang="${language}">${definition}</rdfs:comment>`;
  }

  if (domain) {
    rdfXmlContent += `\n    <rdfs:domain rdf:resource="http://iflastandards.info/ns/isbdm/elements/${domain}"/>`;
  }

  if (subPropertyOf && subPropertyOf.length > 0) {
    subPropertyOf.forEach((prop) => {
      rdfXmlContent += `\n    <rdfs:subPropertyOf rdf:resource="${prop}"/>`;
    });
  }

  if (isDefinedBy) {
    rdfXmlContent += `\n    <rdfs:isDefinedBy rdf:resource="${isDefinedBy}"/>`;
  }

  if (status) {
    rdfXmlContent += `\n    <dcterms:status>${status}</dcterms:status>`;
  }

  if (deprecated) {
    rdfXmlContent += `\n    <owl:deprecated rdf:datatype="http://www.w3.org/2001/XMLSchema#boolean">true</owl:deprecated>`;

    if (deprecatedInVersion) {
      rdfXmlContent += `\n    <ifla:deprecatedInVersion>${deprecatedInVersion}</ifla:deprecatedInVersion>`;
    }

    if (willBeRemovedInVersion) {
      rdfXmlContent += `\n    <ifla:willBeRemovedInVersion>${willBeRemovedInVersion}</ifla:willBeRemovedInVersion>`;
    }
  }

  // Close the appropriate tag
  if (type?.toLowerCase().includes("class")) {
    rdfXmlContent += `\n  </rdfs:Class>\n</rdf:RDF>`;
  } else {
    rdfXmlContent += `\n  </rdf:Property>\n</rdf:RDF>`;
  }

  return rdfXmlContent;
}
