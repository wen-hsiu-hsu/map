## Context

The map iframe currently shows a blank white screen while MapLibre initializes. The `READY` postMessage is sent immediately after `map.load`. There is no concept of an intro or loading state visible to the end user.

The project uses MapLibre GL JS with globe projection, a React component (`GlobeMap.tsx`), and a URL-param-driven configuration system. Settings can also be sent via postMessage.

## Goals / Non-Goals

**Goals:**
- White overlay that eliminates the blank screen during initialization
- Optional globe intro animation: starts at low zoom with center offset, animates to target center/zoom
- Two trigger mechanisms: `?intro=true` URL param and `PLAY_INTRO` postMessage
- `READY` is delayed until animation completes when intro is active

**Non-Goals:**
- Custom animation curves or keyframe sequences (use MapLibre's built-in `easeTo`)
- Intro animation for non-globe projections
- Persisting intro preference across sessions

## Decisions

### 1. Animation via manual `requestAnimationFrame` loop

**Decision**: Use a `requestAnimationFrame` loop that manually interpolates `center.lng`, `center.lat`, and `zoom` each frame via `map.jumpTo()`.

**Rationale**: `map.easeTo()` was considered first, but MapLibre normalises longitude to the shortest path — `targetLng - 360` collapses to the same point as `targetLng`, making multi-rotation (`introRotate ≥ 360`) impossible. The rAF loop bypasses normalisation and gives full control over the animation path, enabling any number of rotations (positive or negative). Completion is signalled via a callback when `t >= 1`, equivalent to `moveend` semantics.

**Alternative considered**: `map.flyTo()` — creates a zoom-out arc (flies up then down) which is not the desired "coming from space" feel. Rejected.
**Alternative considered**: `map.easeTo()` — rejected because MapLibre normalises longitude, breaking multi-rotation support.

### 2. Starting position: offset longitude by -90 degrees at zoom 1

**Decision**: Before `easeTo`, set map to `center=[targetLng - 90, 0], zoom=1`.

**Rationale**: 90-degree offset gives visible rotation without feeling like a full spin. Zoom 1 shows the whole globe at a "space" distance. The `introRotate` URL param (default 90) makes this configurable.

**Alternative considered**: Starting from the opposite side (-180 offset) — too slow or disorienting for short durations.

### 3. White overlay rendered in React, not CSS

**Decision**: A `<div>` overlay inside `GlobeMap.tsx`, controlled by a `showOverlay` state that starts `true` and transitions to `false` when the animation begins.

**Rationale**: Keeps all animation state in one component. CSS-only solutions (e.g., `:host` pseudo-class) are not available in iframe context.

**Transition**: CSS `opacity` transition (400ms) so the overlay fades rather than snapping away.

### 4. READY is blocked by intro animation

**Decision**: When intro is active, `READY` is sent inside the animation completion callback (when `t >= 1` in the rAF loop), not immediately on map load.

**Rationale**: Parent apps that listen for `READY` before sending markers or `SET_OPTIONS` will get a consistent signal regardless of whether intro is enabled. No new event type needed.

### 5. `PLAY_INTRO` postMessage triggers replay

**Decision**: Add `PLAY_INTRO` to `InboundMessage`. When received (even after initial load), the animation replays: overlay fades in briefly, then the zoom-out/rotate/zoom-in sequence runs again, ending with `READY`.

**Rationale**: Allows host pages to offer a "replay" button or re-trigger the animation for UX purposes.

## Risks / Trade-offs

- **Tile loading during animation**: Tiles at zoom 1 load fast; tiles at target zoom may still be loading when animation ends. Not mitigated — acceptable visual artifact as tiles pop in.
- **READY delay**: With a 3-second intro, parent apps wait up to 3s longer for READY. Non-intro path is unchanged.
- **`PLAY_INTRO` after markers set**: Replay resets camera but not marker state. Parent should not rely on intro replay as a state reset mechanism.

## Migration Plan

No breaking changes. New URL params (`intro`, `introDuration`, `introRotate`) are opt-in. Existing embeds without `?intro=true` are unaffected. `READY` timing is unchanged for non-intro embeds.
