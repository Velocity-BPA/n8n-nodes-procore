/**
 * Procore Schedule Operations
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing
 * or contact licensing@velobpa.com.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { procoreApiRequest, procoreApiRequestAllItems } from '../../transport/procoreApi';
import { toExecutionData, cleanObject } from '../../utils/helpers';

export const scheduleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
			},
		},
		options: [
			{
				name: 'Get Schedule',
				value: 'getSchedule',
				description: 'Get the project schedule',
				action: 'Get schedule',
			},
			{
				name: 'List Schedule Tasks',
				value: 'listScheduleTasks',
				description: 'List all schedule tasks',
				action: 'List schedule tasks',
			},
			{
				name: 'Get Schedule Task',
				value: 'getScheduleTask',
				description: 'Get a schedule task by ID',
				action: 'Get schedule task',
			},
			{
				name: 'Update Schedule Task',
				value: 'updateScheduleTask',
				description: 'Update a schedule task',
				action: 'Update schedule task',
			},
			{
				name: 'List Schedule Milestones',
				value: 'listScheduleMilestones',
				description: 'List all schedule milestones',
				action: 'List schedule milestones',
			},
		],
		default: 'getSchedule',
	},
];

export const scheduleFields: INodeProperties[] = [
	// ----------------------------------
	//         schedule: listScheduleTasks
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['listScheduleTasks', 'listScheduleMilestones'],
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
				resource: ['schedule'],
				operation: ['listScheduleTasks', 'listScheduleMilestones'],
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
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['listScheduleTasks'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Not Started', value: 'not_started' },
					{ name: 'In Progress', value: 'in_progress' },
					{ name: 'Complete', value: 'complete' },
					{ name: 'On Hold', value: 'on_hold' },
				],
				default: '',
				description: 'Filter by task status',
			},
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'number',
				default: 0,
				description: 'Filter by assignee user ID',
			},
			{
				displayName: 'Start Date From',
				name: 'start_date_from',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks starting from this date',
			},
			{
				displayName: 'Start Date To',
				name: 'start_date_to',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks starting until this date',
			},
			{
				displayName: 'Is Critical',
				name: 'is_critical',
				type: 'boolean',
				default: false,
				description: 'Filter for critical path tasks only',
			},
		],
	},

	// ----------------------------------
	//         schedule: getScheduleTask / updateScheduleTask
	// ----------------------------------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['getScheduleTask', 'updateScheduleTask'],
			},
		},
		default: 0,
		description: 'The ID of the schedule task',
	},

	// ----------------------------------
	//         schedule: updateScheduleTask
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['updateScheduleTask'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The name of the task',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description of the task',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Not Started', value: 'not_started' },
					{ name: 'In Progress', value: 'in_progress' },
					{ name: 'Complete', value: 'complete' },
					{ name: 'On Hold', value: 'on_hold' },
				],
				default: 'not_started',
				description: 'The status of the task',
			},
			{
				displayName: 'Start Date',
				name: 'start_date',
				type: 'dateTime',
				default: '',
				description: 'The start date of the task',
			},
			{
				displayName: 'End Date',
				name: 'finish_date',
				type: 'dateTime',
				default: '',
				description: 'The finish date of the task',
			},
			{
				displayName: 'Actual Start Date',
				name: 'actual_start_date',
				type: 'dateTime',
				default: '',
				description: 'The actual start date of the task',
			},
			{
				displayName: 'Actual Finish Date',
				name: 'actual_finish_date',
				type: 'dateTime',
				default: '',
				description: 'The actual finish date of the task',
			},
			{
				displayName: 'Percent Complete',
				name: 'percent_complete',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 0,
				description: 'The percentage of completion (0-100)',
			},
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'number',
				default: 0,
				description: 'The ID of the assigned user',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes for the task',
			},
		],
	},
];

export async function executeScheduleOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const companyId = this.getNodeParameter('companyId', i) as number;
	const projectId = this.getNodeParameter('projectId', i) as number;

	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'getSchedule': {
			responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/schedule`,
					companyId,
				});
			break;
		}

		case 'listScheduleTasks': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = cleanObject(filters);

			if (returnAll) {
				responseData = await procoreApiRequestAllItems.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/schedule/tasks`,
					companyId,
					qs,
				});
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				qs.per_page = limit;
				responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/schedule/tasks`,
					companyId,
					qs,
				});
			}
			break;
		}

		case 'getScheduleTask': {
			const taskId = this.getNodeParameter('taskId', i) as number;
			responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/schedule/tasks/${taskId}`,
					companyId,
				});
			break;
		}

		case 'updateScheduleTask': {
			const taskId = this.getNodeParameter('taskId', i) as number;
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

			const body: IDataObject = {
				task: cleanObject(updateFields),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'PATCH',
					endpoint: `/rest/v1.0/projects/${projectId}/schedule/tasks/${taskId}`,
					companyId,
					body,
				});
			break;
		}

		case 'listScheduleMilestones': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await procoreApiRequestAllItems.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/schedule/milestones`,
					companyId,
				});
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				const qs: IDataObject = { per_page: limit };
				responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/schedule/milestones`,
					companyId,
					qs,
				});
			}
			break;
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}

	return toExecutionData(responseData, { item: i });
}
