# Security Policy

## Supported Version

The latest version on the `master` branch is the production version of ChronoPulse.

## Reporting a Vulnerability

If you discover a security vulnerability in ChronoPulse, please report it privately to the project owner rather than publishing exploit details in a public issue.

Please include:
- A short description of the vulnerability
- The affected feature or URL
- Reproduction steps
- Security impact
- Screenshots or proof-of-concept details when safe to provide

Do not include passwords, private tokens, personal data, or other secrets in a report.

## Security Notes

ChronoPulse is a client-side web application. Code delivered to a browser cannot be made secret with JavaScript obfuscation, right-click blocking, or developer-tools blocking. These measures are deterrents only.

Authentication, authorization, rate limiting, authoritative game results, and other security-sensitive decisions should be enforced by a trusted server or service rather than by browser JavaScript.

The `security-hardening` branch is used for security experiments and must not be treated as the production branch unless changes are explicitly reviewed and merged.
