# Starter Skeleton Theme for Shopify

This _is not_ a huge opinionated framework. This will not try to give you fancy ways to do cool stuff, with lots of configuration. This is designed to get a bespoke theme up and running quickly, with minimal effort.

This _is_ a set of build tools, a simple structure and some basic scss.

You will need to BYO design, layout, and custom modules/sections/whatever. Is there something missing that you need/want? Build it.

## Tools

- Shopify Theme Kit: [http://themekit.cat/](http://themekit.cat/)
- Inside SCSS: [https://github.com/stewartknapman/inside](https://github.com/stewartknapman/inside)
- Sass Importer: [https://github.com/stewartknapman/sass-importer](https://github.com/stewartknapman/sass-importer)
- Shopify Settings Generator: [https://github.com/stewartknapman/shopify-settings-generator](https://github.com/stewartknapman/shopify-settings-generator)

### Shopify Theme Kit
I recommend using Shopify's Theme Kit rather than the Theme Gem. This is what Shopify's own developers use, and has the ability to use multiple environments (i.e. development, staging, production, etc.).

### Inside SCSS
I built a light weight SASS framework for my own needs. I like it. Don't want it? Don't worry, you can just remove the lines that look like this `@import '../../node_modules/inside-scss/src/inside';` in the main scss files (`_src/scss/`) and replace them with what ever you want.

### Sass Importer
I prefer to push my scss files to Shopify to be compiled. Yes, I know that Shopify's version of SASS is old and crappy, but that way I don't have to worry about [escaping any liquid](https://gist.github.com/stewartknapman/8346708). I also prefer to use `@import`. So I build a tool that just concats the scss files based on the import rules.

Again, if you don't want to use my methods, I'm not your mother, go and rip it out and replace it with something that suits your own needs.

### Shopify Settings Generator
If you hadn't noticed I like building my own tools. This one allows me to keep theme settings in small, managable, bite-sized files, along with doing loops and other stuff that sucks.

I think if at this point you don't want to use this, you might want to look at using a different theme, there are too many things here you don't agree with. But hey, do what ever you want to do, man.

## Commands

```
npm run build
```

_To do: more detail on how to run the build tasks._

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
- svg icons with fallback (one include snippet file at the top of the body that defines the symbols, built from a folder of icons. <use> to use them. Include <title> for accessibility Fallback to text/emoji?)