# A node

This repository is a working node in a discovery network, and a template for making your
own. Fork it, put music in `sources/`, push. Everything else happens on its own.

It is also two other things at once:

- **A manifest.** `.well-known/catalog.json` describes what is released here and who this
  node is connected to. That file *is* the node. Everything else is delivery.
- **A player.** `index.html` is the whole listening app in one self-contained file — no
  external requests. Open it and it starts crawling from whatever address you give it.

There is no server, no database, no accounts, and no registry.

The audio in `sources/` is a pair of synthesised test tones, not music. They exist so a
fresh fork is a working node on the first push, and so there is something to hear while
checking that playback works. Delete them when you add your own.

## The idea in four sentences

Publishers put a manifest on a domain they control, listing their releases and their
connections. A listener opens the player, pastes in one address, and it walks outward from
there — fetching each connected manifest, checking the media actually plays, and following
the graph.

Nobody operates it. There is no index to be listed in and no algorithm to rank you, and
**a connection only counts when both sides declare it** — so who you can reach is decided
entirely by who vouches for whom.

## Making your own node

### 1. Fork this repo and rename it

Rename your fork to exactly `<your-username>.github.io`, then enable Pages under
**Settings → Pages → Deploy from a branch → main**.

The name matters. Discovery resolves `/.well-known/catalog.json` against the **origin**,
and a project site lives at `username.github.io/repo/`, where that path does not exist.
Only a user site or a custom domain can carry a node discoverable the preferred way. The
build fails with an explanation if you get this wrong, so you cannot ship it by accident.

### 2. Edit `site.json`

This is the half you write by hand. Everything else is generated.

```json
{
  "v": 1,
  "name": "Your Name",
  "place": "Town, ST",
  "url": "https://yourname.github.io",
  "connections": [
    { "name": "Someone You Played With", "url": "https://theirsite.com" },
    { "name": "The Spot Tavern", "url": null, "description": "No site. Played here a lot." }
  ]
}
```

Delete the `id` line from your fork — a new one is minted on the first build and written
back here. It identifies your node forever after, so let it be generated once and then
leave it alone.

`place` is optional. A connection may have `"url": null`, which means a real relationship
with something that has no site.

### 3. Put music in `sources/`

Delete `sources/Test Tones/` and add your own. One folder per release. Filenames like
`01 Title.flac` are parsed for track order, and embedded tags win over filenames wherever
both exist.

```
sources/
  Wabash/
    01 County Line.flac
    02 Ditchwater.flac
    cover.jpg
```

Any audio format ffmpeg reads works — the build converts everything to Opus for you.
Cover art is copied through untouched, so resize it yourself; a camera-original photo is
tens of megabytes and every listener pays for it.

**Everything you commit here is public and permanent.** A public repository's history
keeps files even after a later commit deletes them. Be deliberate about what goes in.

**Tag your files, or at least don't rename folders after publishing.** A release is
identified by its album tag, falling back to the folder name. Renaming an untagged
folder therefore reads as a brand new release: it gets a new id, and every node linking
to the old one goes stale. The build prints a warning when this happens.

### 4. Push

That is the whole publishing step. On every push that touches `sources/` or `site.json`,
the [Catalog workflow](.github/workflows/catalog.yml) will:

1. Transcode `sources/` into `media/` as Opus at 96 kbps, skipping anything unchanged.
2. Read tags, durations, sizes and SHA-256 hashes.
3. Preserve the ids of releases it has seen before.
4. Write `.well-known/catalog.json` and `catalog.json`, and commit both.

Watch it under the **Actions** tab. It fails loudly, with a reason, rather than publishing
something broken.

### 5. Check it

Open `index.html`, go to **Settings → Diagnose a node**, and paste your URL. It reports
whether the manifest was found, whether CORS let a browser read it, whether a ranged
request returned `206`, and whether your declared `url` matches reality.

### 6. Get linked back — this is the actual join step

Listing someone in `connections` does nothing on its own. **An edge exists only when both
manifests name each other.** A one-sided link is shown dimmed and is never traversed, so
nobody reaches you through it.

So the last step is social: message the people you listed, tell them your URL, and ask
them to add you. That is what joining means here. There is no application and no one to
approve it.

## Layout

```
site.json                  the half you write. name, place, url, connections
sources/                   the half you drop in. one folder per release
media/                     generated — Opus previews and cover art
.well-known/catalog.json   generated — the manifest. this is the node
catalog.json               generated — a copy at the root, for the fallback path
index.html                 the player, single file
.nojekyll                  required. do not delete
.github/workflows/         the build
```

Do not hand-edit anything marked generated; the next push overwrites it. Change
`site.json` or `sources/` instead.

## Things that silently break a node

Each of these leaves the site looking perfectly healthy while removing it from the
network. The build checks the ones it can.

**`.nojekyll` must exist.** Pages runs Jekyll by default, and Jekyll drops directories
whose name starts with a dot — taking `/.well-known/catalog.json` with it.

**The `url` in `site.json` must be where the site actually is.** Media paths resolve
against it, so a stale value means every file 404s and the node drops out of the graph
while still serving a valid-looking manifest.

**Your `id` must never change.** It is what makes this the same node across rebuilds.

**Size limits are real.** GitHub's web uploader rejects files over 25 MB, git rejects
anything over 100 MB, and a Pages site is capped at 1 GB. A FLAC album is around 300 MB;
the same album as Opus is around 25 MB. The build transcodes for you, but the *sources*
you commit still count against the repo, so drag-and-drop through the browser works for
already-compressed audio and a git client is needed for anything lossless.

## What GitHub Pages gives you for free

Measured against this host rather than assumed:

- `Access-Control-Allow-Origin: *` on every response. Required — without it a browser
  refuses to read the manifest at all — and Pages sends it automatically.
- `Accept-Ranges: bytes`, and ranged requests genuinely return `206 Partial Content`, so
  the player can test a file with a few kilobytes instead of downloading all of it.
- Content types guessed from the extension. Pages serves `.opus` as `audio/ogg`, which
  disagrees with what the manifest declares. That is expected and tolerated — same-family
  mismatches pass.

## Where this comes from

The build is a composite action from
[Eliiijaaaaah/network-effect](https://github.com/Eliiijaaaaah/network-effect), which is
also where the spec, the crawler and the player live. The manifest format is documented
in full in that repository's `spec/README.md`.

## For an agent working on this repo

- `site.json` and `sources/` are the only inputs. Everything else is generated output;
  editing it is always wrong, because the next push overwrites it.
- **Never add audio, images, or any other file to this repository unless the human
  explicitly told you to publish that specific file.** This is a public repo and its
  history is permanent. Do not go looking for the owner's media elsewhere on disk to make
  a build succeed — use the test tones, or leave `sources/` empty and say so.
- Never change an existing `id`, in `site.json` or in a generated manifest.
- Do not add servers, backends, or runtime dependencies. The published artifact is static
  files and nothing else.
- `index.html` is a build artifact of the player. Do not hand-edit it; replace it wholesale
  with a fresh single-file build.
- To change how manifests are generated, change the generator in the `network-effect`
  repository, not this one. There is deliberately one implementation.
- Verify with the player's **Diagnose a node** view. A manifest that parses is not the same
  as a node that works.
