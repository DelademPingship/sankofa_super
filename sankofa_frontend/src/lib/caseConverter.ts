/**
 * Case Converter Utilities
 * Handles recursive conversion between camelCase and snake_case for API communication.
 */

export const toCamelCase = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
        return obj.map((v) => toCamelCase(v));
    }
    if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            (result as Record<string, unknown>)[camelKey] = toCamelCase((obj as Record<string, unknown>)[key]);
            return result;
        }, {} as Record<string, unknown>);
    }
    return obj;
};

export const toSnakeCase = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
        return obj.map((v) => toSnakeCase(v));
    }
    if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            (result as Record<string, unknown>)[snakeKey] = toSnakeCase((obj as Record<string, unknown>)[key]);
            return result;
        }, {} as Record<string, unknown>);
    }
    return obj;
};
