const mainMenuBtn = document.getElementById("mainMenuBtn");

mainMenuBtn?.addEventListener("click", () => {
  const confirmLeave = confirm(
    "Are you sure you want to return to the main menu? Unsaved progress will be lost."
  );
  if (confirmLeave) {
    window.location.href = "./index.html";
  }
});
