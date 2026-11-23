import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { app } from "./app.js";

let server: Server;
let endpoint: string;

before(async () => {
    // Port 0 asks the operating system to choose an available test port.
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    endpoint = `http://127.0.0.1:${address.port}/api/price-preview`;
});

after(async () => {
    if (server) {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
});

async function postPreview(body: unknown) {
    return fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

// These are fixed expectations from the requirement, independent of app output.
for (const price of [500, 750]) {
    test(`POST accepts numeric ${price} and returns its preview`, async () => {
        const response = await postPreview({ nightlyPrice: price });
        assert.equal(response.status, 200);
        assert.match(response.headers.get("content-type") ?? "", /application\/json/);
        assert.deepEqual(await response.json(), {
            nightlyPrice: price,
            previewText: `Gecelik oda fiyatları için minimum fiyat ${price} TL'dir.`,
        });
    });
}

test("POST accepts explicit null as contact-for-pricing", async () => {
    const response = await postPreview({ nightlyPrice: null });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        nightlyPrice: null,
        previewText: "Güncel oda fiyatları için iletişime geçin.",
    });
});

const invalidCases = [
    { name: "missing price field", body: {} },
    { name: "zero", body: { nightlyPrice: 0 } },
    { name: "below-minimum price", body: { nightlyPrice: 222 } },
    { name: "fractional price", body: { nightlyPrice: 500.5 } },
    { name: "numeric string", body: { nightlyPrice: "500" } },
    { name: "empty string", body: { nightlyPrice: "" } },
    { name: "text null instead of JSON null", body: { nightlyPrice: "null" } },
];

for (const { name, body } of invalidCases) {
    test(`POST rejects ${name}`, async () => {
        const response = await postPreview(body);
        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), {
            error: "Fiyat 500 TL veya daha yüksek bir tamsayı olmalıdır.",
        });
    });
}
