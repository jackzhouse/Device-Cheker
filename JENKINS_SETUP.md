# Jenkins CI/CD Setup Guide

This document explains how to set up and configure Jenkins for the device-checking application.

## Prerequisites

- Jenkins server (running on Docker, Kubernetes, or bare metal)
- Docker installed on Jenkins agent
- Git repository access (GitHub, GitLab, etc.)
- Docker registry (Docker Hub, private registry, or AWS ECR)
- Consul server running in Docker

## Jenkins Installation

### Option 1: Docker (Recommended)

```bash
# Run Jenkins with Docker
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Option 2: Kubernetes

```yaml
# jenkins-deployment.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jenkins-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jenkins
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jenkins
  template:
    metadata:
      labels:
        app: jenkins
    spec:
      containers:
      - name: jenkins
        image: jenkins/jenkins:lts
        ports:
        - containerPort: 8080
        - containerPort: 50000
        volumeMounts:
        - name: jenkins-home
          mountPath: /var/jenkins_home
        - name: docker-sock
          mountPath: /var/run/docker.sock
      volumes:
      - name: jenkins-home
        persistentVolumeClaim:
          claimName: jenkins-pvc
      - name: docker-sock
        hostPath:
          path: /var/run/docker.sock
```

## Initial Jenkins Setup

### 1. Access Jenkins UI

Open `http://localhost:8080` (or your Jenkins URL)

### 2. Unlock Jenkins

- Enter the initial admin password from the container logs
- Install suggested plugins
- Create admin user

### 3. Install Required Plugins

Go to **Manage Jenkins** → **Plugins** → **Available Plugins** and install:

- **Docker Pipeline** (already included in suggested plugins)
- **Docker** (for Docker-based builds)
- **Git** (for SCM integration)
- **GitHub** or **GitLab** (depending on your Git provider)

## Configure Jenkins Credentials

### 1. Docker Registry Credentials

Go to **Manage Jenkins** → **Credentials** → **System** → **Global Credentials**:

1. Click **Add Credentials**
2. Select **Username with password**
3. Fill in:
   - **Username**: Your Docker Hub username or registry user
   - **Password**: Your Docker Hub password or registry token
   - **ID**: `docker-registry-credentials`
4. Click **Create**

### 2. SSH Credentials (for remote deployment)

1. Click **Add Credentials**
2. Select **SSH Username with private key**
3. Fill in:
   - **Username**: SSH username (e.g., `ubuntu`, `root`)
   - **Private Key**: Enter directly or from Jenkins master
   - **ID**: `ssh-server-credentials`
4. Click **Create**

### 3. GitHub/GitLab Personal Access Token

1. Go to your Git provider and create a Personal Access Token
2. Add to Jenkins credentials:
   - **Secret text** type
   - **Secret**: Your token
   - **ID**: `git-token`

## Create Jenkins Pipeline Job

### Option 1: Freestyle Project with Pipeline Script

1. **New Item** → Enter name `device-checking`
2. Select **Pipeline**
3. Configure:

**Pipeline** section:
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/jackzhouse/Device-Cheker.git`
- **Credentials**: Select your Git credentials
- **Branch Specifier**: `*/main` (or `*/develop`)
- **Script Path**: `Jenkinsfile`

### Option 2: Multibranch Pipeline (Recommended)

1. **New Item** → Enter name `device-checking-multibranch`
2. Select **Multibranch Pipeline**
3. Configure:

**Branch Sources**:
- Add source → **Git**
- Repository URL: `https://github.com/jackzhouse/Device-Cheker.git`
- Credentials: Select your Git credentials
- Build Configuration: by Jenkinsfile

**Scan Multibranch Pipeline Triggers**:
- Periodically: `1 minute`

This will automatically create jobs for each branch.

## Configure Jenkinsfile

Update the configuration section in `Jenkinsfile`:

```groovy
environment {
    // Docker Registry
    DOCKER_REGISTRY = 'docker.io'  // Or your private registry
    DOCKER_IMAGE = 'device-checking'
    
    // Credentials ID (must match Jenkins credentials)
    DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
    
    // Deployment method
    DEPLOYMENT_METHOD = 'docker-compose'  // or 'kubernetes' or 'ssh'
    
    // For SSH deployment (uncomment and configure)
    // SSH_SERVER = 'user@your-server.com'
    // SSH_CREDENTIALS_ID = 'ssh-server-credentials'
    // DEPLOY_PATH = '/opt/device-checking'
}
```

## Update docker-compose.yml for CI/CD

The `docker-compose.yml` needs to reference the Docker registry:

```yaml
version: '3.8'

services:
  app:
    image: docker.io/device-checking:latest  # Pull from registry instead of building
    container_name: device-checking-app
    ports:
      - "3000:3000"
    networks:
      - staging-local
    environment:
      - NODE_ENV=production
      - CONSUL_HOST=consul
      - CONSUL_PORT=8500
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  staging-local:
    external: true
    name: staging-local
```

## Setup Consul KV for Production

Before running the pipeline, set up your MongoDB URI in Consul:

