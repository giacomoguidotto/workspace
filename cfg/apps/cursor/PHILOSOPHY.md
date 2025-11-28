# Cursor Keybindings Philosophy

## Core Principles

1.  **Layered Interaction**: Keybindings are organized by *layer*, defining the scope of the action (Global Window vs. Editor Content vs. AI Assistance).
2.  **Home Row Navigation (H/J/K/L)**: Movement always follows the Vim standard (`h`: Left, `j`: Down, `k`: Up, `l`: Right).
3.  **No Alt**: The `alt` (Option) key is reserved for OS functions and never used for editor actions.
4.  **Shift Modifiers**: Used for "reverse" directions, "harder" versions of an action, or secondary functions within the same layer.

---

## Layers & Mapping

### Layer 1: Global Navigation (Ctrl)
*Scope: The Window & Layout Management*
*   **Concept**: "Move me between the major blocks of the application."
*   **Keybindings**:
    *   `ctrl + h/j/k/l`: Navigate focus between Editor, Sidebar, Panel, and Terminal.
        *   *Seamless Flow*: `ctrl+l` from Sidebar -> Editor. `ctrl+j` from Editor -> Panel.
    *   `ctrl + d`: Split Editor Right.
    *   `ctrl + shift + d`: Split Editor Down.

### Layer 2: Editor & Content (Cmd)
*Scope: The Text/Content Currently Focused*
*   **Concept**: "Manipulate the thing I am looking at right now."
*   **Navigation**:
    *   `cmd + shift + k`: Focus Active Editor (Return to code from anywhere).
    *   `cmd + j/k`: Navigate inside lists (Suggestions, Quick Fixes, Quick Pick).
    *   `cmd + shift + [` / `]`: Cycle Tabs (Editors) or Panel Views (Terminal/Output/Debug).
    *   `cmd + \` / `cmd + '`: Scroll Viewport Up/Down (Cursor stays static).
*   **Actions**:
    *   `cmd + c` (Copy), `cmd + /` (Comment), `cmd + backspace` (Delete Line).
    *   `cmd + ;`: Toggle Panel.
    *   `cmd + space`: Trigger Suggestions (IntelliSense).
*   **Multi-Cursor**:
    *   `cmd + shift + \` (Up) / `cmd + shift + '` (Down): Clone cursor vertically.
    *   *Mnemonic*: Uses the physical keys next to Enter/Return for vertical expansion.

### Layer 3: AI & Automation (Cmd + H)
*Scope: Intelligence & Generation*
*   **Concept**: "Ask for help or generate content."
*   **Why H?**: `h` maps to "Left" in Vim. The AI chat/sidebar is visually located on the **Left** side of the editor.
*   **Keybindings**:
    *   `cmd + h`: Inline Generate (Ghost Text) in Editor or Terminal.
    *   `cmd + shift + h`: Add current file to Chat Context.

### Layer 4: Zoom & View
*Scope: Visual Adjustments*
*   `cmd + shift + =`: Zoom In.
*   `cmd + shift + -`: Zoom Out.

---

## Conflict Resolution Strategy
*   **Context Keys (`when`)**: Overloaded keys (like `cmd+j`) automatically adapt:
    *   In Editor -> Scroll/Move? (Context dependent)
    *   In Suggest Widget -> Select Next Item.
    *   In Quick Fix -> Select Next Action.
*   **Fallback**: If a specific widget isn't open, keys default to their broad editor action or do nothing to prevent errors.
