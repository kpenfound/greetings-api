pipeline {
  agent { label 'dagger' }

  environment {
    DAGGER_MODULE = "github.com/kpenfound/greetings-api/ci"
  }
  stages {
    stage("dagger") {
      steps {
        sh '''
            dagger call ci --dir "."
        '''
      }
    }
  }
}
