/**
 * Procore Directory (Contacts) Operations
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

export const directoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['directory'],
			},
		},
		options: [
			{
				name: 'List Contacts',
				value: 'listContacts',
				description: 'List all contacts',
				action: 'List contacts',
			},
			{
				name: 'Get Contact',
				value: 'getContact',
				description: 'Get a contact by ID',
				action: 'Get contact',
			},
			{
				name: 'Create Contact',
				value: 'createContact',
				description: 'Create a new contact',
				action: 'Create contact',
			},
			{
				name: 'Update Contact',
				value: 'updateContact',
				description: 'Update a contact',
				action: 'Update contact',
			},
			{
				name: 'Delete Contact',
				value: 'deleteContact',
				description: 'Delete a contact',
				action: 'Delete contact',
			},
		],
		default: 'listContacts',
	},
];

export const directoryFields: INodeProperties[] = [
	// ----------------------------------
	//         directory: listContacts
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['directory'],
				operation: ['listContacts'],
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
				resource: ['directory'],
				operation: ['listContacts'],
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
				resource: ['directory'],
				operation: ['listContacts'],
			},
		},
		options: [
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search contacts by name or email',
			},
			{
				displayName: 'Vendor ID',
				name: 'vendor_id',
				type: 'number',
				default: 0,
				description: 'Filter by vendor ID',
			},
			{
				displayName: 'Is Active',
				name: 'is_active',
				type: 'boolean',
				default: true,
				description: 'Filter active contacts only',
			},
		],
	},

	// ----------------------------------
	//         directory: getContact
	// ----------------------------------
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['directory'],
				operation: ['getContact', 'updateContact', 'deleteContact'],
			},
		},
		default: 0,
		description: 'The ID of the contact',
	},

	// ----------------------------------
	//         directory: createContact
	// ----------------------------------
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['directory'],
				operation: ['createContact'],
			},
		},
		default: '',
		description: 'The first name of the contact',
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['directory'],
				operation: ['createContact'],
			},
		},
		default: '',
		description: 'The last name of the contact',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		displayOptions: {
			show: {
				resource: ['directory'],
				operation: ['createContact'],
			},
		},
		default: '',
		description: 'The email address of the contact',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['directory'],
				operation: ['createContact'],
			},
		},
		options: [
			{
				displayName: 'Job Title',
				name: 'job_title',
				type: 'string',
				default: '',
				description: 'The job title of the contact',
			},
			{
				displayName: 'Phone',
				name: 'business_phone',
				type: 'string',
				default: '',
				description: 'The business phone number',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobile_phone',
				type: 'string',
				default: '',
				description: 'The mobile phone number',
			},
			{
				displayName: 'Vendor ID',
				name: 'vendor_id',
				type: 'number',
				default: 0,
				description: 'The associated vendor ID',
			},
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				description: 'The street address',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'The city',
			},
			{
				displayName: 'State',
				name: 'state_code',
				type: 'string',
				default: '',
				description: 'The state/province code',
			},
			{
				displayName: 'Zip Code',
				name: 'zip',
				type: 'string',
				default: '',
				description: 'The postal/zip code',
			},
			{
				displayName: 'Country',
				name: 'country_code',
				type: 'string',
				default: 'US',
				description: 'The country code (e.g., US, CA)',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes about the contact',
			},
			{
				displayName: 'Is Active',
				name: 'is_active',
				type: 'boolean',
				default: true,
				description: 'Whether the contact is active',
			},
		],
	},

	// ----------------------------------
	//         directory: updateContact
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['directory'],
				operation: ['updateContact'],
			},
		},
		options: [
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				description: 'The first name of the contact',
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'The last name of the contact',
			},
			{
				displayName: 'Email',
				name: 'email_address',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'The email address of the contact',
			},
			{
				displayName: 'Job Title',
				name: 'job_title',
				type: 'string',
				default: '',
				description: 'The job title of the contact',
			},
			{
				displayName: 'Phone',
				name: 'business_phone',
				type: 'string',
				default: '',
				description: 'The business phone number',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobile_phone',
				type: 'string',
				default: '',
				description: 'The mobile phone number',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes about the contact',
			},
			{
				displayName: 'Is Active',
				name: 'is_active',
				type: 'boolean',
				default: true,
				description: 'Whether the contact is active',
			},
		],
	},
];

export async function executeDirectoryOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const companyId = this.getNodeParameter('companyId', i) as number;
	const projectId = this.getNodeParameter('projectId', i) as number;

	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'listContacts': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = cleanObject(filters);

			if (returnAll) {
				responseData = await procoreApiRequestAllItems.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/directory/people`,
					companyId,
					qs,
				});
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				qs.per_page = limit;
				responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/directory/people`,
					companyId,
					qs,
				});
			}
			break;
		}

		case 'getContact': {
			const contactId = this.getNodeParameter('contactId', i) as number;
			responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/directory/people/${contactId}`,
					companyId,
				});
			break;
		}

		case 'createContact': {
			const firstName = this.getNodeParameter('firstName', i) as string;
			const lastName = this.getNodeParameter('lastName', i) as string;
			const email = this.getNodeParameter('email', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const body: IDataObject = {
				person: cleanObject({
					first_name: firstName,
					last_name: lastName,
					email_address: email,
					...additionalFields,
				}),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'POST',
					endpoint: `/rest/v1.0/projects/${projectId}/directory/people`,
					companyId,
					body,
				});
			break;
		}

		case 'updateContact': {
			const contactId = this.getNodeParameter('contactId', i) as number;
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

			const body: IDataObject = {
				person: cleanObject(updateFields),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'PATCH',
					endpoint: `/rest/v1.0/projects/${projectId}/directory/people/${contactId}`,
					companyId,
					body,
				});
			break;
		}

		case 'deleteContact': {
			const contactId = this.getNodeParameter('contactId', i) as number;
			await procoreApiRequest.call(this, {
					method: 'DELETE',
					endpoint: `/rest/v1.0/projects/${projectId}/directory/people/${contactId}`,
					companyId,
				});
			responseData = { success: true, id: contactId };
			break;
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}

	return toExecutionData(responseData, { item: i });
}
