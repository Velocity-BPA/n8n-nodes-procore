/**
 * Procore Correspondence Operations
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

export const correspondenceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['correspondence'],
			},
		},
		options: [
			{
				name: 'List Correspondence',
				value: 'listCorrespondence',
				description: 'List all correspondence items',
				action: 'List correspondence',
			},
			{
				name: 'Get Correspondence',
				value: 'getCorrespondence',
				description: 'Get a correspondence item by ID',
				action: 'Get correspondence',
			},
			{
				name: 'Create Correspondence',
				value: 'createCorrespondence',
				description: 'Create a new correspondence item',
				action: 'Create correspondence',
			},
			{
				name: 'Update Correspondence',
				value: 'updateCorrespondence',
				description: 'Update a correspondence item',
				action: 'Update correspondence',
			},
		],
		default: 'listCorrespondence',
	},
];

export const correspondenceFields: INodeProperties[] = [
	// ----------------------------------
	//         correspondence: listCorrespondence
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['correspondence'],
				operation: ['listCorrespondence'],
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
				resource: ['correspondence'],
				operation: ['listCorrespondence'],
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
				resource: ['correspondence'],
				operation: ['listCorrespondence'],
			},
		},
		options: [
			{
				displayName: 'Correspondence Type',
				name: 'correspondence_type',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Letter', value: 'letter' },
					{ name: 'Email', value: 'email' },
					{ name: 'Transmittal', value: 'transmittal' },
					{ name: 'Notice', value: 'notice' },
					{ name: 'Other', value: 'other' },
				],
				default: '',
				description: 'Filter by correspondence type',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Draft', value: 'draft' },
					{ name: 'Sent', value: 'sent' },
					{ name: 'Received', value: 'received' },
					{ name: 'Closed', value: 'closed' },
				],
				default: '',
				description: 'Filter by correspondence status',
			},
			{
				displayName: 'Created After',
				name: 'created_at_from',
				type: 'dateTime',
				default: '',
				description: 'Filter correspondence created after this date',
			},
			{
				displayName: 'Created Before',
				name: 'created_at_to',
				type: 'dateTime',
				default: '',
				description: 'Filter correspondence created before this date',
			},
		],
	},

	// ----------------------------------
	//         correspondence: getCorrespondence
	// ----------------------------------
	{
		displayName: 'Correspondence ID',
		name: 'correspondenceId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['correspondence'],
				operation: ['getCorrespondence', 'updateCorrespondence'],
			},
		},
		default: 0,
		description: 'The ID of the correspondence item',
	},

	// ----------------------------------
	//         correspondence: createCorrespondence
	// ----------------------------------
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['correspondence'],
				operation: ['createCorrespondence'],
			},
		},
		default: '',
		description: 'The subject of the correspondence',
	},
	{
		displayName: 'Correspondence Type',
		name: 'correspondenceType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['correspondence'],
				operation: ['createCorrespondence'],
			},
		},
		options: [
			{ name: 'Letter', value: 'letter' },
			{ name: 'Email', value: 'email' },
			{ name: 'Transmittal', value: 'transmittal' },
			{ name: 'Notice', value: 'notice' },
			{ name: 'Other', value: 'other' },
		],
		default: 'letter',
		description: 'The type of correspondence',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['correspondence'],
				operation: ['createCorrespondence'],
			},
		},
		options: [
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				description: 'The body content of the correspondence',
			},
			{
				displayName: 'Recipient IDs',
				name: 'recipient_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of recipient user IDs',
			},
			{
				displayName: 'CC IDs',
				name: 'cc_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of CC recipient user IDs',
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'The due date for response',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Draft', value: 'draft' },
					{ name: 'Sent', value: 'sent' },
				],
				default: 'draft',
				description: 'The initial status',
			},
			{
				displayName: 'Private',
				name: 'private',
				type: 'boolean',
				default: false,
				description: 'Whether the correspondence is private',
			},
			{
				displayName: 'Reference Number',
				name: 'number',
				type: 'string',
				default: '',
				description: 'The reference number',
			},
		],
	},

	// ----------------------------------
	//         correspondence: updateCorrespondence
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['correspondence'],
				operation: ['updateCorrespondence'],
			},
		},
		options: [
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'The subject of the correspondence',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				description: 'The body content of the correspondence',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Draft', value: 'draft' },
					{ name: 'Sent', value: 'sent' },
					{ name: 'Received', value: 'received' },
					{ name: 'Closed', value: 'closed' },
				],
				default: 'draft',
				description: 'The status of the correspondence',
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'The due date for response',
			},
			{
				displayName: 'Private',
				name: 'private',
				type: 'boolean',
				default: false,
				description: 'Whether the correspondence is private',
			},
		],
	},
];

export async function executeCorrespondenceOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const companyId = this.getNodeParameter('companyId', i) as number;
	const projectId = this.getNodeParameter('projectId', i) as number;

	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'listCorrespondence': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = cleanObject(filters);

			if (returnAll) {
				responseData = await procoreApiRequestAllItems.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/correspondence`,
					companyId,
					qs,
				});
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				qs.per_page = limit;
				responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/correspondence`,
					companyId,
					qs,
				});
			}
			break;
		}

		case 'getCorrespondence': {
			const correspondenceId = this.getNodeParameter('correspondenceId', i) as number;
			responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/correspondence/${correspondenceId}`,
					companyId,
				});
			break;
		}

		case 'createCorrespondence': {
			const subject = this.getNodeParameter('subject', i) as string;
			const correspondenceType = this.getNodeParameter('correspondenceType', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			// Process recipient_ids and cc_ids from comma-separated strings
			if (additionalFields.recipient_ids) {
				additionalFields.recipient_ids = (additionalFields.recipient_ids as string)
					.split(',')
					.map((id) => parseInt(id.trim(), 10))
					.filter((id) => !isNaN(id));
			}
			if (additionalFields.cc_ids) {
				additionalFields.cc_ids = (additionalFields.cc_ids as string)
					.split(',')
					.map((id) => parseInt(id.trim(), 10))
					.filter((id) => !isNaN(id));
			}

			const body: IDataObject = {
				correspondence: cleanObject({
					subject,
					correspondence_type: correspondenceType,
					...additionalFields,
				}),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'POST',
					endpoint: `/rest/v1.0/projects/${projectId}/correspondence`,
					companyId,
					body,
				});
			break;
		}

		case 'updateCorrespondence': {
			const correspondenceId = this.getNodeParameter('correspondenceId', i) as number;
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

			const body: IDataObject = {
				correspondence: cleanObject(updateFields),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'PATCH',
					endpoint: `/rest/v1.0/projects/${projectId}/correspondence/${correspondenceId}`,
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
