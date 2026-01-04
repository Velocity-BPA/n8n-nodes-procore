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

export const companyOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['company'],
      },
    },
    options: [
      {
        name: 'Get Company',
        value: 'getCompany',
        description: 'Get a company by ID',
        action: 'Get a company',
      },
      {
        name: 'Get Company Users',
        value: 'getCompanyUsers',
        description: 'Get all users in a company',
        action: 'Get company users',
      },
      {
        name: 'Get Company Vendors',
        value: 'getCompanyVendors',
        description: 'Get all vendors in a company',
        action: 'Get company vendors',
      },
      {
        name: 'List Companies',
        value: 'listCompanies',
        description: 'List all companies',
        action: 'List companies',
      },
      {
        name: 'Update Company',
        value: 'updateCompany',
        description: 'Update a company',
        action: 'Update a company',
      },
    ],
    default: 'listCompanies',
  },
];

export const companyFields: INodeProperties[] = [
  // Company ID - for get, update, users, vendors operations
  {
    displayName: 'Company ID',
    name: 'companyId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['company'],
        operation: ['getCompany', 'updateCompany', 'getCompanyUsers', 'getCompanyVendors'],
      },
    },
    default: 0,
    description: 'The ID of the company',
  },
  // Update Company fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['company'],
        operation: ['updateCompany'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Company name',
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'Company address',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
        description: 'Company city',
      },
      {
        displayName: 'State Code',
        name: 'state_code',
        type: 'string',
        default: '',
        description: 'Two-letter state code',
      },
      {
        displayName: 'Zip',
        name: 'zip',
        type: 'string',
        default: '',
        description: 'ZIP/Postal code',
      },
      {
        displayName: 'Country Code',
        name: 'country_code',
        type: 'string',
        default: '',
        description: 'Two-letter country code',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'Company phone number',
      },
      {
        displayName: 'Fax',
        name: 'fax',
        type: 'string',
        default: '',
        description: 'Company fax number',
      },
    ],
  },
  // Return All / Limit for list operations
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['company'],
        operation: ['listCompanies', 'getCompanyUsers', 'getCompanyVendors'],
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
        resource: ['company'],
        operation: ['listCompanies', 'getCompanyUsers', 'getCompanyVendors'],
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

export async function executeCompanyOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listCompanies': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: '/companies',
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: '/companies',
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'getCompany': {
      const companyId = this.getNodeParameter('companyId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/companies/${companyId}`,
      });
      break;
    }

    case 'updateCompany': {
      const companyId = this.getNodeParameter('companyId', itemIndex) as number;
      const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/companies/${companyId}`,
        body: { company: cleanObject(updateFields) },
      });
      break;
    }

    case 'getCompanyUsers': {
      const companyId = this.getNodeParameter('companyId', itemIndex) as number;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/companies/${companyId}/users`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/companies/${companyId}/users`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'getCompanyVendors': {
      const companyId = this.getNodeParameter('companyId', itemIndex) as number;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/companies/${companyId}/vendors`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/companies/${companyId}/vendors`,
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
