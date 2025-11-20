pipeline {
    agent any

    environment {
        // You can set Node.js version with Jenkins NodeJS plugin if desired
        // PATH = "/opt/nodejs/bin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                // Clone source code from your repository
                checkout scm
                 echo "Checked out code for ${env.BRANCH_NAME}"
            }
        }
        stage('Setup Node.js') {
            steps {
                script {
                    def nodeHome = tool name: 'NodeJS-18', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
                sh 'node --version'
                sh 'npm --version'
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
