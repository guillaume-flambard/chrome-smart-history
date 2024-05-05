document.getElementById("clean-btn").addEventListener("click", async () => {
  // Demander à l'API de fond d'analyser et de nettoyer l'historique
  chrome.runtime.sendMessage({ action: "cleanHistory" }, function (response) {
    console.log("Response:", response);
  });
});
