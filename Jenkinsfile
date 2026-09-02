@Library('jenkins-shared-library') _
pipeline{
    agent { label "dev"};
    environment{
        REGISTRY_CREDENTIALS= "dockerHub-CredentialsId"
        FRONTEND_IMAGE= "devboard-frontend"
        BACKEND_IMAGE= "devboard-backend"
    }
    stages{
        stage("Code clone"){
            steps{
                script{
                    clone("https://github.com/Rupam51015/devboard.git", "jenkins")
                }
            }
        }
        stage("Code Build, Test & Lint"){
            parallel{
                stage("Frontend setup, Lint & Test"){
                    tools {nodejs "Node-24"}
                    steps{
                        dir('frontend'){
                            echo "installing Frontend dependencies.."
                            sh "npm install --legacy-peer-deps"
                            echo "Linting the code.."
                            sh "npm run lint"
                            echo "Testing the Frontend code.."
                            sh "npm run test"
                        }
                    }
                }
                stage("Backend setup, Lint & Test"){
                    tools {go "Go-1.23"}
                    steps{
                        dir('backend'){
                            echo "Running Go Vetting.."
                            sh "go vet ./..."
                            echo "Running Go Formatting.."
                            sh "go fmt ./..."
                        }
                    }
                }
            }
        }
        stage("Global Security Pre-Checks"){
            parallel{
                stage("Secret Scanning"){
                    steps{
                        echo "Running GitLeaks scanning.."
                        sh '''
                            docker run --rm \
                            -v "$(pwd)":/path \
                            zricethezav/gitleaks:latest \
                            detect --source="/path" --verbose --report-path="/path/gitleaks-report.json" || true
                        '''
                        archiveArtifacts artifacts: 'gitleaks-report.json', allowEmptyArchive: true
                    }
                }
                stage("Dependency Scanning-Frontend"){
                    steps{
                        tools {nodejs "Node-24"}
                        dir("frontend"){
                            echo "Running Dependecy scanning.."
                            sh "npm audit || true"
                        }
                    }
                }
                stage("Dependency Scanning-Backend"){
                    steps{
                        dir("backend") {
                            echo "Running Go Vulnerability Scan via Docker Container..."
                            sh '''
                                docker run --rm \
                                -v "$(pwd)":/app \
                                -w /app \
                                golang:1.23-alpine \
                                sh -c "go install golang.org/x/vuln/cmd/govulncheck@v1.1.4 && /go/bin/govulncheck . > go-vuln-report.txt; chmod 644 go-vuln-report.txt" || true
                            '''
                        }
                        echo "Archiving backend vulnerability report..."
                        archiveArtifacts artifacts: "backend/go-vuln-report.txt", fingerprint: true
                    }
                }
            }
        }
        stage("SonarQube Analysis"){
            steps{
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE'){
                    script {
                        def sonarScannerHome = tool "sonar-scanner"
                        withEnv(["PATH+SONAR=${sonarScannerHome}/bin"]) {
                            withSonarQubeEnv("SonarQube-server") {
                                echo "Executing automated SonarQube Scanner..."
                                sh "sonar-scanner"
                            }
                        }
                    }
                }
            }
        }
        stage("Docker Build"){
            parallel{
                stage("Frontend"){
                    steps{
                        echo "Building docker image.."
                        docker_build(
                            imageName : "${FRONTEND_IMAGE}",
                            imageTag : "latest",
                            fileName : "./frontend/Dockerfile",
                            context : "./frontend"
                        )
                    }                    
                }
                stage("Backend"){
                    steps{
                        echo "Building docker image.."
                        docker_build(
                            imageName : "${BACKEND_IMAGE}",
                            imageTag : "latest",
                            fileName : "./backend/Dockerfile",
                            context : "./backend"
                        )
                    }
                }
            }
        }
        stage("Trivy Scanning"){
            steps{
                sh "docker pull aquasec/trivy:latest"
                echo "Vulenrability Scanning for frontend image.."
                sh """docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    -v \${WORKSPACE}/.cache/trivy:/root/.cache/ \
                    aquasec/trivy:latest image --exit-code 0 --severity HIGH,CRITICAL ${FRONTEND_IMAGE}:latest
                """
                echo "Vulnerability scanning for backend image.."
                sh """docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    -v \${WORKSPACE}/.cache/trivy:/root/.cache/ \
                    aquasec/trivy:latest image --exit-code 0 --severity HIGH,CRITICAL ${BACKEND_IMAGE}:latest
                """
            }
        }
        stage("Docker Push"){
            parallel{
                stage("Frontend"){
                    steps{
                        echo "Pushing frontend image to repository"
                        docker_push("${REGISTRY_CREDENTIALS}", "${FRONTEND_IMAGE}")
                    }
                }
                stage("Backend"){
                    steps{
                        echo "Pushing frontend image to repository"
                        docker_push("${REGISTRY_CREDENTIALS}", "${BACKEND_IMAGE}")
                    }
                }
            }
        }
        stage("Deploy"){
            steps{
                echo "Checking for env file setup.."
                sh "if [ ! -f .env ]; then cp .env.example .env; fi"
                echo "Dyployed Devboard app"
                sh "docker compose pull"
                sh "docker compose up -d"
            }
        }
    }
    post{
        always{
            echo "Pipeline run completed. Running workspace cleanup configurations."
            cleanWs()
        }
    }
}