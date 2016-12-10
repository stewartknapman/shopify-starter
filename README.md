# Starter Skeleton Theme for Shopify

This _is not_ a framework. This will not try to give you fancy ways to do cool stuff. This is designed to get a bespoke theme up and running quickly, with minimal effort.

This _is_ a set of build tools, a simple structure and some basic scss.

You will need to BYO design, layout, and custom modules/sections/whatever.

## Tools

- Shopify Theme Kit: [http://themekit.cat/](http://themekit.cat/)
- Inside SCSS: [https://github.com/stewartknapman/inside](https://github.com/stewartknapman/inside)

### Shopify Theme Kit
We recommend using Shopify's Theme Kit rather than the Theme Gem. This is what Shopify's own developers use, and has the ability to use multiple environments (i.e. development, staging, production, etc.).

[http://themekit.cat/](http://themekit.cat/)

### Inside SCSS
I built a light weight SASS framework for my own needs. I like it. Don't want it? Don't worry, you can just remove the lines that look like this `@import '../../node_modules/inside-scss/src/inside';` in the main scss files (`_src/scss/`) and replace them with what ever you want.

## Commands

```
npm run build
```

To do: more detail on how to run the build tasks.

## Important Notes

### Images

I don't know what size images you need, you'll have to find the image tags and update the sizes based on your own needs.

To make them easy to find I've included this comment tag: `{% comment [IMAGE] - update sizes for your own needs %}{% endcomment %}` with each image tag, so all you need to do is search your project for `[IMAGE]`.

### Layout and Grids

Again, I don't know what you need, so I've left everything one column and full width. It's up to you and your design.

However there is a grid system here, should you need it. Here are your options:

- Use flexbox (or css grids if you can get away with being that bleeding edge)
- Use the built in [sass grid mixins](https://github.com/stewartknapman/inside/#grids)
- Use the built in [grid classes](https://github.com/stewartknapman/inside/#grids) (if you're old school/lazy)

## TODO
- Setup build tasks (autoprefixer)
- JS structure needs a bit of work
- svg icons with fallback