// const priceForm = document.getElementById("price-form");
// const priceInput = document.getElementById("nightly-price");
// const pricePreview = document.getElementById("price-preview");

// priceForm.addEventListener("submit", (event) => {
//     event.preventDefault();

//     pricePreview.textContent =
//         `Gecelik oda fiyatları için minimum fiyat ${priceInput.value} TL'dir.`;
// });
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

priceForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (contactForPrice.checked) {
        pricePreview.textContent =
            "Güncel oda fiyatları için iletişime geçin.";
        priceInput.value = "";
    } else {
        pricePreview.textContent =
            `Gecelik oda fiyatları için minimum fiyat ${priceInput.value} TL'dir.`;
    }
});