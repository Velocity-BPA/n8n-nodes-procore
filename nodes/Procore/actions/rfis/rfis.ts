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
import { procoreApiRequest, procoreApiRequestAllItems } from '../../transport/procoreApi';
import { toExecutionData, cleanObject } from '../../utils/helpers';

export const rfiOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['rfi'],
      },
    },
    options: [
      {
        name: 'Add RFI Response',
        value: 'addRfiResponse',
        description: 'Add a response to an RFI',
        action: 'Add response to RFI',
      },
      {
        name: 'Create RFI',
        value: 'createRfi',
        description: 'Create a new RFI',
        action: 'Create an RFI',
      },
      {
        name: 'Delete RFI',
        value: 'deleteRfi',
        description: 'Delete an RFI',
        action: 'Delete an RFI',
      },
      {
        name: 'Get RFI',
        value: 'getRfi',
        description: 'Get an RFI by ID',
        action: 'Get an RFI',
      },
      {
        name: 'Get RFI Responses',
        value: 'getRfiResponses',
        description: 'Get all responses for an RFI',
        action: 'Get RFI responses',
      },
      {
        name: 'List RFIs',
        value: 'listRfis',
        description: 'List all RFIs in a project',
        action: 'List RFIs',
      },
      {
        name: 'Update RFI',
        value: 'updateRfi',
        description: 'Update an RFI',
        action: 'Update an RFI',
      },
    ],
    default: 'listRfis',
  },
];

export const rfiFields: INodeProperties[] = [
  {
    displayName: 'Company ID',
    name: 'companyId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['rfi'],
      },
    },
    default: 0,
    description: 'The ID of the company',
  },
  {
    displayName: 'Project ID',
    name: 'projectId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['rfi'],
      },
    },
    default: 0,
    description: 'The ID of the project',
  },
  {
    displayName: 'RFI ID',
    name: 'rfiId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['rfi'],
        operation: ['getRfi', 'updateRfi', 'deleteRfi', 'getRfiResponses', 'addRfiResponse'],
      },
    },
    default: 0,
    description: 'The ID of the RFI',
  },
  // Create RFI fields
  {
    displayName: 'Subject',
    name: 'subject',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['rfi'],
        operation: ['createRfi'],
      },
    },
    default: '',
    description: 'Subject of the RFI',
  },
  {
    displayName: 'Question',
    name: 'question',
    type: 'string',
    typeOptions: {
      rows: 4,
    },
    required: true,
    displayOptions: {
      show: {
        resource: ['rfi'],
        operation: ['createRfi'],
      },
    },
    default: '',
    description: 'The RFI question',
  },
  {
    displayName: 'Assignee ID',
    name: 'assignee_id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['rfi'],
        operation: ['createRfi'],
      },
    },
    default: 0,
    description: 'User ID of the RFI assignee',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['rfi'],
        operation: ['createRfi'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'RFI Manager ID',
        name: 'rfi_manager_id',
        type: 'number',
        default: 0,
        description: 'User ID of the RFI manager',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'dateTime',
        default: '',
        description: 'Due date for the RFI response',
      },
      {
        displayName: 'Reference',
        name: 'reference',
        type: 'string',
        default: '',
        description: 'Reference information for the RFI',
      },
      {
        displayName: 'Drawing Number',
        name: 'drawing_number',
        type: 'string',
        default: '',
        description: 'Associated drawing number',
      },
      {
        displayName: 'Specification Section',
        name: 'specification_section',
        type: 'string',
        default: '',
        description: 'Specification section reference',
      },
      {
        displayName: 'Location ID',
        name: 'location_id',
        type: 'number',
        default: 0,
        description: 'Project location ID',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        options: [
          { name: 'Low', value: 'low' },
          { name: 'Normal', value: 'normal' },
          { name: 'High', value: 'high' },
        ],
        default: 'normal',
        description: 'RFI priority',
      },
      {
        displayName: 'Schedule Impact',
        name: 'schedule_impact',
        type: 'boolean',
        default: false,
        description: 'Whether the RFI has schedule impact',
      },
      {
        displayName: 'Cost Impact',
        name: 'cost_impact',
        type: 'boolean',
        default: false,
        description: 'Whether the RFI has cost impact',
      },
    ],
  },
  // Update RFI fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['rfi'],
        operation: ['updateRfi'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Subject',
        name: 'subject',
        type: 'string',
        default: '',
        description: 'Subject of the RFI',
      },
      {
        displayName: 'Question',
        name: 'question',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'The RFI question',
      },
      {
        displayName: 'Assignee ID',
        name: 'assignee_id',
        type: 'number',
        default: 0,
        description: 'User ID of the RFI assignee',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Open', value: 'open' },
          { name: 'Closed', value: 'closed' },
        ],
        default: 'open',
        description: 'RFI status',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'dateTime',
        default: '',
        description: 'Due date for the RFI response',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        options: [
          { name: 'Low', value: 'low' },
          { name: 'Normal', value: 'normal' },
          { name: 'High', value: 'high' },
        ],
        default: 'normal',
        description: 'RFI priority',
      },
    ],
  },
  // Add Response fields
  {
    displayName: 'Response',
    name: 'response',
    type: 'string',
    typeOptions: {
      rows: 4,
    },
    required: true,
    displayOptions: {
      show: {
        resource: ['rfi'],
        operation: ['addRfiResponse'],
      },
    },
    default: '',
    description: 'Response text for the RFI',
  },
  // Return All / Limit
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['rfi'],
        operation: ['listRfis', 'getRfiResponses'],
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
        resource: ['rfi'],
        operation: ['listRfis', 'getRfiResponses'],
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
  // Filters
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['rfi'],
        operation: ['listRfis'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Status',
        name: 'filters[status]',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Open', value: 'open' },
          { name: 'Closed', value: 'closed' },
        ],
        default: 'open',
        description: 'Filter by RFI status',
      },
      {
        displayName: 'Assignee ID',
        name: 'filters[assignee_id]',
        type: 'number',
        default: 0,
        description: 'Filter by assignee user ID',
      },
    ],
  },
];

