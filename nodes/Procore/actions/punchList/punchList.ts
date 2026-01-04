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

export const punchListOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['punchList'],
      },
    },
    options: [
      {
        name: 'Assign Punch Item',
        value: 'assignPunchItem',
        description: 'Assign a punch item to a user',
        action: 'Assign punch item',
      },
      {
        name: 'Close Punch Item',
        value: 'closePunchItem',
        description: 'Mark a punch item as closed',
        action: 'Close punch item',
      },
      {
        name: 'Create Punch Item',
        value: 'createPunchItem',
        description: 'Create a new punch item',
        action: 'Create a punch item',
      },
      {
        name: 'Delete Punch Item',
        value: 'deletePunchItem',
        description: 'Delete a punch item',
        action: 'Delete a punch item',
      },
      {
        name: 'Get Punch Item',
        value: 'getPunchItem',
        description: 'Get a punch item by ID',
        action: 'Get a punch item',
      },
      {
        name: 'List Punch Items',
        value: 'listPunchItems',
        description: 'List all punch items in a project',
        action: 'List punch items',
      },
      {
        name: 'Update Punch Item',
        value: 'updatePunchItem',
        description: 'Update a punch item',
        action: 'Update a punch item',
      },
    ],
    default: 'listPunchItems',
  },
];

export const punchListFields: INodeProperties[] = [
  {
    displayName: 'Company ID',
    name: 'companyId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['punchList'],
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
        resource: ['punchList'],
      },
    },
    default: 0,
    description: 'The ID of the project',
  },
  {
    displayName: 'Punch Item ID',
    name: 'punchItemId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['punchList'],
        operation: ['getPunchItem', 'updatePunchItem', 'deletePunchItem', 'assignPunchItem', 'closePunchItem'],
      },
    },
    default: 0,
    description: 'The ID of the punch item',
  },
  // Create Punch Item fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['punchList'],
        operation: ['createPunchItem'],
      },
    },
    default: '',
    description: 'Name/title of the punch item',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['punchList'],
        operation: ['createPunchItem'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Description of the punch item',
      },
      {
        displayName: 'Assignee ID',
        name: 'assignee_id',
        type: 'number',
        default: 0,
        description: 'User ID of the assignee',
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
          { name: 'Medium', value: 'medium' },
          { name: 'High', value: 'high' },
        ],
        default: 'medium',
        description: 'Priority of the punch item',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'dateTime',
        default: '',
        description: 'Due date for the punch item',
      },
      {
        displayName: 'Ball In Court ID',
        name: 'ball_in_court_id',
        type: 'number',
        default: 0,
        description: 'User ID who has the ball in court',
      },
      {
        displayName: 'Trade ID',
        name: 'trade_id',
        type: 'number',
        default: 0,
        description: 'Trade/category ID',
      },
    ],
  },
  // Update Punch Item fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['punchList'],
        operation: ['updatePunchItem'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Name/title of the punch item',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Description of the punch item',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Open', value: 'open' },
          { name: 'Ready For Review', value: 'ready_for_review' },
          { name: 'Closed', value: 'closed' },
        ],
        default: 'open',
        description: 'Status of the punch item',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        options: [
          { name: 'Low', value: 'low' },
          { name: 'Medium', value: 'medium' },
          { name: 'High', value: 'high' },
        ],
        default: 'medium',
        description: 'Priority of the punch item',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'dateTime',
        default: '',
        description: 'Due date for the punch item',
      },
    ],
  },
  // Assign Punch Item fields
  {
    displayName: 'Assignee ID',
    name: 'assigneeId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['punchList'],
        operation: ['assignPunchItem'],
      },
    },
    default: 0,
    description: 'User ID to assign the punch item to',
  },
  // Return All / Limit
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['punchList'],
        operation: ['listPunchItems'],
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
        resource: ['punchList'],
        operation: ['listPunchItems'],
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
        resource: ['punchList'],
        operation: ['listPunchItems'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Status',
        name: 'filters[status]',
        type: 'options',
        options: [
          { name: 'Open', value: 'open' },
          { name: 'Ready For Review', value: 'ready_for_review' },
          { name: 'Closed', value: 'closed' },
        ],
        default: 'open',
        description: 'Filter by status',
      },
      {
        displayName: 'Assignee ID',
        name: 'filters[assignee_id]',
        type: 'number',
        default: 0,
        description: 'Filter by assignee user ID',
      },
      {
        displayName: 'Location ID',
        name: 'filters[location_id]',
        type: 'number',
        default: 0,
        description: 'Filter by location ID',
      },
    ],
  },
];

export async function executePunchListOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;

  switch (operation) {
    case 'listPunchItems': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      
      const qs = cleanObject(filters);
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/punch_items`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/punch_items`,
          companyId,
          qs: { ...qs, per_page: limit },
        });
      }
      break;
    }

    case 'getPunchItem': {
      const punchItemId = this.getNodeParameter('punchItemId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/punch_items/${punchItemId}`,
        companyId,
      });
      break;
    }

    case 'createPunchItem': {
      const name = this.getNodeParameter('name', itemIndex) as string;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
      
      const body = {
        punch_item: {
          name,
          ...cleanObject(additionalFields),
        },
      };
      
      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/punch_items`,
        companyId,
        body,
      });
      break;
    }

    case 'updatePunchItem': {
      const punchItemId = this.getNodeParameter('punchItemId', itemIndex) as number;
      const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/punch_items/${punchItemId}`,
        companyId,
        body: { punch_item: cleanObject(updateFields) },
      });
      break;
    }

    case 'deletePunchItem': {
      const punchItemId = this.getNodeParameter('punchItemId', itemIndex) as number;
      
      await procoreApiRequest.call(this, {
        method: 'DELETE',
        endpoint: `/projects/${projectId}/punch_items/${punchItemId}`,
        companyId,
      });
      responseData = { success: true, punchItemId };
      break;
    }

    case 'assignPunchItem': {
      const punchItemId = this.getNodeParameter('punchItemId', itemIndex) as number;
      const assigneeId = this.getNodeParameter('assigneeId', itemIndex) as number;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/punch_items/${punchItemId}`,
        companyId,
        body: { punch_item: { assignee_id: assigneeId } },
      });
      break;
    }

    case 'closePunchItem': {
      const punchItemId = this.getNodeParameter('punchItemId', itemIndex) as number;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/punch_items/${punchItemId}`,
        companyId,
        body: { punch_item: { status: 'closed' } },
      });
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return toExecutionData(responseData, { item: itemIndex });
}
