/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';

/**
 * Log licensing notice once per node load
 */
let licensingNoticeLogged = false;

export function logLicensingNotice(): void {
  if (!licensingNoticeLogged) {
    console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
    licensingNoticeLogged = true;
  }
}

/**
 * Convert API response to n8n execution data format
 */
export function toExecutionData(
  data: IDataObject | IDataObject[],
  pairedItem?: { item: number },
): INodeExecutionData[] {
  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      json: item,
      pairedItem: pairedItem || { item: index },
    }));
  }
  return [
    {
      json: data,
      pairedItem: pairedItem || { item: 0 },
    },
  ];
}

/**
 * Clean undefined and null values from object
 */
export function cleanObject(obj: IDataObject): IDataObject {
  const cleaned: IDataObject = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Build query string parameters from additional fields
 */
export function buildQueryParams(
  this: IExecuteFunctions,
  itemIndex: number,
  additionalFieldsKey: string = 'additionalFields',
): IDataObject {
  const additionalFields = this.getNodeParameter(additionalFieldsKey, itemIndex, {}) as IDataObject;
  return cleanObject(additionalFields);
}

/**
 * Format date to ISO string for API requests
 */
export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Format date to YYYY-MM-DD format
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Parse pagination parameters
 */
export function getPaginationParams(
  this: IExecuteFunctions,
  itemIndex: number,
): { page: number; perPage: number } {
  const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
  
  if (returnAll) {
    return { page: 1, perPage: 100 };
  }

  const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
  return { page: 1, perPage: Math.min(limit, 100) };
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Transform object keys from camelCase to snake_case
 */
export function transformToSnakeCase(obj: IDataObject): IDataObject {
  const transformed: IDataObject = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      transformed[snakeKey] = transformToSnakeCase(value as IDataObject);
    } else {
      transformed[snakeKey] = value;
    }
  }
  return transformed;
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: IDataObject,
  requiredFields: string[],
): void {
  const missing = requiredFields.filter(
    (field) => data[field] === undefined || data[field] === null || data[field] === '',
  );
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Handle binary data for file operations
 */
export async function handleBinaryData(
  this: IExecuteFunctions,
  itemIndex: number,
  binaryPropertyName: string,
): Promise<Buffer> {
  // Assert binary data exists and return the buffer
  this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
  return this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: Error,
  itemIndex: number,
): INodeExecutionData {
  return {
    json: {
      error: true,
      message: error.message,
    },
    pairedItem: { item: itemIndex },
  };
}
