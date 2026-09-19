# Design system

The rules your interface follows, written down, so that screen four looks like
screen one.

**Part of this is a visual document**, submitted as a PDF or images. Swatches,
type samples and component states, not paragraphs describing them.

## What to record

**Colour.** Every colour, with its hex value and the name you use for it in code.
Check text against its background for contrast; the WCAG minimum is 4.5 to 1 for
normal text, and it is checked.

**Type.** The family, and the sizes you actually use, each with a name. Three or
four sizes is plenty.

**Spacing.** One scale, and stick to it. Numbers chosen at random per component
is the single most common reason a student project looks unfinished.

**Components.** For each reusable piece: what it looks like normally, on hover,
focused, disabled, and while loading. **Focus states are not optional**: removing
an outline without replacing it makes your app unusable with a keyboard.

**States.** Loading, empty, error and data are four different screens. Decide what
each looks like once, here, rather than improvising per page.

## In code

Say where these live: CSS custom properties, a Tailwind config, a theme object, a
component library you configured. The template starts with custom properties in
`client/src/styles.css`. Module 3 covered the alternatives; use the one you can
defend.
