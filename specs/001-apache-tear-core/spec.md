# Feature Specification: Apache Tear — Core Application

**Feature Branch**: `001-apache-tear-core`
**Created**: 2026-03-20
**Status**: Draft
**Input**: Full product specification — personal knowledge base with markdown notes,
folder organization, session persistence, export, and authentication.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Account Creation & Login (Priority: P1)

A new visitor creates an account with their email and password so their notes
are private and persisted. A returning user logs back in and is taken to their
last visited page or the dashboard.

**Why this priority**: Authentication is the gating capability — no other story
can deliver value without a user identity. It is the minimum viable foundation.

**Independent Test**: Can be fully tested by signing up with a new email,
verifying the confirmation email arrives, then logging out and logging back in.
Delivers the value of a private, persistent identity.

**Acceptance Scenarios**:

1. **Given** a visitor has no account, **When** they submit a valid email and
   password, **Then** their account is created, a confirmation email is sent,
   and they are redirected to the dashboard.
2. **Given** a visitor submits a duplicate email, **When** they attempt to
   register, **Then** the system displays a descriptive error indicating the
   email is already in use.
3. **Given** a registered user, **When** they submit correct credentials,
   **Then** they are authenticated and redirected to their last visited page
   or the dashboard.
4. **Given** a registered user, **When** they submit incorrect credentials,
   **Then** the system displays a descriptive error and suggests corrective
   action (e.g., reset password).
5. **Given** an authenticated user, **When** they log out, **Then** their
   session is terminated and they are redirected to the login page.

---

### User Story 2 - Create and View a Note (Priority: P2)

A writer creates a new note with a title and a markdown body. The note is saved,
immediately visible in the file tree, and renders markdown in a preview pane.

**Why this priority**: Creating and reading a note is the single atomic unit of
value in the application. Every other story builds on this.

**Independent Test**: Can be fully tested by creating a note with markdown
content (headings, bold, code blocks), saving it, and verifying it appears in
the file tree and renders correctly in the preview pane.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they create a new note with a
   title and markdown body and save it, **Then** the note appears in the file
   tree and the markdown renders correctly in the preview pane.
2. **Given** a note exists, **When** the user edits its content, **Then**
   the preview updates to reflect the saved changes.
3. **Given** a note exists, **When** the user renames it, **Then** the file
   tree reflects the new title.
4. **Given** a note exists, **When** the user deletes it, **Then** it is
   removed from the file tree and no longer accessible.
5. **Given** a user creates a note, **When** they download or inspect the
   stored file, **Then** it is a plain `.md` file readable and editable in
   any text editor outside the application.

---

### User Story 3 - Folder Organization (Priority: P3)

A user creates folders to group related notes, renames them, nests them, and
moves notes between folders — keeping topics cleanly separated.

**Why this priority**: Once multiple notes exist, discoverability depends on
structure. This story transforms a flat list of notes into an organized
knowledge base.

**Independent Test**: Can be tested by creating two folders, nesting one inside
the other, creating notes in each, and moving a note between folders. Delivers
the value of structured content organization.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they create a folder with a name,
   **Then** the folder appears in the file tree.
2. **Given** a folder exists, **When** the user renames it, **Then** the file
   tree reflects the new name immediately.
3. **Given** a folder exists, **When** the user nests it inside another folder,
   **Then** the hierarchy is reflected in the file tree.
4. **Given** a note and a target folder exist, **When** the user moves the note
   into the folder, **Then** the note appears under that folder in the file tree.
5. **Given** a folder contains notes, **When** the user deletes the folder,
   **Then** the system warns the user before deletion and either moves the notes
   to the root or deletes them per the user's confirmed choice.

---

### User Story 4 - Session & Workspace Persistence (Priority: P4)

A user's workspace layout and open notes are automatically restored when they
reopen the application, so they can resume exactly where they left off.

**Why this priority**: Persistence of context dramatically reduces friction on
re-entry. It is a quality-of-life feature that depends on notes and organization
existing first (P2, P3).

**Independent Test**: Can be tested by opening several notes, arranging panels,
closing the browser tab, reopening the app, and verifying the same notes and
layout are restored.

**Acceptance Scenarios**:

1. **Given** a user has open notes and a panel layout, **When** they close and
   reopen the application, **Then** the same notes are open and the panel layout
   is restored.
2. **Given** a user changes their panel layout (e.g., resizes the file tree),
   **When** they reopen the app, **Then** the new layout is persisted.
3. **Given** a note that was open is deleted, **When** the user reopens the app,
   **Then** the deleted note is not restored and the workspace opens gracefully.

---

### User Story 5 - Document Export (Priority: P5)

A user exports a note as a PDF or plain `.md` file to share with people who
do not use the application — with all formatting preserved.

**Why this priority**: Export is a sharing and interoperability feature that
adds value to existing notes. It is independent of all prior stories except
note creation (P2).

