# HACKIT-AI Kubernetes Deployment Guide

This repository contains foundational Kubernetes manifests located in the `k8s/` directory. These manifests are designed to seamlessly deploy the HACKIT-AI multi-service architecture into any standard Kubernetes cluster (e.g., EKS, GKE, AKS, or local Minikube).

## Benefits of Kubernetes (k8s)
- **High Availability**: Automatically restarts failed pods and balances load across multiple nodes.
- **Scalability**: Easily scale individual services based on traffic (e.g., scale frontend pods during high traffic while keeping backend pods stable).
- **Service Discovery**: Internal DNS allows the frontend to communicate with the backend seamlessly using simple names like `backend-service`.

## Structure

The `k8s/` directory contains:
- `frontend.yaml`: Configures a Deployment (2 replicas) and a LoadBalancer Service for the Next.js frontend (Port 3000 -> 80).
- `backend.yaml`: Configures a Deployment (2 replicas) and a standard internal Service for the FastAPI backend (Port 8000).
- `app-builder.yaml`: Configures a Deployment (1 replica) and a LoadBalancer Service for the CLI/Dashboard (Port 4097 -> 80).

## How to Deploy (For Future Reference)

**Note:** As per requirements, these files are provided for future infrastructure planning and should not be executed locally right now. When you are ready to provision your cluster:

1. **Build and Push Images:**
   Ensure you have built and pushed the docker images (`hackit-frontend:latest`, `hackit-backend:latest`, `hackit-app-builder:latest`) to your container registry.

2. **Apply the Manifests:**
   ```bash
   kubectl apply -f k8s/backend.yaml
   kubectl apply -f k8s/frontend.yaml
   kubectl apply -f k8s/app-builder.yaml
   ```

3. **Verify Deployment:**
   ```bash
   kubectl get pods
   kubectl get services
   ```

Once deployed, your cloud provider will automatically provision an external IP address for the `frontend-service` and `app-builder-service` LoadBalancers, making them accessible to the public.
