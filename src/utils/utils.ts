export function extractSrcUrl(iframeString: string) {
  const srcMatch = iframeString.match(/src="([^"]+)"/);
  return srcMatch ? srcMatch[1] : null;
}

export function isValidMapLink(iframeString: string) {
  const srcMatch = iframeString.match(/src="([^"]+)"/);
  if (!srcMatch) return false;
  
  const srcUrl = srcMatch[1];
  
  return (srcUrl ?? "").startsWith("https://www.google.com/maps/embed?pb=");
}

export function to12Hours(time24: string) {
  const [hours, minutes] = time24.split(":");
  const hoursInt = parseInt(hours ?? "0", 10);
  const period = hoursInt >= 12 ? "PM" : "AM";
  const hours12 = hoursInt % 12 || 12; // Converts '0' to '12'
  return `${hours12}:${minutes} ${period}`;
}

function convertToDate(time24: string): Date {
  const [hours = 0, minutes = 0] = time24.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
}

export function isLabOpen(start24: string, end24: string): boolean {
  const now = new Date();
  const openingTime = convertToDate(start24);
  const closingTime = convertToDate(end24);

  return now >= openingTime && now <= closingTime;
}