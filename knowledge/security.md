# Security Operations

API keys must be rotated every 90 days. When rotating an API key, create the replacement key first, deploy the new key to dependent services, verify traffic, and then revoke the old key. Never print secrets in logs or support tickets.

Security policies are owned by the security team. High-risk policy changes require review before deployment. Teams should keep audit evidence for key rotation, incident response, and access reviews.

