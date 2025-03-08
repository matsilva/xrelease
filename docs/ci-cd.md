# CI/CD Integration

## GitHub Actions

Add to your workflow:

```yaml
steps:
  - name: Create Release
    run: |
      npm install -g xrelease
      xrelease create --ci
```

## GitLab CI

Add to your `.gitlab-ci.yml`:

```yaml
release:
  stage: release
  script:
    - npm install -g xrelease
    - xrelease create --ci
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

## Jenkins Pipeline

Add to your `Jenkinsfile`:

```groovy
stage('Release') {
  when { branch 'main' }
  steps {
    sh '''
      npm install -g xrelease
      xrelease create --ci
    '''
  }
}
```
