/**
 * Unit Tests for Procore Helpers
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import {
  cleanObject,
  formatDateShort,
  snakeToCamel,
  camelToSnake,
  transformToSnakeCase,
  validateRequired,
} from '../../nodes/Procore/utils/helpers';

describe('Procore Helpers', () => {
  describe('cleanObject', () => {
    it('should remove undefined values', () => {
      const input = { a: 1, b: undefined, c: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 1, c: 'test' });
    });

    it('should remove null values', () => {
      const input = { a: 1, b: null, c: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 1, c: 'test' });
    });

    it('should remove empty strings', () => {
      const input = { a: 1, b: '', c: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 1, c: 'test' });
    });

    it('should keep zero values', () => {
      const input = { a: 0, b: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 0, b: 'test' });
    });

    it('should keep false values', () => {
      const input = { a: false, b: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: false, b: 'test' });
    });
  });

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatDateShort(date);
      expect(result).toBe('2024-01-15');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-03-20T15:45:00Z');
      const result = formatDateShort(date);
      expect(result).toBe('2024-03-20');
    });
  });

  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('hello_world')).toBe('helloWorld');
      expect(snakeToCamel('my_test_string')).toBe('myTestString');
    });

    it('should handle single words', () => {
      expect(snakeToCamel('hello')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(snakeToCamel('')).toBe('');
    });
  });

  describe('camelToSnake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelToSnake('helloWorld')).toBe('hello_world');
      expect(camelToSnake('myTestString')).toBe('my_test_string');
    });

    it('should handle single words', () => {
      expect(camelToSnake('hello')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(camelToSnake('')).toBe('');
    });
  });

  describe('transformToSnakeCase', () => {
    it('should transform object keys to snake_case', () => {
      const input = { firstName: 'John', lastName: 'Doe' };
      const result = transformToSnakeCase(input);
      expect(result).toEqual({ first_name: 'John', last_name: 'Doe' });
    });

    it('should handle nested objects', () => {
      const input = { userData: { firstName: 'John' } };
      const result = transformToSnakeCase(input);
      expect(result).toEqual({ user_data: { first_name: 'John' } });
    });

    it('should preserve array values', () => {
      const input = { tags: ['tag1', 'tag2'] };
      const result = transformToSnakeCase(input);
      expect(result).toEqual({ tags: ['tag1', 'tag2'] });
    });

    it('should handle empty objects', () => {
      const result = transformToSnakeCase({});
      expect(result).toEqual({});
    });
  });

  describe('validateRequired', () => {
    it('should not throw for valid values', () => {
      expect(() => validateRequired({ name: 'test' }, ['name'])).not.toThrow();
    });

    it('should throw for missing required fields', () => {
      expect(() => validateRequired({}, ['name'])).toThrow('Missing required fields: name');
    });

    it('should throw for empty string values', () => {
      expect(() => validateRequired({ name: '' }, ['name'])).toThrow('Missing required fields: name');
    });

    it('should list all missing fields', () => {
      expect(() => validateRequired({}, ['name', 'email'])).toThrow('Missing required fields: name, email');
    });
  });
});
