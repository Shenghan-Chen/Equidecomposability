# Equidecomposability
decompose two polygons with equal area and reassemble the pieces into one another

Check out this simple GUI in the link below:
https://shenghan-chen.github.io/Equidecomposability/



Numerical precision issues are mostly fixed, except for very rare cases that haven't been reproduced for a long time. Some of the tricks I played include: to identify the spots where special cases might lead to coincident points, but due to square roots taken in computing the areas, they are doomed to be off slightly. So I use the functions vec3.equals() / mat4.equals(), which are actually "approximate equal" and do the nasty epsilon check for us, and it turned out to work just fine.

There are indeed some sort of solutions to reduce the pieces needed between two triangles, which should be 8~9 for triangles of the similar scale, i.e. when one is not too much taller than another. Still working on the generalization to the cases of two polygons or two collections of triangles. Triangularization isn't treated very formally, since that won’t be a problem if this is meant for 3D meshes.

Probably ready to be incorporated into a 3D GUI now (to be tested). Transformations are written in a general way such that they should make sense in R^3 (assuming there’s no bug).

A few more improvements on the way: 1. to make it more robust; 2. and take fewer pieces. 3. If time allowed, try to do the pseudo-hinged transformation, since real hinged transformation seems practically unfeasible. That should be easy to envision upon the current approach.
