## Why

When the map iframe is first loaded, there is a blank white screen while MapLibre initializes. Adding an optional intro animation transforms this dead time into a polished onboarding moment — a globe spinning and zooming in from space to the configured center position.

## What Changes

- New optional intro animation: globe rotates and zooms in from a distant view to the configured `center`/`zoom`
- White overlay covers the blank initialization period, fading out as the animation begins
- `READY` postMessage is delayed until the animation completes (when intro is enabled)
- Two activation paths: URL param `?intro=true` and postMessage `{ type: 'PLAY_INTRO' }`

## Capabilities

### New Capabilities
- `intro-animation`: Globe intro animation with white overlay, triggered via URL param or postMessage, ending at configured center/zoom before emitting READY

### Modified Capabilities
- `url-params`: New `intro` and `introDuration` parameters added to the URL param schema
- `postmessage-api`: New inbound message type `PLAY_INTRO`; `READY` emission timing changes when intro is active

## Impact

- `components/GlobeMap.tsx`: intro animation logic, overlay rendering, READY timing
- `lib/parseUrlParams.ts`: new `intro`, `introDuration` fields
- `lib/postMessageTypes.ts`: new `PLAY_INTRO` inbound message type
