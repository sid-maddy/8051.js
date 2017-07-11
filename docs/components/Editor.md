# Editor

# HTML
[Ace Editor](https://ace.c9.io/) is used with the Tomorrow editor theme and x86 Assembly syntax theme (one for 8051 assembly was not readily available.) The three buttons below the editor map to corresponding methods defined in [main.js](../../src/main.js).

If the back-end returns an error in parsing or executing the code, then the error box is shown.

# JS
The `data`:
- `code`: The entire text in the editor.
- `errorMessage`, `lineNumber` and `isError`: Variables returned by the back-end in case of error.
- `markers`: For marking (or highlighting) the lines according to their state.

After the editor is mounted, the themes are applied and the event listeners are attached. The `highlightLine` and `removeMarkers` methods deal with line highlighting.
