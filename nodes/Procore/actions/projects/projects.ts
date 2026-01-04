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

export const projectOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['project'],
      },
    },
    options: [
      {
        name: 'Add Project User',
        value: 'addProjectUser',
        description: 'Add a user to a project',
        action: 'Add user to project',
      },
      {
        name: 'Create Project',
        value: 'createProject',
        description: 'Create a new project',
        action: 'Create a project',
      },
      {
        name: 'Get Project',
        value: 'getProject',
        description: 'Get a project by ID',
        action: 'Get a project',
      },
      {
        name: 'Get Project Roles',
        value: 'getProjectRoles',
        description: 'Get all roles in a project',
        action: 'Get project roles',
      },
      {
        name: 'Get Project Stages',
        value: 'getProjectStages',
        description: 'Get all stages for a project',
        action: 'Get project stages',
      },
      {
        name: 'Get Project Users',
        value: 'getProjectUsers',
        description: 'Get all users in a project',
        action: 'Get project users',
      },
      {
        name: 'List Projects',
        value: 'listProjects',
        description: 'List all projects',
        action: 'List projects',
      },
      {
        name: 'Remove Project User',
        value: 'removeProjectUser',
        description: 'Remove a user from a project',
        action: 'Remove user from project',
      },
      {
        name: 'Update Project',
        value: 'updateProject',
        description: 'Update a project',
        action: 'Update a project',
      },
    ],
    default: 'listProjects',
  },
];

export const projectFields: INodeProperties[] = [
  // Company ID for all project operations
  {
    displayName: 'Company ID',
    name: 'companyId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['project'],
      },
    },
    default: 0,
    description: 'The ID of the company',
  },
  // Project ID - for get, update, users, roles, stages operations
  {
    displayName: 'Project ID',
    name: 'projectId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['project'],
        operation: [
          'getProject',
          'updateProject',
          'getProjectUsers',
          'addProjectUser',
          'removeProjectUser',
          'getProjectStages',
          'getProjectRoles',
        ],
      },
    },
    default: 0,
    description: 'The ID of the project',
  },
  // User ID for add/remove user operations
  {
    displayName: 'User ID',
    name: 'userId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['project'],
        operation: ['addProjectUser', 'removeProjectUser'],
      },
    },
    default: 0,
    description: 'The ID of the user',
  },
  // Create Project fields
  {
    displayName: 'Project Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['project'],
        operation: ['createProject'],
      },
    },
    default: '',
    description: 'Name of the project',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['project'],
        operation: ['createProject'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'Project address',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
        description: 'Project city',
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
        displayName: 'Project Number',
        name: 'project_number',
        type: 'string',
        default: '',
        description: 'Project number/code',
      },
      {
        displayName: 'Start Date',
        name: 'start_date',
        type: 'dateTime',
        default: '',
        description: 'Project start date',
      },
      {
        displayName: 'Completion Date',
        name: 'completion_date',
        type: 'dateTime',
        default: '',
        description: 'Project completion date',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Project description',
      },
    ],
  },
  // Update Project fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['project'],
        operation: ['updateProject'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Project name',
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'Project address',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
        description: 'Project city',
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
        displayName: 'Project Number',
        name: 'project_number',
        type: 'string',
        default: '',
        description: 'Project number/code',
      },
      {
        displayName: 'Start Date',
        name: 'start_date',
        type: 'dateTime',
        default: '',
        description: 'Project start date',
      },
      {
        displayName: 'Completion Date',
        name: 'completion_date',
        type: 'dateTime',
        default: '',
        description: 'Project completion date',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Project description',
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the project is active',
      },
    ],
  },
  // Filters for list operations
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['project'],
        operation: ['listProjects'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Active Only',
        name: 'by_status',
        type: 'boolean',
        default: true,
        description: 'Whether to return only active projects',
      },
      {
        displayName: 'Stage ID',
        name: 'filters[stage_id]',
        type: 'number',
        default: 0,
        description: 'Filter by project stage ID',
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
        resource: ['project'],
        operation: ['listProjects', 'getProjectUsers', 'getProjectStages', 'getProjectRoles'],
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
        resource: ['project'],
        operation: ['listProjects', 'getProjectUsers', 'getProjectStages', 'getProjectRoles'],
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

export async function executeProjectOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;

  switch (operation) {
    case 'listProjects': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      
      const qs = cleanObject(filters);
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: '/projects',
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: '/projects',
          companyId,
          qs: { ...qs, per_page: limit },
        });
      }
      break;
    }

    case 'getProject': {
      const projectId = this.getNodeParameter('projectId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}`,
        companyId,
      });
      break;
    }

    case 'createProject': {
      const name = this.getNodeParameter('name', itemIndex) as string;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
      
      const body = {
        project: {
          name,
          ...cleanObject(additionalFields),
        },
      };
      
      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: '/projects',
        companyId,
        body,
      });
      break;
    }

    case 'updateProject': {
      const projectId = this.getNodeParameter('projectId', itemIndex) as number;
      const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}`,
        companyId,
        body: { project: cleanObject(updateFields) },
      });
      break;
    }

    case 'getProjectUsers': {
      const projectId = this.getNodeParameter('projectId', itemIndex) as number;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/users`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/users`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'addProjectUser': {
      const projectId = this.getNodeParameter('projectId', itemIndex) as number;
      const userId = this.getNodeParameter('userId', itemIndex) as number;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/users`,
        companyId,
        body: { user: { id: userId } },
      });
      break;
    }

    case 'removeProjectUser': {
      const projectId = this.getNodeParameter('projectId', itemIndex) as number;
      const userId = this.getNodeParameter('userId', itemIndex) as number;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'DELETE',
        endpoint: `/projects/${projectId}/users/${userId}`,
        companyId,
      });
      responseData = { success: true, userId, projectId };
      break;
    }

    case 'getProjectStages': {
      const projectId = this.getNodeParameter('projectId', itemIndex) as number;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/stages`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/stages`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'getProjectRoles': {
      const projectId = this.getNodeParameter('projectId', itemIndex) as number;
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/roles`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/roles`,
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
