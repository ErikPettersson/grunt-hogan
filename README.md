# grunt-hogan

a [grunt](http://gruntjs.com) task to precompile [hogan](http://hoganjs.com) templates 

## Getting Started

> NOTE: This documentation is for grunt version 0.4+.

Then add this line to your project's `Gruntfile.js`:

```javascript
grunt.loadNpmTasks('grunt-hogan');
```

To precompile a single template into a single output file:

```javascript
grunt.initConfig({
    hogan: {
        'default': {
            templates: 'tmpl/**/*.html'
        }
    },
    //...
});
```

