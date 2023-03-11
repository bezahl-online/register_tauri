export function getDateFromTimestamp(timestamp: number) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("de-AT");
  }
  
export function getTimeFromTimestamp(timestamp: number) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("de-AT");
  }
  