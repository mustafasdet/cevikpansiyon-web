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

priceForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // if (contactForPrice.checked) {
    //     pricePreview.textContent =
    //         "Güncel oda fiyatları için iletişime geçin.";
    //     return;
    // }

    pricePreview.textContent = "Fiyat kontrol ediliyor...";

    try {
        const response = await fetch(
            "http://127.0.0.1:9000/api/price-preview",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nightlyPrice: contactForPrice.checked
                        ? null
                        : Number(priceInput.value),
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            pricePreview.textContent = data.error;
            return;
        }

        pricePreview.textContent = data.previewText;
    } catch (error) {
        pricePreview.textContent =
            "Fiyat kontrol edilemedi. Lütfen tekrar deneyin.";
        console.error("Price preview request failed:", error);
    }
});