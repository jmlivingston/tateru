{
  "compilerOptions": {
{{#tests}}
    "types": ["vitest/globals", "@testing-library/jest-dom"],
{{/tests}}
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["packages/*/src"]
}
