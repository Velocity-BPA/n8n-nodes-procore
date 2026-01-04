/**
 * Procore Invoices Operations
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

export const invoiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
			},
		},
		options: [
			{
				name: 'List Invoices',
				value: 'listInvoices',
				description: 'List all invoices for a project',
				action: 'List invoices',
			},
			{
				name: 'Get Invoice',
				value: 'getInvoice',
				description: 'Get an invoice by ID',
				action: 'Get invoice',
			},
			{
				name: 'Create Invoice',
				value: 'createInvoice',
				description: 'Create a new invoice',
				action: 'Create invoice',
			},
			{
				name: 'Update Invoice',
				value: 'updateInvoice',
				description: 'Update an invoice',
				action: 'Update invoice',
			},
			{
				name: 'Submit Invoice',
				value: 'submitInvoice',
				description: 'Submit an invoice for approval',
				action: 'Submit invoice',
			},
			{
				name: 'Approve Invoice',
				value: 'approveInvoice',
				description: 'Approve an invoice',
				action: 'Approve invoice',
			},
		],
		default: 'listInvoices',
	},
];

export const invoiceFields: INodeProperties[] = [
	// ----------------------------------
	//         invoices: listInvoices
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['listInvoices'],
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
				resource: ['invoice'],
				operation: ['listInvoices'],
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
				resource: ['invoice'],
				operation: ['listInvoices'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Draft', value: 'draft' },
					{ name: 'Submitted', value: 'submitted' },
					{ name: 'Under Review', value: 'under_review' },
					{ name: 'Approved', value: 'approved' },
					{ name: 'Approved as Noted', value: 'approved_as_noted' },
					{ name: 'Paid', value: 'paid' },
					{ name: 'Rejected', value: 'rejected' },
				],
				default: '',
				description: 'Filter by invoice status',
			},
			{
				displayName: 'Contract ID',
				name: 'contract_id',
				type: 'number',
				default: 0,
				description: 'Filter by contract ID',
			},
			{
				displayName: 'Vendor ID',
				name: 'vendor_id',
				type: 'number',
				default: 0,
				description: 'Filter by vendor ID',
			},
			{
				displayName: 'Billing Period ID',
				name: 'billing_period_id',
				type: 'number',
				default: 0,
				description: 'Filter by billing period ID',
			},
		],
	},

	// ----------------------------------
	//         invoices: getInvoice
	// ----------------------------------
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['getInvoice', 'updateInvoice', 'submitInvoice', 'approveInvoice'],
			},
		},
		default: 0,
		description: 'The ID of the invoice',
	},

	// ----------------------------------
	//         invoices: createInvoice
	// ----------------------------------
	{
		displayName: 'Contract ID',
		name: 'contractId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['createInvoice'],
			},
		},
		default: 0,
		description: 'The ID of the associated contract',
	},
	{
		displayName: 'Billing Period ID',
		name: 'billingPeriodId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['createInvoice'],
			},
		},
		default: 0,
		description: 'The ID of the billing period',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['createInvoice'],
			},
		},
		options: [
			{
				displayName: 'Invoice Number',
				name: 'number',
				type: 'string',
				default: '',
				description: 'The invoice number',
			},
			{
				displayName: 'Invoice Date',
				name: 'invoice_date',
				type: 'dateTime',
				default: '',
				description: 'The invoice date',
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				description: 'The total amount of the invoice',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes for the invoice',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'External reference number',
			},
		],
	},

	// ----------------------------------
	//         invoices: updateInvoice
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['updateInvoice'],
			},
		},
		options: [
			{
				displayName: 'Invoice Number',
				name: 'number',
				type: 'string',
				default: '',
				description: 'The invoice number',
			},
			{
				displayName: 'Invoice Date',
				name: 'invoice_date',
				type: 'dateTime',
				default: '',
				description: 'The invoice date',
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				description: 'The total amount of the invoice',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes for the invoice',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'External reference number',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Draft', value: 'draft' },
					{ name: 'Under Review', value: 'under_review' },
				],
				default: 'draft',
				description: 'The status of the invoice',
			},
		],
	},
];

export async function executeInvoiceOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const companyId = this.getNodeParameter('companyId', i) as number;
	const projectId = this.getNodeParameter('projectId', i) as number;

	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'listInvoices': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = cleanObject(filters);

			if (returnAll) {
				responseData = await procoreApiRequestAllItems.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/requisitions`,
					companyId,
					qs,
				});
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				qs.per_page = limit;
				responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/requisitions`,
					companyId,
					qs,
				});
			}
			break;
		}

		case 'getInvoice': {
			const invoiceId = this.getNodeParameter('invoiceId', i) as number;
			responseData = await procoreApiRequest.call(this, {
					method: 'GET',
					endpoint: `/rest/v1.0/projects/${projectId}/requisitions/${invoiceId}`,
					companyId,
				});
			break;
		}

		case 'createInvoice': {
			const contractId = this.getNodeParameter('contractId', i) as number;
			const billingPeriodId = this.getNodeParameter('billingPeriodId', i) as number;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const body: IDataObject = {
				requisition: cleanObject({
					contract_id: contractId,
					billing_period_id: billingPeriodId,
					...additionalFields,
				}),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'POST',
					endpoint: `/rest/v1.0/projects/${projectId}/requisitions`,
					companyId,
					body,
				});
			break;
		}

		case 'updateInvoice': {
			const invoiceId = this.getNodeParameter('invoiceId', i) as number;
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

			const body: IDataObject = {
				requisition: cleanObject(updateFields),
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'PATCH',
					endpoint: `/rest/v1.0/projects/${projectId}/requisitions/${invoiceId}`,
					companyId,
					body,
				});
			break;
		}

		case 'submitInvoice': {
			const invoiceId = this.getNodeParameter('invoiceId', i) as number;

			const body: IDataObject = {
				requisition: {
					status: 'submitted',
				},
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'PATCH',
					endpoint: `/rest/v1.0/projects/${projectId}/requisitions/${invoiceId}`,
					companyId,
					body,
				});
			break;
		}

		case 'approveInvoice': {
			const invoiceId = this.getNodeParameter('invoiceId', i) as number;

			const body: IDataObject = {
				requisition: {
					status: 'approved',
				},
			};

			responseData = await procoreApiRequest.call(this, {
					method: 'PATCH',
					endpoint: `/rest/v1.0/projects/${projectId}/requisitions/${invoiceId}`,
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
