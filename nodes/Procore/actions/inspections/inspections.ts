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

export const inspectionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['inspection'],
			},
		},
		options: [
			{
				name: 'List Inspections',
				value: 'listInspections',
				description: 'List all inspections',
				action: 'List inspections',
			},
			{
				name: 'Get Inspection',
				value: 'getInspection',
				description: 'Get an inspection by ID',
				action: 'Get inspection',
			},
			{
				name: 'Create Inspection',
				value: 'createInspection',
				description: 'Create a new inspection',
				action: 'Create inspection',
			},
			{
				name: 'Update Inspection',
				value: 'updateInspection',
				description: 'Update an existing inspection',
				action: 'Update inspection',
			},
			{
				name: 'Get Inspection Checklists',
				value: 'getInspectionChecklists',
				description: 'Get all inspection checklists',
				action: 'Get inspection checklists',
			},
			{
				name: 'Create Inspection Checklist',
				value: 'createInspectionChecklist',
				description: 'Create a new inspection checklist',
				action: 'Create inspection checklist',
			},
		],
		default: 'listInspections',
	},
];

export const inspectionFields: INodeProperties[] = [
	// Inspection ID field
	{
		displayName: 'Inspection ID',
		name: 'inspectionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['inspection'],
				operation: ['getInspection', 'updateInspection'],
			},
		},
		default: '',
		description: 'The ID of the inspection',
	},
	// Create inspection fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['inspection'],
				operation: ['createInspection'],
			},
		},
		default: '',
		description: 'Title of the inspection',
	},
	{
		displayName: 'Checklist ID',
		name: 'checklist_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['inspection'],
				operation: ['createInspection'],
			},
		},
		default: '',
		description: 'ID of the inspection checklist template',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['inspection'],
				operation: ['createInspection'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the inspection',
			},
			{
				displayName: 'Inspector ID',
				name: 'inspector_id',
				type: 'string',
				default: '',
				description: 'ID of the inspector',
			},
			{
				displayName: 'Responsible Contractor ID',
				name: 'responsible_contractor_id',
				type: 'string',
				default: '',
				description: 'ID of the responsible contractor',
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
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'Due date for the inspection',
			},
			{
				displayName: 'Inspection Date',
				name: 'inspection_date',
				type: 'dateTime',
				default: '',
				description: 'Date of the inspection',
			},
		],
	},
	// Update inspection fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['inspection'],
				operation: ['updateInspection'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Title',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Title of the inspection',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the inspection',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Not Started', value: 'not_started' },
					{ name: 'In Progress', value: 'in_progress' },
					{ name: 'Ready for Review', value: 'ready_for_review' },
					{ name: 'Passed', value: 'passed' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Closed', value: 'closed' },
				],
				default: 'not_started',
				description: 'Status of the inspection',
			},
			{
				displayName: 'Inspector ID',
				name: 'inspector_id',
				type: 'string',
				default: '',
				description: 'ID of the inspector',
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'Due date for the inspection',
			},
			{
				displayName: 'Inspection Date',
				name: 'inspection_date',
				type: 'dateTime',
				default: '',
				description: 'Date of the inspection',
			},
		],
	},
	// Create checklist fields
	{
		displayName: 'Checklist Name',
		name: 'checklistName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['inspection'],
				operation: ['createInspectionChecklist'],
			},
		},
		default: '',
		description: 'Name of the inspection checklist',
	},
	{
		displayName: 'Checklist Options',
		name: 'checklistOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['inspection'],
				operation: ['createInspectionChecklist'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the checklist',
			},
			{
				displayName: 'Trade ID',
				name: 'trade_id',
				type: 'string',
				default: '',
				description: 'ID of the trade',
			},
			{
				displayName: 'Inspection Type',
				name: 'inspection_type',
				type: 'options',
				options: [
					{ name: 'Quality', value: 'quality' },
					{ name: 'Safety', value: 'safety' },
					{ name: 'Commissioning', value: 'commissioning' },
					{ name: 'Punch', value: 'punch' },
					{ name: 'Other', value: 'other' },
				],
				default: 'quality',
				description: 'Type of inspection',
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
				resource: ['inspection'],
				operation: ['listInspections'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: [
					{ name: 'Not Started', value: 'not_started' },
					{ name: 'In Progress', value: 'in_progress' },
					{ name: 'Ready for Review', value: 'ready_for_review' },
					{ name: 'Passed', value: 'passed' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Closed', value: 'closed' },
				],
				default: [],
				description: 'Filter by status',
			},
			{
				displayName: 'Checklist ID',
				name: 'checklist_id',
				type: 'string',
				default: '',
				description: 'Filter by checklist template',
			},
			{
				displayName: 'Inspector ID',
				name: 'inspector_id',
				type: 'string',
				default: '',
				description: 'Filter by inspector',
			},
			{
				displayName: 'Location ID',
				name: 'location_id',
				type: 'string',
				default: '',
				description: 'Filter by location',
			},
			{
				displayName: 'Due Date From',
				name: 'due_date_from',
				type: 'dateTime',
				default: '',
				description: 'Filter inspections due from this date',
			},
			{
				displayName: 'Due Date To',
				name: 'due_date_to',
				type: 'dateTime',
				default: '',
				description: 'Filter inspections due until this date',
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
				resource: ['inspection'],
				operation: ['listInspections', 'getInspectionChecklists'],
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
				resource: ['inspection'],
				operation: ['listInspections', 'getInspectionChecklists'],
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

export async function executeInspectionOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const companyId = this.getNodeParameter('companyId', i) as number;
	const projectId = this.getNodeParameter('projectId', i) as number;
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'listInspections': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = cleanObject({});

			// Apply filters
			if (filters.status && (filters.status as string[]).length > 0) {
				qs['filters[status][]'] = filters.status;
			}
			if (filters.checklist_id) {
				qs['filters[checklist_id]'] = filters.checklist_id;
			}
			if (filters.inspector_id) {
				qs['filters[inspector_id]'] = filters.inspector_id;
			}
			if (filters.location_id) {
				qs['filters[location_id]'] = filters.location_id;
			}
			if (filters.due_date_from) {
				qs['filters[due_date][gte]'] = filters.due_date_from;
			}
			if (filters.due_date_to) {
				qs['filters[due_date][lte]'] = filters.due_date_to;
			}

			if (returnAll) {
				responseData = await procoreApiRequestAllItems.call(this, {
					method: 'GET',
					endpoint: `/projects/${projectId}/inspections`,
					companyId,
					qs,
				});
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				qs.per_page = limit;
				responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/projects/${projectId}/inspections`,
					companyId,
					qs,
				});
			}
			break;
		}

		case 'getInspection': {
			const inspectionId = this.getNodeParameter('inspectionId', i) as string;
			responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/projects/${projectId}/inspections/${inspectionId}`,
					companyId,
				});
			break;
		}

		case 'createInspection': {
			const title = this.getNodeParameter('title', i) as string;
			const checklistId = this.getNodeParameter('checklist_id', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const body: IDataObject = {
				inspection: cleanObject({
					name: title,
					checklist_id: checklistId,
					...additionalFields,
				}),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'POST',
					endpoint: `/projects/${projectId}/inspections`,
					companyId,
					body,
				});
			break;
		}

		case 'updateInspection': {
			const inspectionId = this.getNodeParameter('inspectionId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

			const body: IDataObject = {
				inspection: cleanObject(updateFields),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'PATCH',
					endpoint: `/projects/${projectId}/inspections/${inspectionId}`,
					companyId,
					body,
				});
			break;
		}

		case 'getInspectionChecklists': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const qs: IDataObject = {};

			if (returnAll) {
				responseData = await procoreApiRequestAllItems.call(this, {
					method: 'GET',
					endpoint: `/projects/${projectId}/checklists/templates`,
					companyId,
					qs,
				});
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				qs.per_page = limit;
				responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/projects/${projectId}/checklists/templates`,
					companyId,
					qs,
				});
			}
			break;
		}

		case 'createInspectionChecklist': {
			const checklistName = this.getNodeParameter('checklistName', i) as string;
			const checklistOptions = this.getNodeParameter('checklistOptions', i, {}) as IDataObject;

			const body: IDataObject = {
				checklist_template: cleanObject({
					name: checklistName,
					...checklistOptions,
				}),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'POST',
					endpoint: `/projects/${projectId}/checklists/templates`,
					companyId,
					body,
				});
			break;
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}

	return toExecutionData(responseData, { item: i });
}
