CDK Integration Notes — Performance API

1) Ensure API is deployed and publicly accessible.

2) Inject SPA runtime configuration:
- Add a small script tag into the deployed `index.html` that sets `window.__PERFORMANCE_API_BASE` to the API base URL, e.g.:

```html
<script>
  window.__PERFORMANCE_API_BASE = "https://j1d6emqagj.execute-api.us-east-1.amazonaws.com/dev";
  // Optionally add other runtime flags here
</script>
```

This allows the SPA to call the correct API without rebuilding for each environment.

Note: The SPA will fall back to the canonical dev API URL `https://j1d6emqagj.execute-api.us-east-1.amazonaws.com/dev` if `window.__PERFORMANCE_API_BASE` is not provided at runtime. Providing the runtime script is still recommended for non-dev environments.

3) CORS
- Make sure API Gateway returns the appropriate CORS headers for GET/POST and preflight OPTIONS from the SPA origin.

4) S3 seeding
- Upload `performance/current.json` into the site bucket under `performance/current.json` (see earlier checklist). Make the object readable.

5) IAM
- Lambda requires s3:GetObject and s3:PutObject scoped to the `performance/current.json` resource.

6) Local dev convenience
- The repo includes `proxy.conf.json` that can forward `/performance` to the dev API to avoid CORS during local `ng serve`.
  - Start dev server: `ng serve --proxy-config proxy.conf.json`
