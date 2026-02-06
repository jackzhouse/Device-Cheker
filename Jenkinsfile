pipeline {
    agent any
    
    environment {
        // ========================================
        // CONFIGURATION - Update these values
        // ========================================
        
        // Docker Image Configuration
        DOCKER_REGISTRY = 'docker.io'  // Change to your registry (e.g., 'registry.example.com')
        DOCKER_IMAGE = 'device-checking'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        
        // Docker Registry Credentials (Jenkins credential ID)
        // Create credentials in Jenkins: Manage Jenkins -> Credentials -> Add Credentials
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
        
        // Deployment Configuration
        // Choose deployment method: 'docker-compose', 'kubernetes', 'ssh'
        DEPLOYMENT_METHOD = 'docker-compose'
        
        // For SSH deployment
        // SSH_SERVER = 'user@your-server.com'
        // SSH_CREDENTIALS_ID = 'ssh-server-credentials'
        // DEPLOY_PATH = '/opt/device-checking'
        
        // For Kubernetes deployment
        // KUBECONFIG_CREDENTIALS_ID = 'kubernetes-config'
        // KUBERNETES_NAMESPACE = 'production'
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Checking out code from Git..."
                    checkout scm
                    sh 'git rev-parse HEAD > git-commit-id'
                    GIT_COMMIT_ID = readFile('git-commit-id').trim()
                    echo "Git commit: ${GIT_COMMIT_ID}"
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    echo "Setting up build environment..."
                    echo "Branch: ${env.BRANCH_NAME}"
                    echo "Build Number: ${env.BUILD_NUMBER}"
                    
                    // Set Docker tag based on branch
                    if (env.BRANCH_NAME == 'main') {
                        DOCKER_TAG = "latest"
                    } else if (env.BRANCH_NAME == 'develop') {
                        DOCKER_TAG = "staging"
                    } else {
                        DOCKER_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
                    }
                    
                    env.DOCKER_TAG = DOCKER_TAG
                    echo "Docker Tag: ${DOCKER_TAG}"
                }
            }
        }
        
        stage('Lint') {
            steps {
                script {
                    echo "Running ESLint..."
                    sh 'npm install --legacy-peer-deps'
                    sh 'npm run lint'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image..."
                    sh """
                        docker build \
                            -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} \
                            -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${GIT_COMMIT_ID} \
                            .
                    """
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    tag pattern: "v\\d+\\.\\d+\\.\\d+", comparator: "REGEXP"
                }
            }
            steps {
                script {
                    echo "Pushing Docker image to registry..."
                    
                    // Login to Docker registry
                    withCredentials([usernamePassword(
                        credentialsId: env.DOCKER_CREDENTIALS_ID,
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )]) {
                        sh """
                            echo \$DOCKER_PASSWORD | docker login ${DOCKER_REGISTRY} -u \$DOCKER_USERNAME --password-stdin
                        """
                    }
                    
                    // Push images
                    sh """
                        docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${GIT_COMMIT_ID}
                    """
                    
                    // Push 'latest' tag for main branch
                    if (env.BRANCH_NAME == 'main') {
                        sh """
                            docker tag ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    echo "Running tests..."
                    // Add your test commands here
                    // sh 'npm test'
                    echo "Tests would run here if configured"
                }
            }
        }
        
        stage('Deploy - Docker Compose') {
            when {
                expression { env.DEPLOYMENT_METHOD == 'docker-compose' }
            }
            steps {
                script {
                    echo "Deploying using Docker Compose..."
                    
                    // Pull latest image
                    sh """
                        docker-compose pull
                    """
                    
                    // Restart services
                    sh """
                        docker-compose up -d
                    """
                    
                    // Verify deployment
                    sh """
                        docker-compose ps
                    """
                }
            }
        }
        
        stage('Deploy - Kubernetes') {
            when {
                expression { env.DEPLOYMENT_METHOD == 'kubernetes' }
            }
            steps {
                script {
                    echo "Deploying to Kubernetes..."
                    
                    // This requires kubectl installed and configured
                    // withCredentials([file(credentialsId: env.KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                    //     sh """
                    //         export KUBECONFIG=$KUBECONFIG
                    //         kubectl set image deployment/device-checking app=${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} -n ${KUBERNETES_NAMESPACE}
                    //         kubectl rollout status deployment/device-checking -n ${KUBERNETES_NAMESPACE}
                    //     """
                    // }
                    
                    echo "Kubernetes deployment would run here"
                    echo "Uncomment and configure the kubectl commands above"
                }
            }
        }
        
        stage('Deploy - SSH') {
            when {
                expression { env.DEPLOYMENT_METHOD == 'ssh' }
            }
            steps {
                script {
                    echo "Deploying via SSH to ${env.SSH_SERVER}..."
                    
                    withCredentials([sshUserPrivateKey(
                        credentialsId: env.SSH_CREDENTIALS_ID,
                        keyFileVariable: 'SSH_KEY'
                    )]) {
                        sh """
                            ssh -i \${SSH_KEY} -o StrictHostKeyChecking=no ${env.SSH_SERVER} "
                                cd ${env.DEPLOY_PATH} &&
                                docker-compose pull &&
                                docker-compose up -d
                            "
                        """
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "Running health checks..."
                    sleep 10  // Wait for service to start
                    
                    // Check if application is responding
                    sh """
                        timeout 30 bash -c 'until curl -f http://localhost:3000/; do sleep 1; done' || exit 1
                    """
                    
                    echo "Application is healthy!"
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up...'
            sh 'docker logout || true'
            sh 'docker image prune -f || true'
        }
        
        success {
            echo 'Deployment successful!'
            // Add notification here (email, Slack, etc.)
        }
        
        failure {
            echo 'Deployment failed!'
            // Add failure notification here
        }
    }
}