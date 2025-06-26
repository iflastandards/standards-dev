// tsup.config.ts
import { defineConfig } from "tsup";
import { sassPlugin, postcssModules } from "esbuild-sass-plugin";
var tsup_config_default = defineConfig({
  entry: {
    index: "src/index.ts",
    "components/SiteLink": "src/components/SiteLink.tsx",
    "components/ElementReference": "src/components/ElementReference/index.tsx",
    "hooks/usePrevious": "src/hooks/usePrevious.ts",
    "utils/index": "src/utils/index.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  // Code splitting for better tree-shaking
  sourcemap: true,
  clean: true,
  // Clean output directory before build
  outDir: "dist",
  target: "es2020",
  // Or your desired target
  platform: "browser",
  // 'node' or 'browser' if specific, 'neutral' for libraries
  esbuildOptions(options) {
    options.jsx = "automatic";
    return options;
  },
  external: [
    "react",
    "react-dom",
    /^@docusaurus\/.*/,
    /^@theme\/.*/,
    "clsx",
    "prism-react-renderer",
    "@ifla/shared-config"
  ],
  esbuildPlugins: [
    // Type assertion to work around version mismatch between tsup and esbuild
    sassPlugin({ transform: postcssModules({}) })
  ]
});
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL2pvbnBoaXBwcy9Db2RlL0lGTEEvc3RhbmRhcmRzLWRldi9wYWNrYWdlcy90aGVtZS90c3VwLmNvbmZpZy50c1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCIvVXNlcnMvam9ucGhpcHBzL0NvZGUvSUZMQS9zdGFuZGFyZHMtZGV2L3BhY2thZ2VzL3RoZW1lXCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy9Vc2Vycy9qb25waGlwcHMvQ29kZS9JRkxBL3N0YW5kYXJkcy1kZXYvcGFja2FnZXMvdGhlbWUvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd0c3VwJztcbmltcG9ydCB7IHNhc3NQbHVnaW4sIHBvc3Rjc3NNb2R1bGVzIH0gZnJvbSAnZXNidWlsZC1zYXNzLXBsdWdpbic7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGVudHJ5OiB7XG4gICAgaW5kZXg6ICdzcmMvaW5kZXgudHMnLFxuICAgICdjb21wb25lbnRzL1NpdGVMaW5rJzogJ3NyYy9jb21wb25lbnRzL1NpdGVMaW5rLnRzeCcsXG4gICAgJ2NvbXBvbmVudHMvRWxlbWVudFJlZmVyZW5jZSc6ICdzcmMvY29tcG9uZW50cy9FbGVtZW50UmVmZXJlbmNlL2luZGV4LnRzeCcsXG4gICAgJ2hvb2tzL3VzZVByZXZpb3VzJzogJ3NyYy9ob29rcy91c2VQcmV2aW91cy50cycsXG4gICAgJ3V0aWxzL2luZGV4JzogJ3NyYy91dGlscy9pbmRleC50cycsXG4gIH0sXG4gIGZvcm1hdDogWydlc20nLCAnY2pzJ10sXG4gIGR0czogdHJ1ZSxcbiAgc3BsaXR0aW5nOiB0cnVlLCAvLyBDb2RlIHNwbGl0dGluZyBmb3IgYmV0dGVyIHRyZWUtc2hha2luZ1xuICBzb3VyY2VtYXA6IHRydWUsXG4gIGNsZWFuOiB0cnVlLCAvLyBDbGVhbiBvdXRwdXQgZGlyZWN0b3J5IGJlZm9yZSBidWlsZFxuICBvdXREaXI6ICdkaXN0JyxcbiAgdGFyZ2V0OiAnZXMyMDIwJywgLy8gT3IgeW91ciBkZXNpcmVkIHRhcmdldFxuICBwbGF0Zm9ybTogJ2Jyb3dzZXInLCAvLyAnbm9kZScgb3IgJ2Jyb3dzZXInIGlmIHNwZWNpZmljLCAnbmV1dHJhbCcgZm9yIGxpYnJhcmllc1xuICBlc2J1aWxkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgb3B0aW9ucy5qc3ggPSAnYXV0b21hdGljJztcbiAgICByZXR1cm4gb3B0aW9ucztcbiAgfSxcbiAgZXh0ZXJuYWw6IFtcbiAgICAncmVhY3QnLFxuICAgICdyZWFjdC1kb20nLFxuICAgIC9eQGRvY3VzYXVydXNcXC8uKi8sXG4gICAgL15AdGhlbWVcXC8uKi8sXG4gICAgJ2Nsc3gnLFxuICAgICdwcmlzbS1yZWFjdC1yZW5kZXJlcicsXG4gICAgJ0BpZmxhL3NoYXJlZC1jb25maWcnLFxuICBdLFxuICBlc2J1aWxkUGx1Z2luczogW1xuICAgIC8vIFR5cGUgYXNzZXJ0aW9uIHRvIHdvcmsgYXJvdW5kIHZlcnNpb24gbWlzbWF0Y2ggYmV0d2VlbiB0c3VwIGFuZCBlc2J1aWxkXG4gICAgc2Fzc1BsdWdpbih7IHRyYW5zZm9ybTogcG9zdGNzc01vZHVsZXMoe30pIH0pIGFzIGFueSxcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVCxTQUFTLG9CQUFvQjtBQUNoVixTQUFTLFlBQVksc0JBQXNCO0FBRTNDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE9BQU87QUFBQSxJQUNMLE9BQU87QUFBQSxJQUNQLHVCQUF1QjtBQUFBLElBQ3ZCLCtCQUErQjtBQUFBLElBQy9CLHFCQUFxQjtBQUFBLElBQ3JCLGVBQWU7QUFBQSxFQUNqQjtBQUFBLEVBQ0EsUUFBUSxDQUFDLE9BQU8sS0FBSztBQUFBLEVBQ3JCLEtBQUs7QUFBQSxFQUNMLFdBQVc7QUFBQTtBQUFBLEVBQ1gsV0FBVztBQUFBLEVBQ1gsT0FBTztBQUFBO0FBQUEsRUFDUCxRQUFRO0FBQUEsRUFDUixRQUFRO0FBQUE7QUFBQSxFQUNSLFVBQVU7QUFBQTtBQUFBLEVBQ1YsZUFBZSxTQUFTO0FBQ3RCLFlBQVEsTUFBTTtBQUNkLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxVQUFVO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGdCQUFnQjtBQUFBO0FBQUEsSUFFZCxXQUFXLEVBQUUsV0FBVyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFBQSxFQUM5QztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
