# 🚢 Kubernetes (k8s) Infrastructure

[![Kubernetes](https://img.shields.io/badge/Kubernetes-Production-326CE5.svg?style=flat&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Helm](https://img.shields.io/badge/Helm-Deployments-0F1689.svg?style=flat&logo=helm&logoColor=white)](https://helm.sh/)
[![Docker](https://img.shields.io/badge/Docker-Containers-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

This directory contains the manifest files required to deploy the complete HACKIT-AI infrastructure to any standard Kubernetes cluster (Minikube, EKS, GKE, AKS).

---

## 🏗️ Architecture Design

HACKIT-AI is built with a microservice architecture, allowing the frontend, backend, and background workers to scale independently based on load.

- **Frontend Scalability:** The Next.js frontend is primarily static with SSR where needed. It scales horizontally easily under high traffic.
- **Backend Scalability:** The FastAPI backend is completely stateless, relying on persistent volumes or external DBs. This allows aggressive scaling when LLM traffic spikes.
- **Internal Networking:** The frontend communicates with the backend via internal Kubernetes DNS (`backend-service.default.svc.cluster.local`) bypassing external gateways for maximum speed and security.

---

## 📂 Manifest Breakdown

| File | Sub-Resources | Purpose & Configuration |
|------|---------------|-------------------------|
| `backend.yaml` | `Deployment`, `Service` | Configuration for the FastAPI backend engine. Defines resource limits (CPU/Memory), environmental config maps for API keys, and maps internal container port 8000 to the cluster via a `ClusterIP` or `NodePort` service. |
| `frontend.yaml` | `Deployment`, `Service` | Configuration for the Next.js App Router. Ensures the Node.js server stays alive, manages replica sets during rolling updates, and sets caching limits. |
| `app-builder.yaml` | `Deployment`, `Job` | Deployment spec for headless automated App Builder tasks. Runs the CLI orchestrator in background queues so main API threads aren't blocked. |

---

## 🚀 Deployment Instructions

Assuming you have `kubectl` configured with an active cluster context (e.g., `minikube start` or an active AWS EKS context):

1. **Apply the backend infrastructure:**
   ```bash
   kubectl apply -f backend.yaml
   ```

2. **Apply the frontend servers:**
   ```bash
   kubectl apply -f frontend.yaml
   ```

3. **Deploy the App Builder headless tasks (Optional):**
   ```bash
   kubectl apply -f app-builder.yaml
   ```

4. **Verify all deployments are running:**
   ```bash
   kubectl get pods -n default
   kubectl get svc
   ```

5. **Access the Application (Minikube Example):**
   ```bash
   minikube service frontend-service
   ```

> **Note:** Ensure your container images (e.g., `rachittiwari/hackit-frontend:latest`) are properly built via `docker build` and pushed to your container registry (Docker Hub/ECR) before applying these manifests.
