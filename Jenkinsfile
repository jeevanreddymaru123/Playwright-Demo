pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['qa', 'staging'],
            description: 'Environment to run tests against'
        )
        choice(
            name: 'BROWSER',
            choices: ['chromium', 'firefox', 'webkit', 'all'],
            description: 'Browser to run tests on'
        )
        choice(
            name: 'TEST_SUITE',
            choices: ['all', 'smoke', 'regression', 'e2e'],
            description: 'Test suite to execute'
        )
        booleanParam(
            name: 'HEADLESS',
            defaultValue: true,
            description: 'Run tests in headless mode'
        )
    }
    
    environment {
        NODE_VERSION = '22'
        PLAYWRIGHT_BROWSERS_PATH = './playwright-browsers'
        CI = 'true'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Checked out code for ${env.BRANCH_NAME}"
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    def nodeHome = tool name: 'NodeJS-22', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
            post {
                failure {
                    echo 'Failed to install dependencies'
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    def baseUrl = ''
                    def apiBaseUrl = ''
                    
                    switch(params.ENVIRONMENT) {
                            case 'qa':
                            baseUrl = 'https://playwright.dev/.com'
                            break
                        case 'staging':
                            baseUrl = 'https://playwright.dev/.com'
                            break
                        }
                    
                    writeFile file: '.env', text: """
BASE_URL=${baseUrl}
API_BASE_URL=${apiBaseUrl}
TIMEOUT=30000
HEADLESS=${params.HEADLESS}
BROWSER=${params.BROWSER}
TEST_ENV=${params.ENVIRONMENT}
"""
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('E2E Tests') {
                    when {
                        anyOf {
                            expression { params.TEST_SUITE == 'all' }
                            expression { params.TEST_SUITE == 'e2e' }
                            expression { params.TEST_SUITE == 'regression' }
                        }
                    }
                    steps {
                        script {
                            def browserArg = params.BROWSER == 'all' ? '' : "--project=${params.BROWSER}"
                            sh "npx playwright test tests/e2e/ ${browserArg}"
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'reports/html-report',
                                reportFiles: 'index.html',
                                reportName: 'E2E Test Report',
                                reportTitles: 'E2E Tests'
                            ])
                        }
                    }
                }             
                              
                stage('Smoke Tests') {
                    when {
                        anyOf {
                            expression { params.TEST_SUITE == 'smoke' }
                            expression { params.TEST_SUITE == 'all' }
                        }
                    }
                    steps {
                        sh 'npx playwright test --grep "@smoke"'
                    }
                }
            }
        }
        
        stage('Collect Results') {
            steps {
                script {
                    // Collect test results
                    if (fileExists('reports/test-results.json')) {
                        def testResults = readJSON file: 'reports/test-results.json'
                        echo "Test Results: ${testResults}"
                    }
                }
                
                // Archive artifacts
                archiveArtifacts artifacts: 'reports/**/*', fingerprint: true
                archiveArtifacts artifacts: 'screenshots/**/*', fingerprint: true, allowEmptyArchive: true
                
                // Publish test results
                publishTestResults testResultsPattern: 'reports/junit-results.xml'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            script {
                if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                    slackSend(
                        channel: '#test-results',
                        color: 'good',
                        message: "✅ Playwright tests passed for ${params.ENVIRONMENT} environment\\n" +
                                "Branch: ${env.BRANCH_NAME}\\n" +
                                "Build: ${env.BUILD_URL}"
                    )
                }
            }
        }
        failure {
            slackSend(
                channel: '#test-failures',
                color: 'danger',
                message: "❌ Playwright tests failed for ${params.ENVIRONMENT} environment\\n" +
                        "Branch: ${env.BRANCH_NAME}\\n" +
                        "Build: ${env.BUILD_URL}\\n" +
                        "Please check the logs for details."
            )
            
            emailext(
                subject: "Test Failure: Playwright Tests - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                <h3>Test Execution Failed</h3>
                <p><strong>Environment:</strong> ${params.ENVIRONMENT}</p>
                <p><strong>Browser:</strong> ${params.BROWSER}</p>
                <p><strong>Test Suite:</strong> ${params.TEST_SUITE}</p>
                <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                <p>Please check the build logs and test reports for more details.</p>
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}, qa-team@company.com",
                mimeType: 'text/html'
            )
        }
        unstable {
            slackSend(
                channel: '#test-results',
                color: 'warning',
                message: "⚠️ Playwright tests completed with some failures for ${params.ENVIRONMENT} environment\\n" +
                        "Branch: ${env.BRANCH_NAME}\\n" +
                        "Build: ${env.BUILD_URL}"
            )
        }
    }
}
