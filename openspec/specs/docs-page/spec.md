## ADDED Requirements

### Requirement: Docs page renders at /docs
The system SHALL provide a web page at `/docs` that displays structured documentation for all major map features.

#### Scenario: Page accessible via URL
- **WHEN** user navigates to `/docs`
- **THEN** the page SHALL render with a title and sectioned content covering URL parameters, markers, postMessage API, and map controls

#### Scenario: Page has anchor-based table of contents
- **WHEN** user loads the docs page
- **THEN** a table of contents SHALL be visible at the top with clickable links that scroll to each section

### Requirement: Docs page covers URL parameters
The system SHALL document all supported URL query parameters with their types and examples.

#### Scenario: Center and zoom parameters documented
- **WHEN** user reads the URL parameters section
- **THEN** they SHALL find documentation for `center` (lng,lat format) and `zoom` (numeric) parameters with examples

#### Scenario: Markers parameter documented
- **WHEN** user reads the markers section
- **THEN** they SHALL find documentation for the `markers` parameter format (URL-safe Base64 JSON array) with field descriptions (id, lat, lng, label, color, flyToZoom)

### Requirement: Docs page covers postMessage API
The system SHALL document all supported postMessage commands with their payload format and expected behavior.

#### Scenario: Supported commands listed
- **WHEN** user reads the postMessage API section
- **THEN** they SHALL find a list of all supported inbound commands (e.g., flyTo, addMarker, removeMarker, setMarkers, clearMarkers) with payload examples

#### Scenario: Event responses documented
- **WHEN** user reads the postMessage API section
- **THEN** they SHALL find documentation for events the map emits back to the parent window (e.g., markerClick, ready)
