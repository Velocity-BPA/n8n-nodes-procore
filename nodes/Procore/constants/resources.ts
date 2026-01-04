/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodePropertyOptions } from 'n8n-workflow';

export const PROCORE_API_VERSION = 'v1.0';

export const PROCORE_RESOURCES: INodePropertyOptions[] = [
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
];

export const COMPANY_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Get Company', value: 'getCompany' },
  { name: 'Get Company Users', value: 'getCompanyUsers' },
  { name: 'Get Company Vendors', value: 'getCompanyVendors' },
  { name: 'List Companies', value: 'listCompanies' },
  { name: 'Update Company', value: 'updateCompany' },
];

export const PROJECT_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Add Project User', value: 'addProjectUser' },
  { name: 'Create Project', value: 'createProject' },
  { name: 'Get Project', value: 'getProject' },
  { name: 'Get Project Roles', value: 'getProjectRoles' },
  { name: 'Get Project Stages', value: 'getProjectStages' },
  { name: 'Get Project Users', value: 'getProjectUsers' },
  { name: 'List Projects', value: 'listProjects' },
  { name: 'Remove Project User', value: 'removeProjectUser' },
  { name: 'Update Project', value: 'updateProject' },
];

export const JOB_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Job', value: 'createJob' },
  { name: 'Get Job', value: 'getJob' },
  { name: 'Get Job Budget', value: 'getJobBudget' },
  { name: 'Get Job Costs', value: 'getJobCosts' },
  { name: 'List Jobs', value: 'listJobs' },
  { name: 'Update Job', value: 'updateJob' },
];

export const RFI_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Add RFI Response', value: 'addRfiResponse' },
  { name: 'Create RFI', value: 'createRfi' },
  { name: 'Delete RFI', value: 'deleteRfi' },
  { name: 'Get RFI', value: 'getRfi' },
  { name: 'Get RFI Responses', value: 'getRfiResponses' },
  { name: 'List RFIs', value: 'listRfis' },
  { name: 'Update RFI', value: 'updateRfi' },
];

export const SUBMITTAL_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Submittal', value: 'createSubmittal' },
  { name: 'Get Submittal', value: 'getSubmittal' },
  { name: 'Get Submittal Approvers', value: 'getSubmittalApprovers' },
  { name: 'List Submittals', value: 'listSubmittals' },
  { name: 'Submit For Approval', value: 'submitForApproval' },
  { name: 'Update Submittal', value: 'updateSubmittal' },
];

export const DOCUMENT_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Folder', value: 'createFolder' },
  { name: 'Delete Document', value: 'deleteDocument' },
  { name: 'Download Document', value: 'downloadDocument' },
  { name: 'Get Document', value: 'getDocument' },
  { name: 'List Documents', value: 'listDocuments' },
  { name: 'List Folders', value: 'listFolders' },
  { name: 'Update Document', value: 'updateDocument' },
  { name: 'Upload Document', value: 'uploadDocument' },
];

export const DRAWING_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Get Drawing', value: 'getDrawing' },
  { name: 'List Drawing Areas', value: 'listDrawingAreas' },
  { name: 'List Drawing Revisions', value: 'listDrawingRevisions' },
  { name: 'List Drawings', value: 'listDrawings' },
  { name: 'Upload Drawing', value: 'uploadDrawing' },
];

export const PHOTO_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Photo Album', value: 'createPhotoAlbum' },
  { name: 'Delete Photo', value: 'deletePhoto' },
  { name: 'Get Photo', value: 'getPhoto' },
  { name: 'List Photo Albums', value: 'listPhotoAlbums' },
  { name: 'List Photos', value: 'listPhotos' },
  { name: 'Upload Photo', value: 'uploadPhoto' },
];

export const PUNCH_LIST_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Assign Punch Item', value: 'assignPunchItem' },
  { name: 'Close Punch Item', value: 'closePunchItem' },
  { name: 'Create Punch Item', value: 'createPunchItem' },
  { name: 'Delete Punch Item', value: 'deletePunchItem' },
  { name: 'Get Punch Item', value: 'getPunchItem' },
  { name: 'List Punch Items', value: 'listPunchItems' },
  { name: 'Update Punch Item', value: 'updatePunchItem' },
];

export const OBSERVATION_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Observation', value: 'createObservation' },
  { name: 'Get Observation', value: 'getObservation' },
  { name: 'Get Observation Types', value: 'getObservationTypes' },
  { name: 'List Observations', value: 'listObservations' },
  { name: 'Update Observation', value: 'updateObservation' },
];

export const INSPECTION_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Inspection', value: 'createInspection' },
  { name: 'Create Inspection Checklist', value: 'createInspectionChecklist' },
  { name: 'Get Inspection', value: 'getInspection' },
  { name: 'Get Inspection Checklists', value: 'getInspectionChecklists' },
  { name: 'List Inspections', value: 'listInspections' },
  { name: 'Update Inspection', value: 'updateInspection' },
];

