export function getBrowserInfo(userAgent: string): string {
  const edge = userAgent.match(/Edg\/([\d.]+)/);
  if (edge) {
    return `Edge ${majorVersion(edge[1])}`;
  }

  const chrome = userAgent.match(/Chrome\/([\d.]+)/);
  if (chrome && !/Edg\//.test(userAgent)) {
    return `Chrome ${majorVersion(chrome[1])}`;
  }

  const firefox = userAgent.match(/Firefox\/([\d.]+)/);
  if (firefox) {
    return `Firefox ${majorVersion(firefox[1])}`;
  }

  const safari = userAgent.match(/Version\/([\d.]+).*Safari\//);
  if (safari && !/Chrome\//.test(userAgent)) {
    return `Safari ${minorVersion(safari[1])}`;
  }

  return "알 수 없는 브라우저";
}

export function getOperatingSystemInfo(userAgent: string): string {
  if (/Mac OS X|Macintosh/i.test(userAgent)) {
    return "macOS";
  }

  if (/Windows NT/i.test(userAgent)) {
    return "Windows";
  }

  if (/Android/i.test(userAgent)) {
    return "Android";
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "iOS";
  }

  if (/Linux/i.test(userAgent)) {
    return "Linux";
  }

  return "알 수 없는 OS";
}

export function getScreenSizeLabel(width: number, height: number): string {
  return `${width} x ${height}`;
}

function majorVersion(version: string): string {
  return version.split(".")[0] ?? version;
}

function minorVersion(version: string): string {
  const [major, minor] = version.split(".");
  return minor ? `${major}.${minor}` : major ?? version;
}
