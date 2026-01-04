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
import { toExecutionData, cleanObject, formatDateShort } from '../../utils/helpers';

export const dailyLogOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['dailyLog'],
      },
    },
    options: [
      {
        name: 'Create Daily Log',
        value: 'createDailyLog',
        description: 'Create a new daily log entry',
        action: 'Create a daily log',
      },
      {
        name: 'Get Daily Log',
        value: 'getDailyLog',
        description: 'Get a daily log by ID',
        action: 'Get a daily log',
      },
      {
        name: 'Get Manpower Logs',
        value: 'getManpowerLogs',
        description: 'Get manpower entries for a date',
        action: 'Get manpower logs',
      },
      {
        name: 'Get Weather Logs',
        value: 'getWeatherLogs',
        description: 'Get weather entries for a date',
        action: 'Get weather logs',
      },
      {
        name: 'List Daily Logs',
        value: 'listDailyLogs',
        description: 'List all daily logs in a project',
        action: 'List daily logs',
      },
      {
        name: 'Update Daily Log',
        value: 'updateDailyLog',
        description: 'Update a daily log',
        action: 'Update a daily log',
      },
    ],
    default: 'listDailyLogs',
  },
];

export const dailyLogFields: INodeProperties[] = [
  {
    displayName: 'Company ID',
    name: 'companyId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['dailyLog'],
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
        resource: ['dailyLog'],
      },
    },
    default: 0,
    description: 'The ID of the project',
  },
  {
    displayName: 'Daily Log ID',
    name: 'dailyLogId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['dailyLog'],
        operation: ['getDailyLog', 'updateDailyLog'],
      },
    },
    default: 0,
    description: 'The ID of the daily log',
  },
  // Date for weather/manpower logs
  {
    displayName: 'Log Date',
    name: 'logDate',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['dailyLog'],
        operation: ['getWeatherLogs', 'getManpowerLogs', 'createDailyLog'],
      },
    },
    default: '',
    description: 'The date for the log entries',
  },
  // Create Daily Log fields
  {
    displayName: 'Notes',
    name: 'notes',
    type: 'string',
    typeOptions: {
      rows: 4,
    },
    displayOptions: {
      show: {
        resource: ['dailyLog'],
        operation: ['createDailyLog'],
      },
    },
    default: '',
    description: 'Notes for the daily log',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['dailyLog'],
        operation: ['createDailyLog'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Weather Conditions',
        name: 'weather_conditions',
        type: 'string',
        default: '',
        description: 'Weather conditions for the day',
      },
      {
        displayName: 'Temperature High',
        name: 'temperature_high',
        type: 'number',
        default: 0,
        description: 'High temperature for the day',
      },
      {
        displayName: 'Temperature Low',
        name: 'temperature_low',
        type: 'number',
        default: 0,
        description: 'Low temperature for the day',
      },
      {
        displayName: 'Workers On Site',
        name: 'workers_on_site',
        type: 'number',
        default: 0,
        description: 'Number of workers on site',
      },
    ],
  },
  // Update Daily Log fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['dailyLog'],
        operation: ['updateDailyLog'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Notes for the daily log',
      },
      {
        displayName: 'Weather Conditions',
        name: 'weather_conditions',
        type: 'string',
        default: '',
        description: 'Weather conditions for the day',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Pending Approval', value: 'pending_approval' },
          { name: 'Approved', value: 'approved' },
        ],
        default: 'draft',
        description: 'Status of the daily log',
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
        resource: ['dailyLog'],
        operation: ['listDailyLogs', 'getWeatherLogs', 'getManpowerLogs'],
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
        resource: ['dailyLog'],
        operation: ['listDailyLogs', 'getWeatherLogs', 'getManpowerLogs'],
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
  // Date range filters
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['dailyLog'],
        operation: ['listDailyLogs'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Start Date',
        name: 'filters[start_date]',
        type: 'dateTime',
        default: '',
        description: 'Filter logs from this date',
      },
      {
        displayName: 'End Date',
        name: 'filters[end_date]',
        type: 'dateTime',
        default: '',
        description: 'Filter logs until this date',
      },
    ],
  },
];

export async function executeDailyLogOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;

  switch (operation) {
    case 'listDailyLogs': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      
      const qs = cleanObject(filters);
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/daily_logs`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/daily_logs`,
          companyId,
          qs: { ...qs, per_page: limit },
        });
      }
      break;
    }

    case 'getDailyLog': {
      const dailyLogId = this.getNodeParameter('dailyLogId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/daily_logs/${dailyLogId}`,
        companyId,
      });
      break;
    }

    case 'createDailyLog': {
      const logDate = this.getNodeParameter('logDate', itemIndex) as string;
      const notes = this.getNodeParameter('notes', itemIndex, '') as string;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
      
      const body = {
        daily_log: {
          log_date: formatDateShort(logDate),
          notes,
          ...cleanObject(additionalFields),
        },
      };
      
      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/daily_logs`,
        companyId,
        body,
      });
      break;
    }

    case 'updateDailyLog': {
      const dailyLogId = this.getNodeParameter('dailyLogId', itemIndex) as number;
      const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/daily_logs/${dailyLogId}`,
        companyId,
        body: { daily_log: cleanObject(updateFields) },
      });
      break;
    }

    case 'getWeatherLogs': {
      const logDate = this.getNodeParameter('logDate', itemIndex) as string;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      const qs = { log_date: formatDateShort(logDate) };
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/daily_logs/weather_logs`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/daily_logs/weather_logs`,
          companyId,
          qs: { ...qs, per_page: limit },
        });
      }
      break;
    }

    case 'getManpowerLogs': {
      const logDate = this.getNodeParameter('logDate', itemIndex) as string;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      const qs = { log_date: formatDateShort(logDate) };
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/daily_logs/manpower_logs`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/daily_logs/manpower_logs`,
          companyId,
          qs: { ...qs, per_page: limit },
        });
      }
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return toExecutionData(responseData, { item: itemIndex });
}