export async function executeRfiOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;

  switch (operation) {
    case 'listRfis': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      
      const qs = cleanObject(filters);
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/rfis`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/rfis`,
          companyId,
          qs: { ...qs, per_page: limit },
        });
      }
      break;
    }

    case 'getRfi': {
      const rfiId = this.getNodeParameter('rfiId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/rfis/${rfiId}`,
        companyId,
      });
      break;
    }

    case 'createRfi': {
      const subject = this.getNodeParameter('subject', itemIndex) as string;
      const question = this.getNodeParameter('question', itemIndex) as string;
      const assigneeId = this.getNodeParameter('assignee_id', itemIndex) as number;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
      
      const body = {
        rfi: {
          subject,
          question,
          assignee_id: assigneeId,
          ...cleanObject(additionalFields),
        },
      };
      
      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/rfis`,
        companyId,
        body,
      });
      break;
    }

    case 'updateRfi': {
      const rfiId = this.getNodeParameter('rfiId', itemIndex) as number;
      const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/rfis/${rfiId}`,
        companyId,
        body: { rfi: cleanObject(updateFields) },
      });
      break;
    }

    case 'deleteRfi': {
      const rfiId = this.getNodeParameter('rfiId', itemIndex) as number;
      
      await procoreApiRequest.call(this, {
        method: 'DELETE',
        endpoint: `/projects/${projectId}/rfis/${rfiId}`,
        companyId,
      });
      responseData = { success: true, rfiId };
      break;
    }

    case 'getRfiResponses': {
      const rfiId = this.getNodeParameter('rfiId', itemIndex) as number;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/rfis/${rfiId}/responses`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/rfis/${rfiId}/responses`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'addRfiResponse': {
      const rfiId = this.getNodeParameter('rfiId', itemIndex) as number;
      const response = this.getNodeParameter('response', itemIndex) as string;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/rfis/${rfiId}/responses`,
        companyId,
        body: { response: { body: response } },
      });
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return toExecutionData(responseData, { item: itemIndex });
}
