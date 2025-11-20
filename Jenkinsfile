pipeline {
    agent any
    stages {
        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
                bat 'npx playwright install'
            }
        }
        stage('Run Playwright Tests') {
            steps {
                bat 'npx playwright test'
            }
        }
    }
}
