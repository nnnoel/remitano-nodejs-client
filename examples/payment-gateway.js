import RemitanoClient from "remitano-nodejs-client";

// Initial client with your Merchant enabled account
const client = new RemitanoClient({
  baseURL: "https://remidemo.com", // Use this url for sandbox testing on testnet. Otherwise, just omit baseURL entirely. The production api is used by default.
  // Refer to this link on setting up an account on testnet: https://developers.remitano.com/docs/payment-gateway/quick-start#sandbox-testing
  accessKey: "xxx", // Ensure the merchant api key/secret corresponds with the same account on testnet or mainnet.
  secretKey: "xxx",
});

(async () => {
  // Create a merchant charge.
  // Refer to this link on how it works: https://developers.remitano.com/docs/payment-gateway/quick-start#how-it-works

  // For crypto charges: https://developers.remitano.com/docs/payment-gateway/quick-start#coin-currencies
  const exampleChargeForCrypto = await client.request({
    url: "/api/v1/merchant/merchant_charges",
    method: "post",
    body: {
      coin_currency: "usdt",
      coin_amount: 20,
      cancelled_or_completed_callback_url: "https://myapi.example/some-callback-endpoint",
      cancelled_or_completed_redirect_url: "https://myapi.example/some-redirect-endpoint", // If omitted, defaults to `cancelled_or_completed_callback_url`
      description: "Example charge for 20 USDT",
    },
  });

  // For fiat charges: https://developers.remitano.com/docs/payment-gateway/quick-start#fiat-currencies
  const exampleChargeForFiat = await client.request({
    url: "/api/v1/merchant/merchant_charges",
    method: "post",
    body: {
      fiat_currency: "usd",
      fiat_amount: 20,
      cancelled_or_completed_callback_url: "https://myapi.example/some-callback-endpoint",
      cancelled_or_completed_redirect_url: "https://myapi.example/some-redirect-endpoint",
      description: "Example charge for 20 USD",
    },
  });

  console.log({ exampleChargeForCrypto, exampleChargeForFiat });

  // Get a merchant charge by ID.
  // Once your customer processes the checkout of your merchant charge,
  // the charge callback url generated will contain a `remitano_id` query param with the id of the charge.
  // In your callback controller, use this id to fetch the merchant charge. The result will include the latest status.

  const exampleExistingCharge = await client.request({
    url: `/api/v1/merchant/merchant_charges/${exampleChargeForCrypto.id}`,
  });

  console.log({ exampleExistingCharge });
})();
