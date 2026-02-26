## ADDED Requirements

### Requirement: Generator page provides link to docs
The system SHALL display a visible link to the `/docs` page within the generator UI.

#### Scenario: Docs link visible on generator page
- **WHEN** user navigates to `/generator`
- **THEN** a "文件說明" or equivalent link SHALL be visible in the header or top area of the page

#### Scenario: Docs link navigates to /docs
- **WHEN** user clicks the docs link on the generator page
- **THEN** the browser SHALL navigate to `/docs`
