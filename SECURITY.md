# Security Policy

[![Security Status](https://img.shields.io/badge/Security-Active-brightgreen.svg)](https://github.com/Rachit-Tiwari-7/HACKIT-AI/security/policy)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Rachit-Tiwari-7/HACKIT-AI/graphs/commit-activity)


## Supported Versions

Currently, only the latest `main` branch of HACKIT-AI is actively supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Security is a top priority for us, especially given our integration with various LLM providers, local file system manipulation (via App Builder CLI), and custom PBKDF2 + TOTP/Email auth implementations.

If you discover a security vulnerability within HACKIT-AI, please do **NOT** open a public issue.

Instead, please responsibly disclose it by emailing the maintainers directly or using GitHub's private vulnerability reporting feature on this repository. 

**Please include the following in your report:**
- Type of vulnerability (e.g., XSS, SQLi, Prompt Injection, Path Traversal)
- Step-by-step instructions to reproduce the issue
- Potential impact of the vulnerability
- (Optional) Suggested mitigation or patch

We will acknowledge receipt of your vulnerability report within 48 hours and strive to send you regular updates about our progress. If the vulnerability is confirmed, we will release a patch as soon as possible.
