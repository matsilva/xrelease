# xrelease

> "I build in Python, Go, Scala, Node, Swift... got tired of each having its own release dance. So I made one that Just Works™ for everything." - [@matsilva](https://x.com/MatSilva)

## TL;DR

```bash
npm install -g xrelease  # Install it
cd your-project         # Go to your project
xrelease init          # Set it up (takes 30 seconds)
xrelease create        # Create a release! 🚀
```

That's it! It'll figure out the rest. Need more control? Check `docs/`.

## What It Does

- ✨ Works with ANY language (Python, Go, Scala, Node, Swift, etc.)
- 🤖 Handles versioning, changelogs, git tags
- 🔄 Same workflow everywhere - learn once, use everywhere
- 🎯 Zero config needed (but fully customizable if you want)

## Common Commands

```bash
xrelease create        # Create a release
xrelease create -M     # Major release
xrelease create -m     # Minor release
xrelease create -p     # Patch release
```

## More Details

- 📚 [Installation Options](docs/installation.md)
- ⚙️ [Configuration Guide](docs/configuration.md)
- 🔄 [CI/CD Integration](docs/ci-cd.md)

## A Note for Scala Devs

Yes, it's built with Node.js, not "sleek, performant Scala with higher-order functions" 😉. But like `sbt` or `mill`, it's just a build tool - it won't touch your production code. Promise!... maybe

## License

MIT
