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

export const photoOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['photo'],
      },
    },
    options: [
      {
        name: 'Create Photo Album',
        value: 'createPhotoAlbum',
        description: 'Create a new photo album',
        action: 'Create a photo album',
      },
      {
        name: 'Delete Photo',
        value: 'deletePhoto',
        description: 'Delete a photo',
        action: 'Delete a photo',
      },
      {
        name: 'Get Photo',
        value: 'getPhoto',
        description: 'Get a photo by ID',
        action: 'Get a photo',
      },
      {
        name: 'List Photo Albums',
        value: 'listPhotoAlbums',
        description: 'List all photo albums',
        action: 'List photo albums',
      },
      {
        name: 'List Photos',
        value: 'listPhotos',
        description: 'List all photos',
        action: 'List photos',
      },
      {
        name: 'Upload Photo',
        value: 'uploadPhoto',
        description: 'Upload a new photo',
        action: 'Upload a photo',
      },
    ],
    default: 'listPhotos',
  },
];

export const photoFields: INodeProperties[] = [
  {
    displayName: 'Photo ID',
    name: 'photoId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['photo'],
        operation: ['getPhoto', 'deletePhoto'],
      },
    },
    default: '',
    description: 'The ID of the photo',
  },
  {
    displayName: 'Binary Property',
    name: 'binaryPropertyName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['photo'],
        operation: ['uploadPhoto'],
      },
    },
    default: 'data',
    description: 'Name of the binary property containing the photo file',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['photo'],
        operation: ['uploadPhoto'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Album ID',
        name: 'image_category_id',
        type: 'string',
        default: '',
        description: 'ID of the photo album',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the photo',
      },
      {
        displayName: 'Location ID',
        name: 'location_id',
        type: 'string',
        default: '',
        description: 'ID of the location',
      },
      {
        displayName: 'Private',
        name: 'private',
        type: 'boolean',
        default: false,
        description: 'Whether the photo is private',
      },
      {
        displayName: 'Starred',
        name: 'starred',
        type: 'boolean',
        default: false,
        description: 'Whether the photo is starred',
      },
      {
        displayName: 'Trade ID',
        name: 'trade_id',
        type: 'string',
        default: '',
        description: 'ID of the trade',
      },
    ],
  },
  {
    displayName: 'Album Name',
    name: 'albumName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['photo'],
        operation: ['createPhotoAlbum'],
      },
    },
    default: '',
    description: 'Name of the photo album',
  },
  {
    displayName: 'Album Options',
    name: 'albumOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['photo'],
        operation: ['createPhotoAlbum'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the album',
      },
      {
        displayName: 'Private',
        name: 'private',
        type: 'boolean',
        default: false,
        description: 'Whether the album is private',
      },
    ],
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['photo'],
        operation: ['listPhotos'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Album ID',
        name: 'image_category_id',
        type: 'string',
        default: '',
        description: 'Filter by album',
      },
      {
        displayName: 'End Date',
        name: 'end_date',
        type: 'dateTime',
        default: '',
        description: 'Filter photos until this date',
      },
      {
        displayName: 'Location ID',
        name: 'location_id',
        type: 'string',
        default: '',
        description: 'Filter by location',
      },
      {
        displayName: 'Starred',
        name: 'starred',
        type: 'boolean',
        default: false,
        description: 'Filter starred photos only',
      },
      {
        displayName: 'Start Date',
        name: 'start_date',
        type: 'dateTime',
        default: '',
        description: 'Filter photos from this date',
      },
    ],
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['photo'],
        operation: ['listPhotos', 'listPhotoAlbums'],
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
        resource: ['photo'],
        operation: ['listPhotos', 'listPhotoAlbums'],
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

export async function executePhotoOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData[]> {
  const companyId = this.getNodeParameter('companyId', itemIndex) as number;
  const projectId = this.getNodeParameter('projectId', itemIndex) as number;
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listPhotos': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
      const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      const qs: IDataObject = {};

      if (filters.image_category_id) {
        qs['filters[image_category_id]'] = filters.image_category_id;
      }
      if (filters.location_id) {
        qs['filters[location_id]'] = filters.location_id;
      }
      if (filters.starred) {
        qs['filters[starred]'] = filters.starred;
      }
      if (filters.start_date) {
        qs['filters[start_date]'] = filters.start_date;
      }
      if (filters.end_date) {
        qs['filters[end_date]'] = filters.end_date;
      }

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/images`,
          companyId,
          qs,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        qs.per_page = limit;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/images`,
          companyId,
          qs,
        });
      }
      break;
    }

    case 'getPhoto': {
      const photoId = this.getNodeParameter('photoId', itemIndex) as string;
      responseData = await procoreApiRequest.call(this, {
        method: 'GET',
        endpoint: `/projects/${projectId}/images/${photoId}`,
        companyId,
      });
      break;
    }

    case 'uploadPhoto': {
      const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex) as string;
      const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

      const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
      const dataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

      const formData: IDataObject = {};

      if (additionalFields.image_category_id) {
        formData['image[image_category_id]'] = additionalFields.image_category_id;
      }
      if (additionalFields.description) {
        formData['image[description]'] = additionalFields.description;
      }
      if (additionalFields.location_id) {
        formData['image[location_id]'] = additionalFields.location_id;
      }
      if (additionalFields.trade_id) {
        formData['image[trade_id]'] = additionalFields.trade_id;
      }
      if (additionalFields.starred !== undefined) {
        formData['image[starred]'] = additionalFields.starred;
      }
      if (additionalFields.private !== undefined) {
        formData['image[private]'] = additionalFields.private;
      }

      formData['image[data]'] = {
        value: dataBuffer,
        options: {
          filename: binaryData.fileName || 'photo.jpg',
          contentType: binaryData.mimeType || 'image/jpeg',
        },
      };

      responseData = await procoreUploadRequest.call(this, {
        endpoint: `/projects/${projectId}/images`,
        companyId,
        formData,
      });
      break;
    }

    case 'deletePhoto': {
      const photoId = this.getNodeParameter('photoId', itemIndex) as string;
      await procoreApiRequest.call(this, {
        method: 'DELETE',
        endpoint: `/projects/${projectId}/images/${photoId}`,
        companyId,
      });
      responseData = { success: true, id: photoId };
      break;
    }

    case 'listPhotoAlbums': {
      const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;

      if (returnAll) {
        responseData = await procoreApiRequestAllItems.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/image_categories`,
          companyId,
        });
      } else {
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        responseData = await procoreApiRequest.call(this, {
          method: 'GET',
          endpoint: `/projects/${projectId}/image_categories`,
          companyId,
          qs: { per_page: limit },
        });
      }
      break;
    }

    case 'createPhotoAlbum': {
      const albumName = this.getNodeParameter('albumName', itemIndex) as string;
      const albumOptions = this.getNodeParameter('albumOptions', itemIndex, {}) as IDataObject;

      const body: IDataObject = {
        image_category: cleanObject({
          name: albumName,
          ...albumOptions,
        }),
      };

      responseData = await procoreApiRequest.call(this, {
        method: 'POST',
        endpoint: `/projects/${projectId}/image_categories`,
        companyId,
        body,
      });
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return toExecutionData(responseData, { item: itemIndex });
}
