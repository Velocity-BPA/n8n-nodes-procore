/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IDataObject,
  IHttpRequestMethods,
  IHttpRequestOptions,
  JsonObject,
  NodeApiError,
} from 'n8n-workflow';
import { PROCORE_API_VERSION } from '../constants/resources';

export interface IProcoreApiOptions {
  method: IHttpRequestMethods;
  endpoint: string;
  body?: IDataObject;
  qs?: IDataObject;
  headers?: IDataObject;
  companyId?: number;
  projectId?: number;
  returnFullResponse?: boolean;
}

export interface IProcoreCredentials {
  environment: 'production' | 'sandbox';
  oauthTokenData?: {
    access_token: string;
    refresh_token: string;
  };
}

export async function procoreApiRequest(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
  options: IProcoreApiOptions,
): Promise<IDataObject | IDataObject[]> {
  const credentials = await this.getCredentials('procoreOAuth2Api') as IProcoreCredentials;
  
  const baseUrl = credentials.environment === 'sandbox'
    ? 'https://sandbox.procore.com'
    : 'https://api.procore.com';

  const requestOptions: IHttpRequestOptions = {
    method: options.method,
    url: `${baseUrl}/rest/${PROCORE_API_VERSION}${options.endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    qs: {
      ...options.qs,
    },
    json: true,
  };

  if (options.companyId) {
    requestOptions.headers = {
      ...requestOptions.headers,
      'Procore-Company-Id': options.companyId.toString(),
    };
  }

  if (options.body && Object.keys(options.body).length > 0) {
    requestOptions.body = options.body;
  }

  try {
    const response = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'procoreOAuth2Api',
      requestOptions,
    );

    if (options.returnFullResponse) {
      return response as IDataObject;
    }

    return response as IDataObject | IDataObject[];
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject, {
      message: `Procore API Error: ${(error as Error).message}`,
    });
  }
}

export async function procoreApiRequestAllItems(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
  options: IProcoreApiOptions,
  propertyName?: string,
): Promise<IDataObject[]> {
  const returnData: IDataObject[] = [];
  let responseData: IDataObject | IDataObject[];
  let page = 1;
  const perPage = 100;

  options.qs = options.qs || {};
  options.qs.per_page = perPage;

  do {
    options.qs.page = page;
    responseData = await procoreApiRequest.call(this, options);

    const items = propertyName 
      ? (responseData as IDataObject)[propertyName] as IDataObject[]
      : responseData as IDataObject[];

    if (!Array.isArray(items)) {
      break;
    }

    returnData.push(...items);
    page++;

    if (items.length < perPage) {
      break;
    }
  } while (true);

  return returnData;
}

export async function procoreUploadRequest(
  this: IExecuteFunctions,
  options: {
    endpoint: string;
    companyId?: number;
    projectId?: number;
    formData: IDataObject;
    headers?: IDataObject;
  },
): Promise<IDataObject> {
  const credentials = await this.getCredentials('procoreOAuth2Api') as IProcoreCredentials;
  
  const baseUrl = credentials.environment === 'sandbox'
    ? 'https://sandbox.procore.com'
    : 'https://api.procore.com';

  const requestOptions: IHttpRequestOptions = {
    method: 'POST',
    url: `${baseUrl}/rest/${PROCORE_API_VERSION}${options.endpoint}`,
    headers: {
      ...options.headers,
    },
    body: options.formData,
  };

  if (options.companyId) {
    requestOptions.headers = {
      ...requestOptions.headers,
      'Procore-Company-Id': options.companyId.toString(),
    };
  }

  try {
    const response = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'procoreOAuth2Api',
      requestOptions,
    );
    return response as IDataObject;
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject, {
      message: `Procore Upload Error: ${(error as Error).message}`,
    });
  }
}

export function getCompanyId(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
  itemIndex: number,
): number {
  if ('getNodeParameter' in this) {
    return this.getNodeParameter('companyId', itemIndex) as number;
  }
  throw new Error('Cannot get company ID in this context');
}

export function getProjectId(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
  itemIndex: number,
): number {
  if ('getNodeParameter' in this) {
    return this.getNodeParameter('projectId', itemIndex) as number;
  }
  throw new Error('Cannot get project ID in this context');
}
