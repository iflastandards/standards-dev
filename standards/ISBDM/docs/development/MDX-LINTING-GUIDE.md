# MDX Linting and Formatting Guide

This guide documents the linting and formatting setup for MDX files in the ISBDM project.

## Overview

Docusaurus v3 uses MDX v3 for `.md` and `.mdx` files, compiling everything into React components. Our setup provides tools to lint and format these files while maintaining compatibility with MDX v3.

## Tools Installed

1. **ESLint with MDX Support**
   - `eslint`: Core linting engine
   - `eslint-plugin-mdx`: Enables ESLint to lint MDX files
   - `@docusaurus/eslint-plugin`: Docusaurus-specific linting rules

2. **Remark for MDX Formatting**
   - `remark-cli`: Command line tool for processing markdown
   - `remark-mdx`: MDX support for remark

## Configuration Files

### ESLint Configuration (`.eslintrc.js`)

The ESLint configuration is set up to:
- Extend recommended configurations for Docusaurus and MDX
- Apply specific rules for MDX files
- Handle JSX in markdown correctly
- Enforce Docusaurus best practices like proper i18n usage

### Remark Configuration (`.remarkrc.js`)

The remark configuration:
- Loads the MDX plugin for proper MDX processing
- Disables certain linting rules that conflict with Docusaurus usage
- Provides consistent formatting for MDX files

### Prettier Configuration (`.prettierignore`)

Since Prettier doesn't fully support MDX v3, we've added MDX files to `.prettierignore`. This prevents Prettier from potentially breaking MDX files during formatting.

## Usage

### Linting MDX Files

To lint all MDX files:

```bash
pnpm lint:mdx
```

This will check for issues in all `.md` and `.mdx` files in the `docs` and `src/components` directories.

### Formatting MDX Files

To format MDX files with remark:

```bash
pnpm format:mdx
```

This will process all `.md` and `.mdx` files according to the remark configuration.

### Regular Linting

For general linting of all supported files:

```bash
pnpm lint
```

## Best Practices

1. **Always run linting before committing changes**
   - This ensures consistent code style and catches potential issues early

2. **For MDX files, use remark for formatting, not Prettier**
   - Prettier may break MDX v3 syntax

3. **Follow the HTML-TO-MDX-CONVERSION-RULES.md guidelines**
   - These rules ensure consistent MDX content that will pass linting

4. **Use JSX attributes correctly in MDX**
   - Use `className` instead of `class`
   - Use `htmlFor` instead of `for`

5. **Handle curly braces in MDX properly**
   - Wrap expressions with backticks to prevent parsing errors
   - Example: `` `{variable}` `` instead of `{variable}`

## Common Issues and Solutions

### Issue: ESLint reports "Parsing error: Unexpected token"

**Solution**: This usually happens when ESLint doesn't recognize MDX syntax. Check that:
- The file has the correct extension (`.mdx` not `.md`) if it contains JSX
- Expressions with curly braces are properly escaped with backticks
- The ESLint configuration is loaded correctly

### Issue: Remark formatting removes important whitespace

**Solution**: Add specific remark plugins or rules to preserve necessary whitespace. You may need to adjust the `.remarkrc.js` configuration.

### Issue: "Plugin 'mdx' not found" error

**Solution**: Make sure all dependencies are properly installed. Try reinstalling with:
```bash
pnpm add --save-dev eslint-plugin-mdx
```

## References

- [Docusaurus Markdown Features](https://docusaurus.io/docs/markdown-features)
- [MDX and React in Docusaurus](https://docusaurus.io/docs/markdown-features/react)
- [eslint-plugin-mdx Documentation](https://github.com/mdx-js/eslint-mdx)
- [Remark Documentation](https://github.com/remarkjs/remark)