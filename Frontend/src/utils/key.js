/**
 * This file provides a custom key generation utility 
 * to help React resolve "key" warnings in components
 */

// Create a unique ID generator for component keys
export const generateId = (() => {
  let id = 0;
  return (prefix = 'id') => `${prefix}-${id++}`;
})();

// Function to help avoid key warnings in React
export const getKey = (item, index) => {
  return item?.id || `item-${index}`;
};
