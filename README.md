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
I recommend using Shopify's Theme Kit. This is what Shopify's own developers use, and has the ability to use multiple environments (i.e. development, staging, production, etc.).

### Inside SCSS
I built a light weight SASS framework for my own needs. I like it. Don't want it? Don't worry, you can just remove the lines that look like this `@import '../../node_modules/inside-scss/src/inside';` in the main scss files (`_src/scss/`) and replace them with the framework of your choice.

### Sass Importer
I prefer to push my scss files to Shopify to be compiled. Yes, I know that Shopify's version of SASS is old, but that way I don't have to worry about [escaping any liquid](https://gist.github.com/stewartknapman/8346708). I also prefer to use `@import` to create small, manageable files. So I build a tool that just concats the scss files based on the import rules.

Again, if you don't want to use this, I'm not your mother. Feel free to rip it out and replace it with something that suits your own needs.

### Shopify Settings Generator
If you hadn't noticed I like building my own tools. This one allows me to keep theme settings in small, manageable, bite-sized files, along with doing cool things like loops and other stuff that sucks to write by hand.

## Commands

```
npm run build
```

Simple.

_To do: more detail on the individual build tasks._

## Important Notes

### Images

I don't know what image sizes you need, I've included some basic defaults but you'll have to find the image tags and update the sizes based on your own content needs.

To make them easy to find I've included this comment tag: `{% comment [IMAGE] - update sizes for your own needs %}{% endcomment %}` with each image tag, so all you need to do is search your project for `[IMAGE]`.

### Layout and Grids

Again, I don't know what you need, so I've left everything one column and full width. It's up to you and your design.

However there is a grid system here, should you need it. Here are your options:

- Use flexbox or CSS grid if you can
- Use the built in [sass grid mixins](https://github.com/stewartknapman/inside/#grids)
- Use the built in [grid classes](https://github.com/stewartknapman/inside/#grids) (if you're old school or strapped for time)

## TODO
- Setup build tasks (autoprefixer)
- JS structure needs a ~bit~ lot of work
- svg icons ~with fallback (one include snippet file at the top of the body that defines the symbols, built from a folder of icons. <use> to use them. Include <title> for accessibility Fallback to text/emoji?)~
