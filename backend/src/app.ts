import cors from "cors";
import express from "express";
import {
    isValidNightlyPrice,
    minimumNightlyPrice,
} from "./pricing.js";

export const app = express();
app.use(cors({
    origin: "http://127.0.0.1:8000"
}));
app.use(express.json());

app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
});

app.post("/api/price-preview", (request, response) => {
    const nightlyPrice: unknown = request.body?.nightlyPrice;
    if (nightlyPrice === null) {
        response.json({
            nightlyPrice: null,
            previewText: "Güncel oda fiyatları için iletişime geçin.",
        });
        return;
    }
    if (!isValidNightlyPrice(nightlyPrice)) {
        response.status(400).json({
            error: `Fiyat ${minimumNightlyPrice} TL veya daha yüksek bir tamsayı olmalıdır.`,
        });
        return;
    }

    response.json({
        nightlyPrice,
        previewText:
            `Gecelik oda fiyatları için minimum fiyat ${nightlyPrice} TL'dir.`,
    });
});

app.use((_request, response) => {
    response.status(404).json({ error: "Route not found" });
});

