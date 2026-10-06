const VALID_NAME = /^[A-Za-z][A-Za-z0-9 _-]*$/;

export const isValidName = (value) => VALID_NAME.test(value.trim());

const toWords = (value) =>
  value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());

export const toKebab = (value) => toWords(value).join('-');

export const toPascal = (value) =>
  toWords(value)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
