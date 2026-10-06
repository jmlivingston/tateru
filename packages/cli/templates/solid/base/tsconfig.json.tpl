{
  "compilerOptions": {
{{#tests}}
    "types": ["vitest/globals", "vite/client"],
{{/tests}}
{{^tests}}
    "types": ["vite/client"],
{{/tests}}
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["packages/*/src"]
}
