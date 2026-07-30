# Docker and Kubernetes Orchestration Guide

This document outlines the containerization strategy for the HACKIT-AI monorepo. We have fully dockerized the stack to ensure seamless, reproducible, and scalable deployments.

## Why Dockerize?
- **It won't break**: Containers isolate the application environment. If it runs on your machine, it will run exactly the same way in production. Say goodbye to "it works on my machine" issues.
- **Microservices Isolation**: The Next.js frontend, FastAPI backend, and App Builder CLI have their own dependencies. Docker ensures they do not conflict.
- **Easy Onboarding**: New team members can spin up the entire multi-agent architecture with a single command without installing Python, Node, or complex dependencies locally.

## Project Structure
We have created the following orchestration files:
- `frontend/Dockerfile`: Next.js web application container.
- `backend/Dockerfile`: FastAPI backend container.
- `app_builder/Dockerfile`: CLI & Dashboard container.
- `docker-compose.yml`: Root orchestrator for local development.
- `k8s/`: Kubernetes manifests for cloud deployments.

---

## Local Development with Docker Compose

**Note:** As per current requirements, these files are created for future reference. When you are ready to run the stack, follow these steps:

1. **Build and start the containers in detached mode:**
   ```bash
   docker-compose up -d --build
   ```
2. **View Logs:**
   ```bash
   docker-compose logs -f
   ```
3. **Stop the containers:**
   ```bash
   docker-compose down
   ```

### Services Available
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **App Builder Dashboard**: http://localhost:4097

---

## Cloud Deployment with Kubernetes (k8s)

When moving to production (e.g., AWS EKS, Google GKE), you can use the manifests in the `k8s/` directory.

1. **Apply the backend manifests:**
   ```bash
   kubectl apply -f k8s/backend.yaml
   ```
2. **Apply the frontend manifests:**
   ```bash
   kubectl apply -f k8s/frontend.yaml
   ```
3. **Apply the app builder manifests:**
   ```bash
   kubectl apply -f k8s/app-builder.yaml
   ```

These manifests include Deployments (for managing pods and replicas) and Services (for internal/external networking).
