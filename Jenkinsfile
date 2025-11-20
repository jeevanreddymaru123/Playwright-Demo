pipeline {
    agent any   
    stages {
        stage('Checkout') {
            steps {
                // Clone source code from your repository
                checkout scm
               // https://github.com/jeevanreddymaru123/Playwright-Demo.git                
            }
        }
        stage('Install Dependencies') {
            steps {
                // Ensure npm, Playwright, and TypeScript are installed
                sh 'npm ci'
                // Install or update Playwright browsers if needed
                sh 'npx playwright install'
            }
        }
        stage('Run Playwright Tests') {
            steps {
                // Execute Playwright tests (default Playwright config and test files)
                sh 'npx playwright test'
            }
            post {
                always {
                    // Archive HTML report if generated
                    archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                }
                success {
                    echo 'Playwright tests succeeded.'
                }
                failure {
                    echo 'Playwright tests failed.'
                }
            }
        }
    }
    post {
        always {
            // Optionally clean up workspace
            cleanWs()
        }
    }
}
