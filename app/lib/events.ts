export type EventItem = {
  id: string;
  title: string;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  audience: string;
  description: string;
  registrationUrl: string;
  format: string;
  image: string;
};

export const sheetCsvUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRN3Y4zJ-ReF0qFUbd8BPwdlwbWNZBA2RYL2XX3rWi51OeQtK2R4DOO8bwic1PH-WKJQyoVLudn0w2V/pub?gid=1291996599&single=true&output=csv";

function csvToRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else inQuotes = false;
      } else field += character;
    } else if (character === '"') inQuotes = true;
    else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (character !== "\r") field += character;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function normalizeDate(value: string) {
  const match = String(value || "").match(/(\d{4})[/.–-](\d{1,2})[/.–-](\d{1,2})/);
  if (!match) return value || "";
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

function normalizeTime(value: string) {
  const text = String(value || "").trim();
  const match = text.match(/^(上午|下午)?\s*(\d{1,2}):(\d{2})/);
  if (!match) return text;
  let hour = Number(match[2]);
  if (match[1] === "下午" && hour < 12) hour += 12;
  if (match[1] === "上午" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${match[3]}`;
}

function normalizeImage(value: string) {
  const match =
    value.match(/drive\.google\.com\/file\/d\/([^/]+)/) ||
    value.match(/drive\.google\.com\/open\?id=([^&]+)/);
  return match ? `https://lh3.googleusercontent.com/d/${match[1]}` : value;
}

export function parseEvents(text: string): EventItem[] {
  const rows = csvToRows(text);
  const headers = rows[0] || [];
  const pick = (record: Record<string, string>, aliases: string[]) =>
    aliases.map((alias) => record[alias]).find(Boolean) || "";
  return rows.slice(1).filter((row) => row.some((value) => value.trim())).map((row, index) => {
    const record: Record<string, string> = {};
    headers.forEach((header, headerIndex) => {
      record[header.trim()] = (row[headerIndex] || "").trim();
    });
    const timestamp = pick(record, ["id", "時間戳記", "提交時間"]);
    return {
      id: timestamp || `event-${index}`,
      title: pick(record, ["title", "主題", "活動主題"]),
      date: normalizeDate(pick(record, ["date", "日期 (開始)", "日期", "開始日期"])),
      endDate: normalizeDate(pick(record, ["endDate", "日期 (結束)", "結束日期"])),
      startTime: normalizeTime(pick(record, ["startTime", "時間 (開始)", "開始時間"])),
      endTime: normalizeTime(pick(record, ["endTime", "時間 (結束)", "結束時間"])),
      location: pick(record, ["location", "活動地點", "地點"]),
      audience: pick(record, ["audience", "開放報名對象範圍（可多選、但儘量單一）", "對象"]),
      description: pick(record, ["description", "活動簡要說明 (引文)", "活動簡要", "簡介"]),
      registrationUrl: pick(record, ["registrationUrl", "報名網址 / 報名接龍群組", "報名網址"]),
      format: pick(record, ["format", "活動形式", "形式"]),
      image: normalizeImage(pick(record, ["image", "上傳活動海報", "活動海報"])),
    };
  }).filter((event) => event.title && event.date);
}

export function isPastEvent(event: EventItem) {
  return new Date(`${event.endDate || event.date}T23:59:59`) < new Date();
}

export function formatEventDate(start: string, end: string) {
  const format = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date);
  };
  return end && end !== start ? `${format(start)}－${format(end)}` : format(start);
}
