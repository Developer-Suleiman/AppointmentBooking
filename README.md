# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Appointment email setup

For safe local testing, `MAIL_MODE=development` logs email contents and verification links in the server console without sending real messages. For real delivery, remove that mode or set another value and add these SMTP settings to `server/.env` without committing real passwords:

```env
MAIL_MODE=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-mailbox@example.com
MAIL_PASSWORD=your-smtp-password
MAIL_FROM=FreshCut Barbers <your-mailbox@example.com>
```

The booking workflow is:

1. A booking is saved as `pending_verification`.
2. The customer receives a verification link that expires after 30 minutes.
3. The link changes the booking to `pending`.
4. Admin confirmation sends a confirmation email.
5. A background worker checks every 15 minutes and sends one reminder approximately 24 hours before confirmed appointments.
