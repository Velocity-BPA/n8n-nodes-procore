/**
 * Procore Node
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing
 * or contact licensing@velobpa.com.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { logLicensingNotice } from './utils/helpers';

// Import operations and fields - using correct singular naming convention
import { companyOperations, companyFields, executeCompanyOperation } from './actions/companies/companies';
import { projectOperations, projectFields, executeProjectOperation } from './actions/projects/projects';
import { jobOperations, jobFields, executeJobOperation } from './actions/jobs/jobs';
import { rfiOperations, rfiFields, executeRfiOperation } from './actions/rfis/rfis';
import { submittalOperations, submittalFields, executeSubmittalOperation } from './actions/submittals/submittals';
import { documentOperations, documentFields, executeDocumentOperation } from './actions/documents/documents';
import { drawingOperations, drawingFields, executeDrawingOperation } from './actions/drawings/drawings';
import { photoOperations, photoFields, executePhotoOperation } from './actions/photos/photos';
import { punchListOperations, punchListFields, executePunchListOperation } from './actions/punchList/punchList';
import { observationOperations, observationFields, executeObservationOperation } from './actions/observations/observations';
import { inspectionOperations, inspectionFields, executeInspectionOperation } from './actions/inspections/inspections';
import { dailyLogOperations, dailyLogFields, executeDailyLogOperation } from './actions/dailyLogs/dailyLogs';
import { meetingOperations, meetingFields, executeMeetingOperation } from './actions/meetings/meetings';
import { budgetOperations, budgetFields, executeBudgetOperation } from './actions/budgets/budgets';
import { contractOperations, contractFields, executeContractOperation } from './actions/contracts/contracts';
import { changeOrderOperations, changeOrderFields, executeChangeOrderOperation } from './actions/changeOrders/changeOrders';
import { invoiceOperations, invoiceFields, executeInvoiceOperation } from './actions/invoices/invoices';
import { scheduleOperations, scheduleFields, executeScheduleOperation } from './actions/schedule/schedule';
import { directoryOperations, directoryFields, executeDirectoryOperation } from './actions/directory/directory';
import { correspondenceOperations, correspondenceFields, executeCorrespondenceOperation } from './actions/correspondence/correspondence';

// Log licensing notice once on module load
logLicensingNotice();

export class Procore implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Procore',
		name: 'procore',
		icon: 'file:procore.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Procore construction management platform',
		defaults: {
			name: 'Procore',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'procoreOAuth2Api',
				required: true,
			},
		],
		properties: [
			// Company ID - required for all operations
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'number',
				required: true,
				default: 0,
				description: 'The Procore company ID',
			},
			// Project ID - required for project-level operations
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'number',
				default: 0,
				description: 'The Procore project ID (required for project-level resources)',
				displayOptions: {
					hide: {
						resource: ['company'],
					},
				},
			},
			// Resource selector - using singular naming to match action files
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Budget', value: 'budget' },
					{ name: 'Change Order', value: 'changeOrder' },
					{ name: 'Company', value: 'company' },
					{ name: 'Contract', value: 'contract' },
					{ name: 'Correspondence', value: 'correspondence' },
					{ name: 'Daily Log', value: 'dailyLog' },
					{ name: 'Directory', value: 'directory' },
					{ name: 'Document', value: 'document' },
					{ name: 'Drawing', value: 'drawing' },
					{ name: 'Inspection', value: 'inspection' },
					{ name: 'Invoice', value: 'invoice' },
					{ name: 'Job', value: 'job' },
					{ name: 'Meeting', value: 'meeting' },
					{ name: 'Observation', value: 'observation' },
					{ name: 'Photo', value: 'photo' },
					{ name: 'Project', value: 'project' },
					{ name: 'Punch List', value: 'punchList' },
					{ name: 'RFI', value: 'rfi' },
					{ name: 'Schedule', value: 'schedule' },
					{ name: 'Submittal', value: 'submittal' },
				],
				default: 'project',
			},
			// Operations for each resource
			...companyOperations,
			...projectOperations,
			...jobOperations,
			...rfiOperations,
			...submittalOperations,
			...documentOperations,
			...drawingOperations,
			...photoOperations,
			...punchListOperations,
			...observationOperations,
			...inspectionOperations,
			...dailyLogOperations,
			...meetingOperations,
			...budgetOperations,
			...contractOperations,
			...changeOrderOperations,
			...invoiceOperations,
			...scheduleOperations,
			...directoryOperations,
			...correspondenceOperations,
			// Fields for each resource
			...companyFields,
			...projectFields,
			...jobFields,
			...rfiFields,
			...submittalFields,
			...documentFields,
			...drawingFields,
			...photoFields,
			...punchListFields,
			...observationFields,
			...inspectionFields,
			...dailyLogFields,
			...meetingFields,
			...budgetFields,
			...contractFields,
			...changeOrderFields,
			...invoiceFields,
			...scheduleFields,
			...directoryFields,
			...correspondenceFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let result: INodeExecutionData[];

				switch (resource) {
					case 'company':
						result = await executeCompanyOperation.call(this, operation, i);
						break;
					case 'project':
						result = await executeProjectOperation.call(this, operation, i);
						break;
					case 'job':
						result = await executeJobOperation.call(this, operation, i);
						break;
					case 'rfi':
						result = await executeRfiOperation.call(this, operation, i);
						break;
					case 'submittal':
						result = await executeSubmittalOperation.call(this, operation, i);
						break;
					case 'document':
						result = await executeDocumentOperation.call(this, operation, i);
						break;
					case 'drawing':
						result = await executeDrawingOperation.call(this, operation, i);
						break;
					case 'photo':
						result = await executePhotoOperation.call(this, operation, i);
						break;
					case 'punchList':
						result = await executePunchListOperation.call(this, operation, i);
						break;
					case 'observation':
						result = await executeObservationOperation.call(this, operation, i);
						break;
					case 'inspection':
						result = await executeInspectionOperation.call(this, operation, i);
						break;
					case 'dailyLog':
						result = await executeDailyLogOperation.call(this, operation, i);
						break;
					case 'meeting':
						result = await executeMeetingOperation.call(this, operation, i);
						break;
					case 'budget':
						result = await executeBudgetOperation.call(this, operation, i);
						break;
					case 'contract':
						result = await executeContractOperation.call(this, operation, i);
						break;
					case 'changeOrder':
						result = await executeChangeOrderOperation.call(this, operation, i);
						break;
					case 'invoice':
						result = await executeInvoiceOperation.call(this, operation, i);
						break;
					case 'schedule':
						result = await executeScheduleOperation.call(this, operation, i);
						break;
					case 'directory':
						result = await executeDirectoryOperation.call(this, operation, i);
						break;
					case 'correspondence':
						result = await executeCorrespondenceOperation.call(this, operation, i);
						break;
					default:
						throw new Error(`Resource ${resource} is not supported`);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
