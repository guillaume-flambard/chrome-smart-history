// background.js

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "cleanHistory") {
    chrome.history.search(
      { text: "", maxResults: 100 },
      async function (historyItems) {
        const urls = historyItems.map((item) => item.url); // Collecte des URLs
        const suspiciousSites = await analyzeHistory(urls);
        removeSuspiciousSites(suspiciousSites); // Supposer que la réponse est une liste d'URLs séparées par des virgules
        sendResponse({ status: "History cleaned" });
      }
    );
    return true; // pour indiquer que la réponse sera asynchrone
  }
});

async function analyzeHistory(historyItems) {
  try {
    const cleanedUrls = historyItems
      .map((url) => cleanUrl(url))
      .filter((hostname) => hostname !== "");
    if (cleanedUrls.length === 0) {
      console.log("No valid URLs to analyze.");
      return [];
    }

    const promptText =
      "Identify any adult or suspicious websites from the following list: " +
      cleanedUrls.join(", ");
    console.log("Sending prompt:", promptText);

    const payload = {
      messages: [{ role: "system", content: promptText }],
      max_tokens: 100,
      temperature: 0.3,
      model: "gpt-3.5-turbo",
    };

    const response = await fetch("http://localhost:3000/api/query", {
      // Point to your local server
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorBody}`
      );
    }
    const data = await response.json();
    console.log("API Response:", data);

    const resultText = data.choices[0].message.content;
    console.log("Extracted Content:", resultText);
    const urls = resultText.match(/\b[\w.-]+\.com\b/gi) || [];
    console.log("Extracted URLs:", urls);
    return urls;
  } catch (error) {
    console.error("Error while fetching from server:", error);
    return [];
  }
}

function removeSuspiciousSites(sites) {
  sites.forEach((site) => {
    const fullUrl = `https://${site}`; // Assuming https as the protocol
    chrome.history.deleteUrl({ url: fullUrl }, function () {
      if (chrome.runtime.lastError) {
        console.log(`Failed to remove: ${fullUrl}`, chrome.runtime.lastError);
      } else {
        console.log(`${fullUrl} has been removed from history.`);
      }
    });
  });
}

function cleanUrl(url) {
  try {
    const urlObject = new URL(url);
    return urlObject.hostname; // Retourne seulement le domaine
  } catch (error) {
    console.error("Invalid URL encountered:", url); // Afficher les URL invalides pour débogage
    return ""; // Retourne une chaîne vide pour les URL invalides
  }
}
