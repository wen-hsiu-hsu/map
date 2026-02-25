## ADDED Requirements

### Requirement: Generator page renders parameter form
The system SHALL provide a web page at `/generator` with input fields for center longitude, center latitude, zoom level, and a dynamic list of markers (each with id, lat, lng, label, color).

#### Scenario: Page loads with empty defaults
- **WHEN** user navigates to `/generator`
- **THEN** the page SHALL display input fields for center lng, center lat, zoom, and an empty marker list with an "Add Marker" button

#### Scenario: Default values pre-filled
- **WHEN** the page loads
- **THEN** center longitude SHALL default to `121.5319`, center latitude to `25.0478`, and zoom to `10`

### Requirement: Generator produces iframe src URL in real time
The system SHALL recompute and display the iframe `src` URL whenever any input field value changes, without requiring a submit button.

#### Scenario: Center and zoom inputs update URL
- **WHEN** user changes center longitude, center latitude, or zoom
- **THEN** the displayed iframe src SHALL immediately reflect the new `?center=<lng>,<lat>&zoom=<zoom>` values

#### Scenario: Markers encoded as URL-safe Base64
- **WHEN** user has one or more marker rows filled in
- **THEN** the displayed iframe src SHALL include `&markers=<url-safe-base64-encoded-json-array>` where the JSON array contains only the filled marker fields

#### Scenario: Empty marker list omits markers param
- **WHEN** no marker rows exist or all marker rows are empty
- **THEN** the displayed iframe src SHALL NOT include a `markers` parameter

### Requirement: Generator allows dynamic marker management
The system SHALL allow users to add and remove marker rows in the form.

#### Scenario: Add marker row
- **WHEN** user clicks "Add Marker"
- **THEN** a new row with id, lat, lng, label (optional), and color (optional) input fields SHALL appear

#### Scenario: Remove marker row
- **WHEN** user clicks the remove button on a marker row
- **THEN** that row SHALL be removed and the iframe src SHALL update immediately

### Requirement: Generator provides copy-to-clipboard action
The system SHALL provide a button to copy the generated iframe src URL to the clipboard.

#### Scenario: Copy button copies URL
- **WHEN** user clicks the copy button
- **THEN** the current iframe src value SHALL be copied to the clipboard and the button SHALL briefly show a confirmation state (e.g., "Copied!")

### Requirement: Generator warns when URL length is excessive
The system SHALL warn the user when the generated URL exceeds 4000 characters, indicating potential issues with browser or server URL length limits.

#### Scenario: Warning displayed for long URL
- **WHEN** the generated iframe src URL exceeds 4000 characters
- **THEN** the system SHALL display a visible warning message near the URL output

#### Scenario: No warning for acceptable URL length
- **WHEN** the generated iframe src URL is 4000 characters or fewer
- **THEN** no length warning SHALL be displayed
