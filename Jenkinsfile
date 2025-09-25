pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend Install and Build React') {
            steps {
                    bat 'npm install'
                    bat 'npm run build'
            }
        }

        stage('Frontend Test React') {
            steps {
                    bat 'npm run test -- --coverage'
            }
        }
    }

    post {
        success {
            echo 'Frontend build and tests succeeded!'
        }
        failure {
            echo 'Frontend build or tests failed.'
        }
        unstable {
            echo 'Frontend build is unstable (some tests may have failed).'
        }
        always {
            echo 'Frontend pipeline execution complete.'
        }
    }
}
