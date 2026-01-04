/**
 * n8n-nodes-procore
 * Copyright (c) 2025 Velocity BPA
 * Licensed under the Business Source License 1.1 (BSL 1.1)
 * See LICENSE file for details
 */

import type {
	INodeProperties,
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
} from 'n8n-workflow';
import { procoreApiRequest, procoreApiRequestAllItems } from '../../transport/procoreApi';
import { toExecutionData, cleanObject } from '../../utils/helpers';

export const observationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['observation'],
			},
		},
		options: [
			{
				name: 'List Observations',
				value: 'listObservations',
				description: 'List all observations',
				action: 'List observations',
			},
			{
				name: 'Get Observation',
				value: 'getObservation',
				description: 'Get an observation by ID',
				action: 'Get observation',
			},
			{
				name: 'Create Observation',
				value: 'createObservation',
				description: 'Create a new observation',
				action: 'Create observation',
			},
			{
				name: 'Update Observation',
				value: 'updateObservation',
				description: 'Update an existing observation',
				action: 'Update observation',
			},
			{
				name: 'Get Observation Types',
				value: 'getObservationTypes',
				description: 'Get all observation types',
				action: 'Get observation types',
			},
		],
		default: 'listObservations',
	},
];

export const observationFields: INodeProperties[] = [
	// Observation ID field
	{
		displayName: 'Observation ID',
		name: 'observationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['observation'],
				operation: ['getObservation', 'updateObservation'],
			},
		},
		default: '',
		description: 'The ID of the observation',
	},
	// Create observation fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['observation'],
				operation: ['createObservation'],
			},
		},
		default: '',
		description: 'Title of the observation',
	},
	{
		displayName: 'Observation Type ID',
		name: 'type_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['observation'],
				operation: ['createObservation'],
			},
		},
		default: '',
		description: 'ID of the observation type',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['observation'],
				operation: ['createObservation'],
			},
		},
		options: [
			{ name: 'Open', value: 'open' },
			{ name: 'Ready for Review', value: 'ready_for_review' },
			{ name: 'Closed', value: 'closed' },
			{ name: 'Not Applicable', value: 'not_applicable' },
		],
		default: 'open',
		description: 'Status of the observation',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['observation'],
				operation: ['createObservation'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the observation',
			},
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'ID of the user to assign',
			},
			{
				displayName: 'Location ID',
				name: 'location_id',
				type: 'string',
				default: '',
				description: 'ID of the location',
			},
			{
				displayName: 'Trade ID',
				name: 'trade_id',
				type: 'string',
				default: '',
				description: 'ID of the trade',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				options: [
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'High', value: 'high' },
				],
				default: 'medium',
				description: 'Priority of the observation',
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'Due date for the observation',
			},
			{
				displayName: 'Contributing Behavior ID',
				name: 'contributing_behavior_id',
				type: 'string',
				default: '',
				description: 'ID of the contributing behavior',
			},
			{
				displayName: 'Contributing Condition ID',
				name: 'contributing_condition_id',
				type: 'string',
				default: '',
				description: 'ID of the contributing condition',
			},
		],
	},
	// Update observation fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['observation'],
				operation: ['updateObservation'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title of the observation',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the observation',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Open', value: 'open' },
					{ name: 'Ready for Review', value: 'ready_for_review' },
					{ name: 'Closed', value: 'closed' },
					{ name: 'Not Applicable', value: 'not_applicable' },
				],
				default: 'open',
				description: 'Status of the observation',
			},
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'ID of the user to assign',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				options: [
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'High', value: 'high' },
				],
				default: 'medium',
				description: 'Priority of the observation',
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'Due date for the observation',
			},
		],
	},
	// List filters
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['observation'],
				operation: ['listObservations'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: [
					{ name: 'Open', value: 'open' },
					{ name: 'Ready for Review', value: 'ready_for_review' },
					{ name: 'Closed', value: 'closed' },
					{ name: 'Not Applicable', value: 'not_applicable' },
				],
				default: [],
				description: 'Filter by status',
			},
			{
				displayName: 'Type ID',
				name: 'type_id',
				type: 'string',
				default: '',
				description: 'Filter by observation type',
			},
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'Filter by assignee',
			},
			{
				displayName: 'Location ID',
				name: 'location_id',
				type: 'string',
				default: '',
				description: 'Filter by location',
			},
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter observations created after this date',
			},
			{
				displayName: 'Created Before',
				name: 'created_before',
				type: 'dateTime',
				default: '',
				description: 'Filter observations created before this date',
			},
		],
	},
	// Pagination
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['observation'],
				operation: ['listObservations', 'getObservationTypes'],
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
				resource: ['observation'],
				operation: ['listObservations', 'getObservationTypes'],
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

export async function executeObservationOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const companyId = this.getNodeParameter('companyId', i) as number;
	const projectId = this.getNodeParameter('projectId', i) as number;
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'listObservations': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = cleanObject({});

			// Apply filters
			if (filters.status && (filters.status as string[]).length > 0) {
				qs['filters[status][]'] = filters.status;
			}
			if (filters.type_id) {
				qs['filters[type_id]'] = filters.type_id;
			}
			if (filters.assignee_id) {
				qs['filters[assignee_id]'] = filters.assignee_id;
			}
			if (filters.location_id) {
				qs['filters[location_id]'] = filters.location_id;
			}
			if (filters.created_after) {
				qs['filters[created_at][gt]'] = filters.created_after;
			}
			if (filters.created_before) {
				qs['filters[created_at][lt]'] = filters.created_before;
			}

			if (returnAll) {
				responseData = await procoreApiRequestAllItems.call(this, {
					method: 'GET',
					endpoint: `/projects/${projectId}/observations/items`,
					companyId,
					qs,
				});
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				qs.per_page = limit;
				responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/projects/${projectId}/observations/items`,
					companyId,
					qs,
				});
			}
			break;
		}

		case 'getObservation': {
			const observationId = this.getNodeParameter('observationId', i) as string;
			responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/projects/${projectId}/observations/items/${observationId}`,
					companyId,
				});
			break;
		}

		case 'createObservation': {
			const title = this.getNodeParameter('title', i) as string;
			const typeId = this.getNodeParameter('type_id', i) as string;
			const status = this.getNodeParameter('status', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const body: IDataObject = {
				observation_item: cleanObject({
					name: title,
					type_id: typeId,
					status,
					...additionalFields,
				}),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'POST',
					endpoint: `/projects/${projectId}/observations/items`,
					companyId,
					body,
				});
			break;
		}

		case 'updateObservation': {
			const observationId = this.getNodeParameter('observationId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

			// Map title to name for API
			if (updateFields.title) {
				updateFields.name = updateFields.title;
				delete updateFields.title;
			}

			const body: IDataObject = {
				observation_item: cleanObject(updateFields),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'PATCH',
					endpoint: `/projects/${projectId}/observations/items/${observationId}`,
					companyId,
					body,
				});
			break;
		}

		case 'getObservationTypes': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const qs: IDataObject = {};

			if (returnAll) {
				responseData = await procoreApiRequestAllItems.call(this, {
					method: 'GET',
					endpoint: `/projects/${projectId}/observations/types`,
					companyId,
					qs,
				});
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				qs.per_page = limit;
				responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/projects/${projectId}/observations/types`,
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
