# AppointmentBooking

A barbershop appointment app for booking services, managing availability, and keeping track of appointments.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Appointment email setup

For local development, `MAIL_MODE=development` logs email contents in the server console without sending real messages. For real delivery, configure SMTP in `server/.env`:

```env
MAIL_MODE=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-mailbox@example.com
MAIL_PASSWORD=your-smtp-password
MAIL_FROM=FreshCut Barbers <your-mailbox@example.com>
```

Bookings are created as pending and require admin confirmation. Confirmed appointments can receive an email reminder approximately 24 hours before the appointment.
