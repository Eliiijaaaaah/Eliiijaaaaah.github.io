# Eliiijaaaaah.github.io — a node

This repository is two things at once:

1. **A node.** It publishes `catalog.json`, a small JSON file describing what is released
   here and who this node is connected to. That file *is* the node. Everything else is
   delivery.
2. **A player.** `index.html` is the whole listening app in one self-contained file —
   inlined CSS and JS, no external requests. Opening it starts a crawl from whatever
   address you give it.

There is no server, no database, no accounts, and no registry. A node is a static file on
a domain somebody controls. A network is a set of those files that name each other.

## The idea in four sentences

Publishers put a manifest on their own domain listing their releases and their
connections. A listener opens the player, pastes in one address, and the player walks
outward from there — fetching each connected manifest, verifying the media actually
plays, and following the graph.

Nobody operates it. There is no index to be listed in and no algorithm to be ranked by.
**A connection only counts when both sides declare it**, so who you can reach is decided
entirely by who vouches for whom.

## Layout

```
.well-known/catalog.json   the manifest. this is the node.
catalog.json               a copy at the root, for the fallback discovery path
media/                     the audio and cover art the manifest points at
index.html                 the player, single file
.nojekyll                  required — see below, it is not optional
LICENSE
```

## What has to be true for this to work

These are not style preferences. Each one silently removes the node from the network if
it is wrong, usually while the site still looks perfectly fine in a browser.

**`.nojekyll` must exist at the repo root.** GitHub Pages runs Jekyll by default, and
Jekyll drops directories whose name starts with a dot. Without this file,
`/.well-known/catalog.json` returns 404 and the node is invisible via the preferred
discovery path.

**This must be a *user* Pages site, not a project site.** Discovery resolves
`/.well-known/catalog.json` against the **origin**, never a path prefix. A project site
lives at `user.github.io/repo/`, where that path does not exist. Only `user.github.io`
(this repo) or a custom domain can carry a node discoverable the preferred way.

**The `url` field must match where the site actually is.** Media paths in the manifest are
relative and resolve against `url`. If it is stale — a renamed repo, a moved domain — every
media URL 404s, playback fails, and the node drops out of the graph while still serving a
perfectly valid-looking manifest. This is the single most common way a node dies quietly.

**`size` and `sha256` must match the real bytes.** They are how a listener knows a file is
what it claims to be. Replacing a track without updating them breaks verification.

**`id` is minted once and never changed.** It is what makes this node the same node across
rebuilds. A new id means every other node's link to you now points at a stranger.

**Both `catalog.json` copies must say the same thing.** Discovery tries
`/.well-known/catalog.json` first, then falls back to `/catalog.json`. If they disagree,
the node's connections change depending on which path a crawler happened to take.

> ⚠️ **They currently disagree.** `.well-known/catalog.json` lists a connection to
> `https://vitromedialab.com/`; the root `catalog.json` has `"connections": []`. Fix by
> copying the well-known one over the root one.

## What GitHub Pages gives you for free

Measured against this host, not assumed:

- `Access-Control-Allow-Origin: *` on every response. This is required — without it a
  browser refuses to read the manifest at all — and Pages sends it automatically.
- `Accept-Ranges: bytes`, and ranged requests really do return `206 Partial Content`, so
  the player can fetch a few kilobytes to test a file instead of downloading all of it.
- Content types are guessed from the file extension. Pages serves `.opus` as `audio/ogg`,
  `.flac` as `audio/x-flac`, and `.mp3` as `audio/mp3`, which disagree with the obvious
  manifest declarations. That is fine and expected — same-family mismatches are tolerated.

## Making a new node

### 1. Get a host

Fork or copy this repository into a new one named exactly `<username>.github.io`, then
enable Pages on it (Settings → Pages → deploy from `main`). A custom domain works too.
A project-site repo does not — see above.

### 2. Replace the media

Delete the contents of `media/` and put your own audio and cover art there. One folder per
release keeps things readable:

```
media/
  Wabash/
    01 County Line.opus
    02 Ditchwater.opus
    cover.jpg
```

**Keep files small.** GitHub's web uploader rejects anything over 25 MB, git rejects
anything over 100 MB, and a Pages site is capped at 1 GB total. A FLAC album is roughly
300 MB and will not fit; the same album as Opus at 96 kbps is about 25 MB and will. If you
have lossless sources, convert first:

```bash
ffmpeg -i "01 County Line.flac" -c:a libopus -b:a 96k "01 County Line.opus"
```

### 3. Write the manifest

Easiest path — let the player do it:

1. Open `index.html` (this repo's own copy works, or any deployed one).
2. Go to **Settings → Publish a catalog**.
3. Point it at your media folder. It reads tags, computes hashes and durations, and
   preserves ids if you load your existing `catalog.json` first.
4. Download the result and commit it to **both** `.well-known/catalog.json` and
   `catalog.json`.

Or write it by hand — the format is small and this is a real example:

```json
{
  "v": 1,
  "id": "urn:uuid:6d1f4a2e-5c3b-4f8a-9e21-7b0c5d4a3f19",
  "name": "Host Probe",
  "place": "Nowhere",
  "url": "https://eliiijaaaaah.github.io",
  "connections": [
    { "name": "Elijah", "url": "https://vitromedialab.com/" }
  ],
  "collections": [
    {
      "id": "urn:uuid:8a2b7c14-3e9d-4a6f-b105-2c8e91d7f430",
      "title": "Header Measurements",
      "date": "2026",
      "art": {
        "url": "media/cover.png",
        "mime": "image/png",
        "size": 2802,
        "sha256": "ea50cbcb…"
      },
      "items": [
        {
          "n": 1,
          "title": "probe.opus",
          "duration": 4,
          "preview": {
            "url": "media/probe.opus",
            "mime": "audio/opus",
            "size": 176444,
            "sha256": "e1c2cb55…"
          }
        }
      ]
    }
  ]
}
```

Field notes: `id` values are UUIDs you mint once (`crypto.randomUUID()` in any browser
console) — one for the node, one per release. `place` is optional. A connection may have
`"url": null`, which means a real relationship with something that has no site. `date`
accepts `"2024"`, `"2024-03"`, or `"2024-03-15"` — whatever precision you actually know.

### 4. Check it before telling anyone

Open the player, go to **Settings → Diagnose a node**, and paste your URL. It reports
whether the manifest was found, whether CORS let it be read, whether a ranged request
returned `206`, and whether the declared `url` matches reality. Fix anything red.

### 5. Get linked back — this is the actual join step

Adding someone to your `connections` does nothing on its own. **An edge only exists when
both manifests name each other**; a one-sided link is displayed dimly and is never
traversed, so nobody will reach you through it.

So the last step is social, not technical: message each person you listed, tell them your
URL, and ask them to add you to their `connections`. That is what joining means here. There
is no application to submit and no one to approve it.

## For an agent working on this repo

- The manifest is the source of truth. Do not add build tooling, servers, or dependencies.
- Never change an existing `id`. Preserve every id when regenerating a manifest.
- Any change to a file in `media/` requires updating that file's `size` and `sha256`.
- Write every manifest change to **both** `.well-known/catalog.json` and `catalog.json`.
- Preserve unknown keys you find in a manifest. They may come from a newer version of the
  format or be hand-authored; dropping them destroys data.
- `index.html` is a build artifact from the player project. Do not hand-edit it; replace it
  wholesale with a fresh single-file build.
- Verify with the player's **Diagnose a node** view rather than by eye. A manifest that
  parses is not the same as a node that works.
