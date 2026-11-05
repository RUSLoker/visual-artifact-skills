# Publishing artifacts

An artifact request defaults to publication on the configured server and a final clickable Markdown link. That request supplies the publication intent required by `SECURITY.md`; don't ask again for every configured publication. Explicitly local requests and private material use file delivery instead. Review the page before publication, including its hidden content and outgoing URLs. Ordinary page publication doesn't require the whole Git-history scan used for repository releases.

Use the bundled `publish` and `serve` commands. Prefer a locally built, pinned image over changing the package installation. The target is one persistent Docker service named `omo-artifacts`, with host port `29004` mapped to container port `8080`, restart policy `unless-stopped`, and a stable store outside the package and all Git working trees. Leave this service running after delivery.

The commands below use Bash, Docker Engine, `curl`, `jq`, and standard host utilities. They describe an operator workflow, not permission to replace a conflicting deployment. Bind paths refer to the Docker daemon's host; run on that host rather than assuming a remote Docker context can mount client files. No extra package installation is needed when these tools are already available.

## Load local configuration first

Inspect the operator's existing configuration before asking for an address or creating files. The conventional location is `$HOME/.config/omo-artifacts/publishing.env`; if the operator uses another location, use that. Keep this file outside the repository, public store, and package archives. It is a trusted shell file, so inspect it before sourcing it.

```sh
set -euo pipefail
CONFIG_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/omo-artifacts/publishing.env"
if [ -f "$CONFIG_FILE" ]; then
  . "$CONFIG_FILE"
fi
```

Required local values:

| Variable | Meaning |
| --- | --- |
| `ARTIFACTS_DIR` | Absolute host path to the stable store, outside the package, source tree, and every Git working tree. The container sees this store at `/data`. |
| `ARTIFACTS_BASE_URL` | User-facing HTTP(S) origin, with optional port, but no credentials, path, query, or fragment. A proxy must expose the CLI routes at the origin root. |
| `ARTIFACTS_IMAGE` | Immutable local image ID, recorded after the build below, used by both the service and publisher. |

For a new setup, use an editor to create the local configuration with operator-selected values. For example, `/srv/omo-artifacts` is a generic store location and `https://example.test` is a reserved documentation origin, not a working deployment. Never copy a real user's address or paths into repository guidance. Protect the local configuration with `chmod 600 "$CONFIG_FILE"` and keep it out of Git by storing it outside the checkout.

If `ARTIFACTS_BASE_URL` remains missing after inspecting local configuration, ask once: "What server address can you open for published artifacts?" Continue preparing the document while waiting. Don't invent a public URL or turn a container address into one. A user-supplied address establishes the intended user network; server-side HTTP checks below establish service behavior only. Don't claim the user's browser was tested unless it actually was.

## Inspect before creating anything

Confirm the Docker daemon is available, then inspect both the named service and the host port:

```sh
docker info
docker ps -a --filter 'name=^/omo-artifacts$'
docker ps --filter publish=29004
ss -ltnp '( sport = :29004 )'
```

If the named container exists, inspect its complete configuration locally. Container environment values and mounts may contain credentials or private paths; don't paste raw inspection output into chat, public reports, or repository files. Report only the fields needed to explain a match or conflict, with sensitive values redacted:

```sh
docker inspect omo-artifacts
docker inspect --format '{{.Image}}' omo-artifacts
docker inspect --format '{{json .Config}}' omo-artifacts
docker inspect --format '{{json .Mounts}}' omo-artifacts
docker inspect --format '{{json .HostConfig.PortBindings}}' omo-artifacts
docker inspect --format '{{json .HostConfig.RestartPolicy}}' omo-artifacts
docker inspect --format '{{json .State}}' omo-artifacts
```

Reuse it only when the image matches the configured `ARTIFACTS_IMAGE`, the command is the bundled CLI's `serve`, the runtime user is `node`, and the environment contains `ARTIFACTS_DIR=/data`, `HOST=0.0.0.0`, and `PORT=8080`. The writable bind mount at `/data` must point to the configured host `ARTIFACTS_DIR`; `8080/tcp` must map to host port `29004` with the operator's intended bind address, and restart policy must be `unless-stopped`. The base URL is used by the publisher and needn't be in the service environment.

A matching running service needs no build or second `docker run`. Start a matching stopped service only if it's intended to be running and port `29004` is free:

```sh
docker start omo-artifacts
```

If a container with that name differs, or another listener owns port `29004`, stop setup and report the exact conflict. Never overwrite its configuration, stop an unrelated container, or take over the port without approval. A free-port check can race; if Docker later reports a bind conflict, inspect again rather than killing the owner.

