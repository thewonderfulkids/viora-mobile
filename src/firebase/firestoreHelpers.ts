export function getTodayKey(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

export function createBaseDoc(uid: string) {
  const now = new Date().toISOString();

  return {
    uid,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTimestamp() {
  return {
    updatedAt: new Date().toISOString(),
  };
}