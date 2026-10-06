{
  "compilerOptions": {
{{#tests}}
    "types": ["vitest/globals", "@testing-library/jest-dom"],
{{/tests}}
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "checkJs": false,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["packages/*/src"]
}
