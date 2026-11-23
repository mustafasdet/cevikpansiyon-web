const priceForm = document.getElementById("price-form");
const priceInput = document.getElementById("nightly-price");
const pricePreview = document.getElementById("price-preview");
const contactForPrice = document.getElementById("contact-for-price");

contactForPrice.addEventListener("change", () => {
    if (contactForPrice.checked) {
        priceInput.value = "";
    }

    priceInput.disabled = contactForPrice.checked;
    pricePreview.textContent = "";
});

// priceForm.addEventListener("submit", (event) => {
//     event.preventDefault();

//     if (contactForPrice.checked) {
//         pricePreview.textContent =
//             "Güncel oda fiyatları için iletişime geçin.";
//         priceInput.value = "";
//     } else {
//         pricePreview.textContent =
//             `Gecelik oda fiyatları için minimum fiyat ${priceInput.value} TL'dir.`;
//     }
// });

const api = "http://127.0.0.1:9000";
const roomSelect = document.getElementById("room-select");
const savedPrices = new Map();
const previewButton = document.getElementById("preview-price");
const saveButton = document.getElementById("save-price");

function setBusy(busy) {
    roomSelect.disabled = busy || savedPrices.size === 0;
    contactForPrice.disabled = busy;
    priceInput.disabled = busy || contactForPrice.checked;
    previewButton.disabled = busy;
    saveButton.disabled = busy || !savedPrices.has(roomSelect.value);
}

function applySavedPrice(price) {
    contactForPrice.checked = price === null;
    priceInput.value = price === null ? "" : String(price);
}

function showSelectedRoom() {
    const price = savedPrices.get(roomSelect.value);
    applySavedPrice(price);
    priceInput.disabled = contactForPrice.checked;
    pricePreview.textContent = price === null
        ? "Güncel oda fiyatları için iletişime geçin."
        : `Kayıtlı gecelik fiyat: ${price} TL.`;
}

roomSelect.addEventListener("change", showSelectedRoom);

async function loadRooms() {
    setBusy(true);
    pricePreview.textContent = "Kayıtlı fiyat yükleniyor...";
    try {
        const response = await fetch(`${api}/api/rooms`, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const rooms = await response.json();
        if (rooms.length === 0) {
            pricePreview.textContent = "Kayıtlı oda bulunamadı.";
            return;
        }

        for (const room of rooms) {
            const id = String(room.id);
            savedPrices.set(id, room.nightly_price);
            roomSelect.add(new Option(`Oda ${id}`, id));
        }
        roomSelect.value = String(rooms[0].id);
        showSelectedRoom();
    } catch (error) {
        pricePreview.textContent = "Kayıtlı fiyat yüklenemedi. Sayfayı yenileyip tekrar deneyin.";
        console.error("Room price load failed:", error);
    } finally {
        setBusy(false);
    }
}

priceForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const saving = event.submitter === saveButton;
    const roomId = roomSelect.value;
    if (saving && !savedPrices.has(roomId)) return;

    const nightlyPrice = contactForPrice.checked ? null : priceInput.valueAsNumber;
    if (nightlyPrice !== null && !Number.isFinite(nightlyPrice)) {
        pricePreview.textContent = "Geçerli bir fiyat girin.";
        return;
    }

    setBusy(true);
    pricePreview.textContent = saving ? "Fiyat kaydediliyor..." : "Fiyat kontrol ediliyor...";
    try {
        const path = saving ? `/api/rooms/${roomId}/price` : "/api/price-preview";
        const response = await fetch(api + path, {
            method: saving ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nightlyPrice }),
        });

        const data = await response.json();
        if (!response.ok) {
            pricePreview.textContent = data.error;
            return;
        }

        if (saving) {
            savedPrices.set(roomId, data.nightly_price);
            applySavedPrice(data.nightly_price);
            pricePreview.textContent = data.nightly_price === null
                ? "Kaydedildi. Güncel oda fiyatları için iletişime geçin."
                : `Gecelik fiyat kaydedildi: ${data.nightly_price} TL.`;
        } else {
            pricePreview.textContent = data.previewText;
        }
    } catch (error) {
        pricePreview.textContent = saving
            ? "Fiyat kaydedilemedi. Lütfen tekrar deneyin."
            : "Fiyat kontrol edilemedi. Lütfen tekrar deneyin.";
        console.error("Price request failed:", error);
    } finally {
        setBusy(false);
    }
});

loadRooms();