export const DAILY_LOG_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Daily Log', value: 'createDailyLog' },
  { name: 'Get Daily Log', value: 'getDailyLog' },
  { name: 'Get Manpower Logs', value: 'getManpowerLogs' },
  { name: 'Get Weather Logs', value: 'getWeatherLogs' },
  { name: 'List Daily Logs', value: 'listDailyLogs' },
  { name: 'Update Daily Log', value: 'updateDailyLog' },
];

export const MEETING_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Meeting', value: 'createMeeting' },
  { name: 'Get Meeting', value: 'getMeeting' },
  { name: 'Get Meeting Agenda', value: 'getMeetingAgenda' },
  { name: 'Get Meeting Attendees', value: 'getMeetingAttendees' },
  { name: 'Get Meeting Minutes', value: 'getMeetingMinutes' },
  { name: 'List Meetings', value: 'listMeetings' },
  { name: 'Update Meeting', value: 'updateMeeting' },
];

export const BUDGET_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Budget Line Item', value: 'createBudgetLineItem' },
  { name: 'Get Budget', value: 'getBudget' },
  { name: 'Get Budget Changes', value: 'getBudgetChanges' },
  { name: 'Get Budget Line Items', value: 'getBudgetLineItems' },
  { name: 'Update Budget Line Item', value: 'updateBudgetLineItem' },
];

export const CONTRACT_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Contract', value: 'createContract' },
  { name: 'Get Contract', value: 'getContract' },
  { name: 'Get Contract Line Items', value: 'getContractLineItems' },
  { name: 'Get Contract Payments', value: 'getContractPayments' },
  { name: 'List Contracts', value: 'listContracts' },
  { name: 'Update Contract', value: 'updateContract' },
];

export const CHANGE_ORDER_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Approve Change Order', value: 'approveChangeOrder' },
  { name: 'Create Change Order', value: 'createChangeOrder' },
  { name: 'Get Change Order', value: 'getChangeOrder' },
  { name: 'List Change Orders', value: 'listChangeOrders' },
  { name: 'Update Change Order', value: 'updateChangeOrder' },
];

export const INVOICE_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Approve Invoice', value: 'approveInvoice' },
  { name: 'Create Invoice', value: 'createInvoice' },
  { name: 'Get Invoice', value: 'getInvoice' },
  { name: 'List Invoices', value: 'listInvoices' },
  { name: 'Submit Invoice', value: 'submitInvoice' },
  { name: 'Update Invoice', value: 'updateInvoice' },
];

export const SCHEDULE_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Get Schedule', value: 'getSchedule' },
  { name: 'Get Schedule Task', value: 'getScheduleTask' },
  { name: 'List Schedule Milestones', value: 'listScheduleMilestones' },
  { name: 'List Schedule Tasks', value: 'listScheduleTasks' },
  { name: 'Update Schedule Task', value: 'updateScheduleTask' },
];

export const DIRECTORY_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Contact', value: 'createContact' },
  { name: 'Delete Contact', value: 'deleteContact' },
  { name: 'Get Contact', value: 'getContact' },
  { name: 'List Contacts', value: 'listContacts' },
  { name: 'Update Contact', value: 'updateContact' },
];

export const CORRESPONDENCE_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Correspondence', value: 'createCorrespondence' },
  { name: 'Get Correspondence', value: 'getCorrespondence' },
  { name: 'List Correspondence', value: 'listCorrespondence' },
  { name: 'Update Correspondence', value: 'updateCorrespondence' },
];

export const TRIGGER_EVENTS: INodePropertyOptions[] = [
  { name: 'Change Order Created', value: 'changeOrderCreated' },
  { name: 'Daily Log Created', value: 'dailyLogCreated' },
  { name: 'Document Uploaded', value: 'documentUploaded' },
  { name: 'Inspection Completed', value: 'inspectionCompleted' },
  { name: 'Invoice Submitted', value: 'invoiceSubmitted' },
  { name: 'Project Created', value: 'projectCreated' },
  { name: 'Punch Item Closed', value: 'punchItemClosed' },
  { name: 'Punch Item Created', value: 'punchItemCreated' },
  { name: 'RFI Created', value: 'rfiCreated' },
  { name: 'RFI Updated', value: 'rfiUpdated' },
  { name: 'Submittal Created', value: 'submittalCreated' },
];

export const WEBHOOK_EVENT_MAPPING: Record<string, string> = {
  projectCreated: 'projects.create',
  rfiCreated: 'rfis.create',
  rfiUpdated: 'rfis.update',
  submittalCreated: 'submittals.create',
  documentUploaded: 'documents.create',
  punchItemCreated: 'punch_items.create',
  punchItemClosed: 'punch_items.update',
  changeOrderCreated: 'change_orders.create',
  invoiceSubmitted: 'invoices.update',
  inspectionCompleted: 'inspections.update',
  dailyLogCreated: 'daily_logs.create',
};