An existing published link may belong to a separate deployment or a legacy compatibility server. Its existence doesn't establish that the bundled server is installed. Keep it working while assessing any migration.

## Build and pin once for a new setup

Only use this branch when no matching service exists, the name and port are available, and the setup is intended. From the package root containing the existing `Dockerfile`:

```sh
docker build --tag visual-artifact-skills:local .
ARTIFACTS_IMAGE="$(docker image inspect --format '{{.Id}}' visual-artifact-skills:local)"
docker image inspect --format '{{.Id}} {{.Config.User}} {{json .Config.Cmd}}' "$ARTIFACTS_IMAGE"
```

Record that exact `sha256:...` image ID as `ARTIFACTS_IMAGE` in the external configuration. Reuse the ID on later publications, even if a tag moves. The Dockerfile uses `node:24.19.0-slim`, copies the bundled CLI, sets `/app` as its working directory, and runs as `USER node`. Its default command is `node skills/hosted-artifacts/scripts/artifacts.mjs serve`. No global CLI installation is involved.

Resolve the host store path and confirm it is absolute and outside the package and every Git working tree before creation. Prepare a new store for the image's actual numeric UID and GID:

```sh
: "${ARTIFACTS_DIR:?Set the absolute host store path in local configuration}"
: "${ARTIFACTS_IMAGE:?Build and record the local image ID}"
NODE_UID="$(docker run --rm --pull=never "$ARTIFACTS_IMAGE" id -u)"
NODE_GID="$(docker run --rm --pull=never "$ARTIFACTS_IMAGE" id -g)"
if [ ! -e "$ARTIFACTS_DIR" ]; then
  sudo install -d -m 0750 -o "$NODE_UID" -g "$NODE_GID" "$ARTIFACTS_DIR"
fi
docker run --rm --pull=never \
  --mount "type=bind,source=$ARTIFACTS_DIR,target=/data" \
  "$ARTIFACTS_IMAGE" sh -c 'test -r /data && test -w /data && test -x /data'
```

For an existing store, inspect ownership and traversal permissions first. If access fails, arrange a narrowly scoped ownership or ACL correction with its operator; don't recursively change shared files as an automatic repair. With rootless Docker or user namespace remapping, have the operator apply the mapped host ownership rather than assuming container IDs equal host IDs. Never use `chmod 777` or run the publisher/server as root to bypass permissions.

Once the name, port, store, and image checks pass, create the service:

```sh
docker run -d --name omo-artifacts --pull=never \
  --restart unless-stopped \
  --publish 29004:8080 \
  --env ARTIFACTS_DIR=/data --env HOST=0.0.0.0 --env PORT=8080 \
  --mount "type=bind,source=$ARTIFACTS_DIR,target=/data" \
  "$ARTIFACTS_IMAGE"
docker logs --tail 20 omo-artifacts
```

The mapping exposes the host port on all host interfaces. The operator must choose network/proxy access appropriate for this unauthenticated server and configure the base URL accordingly. The server logs JSON with a `listening` field after it starts. A proxy may use HTTPS externally while the container listens on HTTP. Don't combine the persistent service with `--rm`; short-lived commands below use `--rm` and no restart policy.

On subsequent runs, return to inspection and reuse the matching service. Don't rebuild or recreate it for each artifact.

## Publish the reviewed HTML

Complete the page review and preview checks in `../SKILL.md` first. The CLI accepts one HTML input and copies its bytes without bundling companion files. Inline required graphics, styles, value equivalents, and notes. For a standalone SVG, embed the reviewed SVG in a standalone HTML document with a title, viewport metadata, and its accessible summary and full values equivalent. Don't pass raw SVG as `INPUT.html` or rely on adjacent files being served.

Load the trusted configuration, then run this block in Bash with failure propagation enabled. Replace the input path, slug, and title with this document's values. The example input path is generic and must already exist on the Docker host.

```sh
set -euo pipefail
. "$CONFIG_FILE"
: "${ARTIFACTS_DIR:?Missing configured host store}"
: "${ARTIFACTS_BASE_URL:?Ask once for the user-facing origin}"
: "${ARTIFACTS_IMAGE:?Missing pinned local image ID}"
INPUT_HTML="/absolute/path/to/reviewed-report.html"
SLUG="reviewed-report"
TITLE="Reviewed report"
test -f "$INPUT_HTML"
INPUT_HTML="$(realpath "$INPUT_HTML")"
EXPECTED_SHA256="$(sha256sum "$INPUT_HTML" | cut -d ' ' -f 1)"

PUBLISH_JSON="$(docker run --rm --pull=never \
  --env ARTIFACTS_DIR=/data --env ARTIFACTS_BASE_URL="$ARTIFACTS_BASE_URL" \
  --mount "type=bind,source=$ARTIFACTS_DIR,target=/data" \
  --mount "type=bind,source=$INPUT_HTML,target=/input/report.html,readonly" \
  "$ARTIFACTS_IMAGE" \
  node skills/hosted-artifacts/scripts/artifacts.mjs publish /input/report.html \
  --slug "$SLUG" --title "$TITLE")"
LATEST_URL="$(printf '%s\n' "$PUBLISH_JSON" | jq -er '.latest | strings | select(length > 0)')"
REVISION_URL="$(printf '%s\n' "$PUBLISH_JSON" | jq -er '.revision | strings | select(length > 0)')"
printf '%s\n' "$PUBLISH_JSON"
```

