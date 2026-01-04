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

export const jobOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['job'],
      },
    },
    options: [
      {
        name: 'Create Job',
        value: 'createJob',
        description: 'Create a new job',
        action: 'Create a job',
      },
      {
        name: 'Get Job',
        value: 'getJob',
        description: 'Get a job by ID',
        action: 'Get a job',
      },
      {
        name: 'Get Job Budget',
        value: 'getJobBudget',
        description: 'Get budget for a job',
        action: 'Get job budget',
      },
      {
        name: 'Get Job Costs',
        value: 'getJobCosts',
        description: 'Get costs for a job',
        action: 'Get job costs',
      },
      {
        name: 'List Jobs',
        value: 'listJobs',
        description: 'List all jobs/work breakdown',
        action: 'List jobs',
      },
      {
        name: 'Update Job',
        value: 'updateJob',
        description: 'Update an existing job',
        action: 'Update a job',
      },
    ],
    default: 'listJobs',
  },
];

export const jobFields: INodeProperties[] = [
  {
    displayName: 'Job ID',
    name: 'jobId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['job'],
        operation: ['getJob', 'updateJob', 'getJobCosts', 'getJobBudget'],
      },
    },
    default: '',
    description: 'The ID of the job',
  },
  {
    displayName: 'Job Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['job'],
        operation: ['createJob'],
      },
    },
    default: '',
    description: 'Name of the job',
  },
  {
    displayName: 'Job Code',
    name: 'code',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['job'],
        operation: ['createJob'],
      },
    },
    default: '',
    description: 'Code for the job',
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['job'],
        operation: ['updateJob'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Code',
        name: 'code',
        type: 'string',
        default: '',
        description: 'Code for the job',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the job',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Name of the job',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Active', value: 'active' },
          { name: 'Completed', value: 'completed' },
          { name: 'Inactive', value: 'inactive' },
        ],
        default: 'active',
        description: 'Status of the job',
      },
    ],
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['job'],
        operation: ['createJob'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the job',
      },
      {
        displayName: 'End Date',
        name: 'end_date',
        type: 'dateTime',
        default: '',
        description: 'End date of the job',
      },
      {
        displayName: 'Parent Job ID',
        name: 'parent_id',
        type: 'string',
        default: '',
        description: 'ID of the parent job',
      },
      {
        displayName: 'Start Date',
        name: 'start_date',
        type: 'dateTime',
        default: '',
        description: 'Start date of the job',
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
        resource: ['job'],
        operation: ['listJobs'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Parent Job ID',
        name: 'parent_id',
        type: 'string',
        default: '',
        description: 'Filter by parent job',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Active', value: 'active' },
          { name: 'Completed', value: 'completed' },
          { name: 'Inactive', value: 'inactive' },
        ],
        default: 'active',
        description: 'Filter by status',
      },
    ],
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['job'],
        operation: ['listJobs', 'getJobCosts'],
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
        resource: ['job'],
        operation: ['listJobs', 'getJobCosts'],
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

export async function executeJobOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listJobs': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      const qs: IDataObject = cleanObject(filters);

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/work_breakdown_structure/flat_cost_codes`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        qs.per_page = limit;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/work_breakdown_structure/flat_cost_codes`,
          companyId,
          qs,
        });
      }
      break;
    }

    case 'getJob': {
      const jobId = this.getNodeParameter('jobId', itemIndex) as string;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/work_breakdown_structure/flat_cost_codes/${jobId}`,
        companyId,
      });
      break;
    }

    case 'createJob': {
      const name = this.getNodeParameter('name', itemIndex) as string;
      const code = this.getNodeParameter('code', itemIndex) as string;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

      const body: IDataObject = {
        cost_code: cleanObject({
          name,
          code,
          ...additionalFields,
        }),
      };

      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/work_breakdown_structure/flat_cost_codes`,
        companyId,
        body,
      });
      break;
    }

    case 'updateJob': {
      const jobId = this.getNodeParameter('jobId', itemIndex) as string;
      const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

      const body: IDataObject = {
        cost_code: cleanObject(updateFields),
      };

      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/work_breakdown_structure/flat_cost_codes/${jobId}`,
        companyId,
        body,
      });
      break;
    }

    case 'getJobCosts': {
      const jobId = this.getNodeParameter('jobId', itemIndex) as string;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const qs: IDataObject = {
        'filters[cost_code_id]': jobId,
      };

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/budget/budget_line_items`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        qs.per_page = limit;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/budget/budget_line_items`,
          companyId,
          qs,
        });
      }
      break;
    }

    case 'getJobBudget': {
      const jobId = this.getNodeParameter('jobId', itemIndex) as string;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/budget/budget_line_items`,
        companyId,
        qs: { 'filters[cost_code_id]': jobId },
      });
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return toExecutionData(responseData, { item: itemIndex });
}
