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

export const budgetOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['budget'],
      },
    },
    options: [
      {
        name: 'Create Budget Line Item',
        value: 'createBudgetLineItem',
        description: 'Create a new budget line item',
        action: 'Create a budget line item',
      },
      {
        name: 'Get Budget',
        value: 'getBudget',
        description: 'Get project budget',
        action: 'Get budget',
      },
      {
        name: 'Get Budget Changes',
        value: 'getBudgetChanges',
        description: 'Get budget changes',
        action: 'Get budget changes',
      },
      {
        name: 'Get Budget Line Items',
        value: 'getBudgetLineItems',
        description: 'Get budget line items',
        action: 'Get budget line items',
      },
      {
        name: 'Update Budget Line Item',
        value: 'updateBudgetLineItem',
        description: 'Update a budget line item',
        action: 'Update a budget line item',
      },
    ],
    default: 'getBudget',
  },
];

export const budgetFields: INodeProperties[] = [
  {
    displayName: 'Company ID',
    name: 'companyId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['budget'],
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
        resource: ['budget'],
      },
    },
    default: 0,
    description: 'The ID of the project',
  },
  {
    displayName: 'Budget Line Item ID',
    name: 'budgetLineItemId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['budget'],
        operation: ['updateBudgetLineItem'],
      },
    },
    default: 0,
    description: 'The ID of the budget line item',
  },
  // Create Budget Line Item fields
  {
    displayName: 'Cost Code ID',
    name: 'cost_code_id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['budget'],
        operation: ['createBudgetLineItem'],
      },
    },
    default: 0,
    description: 'ID of the cost code',
  },
  {
    displayName: 'Original Budget Amount',
    name: 'original_budget_amount',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['budget'],
        operation: ['createBudgetLineItem'],
      },
    },
    default: 0,
    description: 'Original budget amount',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['budget'],
        operation: ['createBudgetLineItem'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the budget line item',
      },
      {
        displayName: 'Unit Cost',
        name: 'unit_cost',
        type: 'number',
        default: 0,
        description: 'Unit cost',
      },
      {
        displayName: 'Quantity',
        name: 'quantity',
        type: 'number',
        default: 0,
        description: 'Quantity',
      },
    ],
  },
  // Update Budget Line Item fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['budget'],
        operation: ['updateBudgetLineItem'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Original Budget Amount',
        name: 'original_budget_amount',
        type: 'number',
        default: 0,
        description: 'Original budget amount',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the budget line item',
      },
      {
        displayName: 'Unit Cost',
        name: 'unit_cost',
        type: 'number',
        default: 0,
        description: 'Unit cost',
      },
      {
        displayName: 'Quantity',
        name: 'quantity',
        type: 'number',
        default: 0,
        description: 'Quantity',
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
        resource: ['budget'],
        operation: ['getBudgetLineItems', 'getBudgetChanges'],
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
        resource: ['budget'],
        operation: ['getBudgetLineItems', 'getBudgetChanges'],
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

export async function executeBudgetOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;

  switch (operation) {
    case 'getBudget': {
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/budget`,
        companyId,
      });
      break;
    }

    case 'getBudgetLineItems': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/budget/line_items`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/budget/line_items`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'createBudgetLineItem': {
      const costCodeId = this.getNodeParameter('cost_code_id', itemIndex) as number;
      const originalBudgetAmount = this.getNodeParameter('original_budget_amount', itemIndex) as number;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
      
      const body = {
        budget_line_item: {
          cost_code_id: costCodeId,
          original_budget_amount: originalBudgetAmount,
          ...cleanObject(additionalFields),
        },
      };
      
      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/budget/line_items`,
        companyId,
        body,
      });
      break;
    }

    case 'updateBudgetLineItem': {
      const budgetLineItemId = this.getNodeParameter('budgetLineItemId', itemIndex) as number;
      const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/budget/line_items/${budgetLineItemId}`,
        companyId,
        body: { budget_line_item: cleanObject(updateFields) },
      });
      break;
    }

    case 'getBudgetChanges': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/budget/changes`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/budget/changes`,
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