The image's `CMD` is replaced by the explicit `node ... publish` command; it isn't a CLI entrypoint. Keep the input readable by the image's `node` user and mount it read-only. Both publisher and server use the same writable store at `/data`; the server needs it present for `storePath()` even though page requests only read it. Configuration stays on the host, with only the required values passed into containers.

The slug must match lowercase letters or digits separated by single hyphens, up to 80 characters. The title must contain non-whitespace text. The base must be an HTTP(S) origin without credentials, path, query, or fragment. The publisher's stdout is one JSON object with exactly the delivery fields `latest` and `revision`; diagnostics go to stderr, and a failure exits nonzero. Parse those fields, never construct a successful URL from a guessed revision or from service logs.

Every successful invocation creates a new immutable revision, so don't republish just to retry a failed HTTP check. Keep the returned JSON and verify that publication again. The latest URL can change after a later publication using the same slug.

## Verify and return the link

Continue in the same Bash session. Fetch both returned URLs with redirects enabled. Require the final HTTP status to be exactly `200`, an HTML content type, and a SHA-256 matching the reviewed input:

```sh
VERIFY_DIR="$(mktemp -d)"
trap 'rm -rf -- "$VERIFY_DIR"' EXIT
for URL in "$REVISION_URL" "$LATEST_URL"; do
  HTTP_RESULT="$(curl --silent --show-error --fail --location --max-redirs 5 \
    --connect-timeout 10 --max-time 60 \
    --output "$VERIFY_DIR/page.html" \
    --write-out '%{http_code}\n%{content_type}\n%{url_effective}\n' \
    "$URL")"
  printf '%s\n' "$HTTP_RESULT"
  STATUS="$(printf '%s\n' "$HTTP_RESULT" | head -n 1)"
  CONTENT_TYPE="$(printf '%s\n' "$HTTP_RESULT" | tail -n +2 | head -n 1)"
  test "$STATUS" = 200
  case "$CONTENT_TYPE" in
    text/html|text/html\;*) ;;
    *) printf 'Expected HTML, got %s\n' "$CONTENT_TYPE" >&2; exit 1 ;;
  esac
  ACTUAL_SHA256="$(sha256sum "$VERIFY_DIR/page.html" | cut -d ' ' -f 1)"
  test "$ACTUAL_SHA256" = "$EXPECTED_SHA256"
done
printf '[Open the report](%s)\n' "$REVISION_URL"
```

The latest route normally returns `302` to its revision; `curl --location` follows it, so the recorded status and content type describe the final response. The revision route returns the stored HTML bytes as `text/html; charset=utf-8`. A redirect to a login page or a different report must fail the byte/hash check even if it returns 200.

Return the emitted Markdown link in the final response. Choose the verified revision URL for an immutable reference or the verified `latest` value when later versions should appear at the same link. Include a short verification statement and any actual preview limits. A local path, `show_html_page`, file attachment, or agent-only URL never substitutes for this link in the default workflow.

If the publisher exits nonzero, JSON parsing fails, HTTP verification fails, or the base is still unknown, report the exact failed step and mark URL delivery incomplete. Keep the reviewed file as an interim attachment if useful, without claiming the publication succeeded. A hash mismatch on latest can indicate another publication of the same slug; inspect the returned revision and concurrent work before deciding which link to deliver. Don't silently publish another version, change the base, or stop the service as a repair.

Keep two checks distinct: a loopback or LAN request diagnoses service availability, while the configured user-facing URL also depends on the intended network, firewall, proxy, or port forwarding. If the user-provided base refuses connections from the server but a LAN address serves the same artifact, preserve `ARTIFACTS_BASE_URL` and the returned URLs. Don't silently replace them with that LAN address, rewrite the local configuration, or declare delivery based solely on the successful agent-local request.

