# Starter Skeleton Theme for Shopify

This _is not_ a framework. This will not try to give you fancy ways to do cool stuff. This is designed to get a bespoke theme up and running quickly, with minimal effort.

This _is_ a set of build tools, a simple structure and some basic scss.

You will need to BYO design, layout, and custom modules/sections/whatever.

## Tools

- Shopify Theme Kit: [http://themekit.cat/install/](http://themekit.cat/install/)
- Inside SCSS: [https://github.com/stewartknapman/inside](https://github.com/stewartknapman/inside)

### Shopify Theme Kit
We recommend using Shopify's Theme Kit rather than the Theme Gem. This is what Shopify's own developers use, and has the ability to use multiple environments (i.e. development, staging, production, etc.).

[http://themekit.cat/install/](http://themekit.cat/install/)

### Commands


### Images

I don't know what size images you need, you'll have to find the image tags and update the sizes based on your own needs.

To make them easy to find I've included this comment tag: `{% comment [IMAGE] - update sizes for your own needs %}{% endcomment %}` with each image tag, so all you need to do is search your project for `[IMAGE]`.

## TODO
- Setup build tasks (autoprefixer)
- JS structure needs a bit of work
- svg icons with fallback