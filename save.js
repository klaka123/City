import { buildings } from "./buildings.js";

export function saveGame() {
  const data = [...buildings.entries()].map(([k,v]) => ({
    key: k,
    level: v.level
  }));
  localStorage.setItem("city_save", JSON.stringify(data));
}

export function loadGame() {
  const data = JSON.parse(localStorage.getItem("city_save") || "[]");
  data.forEach(() => {});
}
