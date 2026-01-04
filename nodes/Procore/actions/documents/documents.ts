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
import { procoreApiRequest, procoreApiRequestAllItems, procoreUploadRequest } from '../../transport/procoreApi';
import { toExecutionData, cleanObject } from '../../utils/helpers';

export const documentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['document'],
      },
    },
    options: [
      {
        name: 'Create Folder',
        value: 'createFolder',
        description: 'Create a new folder',
        action: 'Create a folder',
      },
      {
        name: 'Delete Document',
        value: 'deleteDocument',
        description: 'Delete a document',
        action: 'Delete a document',
      },
      {
        name: 'Download Document',
        value: 'downloadDocument',
        description: 'Download a document',
        action: 'Download a document',
      },
      {
        name: 'Get Document',
        value: 'getDocument',
        description: 'Get a document by ID',
        action: 'Get a document',
      },
      {
        name: 'List Documents',
        value: 'listDocuments',
        description: 'List all documents in a project',
        action: 'List documents',
      },
      {
        name: 'List Folders',
        value: 'listFolders',
        description: 'List all folders in a project',
        action: 'List folders',
      },
      {
        name: 'Update Document',
        value: 'updateDocument',
        description: 'Update a document',
        action: 'Update a document',
      },
      {
        name: 'Upload Document',
        value: 'uploadDocument',
        description: 'Upload a new document',
        action: 'Upload a document',
      },
    ],
    default: 'listDocuments',
  },
];

export const documentFields: INodeProperties[] = [
  {
    displayName: 'Company ID',
    name: 'companyId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['document'],
      },
    },
    default: 0,
    description: 'The ID of the company',
  },
  {
    displayName: 'Project ID',
    name: 'projectId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['document'],
      },
    },
    default: 0,
    description: 'The ID of the project',
  },
  {
    displayName: 'Document ID',
    name: 'documentId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['getDocument', 'updateDocument', 'deleteDocument', 'downloadDocument'],
      },
    },
    default: 0,
    description: 'The ID of the document',
  },
  // Create Folder fields
  {
    displayName: 'Folder Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['createFolder'],
      },
    },
    default: '',
    description: 'Name of the folder',
  },
  {
    displayName: 'Parent Folder ID',
    name: 'parent_id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['createFolder'],
      },
    },
    default: 0,
    description: 'ID of the parent folder (0 for root)',
  },
  // Upload Document fields
  {
    displayName: 'Binary Property',
    name: 'binaryPropertyName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['uploadDocument'],
      },
    },
    default: 'data',
    description: 'Name of the binary property containing the file data',
  },
  {
    displayName: 'Folder ID',
    name: 'folderId',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['uploadDocument'],
      },
    },
    default: 0,
    description: 'ID of the folder to upload to (0 for root)',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['uploadDocument'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the document',
      },
      {
        displayName: 'Private',
        name: 'private',
        type: 'boolean',
        default: false,
        description: 'Whether the document is private',
      },
    ],
  },
  // Update Document fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['updateDocument'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Name of the document',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the document',
      },
      {
        displayName: 'Folder ID',
        name: 'folder_id',
        type: 'number',
        default: 0,
        description: 'ID of the folder to move to',
      },
      {
        displayName: 'Private',
        name: 'private',
        type: 'boolean',
        default: false,
        description: 'Whether the document is private',
      },
    ],
  },
  // List filters
  {
    displayName: 'Folder ID',
    name: 'listFolderId',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['listDocuments', 'listFolders'],
      },
    },
    default: 0,
    description: 'ID of the folder to list contents of (0 for root)',
  },
  // Return All / Limit
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['listDocuments', 'listFolders'],
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
        resource: ['document'],
        operation: ['listDocuments', 'listFolders'],
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

export async function executeDocumentOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;

  switch (operation) {
    case 'listDocuments': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const folderId = this.getNodeParameter('listFolderId', itemIndex, 0) as number;
      
      const qs: IDataObject = {};
      if (folderId > 0) {
        qs['filters[folder_id]'] = folderId;
      }
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/documents`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/documents`,
          companyId,
          qs: { ...qs, per_page: limit },
        });
      }
      break;
    }

    case 'listFolders': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const folderId = this.getNodeParameter('listFolderId', itemIndex, 0) as number;
      
      const qs: IDataObject = {};
      if (folderId > 0) {
        qs['filters[parent_id]'] = folderId;
      }
      
      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/folders`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/folders`,
          companyId,
          qs: { ...qs, per_page: limit },
        });
      }
      break;
    }

    case 'getDocument': {
      const documentId = this.getNodeParameter('documentId', itemIndex) as number;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/documents/${documentId}`,
        companyId,
      });
      break;
    }

    case 'createFolder': {
      const name = this.getNodeParameter('name', itemIndex) as string;
      const parentId = this.getNodeParameter('parent_id', itemIndex, 0) as number;
      
      const body: IDataObject = {
        folder: {
          name,
        },
      };
      
      if (parentId > 0) {
        (body.folder as IDataObject).parent_id = parentId;
      }
      
      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/folders`,
        companyId,
        body,
      });
      break;
    }

    case 'uploadDocument': {
      const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex) as string;
      const folderId = this.getNodeParameter('folderId', itemIndex, 0) as number;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
      
      const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
      const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
      
      const formData: IDataObject = {
        'document[name]': binaryData.fileName || 'uploaded_file',
        'document[data]': {
          value: buffer,
          options: {
            filename: binaryData.fileName || 'uploaded_file',
            contentType: binaryData.mimeType,
          },
        },
      };
      
      if (folderId > 0) {
        formData['document[folder_id]'] = folderId;
      }
      
      if (additionalFields.description) {
        formData['document[description]'] = additionalFields.description;
      }
      
      if (additionalFields.private !== undefined) {
        formData['document[private]'] = additionalFields.private;
      }
      
      responseData = await procoreUploadRequest.call(this, {
        endpoint: `/projects/${projectId}/documents`,
        companyId,
        formData,
      });
      break;
    }

    case 'updateDocument': {
      const documentId = this.getNodeParameter('documentId', itemIndex) as number;
      const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;
      
      responseData = await procoreApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `/projects/${projectId}/documents/${documentId}`,
        companyId,
        body: { document: cleanObject(updateFields) },
      });
      break;
    }

    case 'deleteDocument': {
      const documentId = this.getNodeParameter('documentId', itemIndex) as number;
      
      await procoreApiRequest.call(this, {
        method: 'DELETE',
        endpoint: `/projects/${projectId}/documents/${documentId}`,
        companyId,
      });
      responseData = { success: true, documentId };
      break;
    }

    case 'downloadDocument': {
      const documentId = this.getNodeParameter('documentId', itemIndex) as number;
      
      // Get document info first
      const documentInfo = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/documents/${documentId}`,
        companyId,
      }) as IDataObject;
      
      responseData = {
        ...documentInfo,
        downloadUrl: documentInfo.url,
      };
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return toExecutionData(responseData, { item: itemIndex });
}
