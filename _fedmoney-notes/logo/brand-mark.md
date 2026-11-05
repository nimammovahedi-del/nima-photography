# Header brand mark (Federal Money Atlas)

Source: site/src/layouts/Site.astro (markup) and site/public/app/v3.css (styles) in ~/Projects/federal-money-map.

Markup:

```html
<a class="brand" href="/"><i aria-hidden="true"><b></b><b></b><b></b><b></b></i>Federal Money Atlas</a>
```

CSS:

```css
.brand{font:700 12px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;text-decoration:none;display:flex;align-items:center;gap:10px}
.brand i{display:grid;grid-template-columns:repeat(2,6px);gap:2px}
.brand i b{width:6px;height:6px;background:var(--ink)}
.brand i b:nth-child(2),.brand i b:nth-child(3){background:var(--green)}
```

A 2x2 grid of squares: ink top-left and bottom-right, green top-right and bottom-left (same as favicon.svg).
