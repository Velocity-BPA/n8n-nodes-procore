/**
 * Procore Trigger Node
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
  IHookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
} from 'n8n-workflow';

import { procoreApiRequest } from './transport/procoreApi';
import { logLicensingNotice } from './utils/helpers';
import { TRIGGER_EVENTS, WEBHOOK_EVENT_MAPPING } from './constants/resources';

// Log licensing notice once on module load
logLicensingNotice();

export class ProcoreTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Procore Trigger',
    name: 'procoreTrigger',
    icon: 'file:procore.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Handle Procore webhook events',
    defaults: {
      name: 'Procore Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'procoreOAuth2Api',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Company ID',
        name: 'companyId',
        type: 'number',
        required: true,
        default: 0,
        description: 'The Procore company ID',
      },
      {
        displayName: 'Project ID',
        name: 'projectId',
        type: 'number',
        default: 0,
        description: 'The Procore project ID (leave 0 for company-level webhooks)',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        required: true,
        default: 'projectCreated',
        options: TRIGGER_EVENTS.map((event) => ({
          name: event.name,
          value: event.value,
          description: event.description,
        })),
        description: 'The event to listen for',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const webhookUrl = this.getNodeWebhookUrl('default') as string;
        const companyId = this.getNodeParameter('companyId') as number;
        const event = this.getNodeParameter('event') as string;

        try {
          const webhooks = (await procoreApiRequest.call(this, {
            method: 'GET',
            endpoint: '/webhooks/hooks',
            companyId,
          })) as IDataObject[];

          const eventMapping = WEBHOOK_EVENT_MAPPING[event];
          if (!eventMapping) {
            return false;
          }

          for (const webhook of webhooks) {
            if (
              webhook.destination_url === webhookUrl &&
              (webhook.destination_headers as IDataObject)?.['X-Hook-Event'] === event
            ) {
              webhookData.webhookId = webhook.id;
              return true;
            }
          }
        } catch (error) {
          return false;
        }

        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const webhookUrl = this.getNodeWebhookUrl('default') as string;
        const companyId = this.getNodeParameter('companyId') as number;
        const projectId = this.getNodeParameter('projectId') as number;
        const event = this.getNodeParameter('event') as string;

        const eventMapping = WEBHOOK_EVENT_MAPPING[event];
        if (!eventMapping) {
          throw new Error(`Event ${event} is not supported`);
        }

        const body: IDataObject = {
          hook: {
            api_version: 'v2',
            destination_url: webhookUrl,
            destination_headers: {
              'X-Hook-Event': event,
            },
            namespace: eventMapping,
          },
        };

        if (projectId > 0) {
          (body.hook as IDataObject).project_id = projectId;
        }

        try {
          const response = (await procoreApiRequest.call(this, {
            method: 'POST',
            endpoint: '/webhooks/hooks',
            companyId,
            body,
          })) as IDataObject;

          if (response.id) {
            webhookData.webhookId = response.id;
            return true;
          }
        } catch (error) {
          throw new Error(`Failed to create Procore webhook: ${(error as Error).message}`);
        }

        return false;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const companyId = this.getNodeParameter('companyId') as number;

        if (webhookData.webhookId) {
          try {
            await procoreApiRequest.call(this, {
              method: 'DELETE',
              endpoint: `/webhooks/hooks/${webhookData.webhookId}`,
              companyId,
            });
          } catch (error) {
            return false;
          }
        }

        delete webhookData.webhookId;
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const body = this.getBodyData() as IDataObject;

    const event = this.getNodeParameter('event') as string;
    const hookEvent = req.headers['x-hook-event'] as string;

    const returnData: IDataObject = {
      event,
      hookEvent,
      timestamp: new Date().toISOString(),
      ...body,
    };

    return {
      workflowData: [this.helpers.returnJsonArray([returnData])],
    };
  }
}
