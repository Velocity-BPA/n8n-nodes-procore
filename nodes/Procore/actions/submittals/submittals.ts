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

export const submittalOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['submittal'],
      },
    },
    options: [
      {
        name: 'Create Submittal',
        value: 'createSubmittal',
        description: 'Create a new submittal',
        action: 'Create a submittal',
      },
      {
        name: 'Get Submittal',
        value: 'getSubmittal',
        description: 'Get a submittal by ID',
        action: 'Get a submittal',
      },
      {
        name: 'Get Submittal Approvers',
        value: 'getSubmittalApprovers',
        description: 'Get approvers for a submittal',
        action: 'Get submittal approvers',
      },
      {
        name: 'List Submittals',
        value: 'listSubmittals',
        description: 'List all submittals in a project',
        action: 'List submittals',
      },
      {
        name: 'Submit For Approval',
        value: 'submitForApproval',
        description: 'Submit a submittal for approval',
        action: 'Submit for approval',
      },
      {
        name: 'Update Submittal',
        value: 'updateSubmittal',
        description: 'Update a submittal',
        action: 'Update a submittal',
      },
    ],
    default: 'listSubmittals',
  },
];

export const submittalFields: INodeProperties[] = [
  {
    displayName: 'Company ID',
    name: 'companyId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['submittal'],
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
        resource: ['submittal'],
      },
    },
    default: 0,
    description: 'The ID of the project',
  },
  {
    displayName: 'Submittal ID',
    name: 'submittalId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['submittal'],
        operation: ['getSubmittal', 'updateSubmittal', 'getSubmittalApprovers', 'submitForApproval'],
      },
    },
    default: 0,
    description: 'The ID of the submittal',
  },
  // Create Submittal fields
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['submittal'],
        operation: ['createSubmittal'],
      },
    },
    default: '',
    description: 'Title of the submittal',
  },
  {
    displayName: 'Specification Section ID',
    name: 'specification_section_id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['submittal'],
        operation: ['createSubmittal'],
      },
    },
    default: 0,
    description: 'ID of the specification section',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['submittal'],
        operation: ['createSubmittal'],
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
        description: 'Description of the submittal',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Shop Drawing', value: 'shop_drawing' },
          { name: 'Product Data', value: 'product_data' },
          { name: 'Sample', value: 'sample' },
          { name: 'Mock-Up', value: 'mock_up' },
          { name: 'Other', value: 'other' },
        ],
        default: 'shop_drawing',
        description: 'Type of submittal',
      },
      {
        displayName: 'Responsible Contractor ID',
        name: 'responsible_contractor_id',
        type: 'number',
        default: 0,
        description: 'ID of the responsible contractor',
      },
      {
        displayName: 'Submittal Manager ID',
        name: 'submittal_manager_id',
        type: 'number',
        default: 0,
        description: 'User ID of the submittal manager',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'dateTime',
        default: '',
        description: 'Due date for the submittal',
      },
      {
        displayName: 'Location ID',
        name: 'location_id',
        type: 'number',
        default: 0,
        description: 'Project location ID',
      },
      {
        displayName: 'Ball In Court ID',
        name: 'ball_in_court_id',
        type: 'number',
        default: 0,
        description: 'User ID who has the ball in court',
      },
    ],
  },
  // Update Submittal fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['submittal'],
        operation: ['updateSubmittal'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'Title of the submittal',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Description of the submittal',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Pending', value: 'pending' },
          { name: 'Approved', value: 'approved' },
          { name: 'Approved As Noted', value: 'approved_as_noted' },
          { name: 'Revise And Resubmit', value: 'revise_and_resubmit' },
          { name: 'Rejected', value: 'rejected' },
        ],
        default: 'draft',
        description: 'Submittal status',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'dateTime',
        default: '',
        description: 'Due date for the submittal',
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
        resource: ['submittal'],
        operation: ['listSubmittals', 'getSubmittalApprovers'],
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
        resource: ['submittal'],
        operation: ['listSubmittals', 'getSubmittalApprovers'],
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

export async function executeSubmittalOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;

  switch (operation) {
    case 'listSubmittals': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/submittals`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/submittals`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'getSubmittal': {
      const submittalId = this.getNodeParameter('submittalId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/submittals/${submittalId}`,
        companyId,
      });
      break;
    }

    case 'createSubmittal': {
      const title = this.getNodeParameter('title', itemIndex) as string;
      const specificationSectionId = this.getNodeParameter('specification_section_id', itemIndex) as number;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
      
      const body = {
        submittal: {
          title,
          specification_section_id: specificationSectionId,
          ...cleanObject(additionalFields),
        },
      };
      
      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/submittals`,
        companyId,
        body,
      });
      break;
    }

    case 'updateSubmittal': {
      const submittalId = this.getNodeParameter('submittalId', itemIndex) as number;
      const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/submittals/${submittalId}`,
        companyId,
        body: { submittal: cleanObject(updateFields) },
      });
      break;
    }

    case 'getSubmittalApprovers': {
      const submittalId = this.getNodeParameter('submittalId', itemIndex) as number;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/submittals/${submittalId}/approvers`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/submittals/${submittalId}/approvers`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'submitForApproval': {
      const submittalId = this.getNodeParameter('submittalId', itemIndex) as number;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/submittals/${submittalId}/submit`,
        companyId,
      });
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return toExecutionData(responseData, { item: itemIndex });
}
