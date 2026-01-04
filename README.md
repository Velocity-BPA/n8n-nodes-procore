# n8n-nodes-procore

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Procore, the leading cloud-based construction management platform. This node provides full integration with Procore's REST API v1.0, enabling automation of construction project workflows across 20 resources with 100+ operations.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Complete Construction Management** - Access to projects, RFIs, submittals, punch lists, and more
- **Financial Management** - Budgets, contracts, change orders, and invoices
- **Document Control** - Documents, drawings, and photos with file upload support
- **Field Management** - Daily logs, inspections, observations, and meetings
- **Team Collaboration** - Directory management and correspondence
- **Webhook Triggers** - Real-time event notifications for 11 event types
- **OAuth 2.0 Authentication** - Secure authentication with token refresh
- **Sandbox Support** - Development and testing environment support

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-procore`
5. Select **Install**

### Manual Installation

```bash
# Navigate to n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-procore
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-procore.zip
cd n8n-nodes-procore

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-procore

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-procore %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

### OAuth 2.0 Configuration

1. Go to [Procore Developer Portal](https://developers.procore.com)
2. Create a new application or use an existing one
3. Note your **Client ID** and **Client Secret**
4. Set your redirect URI to your n8n webhook URL

| Parameter | Description |
|-----------|-------------|
| Client ID | OAuth 2.0 client identifier from Procore |
| Client Secret | OAuth 2.0 client secret from Procore |
| Environment | `production` or `sandbox` |

### OAuth URLs

| Environment | Authorization URL | Token URL |
|-------------|------------------|-----------|
| Production | https://login.procore.com/oauth/authorize | https://login.procore.com/oauth/token |
| Sandbox | https://login-sandbox.procore.com/oauth/authorize | https://login-sandbox.procore.com/oauth/token |

## Resources & Operations

### Companies
- List Companies - Get all companies
- Get Company - Get company by ID
- Update Company - Update company info
- Get Company Users - List company users
- Get Company Vendors - List vendors

### Projects
- List Projects - Get projects with filters
- Get Project - Get project by ID
- Create Project - Create new project
- Update Project - Update project details
- Get Project Users - List project team
- Add Project User - Add user to project
- Remove Project User - Remove user
- Get Project Stages - List stages
- Get Project Roles - List roles

### Jobs (Work)
- List Jobs - Get work breakdown
- Get Job - Get job by ID
- Create Job - Create job
- Update Job - Update job
- Get Job Costs - Job cost data
- Get Job Budget - Job budget data

### RFIs (Requests for Information)
- List RFIs - Get all RFIs with filters
- Get RFI - Get RFI by ID
- Create RFI - Create new RFI
- Update RFI - Update RFI
- Delete RFI - Delete RFI
- Get RFI Responses - List responses
- Add RFI Response - Add response

### Submittals
- List Submittals - Get all submittals
- Get Submittal - Get by ID
- Create Submittal - Create submittal
- Update Submittal - Update submittal
- Get Approvers - List approvers
- Submit for Approval - Submit submittal

### Documents
- List Documents - Get documents
- Get Document - Get by ID
- Upload Document - Upload file
- Update Document - Update metadata
- Delete Document - Delete document
- List Folders - Get folders
- Create Folder - Create folder
- Download Document - Download file

### Drawings
- List Drawings - Get all drawings
- Get Drawing - Get by ID
- Upload Drawing - Upload drawing
- List Drawing Areas - Get areas
- List Revisions - Get revisions

### Photos
- List Photos - Get all photos
- Get Photo - Get by ID
- Upload Photo - Upload photo
- Delete Photo - Delete photo
- List Albums - Get photo albums
- Create Album - Create album

### Punch List
- List Punch Items - Get items
- Get Punch Item - Get by ID
- Create Punch Item - Create item
- Update Punch Item - Update item
- Delete Punch Item - Delete item
- Assign Punch Item - Assign to user
- Close Punch Item - Mark closed

### Observations (Safety)
- List Observations - Get all
- Get Observation - Get by ID
- Create Observation - Create new
- Update Observation - Update
- Get Types - List observation types

### Inspections
- List Inspections - Get all
- Get Inspection - Get by ID
- Create Inspection - Create new
- Update Inspection - Update
- Get Checklists - List checklists
- Create Checklist - Create checklist

### Daily Logs
- List Daily Logs - Get logs
- Get Daily Log - Get by ID
- Create Daily Log - Create log
- Update Daily Log - Update log
- Get Weather Logs - Weather data
- Get Manpower Logs - Manpower data

### Meetings
- List Meetings - Get all meetings
- Get Meeting - Get by ID
- Create Meeting - Create meeting
- Update Meeting - Update meeting
- Get Agenda - Get meeting agenda
- Get Minutes - Get meeting minutes
- Get Attendees - List attendees

### Budgets
- Get Budget - Get project budget
- Get Budget Line Items - Line items
- Create Budget Line Item - Create item
- Update Budget Line Item - Update item
- Get Budget Changes - List changes

### Contracts
- List Contracts - Get all contracts
- Get Contract - Get by ID
- Create Contract - Create contract
- Update Contract - Update contract
- Get Line Items - Contract items
- Get Payments - Contract payments

### Change Orders
- List Change Orders - Get all
- Get Change Order - Get by ID
- Create Change Order - Create new
- Update Change Order - Update
- Approve Change Order - Approve

### Invoices
- List Invoices - Get all invoices
- Get Invoice - Get by ID
- Create Invoice - Create invoice
- Update Invoice - Update invoice
- Submit Invoice - Submit for approval
- Approve Invoice - Approve invoice

### Schedule
- Get Schedule - Get project schedule
- List Tasks - Get schedule tasks
- Get Task - Get task by ID
- Update Task - Update task
- List Milestones - Get milestones

### Directory (Contacts)
- List Contacts - Get all contacts
- Get Contact - Get by ID
- Create Contact - Create contact
- Update Contact - Update contact
- Delete Contact - Delete contact

### Correspondence
- List Correspondence - Get all items
- Get Correspondence - Get by ID
- Create Correspondence - Create item
- Update Correspondence - Update item

## Trigger Node

The Procore Trigger node supports webhook-based event notifications:

| Event | Description |
|-------|-------------|
| projectCreated | New project created |
| rfiCreated | New RFI created |
| rfiUpdated | RFI updated |
| submittalCreated | Submittal created |
| documentUploaded | Document uploaded |
| punchItemCreated | Punch item created |
| punchItemClosed | Punch item closed |
| changeOrderCreated | Change order created |
| invoiceSubmitted | Invoice submitted |
| inspectionCompleted | Inspection completed |
| dailyLogCreated | Daily log created |

## Usage Examples

### List Projects with Filters

```json
{
  "resource": "projects",
  "operation": "listProjects",
  "companyId": 123456,
  "filters": {
    "status": "active"
  }
}
```

### Create an RFI

```json
{
  "resource": "rfis",
  "operation": "createRfi",
  "companyId": 123456,
  "projectId": 789012,
  "subject": "Electrical conduit routing clarification",
  "question": "Please clarify the routing for electrical conduits in section B3.",
  "priority": "high",
  "additionalFields": {
    "due_date": "2024-02-01",
    "schedule_impact": true
  }
}
```

### Upload a Document

```json
{
  "resource": "documents",
  "operation": "uploadDocument",
  "companyId": 123456,
  "projectId": 789012,
  "name": "Architectural Plans Rev 2",
  "folderId": 456,
  "binaryPropertyName": "data"
}
```

## Procore Concepts

| Concept | Description |
|---------|-------------|
| Company ID | Procore company identifier (required for all operations) |
| Project ID | Project identifier (required for project-level resources) |
| RFI | Request for Information - formal questions requiring answers |
| Submittal | Document submission for approval (shop drawings, samples) |
| Punch List | Deficiency items requiring completion |
| Observation | Safety or quality observation record |
| Daily Log | Daily field activity report |
| Change Order | Contract modification request |

## API Endpoints

| Environment | Base URL |
|-------------|----------|
| Production | https://api.procore.com/rest/v1.0/ |
| Sandbox | https://sandbox.procore.com/rest/v1.0/ |

## Error Handling

The node handles common Procore API errors:

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 401 | Unauthorized | Check OAuth credentials |
| 403 | Forbidden | Verify permissions |
| 404 | Not Found | Check resource IDs |
| 422 | Unprocessable | Validate input data |
| 429 | Rate Limited | Reduce request frequency |

## Security Best Practices

1. **Use OAuth 2.0** - Always use OAuth authentication
2. **Sandbox Testing** - Test in sandbox before production
3. **Minimal Permissions** - Request only needed scopes
4. **Secure Credentials** - Never expose client secrets
5. **Token Refresh** - Implement proper token refresh

## Development

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the project
npm run build

# Development mode with watch
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

- [Procore Developer Portal](https://developers.procore.com)
- [n8n Community](https://community.n8n.io)
- [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-procore/issues)

## Acknowledgments

- [Procore](https://www.procore.com) for their comprehensive API
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for contributions and feedback
