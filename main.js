// main.js
const statusTab = document.getElementById("status-tab");
const ipTab = document.getElementById("ip-tab");
const statusContainer = document.getElementById("status-container");
const ipContainer = document.getElementById("ip-container");
const passwordInput = document.getElementById("password-input");
const ipInfo = document.getElementById("ip-info");

const statusText = document.getElementById("status-text");
const playersText = document.getElementById("players-text");
const offlineDisclaimer = document.getElementById("offline-disclaimer");
const debugInfo = document.getElementById("debug-info");

const PASSWORD = "123";
const PASSWORD_KEY = "ip_access_pass";
const PASSWORD_VERSION = "v1";

const SERVER_IP = "ilaymc.ddns.net";
const SERVER_PORT = "19132";

const DEBUG_MODE = false;

const showTab = (tab) => {
  if (tab === "status") {
    statusContainer.classList.remove("hidden");
    ipContainer.classList.add("hidden");
  } else {
    statusContainer.classList.add("hidden");
    ipContainer.classList.remove("hidden");
  }
};

statusTab.onclick = () => showTab("status");
ipTab.onclick = () => showTab("ip");

function validatePassword(pass) {
  return pass === PASSWORD;
}

function checkPassword() {
  const saved = localStorage.getItem(PASSWORD_KEY);
  if (saved === PASSWORD + PASSWORD_VERSION) {
    ipInfo.classList.remove("hidden");
    passwordInput.classList.add("hidden");
  } else {
    ipInfo.classList.add("hidden");
    passwordInput.classList.remove("hidden");
  }
}

passwordInput.addEventListener("change", () => {
  const entered = passwordInput.value;
  if (validatePassword(entered)) {
    localStorage.setItem(PASSWORD_KEY, PASSWORD + PASSWORD_VERSION);
    checkPassword();
  } else {
    alert("Incorrect password.");
  }
});

checkPassword();

function updateDebugInfo(message) {
  if (DEBUG_MODE) {
    debugInfo.classList.remove("hidden");
    debugInfo.innerHTML += `<p>${message}</p>`;
  }
}

async function fetchStatus() {
  const apiUrls = [
    `https://api.mcstatus.io/v2/status/bedrock/${SERVER_IP}:${SERVER_PORT}`,
    `https://api.mcstatus.io/v2/status/bedrock/${SERVER_IP}:${SERVER_PORT}`
  ];

  let successfulUrl = null;
  let responseData = null;

  debugInfo.innerHTML = "";
  updateDebugInfo("Starting status check...");

  for (const url of apiUrls) {
    try {
      updateDebugInfo(`Trying URL: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        updateDebugInfo(`Failed with status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      updateDebugInfo(`Response received: ${JSON.stringify(data).substring(0, 100)}...`);

      if (data && typeof data.online === 'boolean') {
        successfulUrl = url;
        responseData = data;
        updateDebugInfo(`Success with URL: ${url}`);
        break;
      }
    } catch (err) {
      updateDebugInfo(`Error with URL ${url}: ${err.message}`);
    }
  }

  if (!responseData) {
    updateDebugInfo("All URL formats failed");
    statusText.textContent = "Server Offline";
    statusText.className = "status-offline";
    playersText.textContent = "";
    offlineDisclaimer.classList.remove("hidden");
    const playerList = document.getElementById("player-list");
    if (playerList) playerList.remove();
    return;
  }

  const online = responseData.online;
  updateDebugInfo(`Server online status: ${online}`);

  if (!online) {
    statusText.textContent = "Server Offline";
    statusText.className = "status-offline";
    playersText.textContent = "";
    offlineDisclaimer.classList.remove("hidden");
    const playerList = document.getElementById("player-list");
    if (playerList) playerList.remove();
    return;
  }

  statusText.textContent = "Online";
  statusText.className = "status-online";
  playersText.textContent = `${responseData.players.online}/${responseData.players.max} players`;

  // Remove previous player list if exists
  const existingList = document.getElementById("player-list");
  if (existingList) existingList.remove();

  if (Array.isArray(responseData.players?.list) && responseData.players.list.length > 0) {
    const listContainer = document.createElement("div");
    listContainer.id = "player-list";
    listContainer.style.marginTop = "1rem";

    responseData.players.list.forEach(player => {
      const playerEl = document.createElement("div");
      playerEl.className = "player";

      const avatar = document.createElement("img");
      avatar.src = `https://crafthead.net/avatar/${player.name}/32`;
      avatar.alt = player.name;

      const name = document.createElement("span");
      name.textContent = player.name;

      playerEl.appendChild(avatar);
      playerEl.appendChild(name);
      listContainer.appendChild(playerEl);
    });

    playersText.parentNode.insertBefore(listContainer, playersText.nextSibling);
  }

  offlineDisclaimer.classList.add("hidden");

  if (successfulUrl) {
    localStorage.setItem("successful_api_url", successfulUrl);
    updateDebugInfo(`Saved successful URL format for future use: ${successfulUrl}`);
  }
}

fetchStatus();
setInterval(fetchStatus, 15000);
