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

export const changeOrderOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['changeOrder'],
      },
    },
    options: [
      {
        name: 'Approve Change Order',
        value: 'approveChangeOrder',
        description: 'Approve a change order',
        action: 'Approve change order',
      },
      {
        name: 'Create Change Order',
        value: 'createChangeOrder',
        description: 'Create a new change order',
        action: 'Create change order',
      },
      {
        name: 'Get Change Order',
        value: 'getChangeOrder',
        description: 'Get a change order by ID',
        action: 'Get change order',
      },
      {
        name: 'List Change Orders',
        value: 'listChangeOrders',
        description: 'List all change orders for a project',
        action: 'List change orders',
      },
      {
        name: 'Update Change Order',
        value: 'updateChangeOrder',
        description: 'Update a change order',
        action: 'Update change order',
      },
    ],
    default: 'listChangeOrders',
  },
];

export const changeOrderFields: INodeProperties[] = [
  // Change Order ID
  {
    displayName: 'Change Order ID',
    name: 'changeOrderId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['changeOrder'],
        operation: ['getChangeOrder', 'updateChangeOrder', 'approveChangeOrder'],
      },
    },
    default: 0,
    description: 'The ID of the change order',
  },
  // Create fields
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['changeOrder'],
        operation: ['createChangeOrder'],
      },
    },
    default: '',
    description: 'Change order title',
  },
  // Additional fields for create
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['changeOrder'],
        operation: ['createChangeOrder'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Change order description',
      },
      {
        displayName: 'Reason',
        name: 'reason',
        type: 'options',
        options: [
          { name: 'Owner Change', value: 'owner_change' },
          { name: 'Design Change', value: 'design_change' },
          { name: 'Unforeseen Conditions', value: 'unforeseen_conditions' },
          { name: 'Value Engineering', value: 'value_engineering' },
          { name: 'Code Change', value: 'code_change' },
          { name: 'Other', value: 'other' },
        ],
        default: 'owner_change',
        description: 'Reason for change order',
      },
      {
        displayName: 'Schedule Impact (Days)',
        name: 'schedule_impact_days',
        type: 'number',
        default: 0,
        description: 'Number of days impact on schedule',
      },
    ],
  },
  // Update fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['changeOrder'],
        operation: ['updateChangeOrder'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'Change order title',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Change order description',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Pending', value: 'pending' },
          { name: 'Approved', value: 'approved' },
          { name: 'Rejected', value: 'rejected' },
        ],
        default: 'draft',
        description: 'Change order status',
      },
    ],
  },
  // Return All / Limit
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['changeOrder'],
        operation: ['listChangeOrders'],
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
        resource: ['changeOrder'],
        operation: ['listChangeOrders'],
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

export async function executeChangeOrderOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;

  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listChangeOrders': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/change_order_requests`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/change_order_requests`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'getChangeOrder': {
      const changeOrderId = this.getNodeParameter('changeOrderId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/change_order_requests/${changeOrderId}`,
        companyId,
      });
      break;
    }

    case 'createChangeOrder': {
      const title = this.getNodeParameter('title', itemIndex) as string;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

      const body: IDataObject = {
        change_order_request: cleanObject({
          title,
          ...additionalFields,
        }),
      };

      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/change_order_requests`,
        companyId,
        body,
      });
      break;
    }

    case 'updateChangeOrder': {
      const changeOrderId = this.getNodeParameter('changeOrderId', itemIndex) as number;
      const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

      const body: IDataObject = {
        change_order_request: cleanObject(updateFields),
      };

      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/change_order_requests/${changeOrderId}`,
        companyId,
        body,
      });
      break;
    }

    case 'approveChangeOrder': {
      const changeOrderId = this.getNodeParameter('changeOrderId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/change_order_requests/${changeOrderId}/approve`,
        companyId,
      });
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return toExecutionData(responseData, { item: itemIndex });
}
