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

export const contractOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['contract'],
      },
    },
    options: [
      {
        name: 'Create Contract',
        value: 'createContract',
        description: 'Create a new contract',
        action: 'Create contract',
      },
      {
        name: 'Get Contract',
        value: 'getContract',
        description: 'Get a contract by ID',
        action: 'Get contract',
      },
      {
        name: 'Get Contract Line Items',
        value: 'getContractLineItems',
        description: 'Get line items for a contract',
        action: 'Get contract line items',
      },
      {
        name: 'Get Contract Payments',
        value: 'getContractPayments',
        description: 'Get payments for a contract',
        action: 'Get contract payments',
      },
      {
        name: 'List Contracts',
        value: 'listContracts',
        description: 'List all contracts for a project',
        action: 'List contracts',
      },
      {
        name: 'Update Contract',
        value: 'updateContract',
        description: 'Update a contract',
        action: 'Update contract',
      },
    ],
    default: 'listContracts',
  },
];

export const contractFields: INodeProperties[] = [
  // Contract ID
  {
    displayName: 'Contract ID',
    name: 'contractId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['getContract', 'updateContract', 'getContractLineItems', 'getContractPayments'],
      },
    },
    default: 0,
    description: 'The ID of the contract',
  },
  // Create contract fields
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['createContract'],
      },
    },
    default: '',
    description: 'Contract title',
  },
  {
    displayName: 'Contract Type',
    name: 'contractType',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['createContract'],
      },
    },
    options: [
      { name: 'Prime Contract', value: 'prime_contract' },
      { name: 'Commitment', value: 'commitment' },
      { name: 'Subcontract', value: 'subcontract' },
      { name: 'Purchase Order', value: 'purchase_order' },
    ],
    default: 'commitment',
    description: 'Type of contract',
  },
  // Additional fields for create
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['createContract'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Contract Number',
        name: 'contract_number',
        type: 'string',
        default: '',
        description: 'Contract number',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Contract description',
      },
      {
        displayName: 'Executed',
        name: 'executed',
        type: 'boolean',
        default: false,
        description: 'Whether the contract is executed',
      },
      {
        displayName: 'Start Date',
        name: 'start_date',
        type: 'dateTime',
        default: '',
        description: 'Contract start date',
      },
      {
        displayName: 'Vendor ID',
        name: 'vendor_id',
        type: 'number',
        default: 0,
        description: 'Vendor ID for the contract',
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
        resource: ['contract'],
        operation: ['updateContract'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'Contract title',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Contract description',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Pending', value: 'pending' },
          { name: 'Approved', value: 'approved' },
          { name: 'Executed', value: 'executed' },
          { name: 'Closed', value: 'closed' },
        ],
        default: 'draft',
        description: 'Contract status',
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
        resource: ['contract'],
        operation: ['listContracts', 'getContractLineItems', 'getContractPayments'],
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
        resource: ['contract'],
        operation: ['listContracts', 'getContractLineItems', 'getContractPayments'],
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
        resource: ['contract'],
        operation: ['listContracts'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Contract Type',
        name: 'contract_type',
        type: 'options',
        options: [
          { name: 'Prime Contract', value: 'prime_contract' },
          { name: 'Commitment', value: 'commitment' },
          { name: 'Subcontract', value: 'subcontract' },
          { name: 'Purchase Order', value: 'purchase_order' },
        ],
        default: '',
        description: 'Filter by contract type',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Pending', value: 'pending' },
          { name: 'Approved', value: 'approved' },
          { name: 'Executed', value: 'executed' },
          { name: 'Closed', value: 'closed' },
        ],
        default: '',
        description: 'Filter by status',
      },
    ],
  },
];

export async function executeContractOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;

  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listContracts': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      const qs: IDataObject = cleanObject(filters);

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/work_order_contracts`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        qs.per_page = limit;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/work_order_contracts`,
          companyId,
          qs,
        });
      }
      break;
    }

    case 'getContract': {
      const contractId = this.getNodeParameter('contractId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/work_order_contracts/${contractId}`,
        companyId,
      });
      break;
    }

    case 'createContract': {
      const title = this.getNodeParameter('title', itemIndex) as string;
      const contractType = this.getNodeParameter('contractType', itemIndex) as string;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

      const body: IDataObject = {
        work_order_contract: cleanObject({
          title,
          contract_type: contractType,
          ...additionalFields,
        }),
      };

      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/work_order_contracts`,
        companyId,
        body,
      });
      break;
    }

    case 'updateContract': {
      const contractId = this.getNodeParameter('contractId', itemIndex) as number;
      const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

      const body: IDataObject = {
        work_order_contract: cleanObject(updateFields),
      };

      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/work_order_contracts/${contractId}`,
        companyId,
        body,
      });
      break;
    }

    case 'getContractLineItems': {
      const contractId = this.getNodeParameter('contractId', itemIndex) as number;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/work_order_contracts/${contractId}/line_items`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/work_order_contracts/${contractId}/line_items`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'getContractPayments': {
      const contractId = this.getNodeParameter('contractId', itemIndex) as number;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/work_order_contracts/${contractId}/payment_applications`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/work_order_contracts/${contractId}/payment_applications`,
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
