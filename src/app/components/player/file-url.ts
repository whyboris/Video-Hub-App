/**
 * Turn a file system path into a `file://` URL the <video> element can load
 * Encodes every path segment, so names with `#`, `?`, `%` or spaces work
 *  - `C:\Videos\a #1.mp4`      => `file:///C:/Videos/a%20%231.mp4`
 *  - `\nas\share\b.mp4`       => `file://nas/share/b.mp4`
 *  - `/home/me/c.mp4`          => `file:///home/me/c.mp4`
 */
export function fileUrl(fullPath: string): string {
  const forward: string = fullPath.replace(/\\/g, '/');

  const encode = (path: string): string => path
    .split('/')
    .map((segment: string) => /^[a-zA-Z]:$/.test(segment) ? segment : encodeURIComponent(segment))
    .join('/');

  if (/^[a-zA-Z]:\//.test(forward)) {
    return 'file:///' + encode(forward);
  }
  if (forward.startsWith('//')) {
    return 'file:' + encode(forward);
  }
  return 'file://' + encode(forward);
}
