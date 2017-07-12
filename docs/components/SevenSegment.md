# [Seven Segment](../src/components/SevenSegment.vue)

# HTML
The seven segment is an SVG drawn using Inkscape. The important parts in the SVG code are the ids applied to each segment. A dropdown is provided to select the active port.

# JS
Each segment is filled or unfilled according to the active port's state in the `memory`. The getters defined in [main.js](../../src/main.js) are used to ease this assignment.