**Independent Test**: Can be tested by exporting a note containing rich markdown
(headings, lists, code blocks, bold/italic) as both PDF and `.md`, then verifying
the exported files preserve all formatting.

**Acceptance Scenarios**:

1. **Given** a note with markdown content, **When** the user exports it as PDF,
   **Then** a downloadable PDF is produced with all formatting preserved.
2. **Given** a note, **When** the user exports it as `.md`, **Then** a plain
   markdown file is downloaded that is readable in any text editor.
3. **Given** a note with images or special characters, **When** exported,
   **Then** those elements are handled gracefully (included or noted as
   unsupported, not silently dropped).

---

### Edge Cases

- What happens when a user creates a note with an empty title or body?
- What happens when two notes in the same folder have identical names?
- What happens when a folder is dragged into one of its own descendants?
- How does the system handle a session restore when notes were modified on
  another device since the last session?
- What happens if the export of a very large note times out or fails?
- How does the system behave when the user's storage quota is exceeded?

## Requirements *(mandatory)*

### Functional Requirements

**Authentication**

- **FR-001**: System MUST allow users to create an account using email and password.
- **FR-002**: System MUST send a confirmation email upon successful account creation.
- **FR-003**: System MUST authenticate returning users via email and password.
- **FR-004**: System MUST redirect authenticated users to their last visited
  page or the dashboard on login.
- **FR-005**: System MUST display descriptive error messages for invalid
  credentials and suggest corrective actions.
- **FR-006**: System MUST allow users to log out, terminating their session.

**Note Management**

- **FR-007**: System MUST allow users to create a note with a title and a
  markdown body.
- **FR-008**: System MUST display new and existing notes in a file tree
  immediately after save.
- **FR-009**: System MUST render markdown content in a preview pane.
- **FR-010**: System MUST allow users to edit, rename, and delete their notes.
- **FR-011**: System MUST store each note as a plain `.md` file on the server
  or storage bucket, readable and editable outside the application.

**Folder Organization**

- **FR-012**: System MUST allow users to create, rename, and delete folders.
- **FR-013**: System MUST support nested folders (folders within folders).
- **FR-014**: System MUST allow users to move notes between folders.
- **FR-015**: System MUST warn the user before deleting a non-empty folder and
  confirm their intended action.

**Session & Workspace Persistence**

- **FR-020**: System MUST persist the user's open notes and panel layout
  between sessions.
- **FR-021**: On session restore, if a previously open note has been deleted,
  the workspace MUST recover gracefully without errors.

**Document Export**

- **FR-022**: System MUST allow users to export a note as a PDF file with
  formatting preserved.
- **FR-023**: System MUST allow users to export a note as a `.md` file.

### Key Entities

- **User**: Represents an account. Has an email address and authentication
  credentials. Owns all notes and folders. Has one workspace state.
- **Note**: A markdown document with a title and body. Belongs to a user,
  optionally nested within a folder. Stored as a plain `.md` file.
  Has creation and modification timestamps.
- **Folder**: A named container for notes and other folders. Belongs to a user,
  supports arbitrary nesting. Has a name and an optional parent folder.
- **WorkspaceState**: Captures a user's UI context — which notes are open,
  panel layout dimensions. One record per user, updated on change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user completes account creation (signup through email
  confirmation) in under 2 minutes.
- **SC-002**: A note is saved and appears in the file tree within 1 second of
  the user confirming the save action.
- **SC-003**: Workspace state is fully restored within 2 seconds of the
  application loading on return visits.
- **SC-004**: An exported PDF preserves 100% of the markdown formatting
  elements present in the original note (headings, lists, bold, italic,
  code blocks).
- **SC-005**: Notes stored on the server are downloadable as plain `.md` files
  that open correctly in standard text editors without any modification.
- **SC-006**: The application is fully usable on screen widths from 375 px
  (mobile) to 1440 px+ (desktop) without horizontal scrolling or content
  overflow.

## Design Constraints

- **Visual style**: Monokai-inspired color palette — dark background, high
  contrast syntax-colored accents. Minimalistic and professional aesthetic,
  inspired by Obsidian.
- **Breakpoints**: Mobile < 640 px, Tablet 640 px–1024 px, Desktop > 1024 px.
- **Motion**: Subtle transitions (150 ms ease) — no jarring animations.
- **AI**: Claude AI integration is planned for future features; model selection
  is TBD per feature. Not required for this core release.

## Assumptions

- The application is single-user by design (personal use); no sharing,
  collaboration, or team features are in scope.
- Password reset via email is a standard expectation and is in scope as a
  sub-requirement of FR-003/FR-005 (descriptive errors that suggest corrective
  action imply a reset path exists).
- Notes are owned exclusively by the creating user; no access control beyond
  authentication is required.
- Export formatting fidelity applies to standard CommonMark markdown elements;
  custom HTML embedded in markdown is out of scope for v1.
- Storage quota limits are a platform/infrastructure concern and not explicitly
  enforced at the application level for v1; the edge case is handled with a
  graceful error message.
