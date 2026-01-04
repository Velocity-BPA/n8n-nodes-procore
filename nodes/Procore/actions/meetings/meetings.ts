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

export const meetingOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['meeting'],
      },
    },
    options: [
      {
        name: 'Create Meeting',
        value: 'createMeeting',
        description: 'Create a new meeting',
        action: 'Create meeting',
      },
      {
        name: 'Get Meeting',
        value: 'getMeeting',
        description: 'Get a meeting by ID',
        action: 'Get meeting',
      },
      {
        name: 'Get Meeting Agenda',
        value: 'getMeetingAgenda',
        description: 'Get the agenda for a meeting',
        action: 'Get meeting agenda',
      },
      {
        name: 'Get Meeting Attendees',
        value: 'getMeetingAttendees',
        description: 'Get attendees for a meeting',
        action: 'Get meeting attendees',
      },
      {
        name: 'Get Meeting Minutes',
        value: 'getMeetingMinutes',
        description: 'Get the minutes for a meeting',
        action: 'Get meeting minutes',
      },
      {
        name: 'List Meetings',
        value: 'listMeetings',
        description: 'List all meetings for a project',
        action: 'List meetings',
      },
      {
        name: 'Update Meeting',
        value: 'updateMeeting',
        description: 'Update a meeting',
        action: 'Update meeting',
      },
    ],
    default: 'listMeetings',
  },
];

export const meetingFields: INodeProperties[] = [
  // Meeting ID - for single operations
  {
    displayName: 'Meeting ID',
    name: 'meetingId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['meeting'],
        operation: ['getMeeting', 'updateMeeting', 'getMeetingAgenda', 'getMeetingMinutes', 'getMeetingAttendees'],
      },
    },
    default: 0,
    description: 'The ID of the meeting',
  },
  // Create meeting fields
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['meeting'],
        operation: ['createMeeting'],
      },
    },
    default: '',
    description: 'Meeting title',
  },
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['meeting'],
        operation: ['createMeeting'],
      },
    },
    default: '',
    description: 'Meeting start date and time',
  },
  // Additional fields for create
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['meeting'],
        operation: ['createMeeting'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Meeting description',
      },
      {
        displayName: 'End Date',
        name: 'end_date',
        type: 'dateTime',
        default: '',
        description: 'Meeting end date and time',
      },
      {
        displayName: 'Location',
        name: 'location',
        type: 'string',
        default: '',
        description: 'Meeting location',
      },
      {
        displayName: 'Meeting Type',
        name: 'meeting_type',
        type: 'options',
        options: [
          { name: 'Project Meeting', value: 'project_meeting' },
          { name: 'Owner Meeting', value: 'owner_meeting' },
          { name: 'Subcontractor Meeting', value: 'subcontractor_meeting' },
          { name: 'Safety Meeting', value: 'safety_meeting' },
        ],
        default: 'project_meeting',
        description: 'Type of meeting',
      },
      {
        displayName: 'Private',
        name: 'private',
        type: 'boolean',
        default: false,
        description: 'Whether the meeting is private',
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
        resource: ['meeting'],
        operation: ['updateMeeting'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'Meeting title',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Meeting description',
      },
      {
        displayName: 'Start Date',
        name: 'start_date',
        type: 'dateTime',
        default: '',
        description: 'Meeting start date and time',
      },
      {
        displayName: 'End Date',
        name: 'end_date',
        type: 'dateTime',
        default: '',
        description: 'Meeting end date and time',
      },
      {
        displayName: 'Location',
        name: 'location',
        type: 'string',
        default: '',
        description: 'Meeting location',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Scheduled', value: 'scheduled' },
          { name: 'In Progress', value: 'in_progress' },
          { name: 'Completed', value: 'completed' },
          { name: 'Cancelled', value: 'cancelled' },
        ],
        default: 'scheduled',
        description: 'Meeting status',
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
        resource: ['meeting'],
        operation: ['listMeetings'],
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
        resource: ['meeting'],
        operation: ['listMeetings'],
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
  // Filters for list
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['meeting'],
        operation: ['listMeetings'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Meeting Type',
        name: 'meeting_type',
        type: 'options',
        options: [
          { name: 'Project Meeting', value: 'project_meeting' },
          { name: 'Owner Meeting', value: 'owner_meeting' },
          { name: 'Subcontractor Meeting', value: 'subcontractor_meeting' },
          { name: 'Safety Meeting', value: 'safety_meeting' },
        ],
        default: '',
        description: 'Filter by meeting type',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Scheduled', value: 'scheduled' },
          { name: 'In Progress', value: 'in_progress' },
          { name: 'Completed', value: 'completed' },
          { name: 'Cancelled', value: 'cancelled' },
        ],
        default: '',
        description: 'Filter by status',
      },
    ],
  },
];

export async function executeMeetingOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;

  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listMeetings': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      const qs: IDataObject = cleanObject(filters);

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/meetings`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        qs.per_page = limit;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/meetings`,
          companyId,
          qs,
        });
      }
      break;
    }

    case 'getMeeting': {
      const meetingId = this.getNodeParameter('meetingId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/meetings/${meetingId}`,
        companyId,
      });
      break;
    }

    case 'createMeeting': {
      const title = this.getNodeParameter('title', itemIndex) as string;
      const startDate = this.getNodeParameter('startDate', itemIndex) as string;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

      const body: IDataObject = {
        meeting: cleanObject({
          title,
          start_date: startDate,
          ...additionalFields,
        }),
      };

      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/meetings`,
        companyId,
        body,
      });
      break;
    }

    case 'updateMeeting': {
      const meetingId = this.getNodeParameter('meetingId', itemIndex) as number;
      const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

      const body: IDataObject = {
        meeting: cleanObject(updateFields),
      };

      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/meetings/${meetingId}`,
        companyId,
        body,
      });
      break;
    }

    case 'getMeetingAgenda': {
      const meetingId = this.getNodeParameter('meetingId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/meetings/${meetingId}/agenda_items`,
        companyId,
      });
      break;
    }

    case 'getMeetingMinutes': {
      const meetingId = this.getNodeParameter('meetingId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/meetings/${meetingId}/meeting_minutes`,
        companyId,
      });
      break;
    }

    case 'getMeetingAttendees': {
      const meetingId = this.getNodeParameter('meetingId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/meetings/${meetingId}/attendees`,
        companyId,
      });
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return toExecutionData(responseData, { item: itemIndex });
}
