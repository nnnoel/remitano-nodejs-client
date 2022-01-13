## Remitano NodeJS Client

API explorer: https://developers.remitano.com/api-explorer/

1. Generate an API key/secret from your Remitano account settings

2. Example usage

```javascript
import RemitanoClient from "remitano-nodejs-client";

const client = new RemitanoClient({
  accessKey: "xxx",
  secretKey: "xxx",
});

(async () => {
  const result = await client.request({ url: "/api/v1/users/me" });
  console.log(result)
})();
```
