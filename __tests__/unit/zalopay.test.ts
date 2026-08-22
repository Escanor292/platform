import crypto from "crypto";
import { createZaloPayTransactionId, verifyZaloPayCallback } from "@/lib/payment/zalopay";

describe("ZaloPay payment contract", () => {
  const previousAppId = process.env.ZALOPAY_APP_ID;
  const previousKey1 = process.env.ZALOPAY_KEY1;
  const previousKey2 = process.env.ZALOPAY_KEY2;

  beforeEach(() => {
    process.env.ZALOPAY_APP_ID = "2553";
    process.env.ZALOPAY_KEY1 = "order-key-for-test";
    process.env.ZALOPAY_KEY2 = "callback-key-for-test";
  });

  afterAll(() => {
    process.env.ZALOPAY_APP_ID = previousAppId;
    process.env.ZALOPAY_KEY1 = previousKey1;
    process.env.ZALOPAY_KEY2 = previousKey2;
  });

  it("builds an app_trans_id with the required Vietnamese date prefix", () => {
    const transactionId = createZaloPayTransactionId("0b4b6b8c-7f08-4f1b-9482-111111111111");
    expect(transactionId).toMatch(/^\d{6}_[a-z0-9]{28}$/);
  });

  it("accepts a valid callback MAC and rejects a modified payload", () => {
    const data = JSON.stringify({ app_trans_id: "260822_test", amount: 100000 });
    const mac = crypto.createHmac("sha256", process.env.ZALOPAY_KEY2!).update(data).digest("hex");
    expect(verifyZaloPayCallback(data, mac)).toBe(true);
    expect(verifyZaloPayCallback(`${data}x`, mac)).toBe(false);
  });
});
