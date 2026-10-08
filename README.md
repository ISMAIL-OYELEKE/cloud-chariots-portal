# Cloud Chariots Internal Staff Portal

The web frontend for an internal staff portal built at Cloud Chariots. Staff use it to request leave and payroll advances, log transport, and submit appraisals. Managers use it to review and approve those requests.

## What this repository contains

This repository holds **the frontend only**: a static HTML, CSS and JavaScript app with no build step.

| File | Purpose |
| --- | --- |
| `index.html` | The single page: sign in, sign up, the staff dashboard and the manager review views |
| `app.js` | Calls the portal API and renders requests, approvals and notifications |
| `style.css` | Styles |
| `images/` | Logos |

The backend is **not** in this repository. The frontend talks to it through an Amazon API Gateway API in `eu-west-2` (London).

## The backend, and where it is documented

The backend and its infrastructure were built in the company's AWS account, so their source and configuration are not public. In outline:

- **Amazon API Gateway** receives the frontend's requests for sign in, leave, payroll advances, transport logs and appraisals.
- **AWS Lambda** functions handle each route.
- **Amazon DynamoDB** stores request state, sessions and the notification feed.
- **Amazon SES** sends status emails as a request moves through approval.
- **Amazon EventBridge** schedules reminders and status digests.
- **AWS IAM** gives each function only the access it needs.

The architecture diagram, the design decisions and the results are written up in the case study:
**[Enterprise staff portal case study](https://ismailoyeleke.com/projects/enterprise-staff-portal)**

## Running the frontend locally

Serve the folder with any static file server, for example:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. It needs the backend API to be reachable to sign in.