```bash
# Using Consul CLI
consul kv put device-checking/config/MONGODB_URI "mongodb://mongodb:27017/device-checking"

# Verify
consul kv get device-checking/config/MONGODB_URI
```

## Run the Pipeline

### Manual Trigger

1. Go to your Jenkins job
2. Click **Build Now**
3. Watch the build progress in the console output

### Automatic Trigger (Webhooks)

Configure your Git provider to trigger Jenkins on push:

**GitHub**:
1. Go to **Repository Settings** → **Webhooks**
2. Add webhook: `http://your-jenkins-server/github-webhook/`
3. Select events: **Pushes**

**GitLab**:
1. Go to **Settings** → **Webhooks**
2. Add URL: `http://your-jenkins-server/project/device-checking`
3. Select events: **Push events**

## Pipeline Stages Explained

1. **Checkout**: Clones the Git repository
2. **Setup Environment**: Configures build parameters based on branch
3. **Lint**: Runs ESLint to check code quality
4. **Build Docker Image**: Builds the Docker image using the Dockerfile
5. **Push to Registry**: Pushes the image to Docker registry (main/develop only)
6. **Test**: Runs automated tests (if configured)
7. **Deploy**: Deploys the application using selected method
8. **Health Check**: Verifies the application is running correctly

## Branch Strategy

The pipeline supports different deployment strategies:

### Main Branch
- Tag: `latest` and commit hash
- Pushes to registry
- Deploys to production

### Develop Branch
- Tag: `staging` and commit hash
- Pushes to registry
- Deploys to staging

### Feature Branches
- Tag: `branchname-buildnumber` and commit hash
- Does not push to registry (by default)
- Does not deploy (by default)

### Version Tags
- Tag: `v1.0.0`, etc.
- Pushes to registry
- Deploys to production

## Troubleshooting

### Build Fails at "Docker build"

**Problem**: Jenkins agent doesn't have Docker access

**Solution**:
```bash
# Ensure Docker is mounted to Jenkins container
docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

### Push to Registry Fails

**Problem**: Authentication error

**Solution**:
1. Verify credentials are correct in Jenkins
2. Ensure Docker registry is accessible from Jenkins
3. Check the credentials ID matches Jenkinsfile

### Deploy Fails

**Problem**: Cannot connect to deployment server

**Solution**:
1. Verify SSH credentials are correct
2. Test SSH connection manually
3. Ensure `docker-compose.yml` is present on the server
4. Check that the server has Docker installed

### Health Check Fails

**Problem**: Application not responding

**Solution**:
1. Check application logs: `docker logs device-checking-app`
2. Verify Consul is accessible
3. Check MongoDB URI in Consul KV
4. Ensure MongoDB is running

### Consul Connection Issues

**Problem**: Application can't connect to Consul

**Solution**:
1. Verify Consul is running: `docker ps | grep consul`
2. Check network: `docker network inspect staging-local`
3. Test connectivity: `docker exec device-checking-app ping consul`

## Monitoring and Notifications

### Email Notifications

Add to Jenkinsfile `post` section:

```groovy
post {
    success {
        emailext (
            subject: "Jenkins Build Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Build successful!\n\n${env.BUILD_URL}",
            to: "team@example.com"
        )
    }
    
    failure {
        emailext (
            subject: "Jenkins Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Build failed!\n\n${env.BUILD_URL}",
            to: "team@example.com"
        )
    }
}
```

### Slack Notifications

Install **Slack Notification Plugin** and add:

```groovy
post {
    success {
        slackSend(
            channel: '#devops',
            color: 'good',
            message: "✅ ${env.JOB_NAME} - Build #${env.BUILD_NUMBER} Success"
        )
    }
    
    failure {
        slackSend(
            channel: '#devops',
            color: 'danger',
            message: "❌ ${env.JOB_NAME} - Build #${env.BUILD_NUMBER} Failed"
        )
    }
}
```

## Best Practices

1. **Use Multibranch Pipeline**: Automatically creates jobs for each branch
2. **Separate Environments**: Use different Consul KV paths for staging/production
3. **Tag Releases**: Use Git tags (v1.0.0) for production releases
4. **Monitor Builds**: Set up notifications for build failures
5. **Clean Up**: Use Docker image pruning to save disk space
6. **Security**: Use secrets management for sensitive data
7. **Testing**: Add automated tests before deployment
8. **Rollback**: Keep previous Docker images for quick rollback

## Security Considerations

1. **Never commit** `.env.local` to Git
2. **Use Jenkins Credentials** for all secrets
3. **Rotate registry credentials** regularly
4. **Use private registries** for production images
5. **Enable ACLs** on Consul for production
6. **Scan images** for vulnerabilities
7. **Limit Jenkins permissions** on servers

## Next Steps

1. Set up Jenkins server
2. Configure credentials
3. Create pipeline job
4. Set up Consul KV with MongoDB URI
5. Run first build
6. Configure notifications
7. Set up webhook triggers

## Additional Resources

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Hub](https://hub.docker.com/)
- [Consul Documentation](https://developer.hashicorp.com/consul/docs)
- [Jenkins Docker Plugin](https://plugins.jenkins.io/docker-plugin/)