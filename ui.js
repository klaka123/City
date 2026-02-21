import { mode, toggleDayNight } from "./world.js";

export function initUI() {
  const ui = document.getElementById("ui");

  const buttons = [
    ["🏗 Строить", () => window.mode="build"],
    ["❌ Удалить", () => window.mode="delete"],
    ["🌗 День / Ночь", toggleDayNight],
    ["🔄 Новый город", () => location.reload()]
  ];

  buttons.forEach(([text, action]) => {
    const b = document.createElement("button");
    b.className = "ui-btn";
    b.textContent = text;
    b.onclick = action;
    ui.appendChild(b);
  });
}
