pipeline {
  agent { label 'dagger' }
  
  environment {
    _EXPERIMENTAL_DAGGER_CLOUD_TOKEN = "a276ce43-e1ca-4427-a6ee-200d77b85b56"
  }
  stages {
    stage("dagger") {
      steps {
        sh '''
            dagger run go run ./ci ci
        '''
      }
    }
  }
}