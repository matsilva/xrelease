# CI/CD Integration

## Quickstart (GitHub Actions)

Copy this into `.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install -g xrelease
      - run: xrelease create
```

## CI Platform Examples

### GitHub Actions (Full)

```yaml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Important for correct versioning

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      # Install xrelease
      - name: Install xrelease
        run: npm install -g xrelease

      # Optional: Configure Git
      - name: Configure Git
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'

      # Create release
      - name: Create Release
        run: xrelease create
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### GitLab CI

```yaml
release:
  stage: release
  image: node:18
  script:
    # Ensure correct Git setup
    - git config --global user.name 'GitLab CI'
    - git config --global user.email 'gitlab-ci@example.com'
    - git fetch --tags

    # Create release
    - npm install -g xrelease
    - xrelease create
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  variables:
    GIT_STRATEGY: clone
    GIT_DEPTH: 0 # Important for correct versioning
```

### Jenkins Pipeline

```groovy
pipeline {
  agent any

  stages {
    stage('Release') {
      when { branch 'main' }
      steps {
        // Ensure correct Git setup
        sh '''
          git config --global user.name 'Jenkins'
          git config --global user.email 'jenkins@example.com'
          git fetch --tags
        '''

        // Install and run xrelease
        sh '''
          npm install -g xrelease
          xrelease create
        '''
      }
    }
  }
}
```

### CircleCI

```yaml
version: 2.1
jobs:
  release:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run:
          name: Fetch Tags
          command: git fetch --tags
      - run:
          name: Configure Git
          command: |
            git config --global user.name 'CircleCI'
            git config --global user.email 'circleci@example.com'
      - run:
          name: Create Release
          command: |
            npm install -g xrelease
            xrelease create

workflows:
  version: 2
  release:
    jobs:
      - release:
          filters:
            branches:
              only: main
```

## Common Issues & Solutions

### Git Depth

Problem: Incorrect version bumping
Solution: Ensure `fetch-depth: 0` or equivalent

```yaml
# GitHub Actions
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

# GitLab CI
variables:
  GIT_DEPTH: 0

# Jenkins
checkout(
  scm: [$class: 'GitSCM', extensions: [[$class: 'CloneOption', depth: 0]]]
)
```

### Git Authentication

Problem: Cannot push tags
Solution: Ensure correct tokens and git config

```bash
# GitHub Actions
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

# GitLab CI
variables:
  GITLAB_TOKEN: ${{ secrets.GITLAB_TOKEN }}
```

### Node Version

Problem: Incompatible Node.js version
Solution: Use Node.js 18 or later

```yaml
# GitHub Actions
- uses: actions/setup-node@v4
  with:
    node-version: '18'

# GitLab CI
image: node:18
```
