# Contributing to mybucks.online

Thank you for your interest in contributing to mybucks.online! Mybucks.online belongs to the community, so we welcome any contributions!

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to contact@mybucks.online.

## Core Principles

As a contributor, please review and adhere to the following **non-negotiable principles**:

### Security & Privacy Principles

- **Never change key-generation mechanism or parameters**  
  The key-generation mechanism using `scrypt` and `keccak256` with their specific parameters must remain unchanged. These are critical security components that ensure wallet compatibility and security.

- **Never submit credentials**  
  Credentials must never be transmitted, logged, or exposed in any way.

- **Never store credentials including local storage**  
  Credentials must remain transient and never be persisted, even in browser local storage.

- **Never use untrusted dependencies**  
  All dependencies must be carefully vetted for security and trustworthiness. Any new dependencies require review and approval.

- **Never track user activities**  
  User activity tracking is prohibited. Note: We use `Google Analytics` and `Google Tag Manager` for the landing page only, not for the wallet application itself.

### Code Quality Principles

- **Keep the codebase simple**  
  Maintain simplicity and clarity in the codebase. Avoid unnecessary complexity.

## Guidelines

- Ensure your changes comply with security & privacy principles.
- Use a clear and descriptive title for issues and pull requests.
- Follow existing code patterns and conventions.
- Keep code simple and readable.
- Test your changes thoroughly before submitting.
- Test with the demo credentials provided in the README.
- Ensure your code works across supported browsers.

## Pull Request Pro Tips

- Fork the repository and clone it locally.
- Create your own branch from latest main branch.
- Contribute in the style of the project as outlined above. This makes it easier to understand and maintain in the future.
- Use a short descriptive commit message. For example: ❌ `Update README.md` ✔ `Add: feature description`
- Open a Pull Request with a clear title, description, and reference to related issues.
- All pull requests require review before merging. Reviewers will check adherence to core principles.
- Be responsive to feedback and requested changes.

## Questions?

- Check the [README](README.md) for project overview
- Visit our [Documentation](https://docs.mybucks.online)
- Join our [Discord](https://discord.gg/RTHgTePKgP)
- Contact us at contact@mybucks.online

## Recognition

Contributors will be recognized in the project. Thank you for helping make mybucks.online better for everyone!

