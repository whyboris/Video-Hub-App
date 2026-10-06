// Playlists and compilations -- stored in `<hubName>.playlists.json` next to the `.vha2` file
// so that the official app, which rebuilds the `.vha2` from known fields, can never erase them.
// See `docs/playlists-and-compilations.md`

export type PlaylistKind = 'playlist' | 'compilation';   // display hint only -- both hold the same entries

export interface PlaylistEntry {
  id: string;                    // uuid -- the same video may appear more than once
  hash: string;                  // `ImageElement.hash` -- content-based so survives rename & move
  start?: number;                // seconds -- both `start` and `end` absent => whole video
  end?: number;                  // seconds
  label?: string;                // e.g. "Grandma's birthday cake"
  added: number;                 // timestamp
  // hints to re-link the entry if the file was edited (which changes the hash)
  fileName: string;
  partialPath: string;
  inputSource: number;
}

export interface Playlist {
  id: string;                    // uuid
  name: string;
  kind: PlaylistKind;
  created: number;               // timestamp
  modified: number;              // timestamp
  entries: PlaylistEntry[];      // order === play order
}

export interface PlaylistFile {
  version: 1;
  hubName: string;
  lastUsedPlaylistId?: string;   // target for the thumbnail playlist icon
  highlightTargetId?: string;    // compilation that highlights marked in the player go into
  playlists: Playlist[];
}

// A highlight of one video, wherever it is stored
export interface HighlightRef {
  playlist: Playlist;
  entry: PlaylistEntry;
}

// What the renderer sends to node to build an `.m3u8` for an external player
export interface ExternalPlaylistItem {
  duration: number;              // seconds
  fullPath: string;
  title: string;
  start?: number;                // seconds
  end?: number;                  // seconds
}

// Sent back after `please-load-playlists`
//  - ''                    -- all good (data may be `null` when the hub has no playlists file yet)
//  - 'restoredFromBackup'  -- main file was unreadable; data is from the `.bak`
//  - 'unreadable'          -- neither file could be read; renderer must not overwrite anything
export type PlaylistLoadStatus = '' | 'restoredFromBackup' | 'unreadable';
