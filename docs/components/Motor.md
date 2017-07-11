# Motor

# HTML
The motor is a SVG created using Inkscape. The important parts in the SVG code are the classes applied to the `<circle>` and `<path>` inside the rotator. The two dropdowns are provided to select the two active port pins.

# JS
The elements inside the rotator are rotated according to the values of the two active port pins.

# CSS
The `apply-animation` mixin is used to create the two similar `c` (clockwise) and `cc` (counter-clockwise) animations with some opposite parameters.
