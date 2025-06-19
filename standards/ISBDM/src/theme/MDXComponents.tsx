// MDXComponents.tsx
// Import the original MDX components
import MDXComponents from '@theme-original/MDXComponents';
// Import shared theme components
import {
  Figure,
  OutLink,
  InLink,
  Mandatory,
  Unique,
  SeeAlso,
  ExampleTable,
  ElementReference,
  VocabularyTable
} from '@ifla/theme';

// Export the enhanced MDX components
export default {
  // Include all the original components
  ...MDXComponents,
  // Add shared theme components
  Figure,
  OutLink,
  InLink,
  Mandatory,
  Unique,
  SeeAlso,
  ExampleTable,
  ElementReference,
  VocabularyTable,
};