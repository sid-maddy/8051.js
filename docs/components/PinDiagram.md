# [Pin Diagram](../../src/components/PinDiagram.vue)

# HTML
The pin diagram is an SVG drawn using Inkscape. The important parts in the SVG code are the ids and classes applied to each pin.

# JS
Each pin is assigned a `high` or `low` class according to their state in the `memory`. The getters defined in [main.js](../../src/main.js) are used to ease this assignment.