Ask once when routing is ambiguous: "The service responds on its local network, but the requested address fails from here. Should that address work through forwarding from your network, or should a different user-facing origin be configured?" This asks about routing, not renewed publication consent. A server may lack access to its own forwarded address, so record that possibility as unverified rather than diagnosing it as fact. Continue independent document work, but keep URL delivery incomplete until the route is resolved and the applicable URL/content checks pass. If the user confirms a different origin, update the external configuration explicitly. Run the publisher with that confirmed configuration and verify its returned URLs, noting that this creates a new immutable revision. Don't fabricate replacement CLI output.

Server-side checks prove only what their vantage point reached. They don't prove the user's browser opened the page. When the configured URL passes the checks and the user-supplied base identifies the intended network, deliver the link without repeatedly requesting confirmation, while describing browser access as untested if it wasn't tested.

## Preserve reports and routes during an approved migration

Migration is a separate operation from publishing a page or updating an installation. Inspect the current deployment, local configuration, mounts, proxy rules, and known delivered URLs first. Don't assume the current host uses the bundled server.

For a legacy static compatibility deployment, use this future migration sequence. These are operator steps, not evidence that a host has already migrated:

1. Inspect the legacy container and proxy configuration using `docker ps -a` and `docker inspect "$LEGACY_SERVICE"`, where the operator supplies the actual service name. Record its image, mounts, ports, restart policy, report directory, and proxy routes in external migration notes. Inventory old latest and revision URLs plus all known legacy paths in an external `LEGACY_URLS_FILE`, one complete URL per line. Don't assume a static report directory has the CLI's store format.
2. Back up the legacy report directory, service inspection, local configuration, and proxy rules before cutover. Choose a new external backup directory, never an existing destination to overwrite. For a Docker-based legacy service, the following block captures its reports and container configuration; also copy its actual proxy configuration using that proxy's operator procedure:

   ```sh
   : "${LEGACY_SERVICE:?Set the inspected legacy container name}"
   : "${LEGACY_REPORTS_DIR:?Set the inspected absolute report directory}"
   : "${MIGRATION_BACKUP_DIR:?Choose a new absolute directory outside Git and served stores}"
   test ! -e "$MIGRATION_BACKUP_DIR"
   mkdir -m 0700 "$MIGRATION_BACKUP_DIR"
   docker inspect "$LEGACY_SERVICE" > "$MIGRATION_BACKUP_DIR/legacy-container.json"
   tar -C "$LEGACY_REPORTS_DIR" -cpf "$MIGRATION_BACKUP_DIR/legacy-reports.tar" .
   cp -p "$CONFIG_FILE" "$MIGRATION_BACKUP_DIR/publishing.env"
   ```

3. Capture each inventoried old URL's status, content type, redirect destination, and SHA-256 using the `curl` and hash commands above, saving the observations outside Git. Resolve failed or ambiguous user routes before treating them as a preservation baseline. For an existing CLI-format store, preserve every slug/revision directory and `meta.json` unchanged in the backed-up store. Republishing old HTML creates new revision IDs and doesn't preserve old revision URLs.
4. Build and pin the image, prepare store ownership, and inspect the target name and port using the setup sections above. Prepare and check the replacement under a temporary name and free port before cutover, recording those temporary resources for cleanup. If the legacy service owns `omo-artifacts` or port `29004`, leave it running and obtain approval for a specific cutover and rollback procedure before taking either resource. That procedure must retain the original container stopped for rollback, renaming it if the replacement needs its name. Keep the legacy reports available through the existing service or an approved compatibility proxy. Copying loose HTML into `/data` doesn't make it routable: the bundled server exposes only `/`, `/a/SLUG/`, and `/a/SLUG/REVISION/`. Decide which service/proxy will retain every other old path before cutover.
5. At the approved cutover, use the exact persistent `docker run` command above once the target resources are available. Publish and verify a reviewed HTML page with the documented publisher and HTTP/hash checks. Recheck every inventoried old URL against its saved response and hash, including legacy paths and immutable revisions, before accepting the migration. A new catalogue or a new report returning 200 doesn't establish old route preservation.
6. If any old route or the new publication fails, follow the agreed rollback procedure: stop the replacement, restore the original service's name, port and proxy configuration as needed, and restart the retained original container. Retain both report stores. Remove temporary check containers and any failed replacement container after it no longer owns required resources; record cleanup without removing the retained original. Keep the backup, compatibility routing, and old store until migration is accepted. Don't remove old reports, rewrite revision metadata, or discard legacy routing to make the new service fit.

Stopping a legacy service, changing proxy rules, or transferring a port needs approval for that specific operation. The bundled CLI has no automatic legacy-route migration command; an exact proxy cutover depends on the inspected deployment. Setup documentation or a successful local service probe is never a claim that deployment, migration, or user access was completed.
