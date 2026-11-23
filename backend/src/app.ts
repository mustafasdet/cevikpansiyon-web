import cors from "cors";
import express from "express";
import {
    isValidNightlyPrice,
    minimumNightlyPrice,
} from "./pricing.js";
import { Pool } from "pg";

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


const db = new Pool({ connectionTimeoutMillis: 3000 });
app.get("/api/rooms", async (_request, response) => {
    try {
        const result = await db.query(
            "SELECT id, nightly_price FROM public.rooms ORDER BY id"
        );
        response.json(result.rows);
    } catch (error) {
        console.error("Could not read rooms:", error);
        response.status(500).json({ error: "Oda bilgileri okunamadı." });
    }
});

app.patch("/api/rooms/:id/price", async (request, response) => {
    const roomId = Number(request.params.id);
    const nightlyPrice: unknown = request.body?.nightlyPrice;

    if (!Number.isInteger(roomId) || roomId < 1 || roomId > 2147483647) {
        response.status(400).json({ error: "Geçersiz oda numarası." });
        return;
    }

    if (nightlyPrice !== null && !isValidNightlyPrice(nightlyPrice)) {
        response.status(400).json({
            error: `Fiyat ${minimumNightlyPrice} TL veya daha yüksek bir tamsayı olmalıdır.`,
        });
        return;
    }

    try {
        const result = await db.query(
            `UPDATE public.rooms
             SET nightly_price = $1
             WHERE id = $2
             RETURNING id, nightly_price`,
            [nightlyPrice, roomId],
        );

        if (result.rows.length === 0) {
            response.status(404).json({ error: "Oda bulunamadı." });
            return;
        }

        response.json(result.rows[0]);
    } catch (error) {
        console.error("Could not update room price:", error);
        response.status(500).json({ error: "Oda fiyatı kaydedilemedi." });
    }
});
app.use((_request, response) => {
    response.status(404).json({ error: "Route not found" });
});

