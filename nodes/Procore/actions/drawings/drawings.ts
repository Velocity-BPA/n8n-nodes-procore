/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  IDataObject,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';
import { procoreApiRequest, procoreApiRequestAllItems, procoreUploadRequest } from '../../transport/procoreApi';
import { toExecutionData } from '../../utils/helpers';

export const drawingOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['drawing'],
      },
    },
    options: [
      {
        name: 'Get Drawing',
        value: 'getDrawing',
        description: 'Get a drawing by ID',
        action: 'Get a drawing',
      },
      {
        name: 'List Drawing Areas',
        value: 'listDrawingAreas',
        description: 'List all drawing areas',
        action: 'List drawing areas',
      },
      {
        name: 'List Drawing Revisions',
        value: 'listDrawingRevisions',
        description: 'List revisions for a drawing',
        action: 'List drawing revisions',
      },
      {
        name: 'List Drawings',
        value: 'listDrawings',
        description: 'List all drawings',
        action: 'List drawings',
      },
      {
        name: 'Upload Drawing',
        value: 'uploadDrawing',
        description: 'Upload a new drawing',
        action: 'Upload a drawing',
      },
    ],
    default: 'listDrawings',
  },
];

export const drawingFields: INodeProperties[] = [
  {
    displayName: 'Drawing ID',
    name: 'drawingId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['drawing'],
        operation: ['getDrawing', 'listDrawingRevisions'],
      },
    },
    default: '',
    description: 'The ID of the drawing',
  },
  {
    displayName: 'Drawing Title',
    name: 'title',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['drawing'],
        operation: ['uploadDrawing'],
      },
    },
    default: '',
    description: 'Title of the drawing',
  },
  {
    displayName: 'Drawing Number',
    name: 'number',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['drawing'],
        operation: ['uploadDrawing'],
      },
    },
    default: '',
    description: 'Drawing number (e.g., A-101)',
  },
  {
    displayName: 'Binary Property',
    name: 'binaryPropertyName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['drawing'],
        operation: ['uploadDrawing'],
      },
    },
    default: 'data',
    description: 'Name of the binary property containing the drawing file',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['drawing'],
        operation: ['uploadDrawing'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the drawing',
      },
      {
        displayName: 'Discipline',
        name: 'discipline',
        type: 'options',
        options: [
          { name: 'Architectural', value: 'architectural' },
          { name: 'Civil', value: 'civil' },
          { name: 'Electrical', value: 'electrical' },
          { name: 'Mechanical', value: 'mechanical' },
          { name: 'Other', value: 'other' },
          { name: 'Plumbing', value: 'plumbing' },
          { name: 'Structural', value: 'structural' },
        ],
        default: 'architectural',
        description: 'Drawing discipline',
      },
      {
        displayName: 'Drawing Area ID',
        name: 'drawing_area_id',
        type: 'string',
        default: '',
        description: 'ID of the drawing area',
      },
      {
        displayName: 'Drawing Date',
        name: 'drawing_date',
        type: 'dateTime',
        default: '',
        description: 'Date of the drawing',
      },
      {
        displayName: 'Received Date',
        name: 'received_date',
        type: 'dateTime',
        default: '',
        description: 'Date the drawing was received',
      },
      {
        displayName: 'Revision',
        name: 'revision',
        type: 'string',
        default: '',
        description: 'Revision number',
      },
    ],
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['drawing'],
        operation: ['listDrawings'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Discipline',
        name: 'discipline',
        type: 'options',
        options: [
          { name: 'Architectural', value: 'architectural' },
          { name: 'Civil', value: 'civil' },
          { name: 'Electrical', value: 'electrical' },
          { name: 'Mechanical', value: 'mechanical' },
          { name: 'Other', value: 'other' },
          { name: 'Plumbing', value: 'plumbing' },
          { name: 'Structural', value: 'structural' },
        ],
        default: 'architectural',
        description: 'Filter by discipline',
      },
      {
        displayName: 'Drawing Area ID',
        name: 'drawing_area_id',
        type: 'string',
        default: '',
        description: 'Filter by drawing area',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Search term',
      },
    ],
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['drawing'],
        operation: ['listDrawings', 'listDrawingAreas', 'listDrawingRevisions'],
      },
    },
    default: false,
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['drawing'],
        operation: ['listDrawings', 'listDrawingAreas', 'listDrawingRevisions'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    default: 50,
    description: 'Max number of results to return',
  },
];

export async function executeDrawingOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listDrawings': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      const qs: IDataObject = {};

      if (filters.drawing_area_id) {
        qs['filters[drawing_area_id]'] = filters.drawing_area_id;
      }
      if (filters.discipline) {
        qs['filters[discipline]'] = filters.discipline;
      }
      if (filters.search) {
        qs['filters[search]'] = filters.search;
      }

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/drawings`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        qs.per_page = limit;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/drawings`,
          companyId,
          qs,
        });
      }
      break;
    }

    case 'getDrawing': {
      const drawingId = this.getNodeParameter('drawingId', itemIndex) as string;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/drawings/${drawingId}`,
        companyId,
      });
      break;
    }

    case 'uploadDrawing': {
      const title = this.getNodeParameter('title', itemIndex) as string;
      const number = this.getNodeParameter('number', itemIndex) as string;
      const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex) as string;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

      const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
      const dataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

      const formData: IDataObject = {
        'drawing[title]': title,
        'drawing[number]': number,
      };

      if (additionalFields.drawing_area_id) {
        formData['drawing[drawing_area_id]'] = additionalFields.drawing_area_id;
      }
      if (additionalFields.discipline) {
        formData['drawing[discipline]'] = additionalFields.discipline;
      }
      if (additionalFields.description) {
        formData['drawing[description]'] = additionalFields.description;
      }
      if (additionalFields.revision) {
        formData['drawing[revision]'] = additionalFields.revision;
      }
      if (additionalFields.drawing_date) {
        formData['drawing[drawing_date]'] = additionalFields.drawing_date;
      }
      if (additionalFields.received_date) {
        formData['drawing[received_date]'] = additionalFields.received_date;
      }

      formData['drawing[file]'] = {
        value: dataBuffer,
        options: {
          filename: binaryData.fileName || 'drawing.pdf',
          contentType: binaryData.mimeType || 'application/pdf',
        },
      };

      responseData = await procoreUploadRequest.call(this, {
        endpoint: `/projects/${projectId}/drawings`,
        companyId,
        formData,
      });
      break;
    }

    case 'listDrawingAreas': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/drawing_areas`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/drawing_areas`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'listDrawingRevisions': {
      const drawingId = this.getNodeParameter('drawingId', itemIndex) as string;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/drawings/${drawingId}/revisions`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/drawings/${drawingId}/revisions`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return toExecutionData(responseData, { item: itemIndex });
}
