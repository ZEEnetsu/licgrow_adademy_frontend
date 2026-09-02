/**
 * YouTube link handling for course chapters — `api-contracts/08-course.md` §11.
 *
 * The contract accepts "a valid YouTube URL or 11-char video id, validated at
 * the edge", and returns 400 VALIDATION_ERROR otherwise. These helpers mirror
 * that validation client-side so a typo is caught before a round trip, and
 * derive the thumbnail/embed URLs the authoring UI needs.
 *
 * Pure and dependency-free — see the youtube.check suite.
 */

/** YouTube video ids are exactly 11 chars of URL-safe base64. */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const ALLOWED_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

/** Path prefixes that carry the id as the next segment. */
const PATH_FORMS = ["embed", "shorts", "live", "v"];

/**
 * Extract the video id from any accepted form.
 *
 * Handles: youtu.be/ID · watch?v=ID · /embed/ID · /shorts/ID · /live/ID ·
 * /v/ID · a bare 11-char id. Extra query params (`&t=30s`, playlists) are
 * ignored. Non-YouTube hosts return null.
 *
 * @param {string} input
 * @returns {string|null}
 */
export function parseYouTubeId(input) {
  if (typeof input !== "string") return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  // a bare id, pasted straight from the URL bar
  if (VIDEO_ID.test(trimmed)) return trimmed;

  let url;
  try {
    // tolerate a missing scheme — people paste "youtu.be/abc"
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return null;

  const segments = url.pathname.split("/").filter(Boolean);

  // youtu.be/<id>
  if (url.hostname.toLowerCase().endsWith("youtu.be")) {
    return VIDEO_ID.test(segments[0] ?? "") ? segments[0] : null;
  }

  // /watch?v=<id>
  const fromQuery = url.searchParams.get("v");
  if (fromQuery && VIDEO_ID.test(fromQuery)) return fromQuery;

  // /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
  if (PATH_FORMS.includes(segments[0]) && VIDEO_ID.test(segments[1] ?? "")) {
    return segments[1];
  }

  return null;
}

/** Does this input name a YouTube video? */
export function isValidYouTubeUrl(input) {
  return parseYouTubeId(input) !== null;
}

/**
 * Canonical watch URL. Storing this rather than whatever was pasted keeps
 * chapter records consistent regardless of which form the author used.
 */
export function youTubeWatchUrl(idOrUrl) {
  const id = parseYouTubeId(idOrUrl);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

/** Privacy-preserving embed host, for when chapters get a player. */
export function youTubeEmbedUrl(idOrUrl) {
  const id = parseYouTubeId(idOrUrl);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

/**
 * Thumbnail URL.
 *
 * The contract has no `thumbnail` field on a chapter — it doesn't need one,
 * because every chapter carries a video id and YouTube serves a still for it.
 *
 * @param {string} idOrUrl
 * @param {"default"|"medium"|"high"|"max"} [quality]
 */
export function youTubeThumbnail(idOrUrl, quality = "medium") {
  const id = parseYouTubeId(idOrUrl);
  if (!id) return null;

  const file = {
    default: "default.jpg",
    medium: "mqdefault.jpg",
    high: "hqdefault.jpg",
    max: "maxresdefault.jpg",
  }[quality] ?? "mqdefault.jpg";

  return `https://img.youtube.com/vi/${id}/${file}`;
}
