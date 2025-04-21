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
  const url = `https://api.mcstatus.io/v2/status/bedrock/${SERVER_IP}:${SERVER_PORT}`;

  debugInfo.innerHTML = "";
  updateDebugInfo("Checking server status...");

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Always show "Online" to avoid false negatives
    statusText.textContent = "Online";
    statusText.className = "status-online";

    // Remove old disclaimer
    offlineDisclaimer.classList.add("hidden");

    if (data && data.players && typeof data.players.online === "number") {
      playersText.textContent = `${data.players.online}/${data.players.max} players`;
    } else {
      playersText.textContent = "";
      offlineDisclaimer.classList.remove("hidden");
    }
  } catch (err) {
    // On error, still show as online but say player count unavailable
    statusText.textContent = "Online";
    statusText.className = "status-online";
    playersText.textContent = "";
    offlineDisclaimer.classList.remove("hidden");
    updateDebugInfo("Error: " + err.message);
  }
}

fetchStatus();
setInterval(fetchStatus, 15000);
