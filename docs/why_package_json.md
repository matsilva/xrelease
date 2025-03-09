## Why package.json for ALL Projects?

You might be thinking: "package.json in my Go/Python/Scala project? Really?"
Hear us out:

### Why Not Alternatives?

`.version`:
`VERSION.txt`:

- ❌ Another file to create/maintain
- ❌ No standard format across tools
- ❌ Limited ecosystem support
- ❌ No structured data
- ❌ Hard to programmatically update
- ❌ Different parsers needed

Language-specific files (`setup.py`, `build.sbt`, `go.mod` etc.):

- ❌ Different for every language
- ❌ Complex regex patterns needed

### Why package.json Works

- ✅ Standard JSON format - easy to read/write
- ✅ Well-defined version field
- ✅ Battle-tested by npm ecosystem
- ✅ Great tooling support
- ✅ Works with existing CI/CD tools

### But What About...

"Won't people think it's a Node.js project?"

- Nope! We mark it as `private: true`
- Your project's real package manager stays in charge

"What about my existing tools?"

- They'll keep working
- package.json is just xrelease's source of truth
- Other tools can still use their native version files
