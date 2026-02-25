### Requirement: SET_MARKERS command accepts dynamic marker input
The test page SHALL provide a form for the SET_MARKERS command where users can add and remove marker rows, each row containing id, lat, lng, label (optional), and color (optional) fields.

#### Scenario: Add marker row to SET_MARKERS form
- **WHEN** user clicks "Add Marker" in the SET_MARKERS section
- **THEN** a new input row with id, lat, lng, label, and color fields SHALL appear

#### Scenario: Remove marker row from SET_MARKERS form
- **WHEN** user clicks the remove button on a marker row
- **THEN** that row SHALL be removed from the form

#### Scenario: Send SET_MARKERS with custom values
- **WHEN** user fills in one or more marker rows and clicks "Send SET_MARKERS"
- **THEN** the test page SHALL send a SET_MARKERS postMessage with the markers array constructed from the filled rows, omitting empty optional fields

#### Scenario: Empty marker list sends empty array
- **WHEN** user clicks "Send SET_MARKERS" with no marker rows
- **THEN** the test page SHALL send `{ type: 'SET_MARKERS', markers: [] }`

### Requirement: FLY_TO command accepts custom coordinate input
The test page SHALL provide input fields for lat, lng, and optional zoom for the FLY_TO command.

#### Scenario: Send FLY_TO with custom values
- **WHEN** user fills in lat and lng (and optionally zoom) and clicks "Send FLY_TO"
- **THEN** the test page SHALL send a FLY_TO postMessage with the provided values

#### Scenario: FLY_TO without zoom omits zoom field
- **WHEN** user leaves the zoom field empty and clicks "Send FLY_TO"
- **THEN** the postMessage payload SHALL NOT include a zoom property

### Requirement: HIGHLIGHT command accepts custom marker id input
The test page SHALL provide an input field for marker id for the HIGHLIGHT command.

#### Scenario: Send HIGHLIGHT with custom id
- **WHEN** user types a marker id and clicks "Send HIGHLIGHT"
- **THEN** the test page SHALL send `{ type: 'HIGHLIGHT', id: '<entered-id>' }`

#### Scenario: Send HIGHLIGHT with null clears highlight
- **WHEN** user leaves the id field empty and clicks "Send HIGHLIGHT"
- **THEN** the test page SHALL send `{ type: 'HIGHLIGHT', id: null }`

### Requirement: SET_OPTIONS command accepts custom center and zoom input
The test page SHALL provide input fields for optional center longitude, center latitude, and optional zoom for the SET_OPTIONS command.

#### Scenario: Send SET_OPTIONS with all fields
- **WHEN** user fills in center lng, center lat, and zoom and clicks "Send SET_OPTIONS"
- **THEN** the test page SHALL send `{ type: 'SET_OPTIONS', center: [lng, lat], zoom: zoom }`

#### Scenario: Send SET_OPTIONS with only zoom
- **WHEN** user leaves center fields empty but fills in zoom and clicks "Send SET_OPTIONS"
- **THEN** the postMessage payload SHALL include only the zoom property

### Requirement: Test page removes all hardcoded test data
The test page SHALL NOT contain any hardcoded marker arrays, coordinates, or other fixed test values for the commands listed above. All values SHALL be supplied by the user at runtime via the form inputs.

#### Scenario: No hardcoded data in initial page load
- **WHEN** user opens the test page
- **THEN** all command form fields SHALL be empty or show placeholder text only, with no pre-filled coordinates or marker data
