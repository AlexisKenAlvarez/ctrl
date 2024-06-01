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