/* Team profile pages — standalone designs, so only the small shared bits. */
const year = String(new Date().getFullYear());
document.querySelectorAll("[data-current-year]").forEach((slot) => {
  slot.textContent = year;
});

document.querySelectorAll("img[data-fallback]").forEach((image) => {
  image.addEventListener(
    "error",
    () => {
      image.src = image.getAttribute("data-fallback");
    },
    { once: true }
  );
});
