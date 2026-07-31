# 🚢 Kubernetes (k8s) Deployments

[![Kubernetes](https://img.shields.io/badge/Kubernetes-Production-326CE5.svg?style=flat&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Helm](https://img.shields.io/badge/Helm-Deployments-0F1689.svg?style=flat&logo=helm&logoColor=white)](https://helm.sh/)

This directory contains the manifest files required to deploy the complete HACKIT-AI infrastructure to any Kubernetes cluster.

## 📂 Folder Structure

| File | Purpose |
|------|---------|
| `backend.yaml` | Service and Deployment configuration for the FastAPI backend engine, mapping internal container port 8000 to the cluster. |
| `frontend.yaml` | Service and Deployment configuration for the Next.js frontend, managing replica sets and Next.js static serving limits. |
| `app-builder.yaml` | Deployment specification for headless automated App Builder tasks and asynchronous queue workers. |

## 🚀 Deployment Instructions

Assuming you have `kubectl` configured with an active cluster context:

1. **Apply the backend infrastructure:**
   ```bash
   kubectl apply -f backend.yaml
   ```

2. **Apply the frontend servers:**
   ```bash
   kubectl apply -f frontend.yaml
   ```

3. **Deploy the App Builder CLI headless tasks (Optional):**
   ```bash
   kubectl apply -f app-builder.yaml
   ```

4. **Verify deployments:**
   ```bash
   kubectl get pods -n default
   kubectl get svc
   ```

Note: Make sure your container images (`rachittiwari/hackit-frontend:latest`, etc.) are pushed to your container registry before applying these manifests.
