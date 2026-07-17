# DigiAyudh ERP System

A comprehensive Enterprise Resource Planning (ERP) system designed for digital agencies, featuring role-based dashboards, project management, employee performance tracking, and advanced document sharing capabilities.

## Features

### Dashboard & Navigation
- **Role-Based Access Control**: Admin, Employee, and Client dashboards with tailored interfaces
- **Smart Navigation**: "Get Started" displays as "Dashboard" when logged in, with automatic role routing
- **Session Persistence**: User sessions remain active across page refreshes
- **Responsive Design**: Full mobile and desktop support with adaptive layouts

### Project Management
- Create, update, and track projects with real-time status
- Task board with drag-and-drop functionality
- Project documents and links with role-based visibility
- Milestone tracking and progress visualization
- Completed projects retain all linked documents indefinitely

### Employee Management
- **Detailed Employee Profiles**: Admin view with performance metrics, activity timeline
- **Performance Tracking**: Tasks completed, on-time delivery %, attendance records
- **Certificate Management**: Admins upload PDF certificates for employees with public verification links
- **Public Certificate Verification**: Shareable verification URLs for certificates (no authentication required)

### Document Sharing
- **Role-Based Uploads**: Employees and clients upload files and external links
- **Visibility Control**: Choose to share with "Team Only" or "With Client"
- **Document Types**: Support for all file formats (up to 50MB) and external URLs
- **Access Management**: Users delete only their own uploads; admins can delete any document
- **PDF Display**: Certificates appear as viewable PDFs on employee profiles

### Additional Features
- Meetings and scheduling
- Invoice management
- Attendance tracking
- Leave request management
- Task assignment and tracking
- Internal messaging and notifications
- Audit logs for compliance tracking
- Support ticket system

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS with customizable theme
- **UI Components**: shadcn/ui component library
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Getting Started

### Prerequisites
- Node.js 18+ or higher
- pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

The production build will be generated in the `dist/` directory.

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── common/         # Common components (Header, Navigation, etc.)
│   ├── layout/         # Layout components
│   ├── public/         # Public page components
│   └── ui/             # shadcn/ui components
├── pages/              # Page components organized by role
│   ├── admin/          # Admin dashboard pages
│   ├── employee/       # Employee dashboard pages
│   ├── client/         # Client dashboard pages
│   └── shared/         # Shared pages across roles
├── redux/              # State management
│   ├── slices/         # Redux slices for different domains
│   ├── hooks.ts        # Redux hooks
│   └── store.ts        # Redux store configuration
├── services/           # API client and external services
├── types/              # TypeScript type definitions
├── lib/                # Utility functions and helpers
├── constants/          # Application constants
├── layouts/            # Layout wrappers
└── mock/               # Mock data for development
```

## Authentication

The system supports three user roles:

1. **Admin**: Full system access, employee management, certificate issuance, compliance tracking
2. **Employee**: Personal dashboard, project access, task management, document uploads
3. **Client**: Project visibility, task tracking, document downloads, invoice access

Session tokens are stored in localStorage with automatic cleanup on logout.

## Environment Variables

Create a `.env` file in the project root with:

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=DigiAyudh
```

## User Sessions

User sessions are automatically restored on page refresh through the `AuthInitializer` component:
- Checks for stored authentication token on app load
- Fetches current user data if token exists
- Maintains session across browser sessions
- Automatically redirects based on user role

## Navigation Updates

The public navbar now displays:
- **Logged Out**: "Get Started" button linking to login
- **Logged In**: User name and "Dashboard" button routing to role-specific dashboard
- **Logout Option**: One-click logout with session cleanup

## Development Guidelines

### Adding New Pages
1. Create page in `src/pages/{role}/{PageName}.tsx`
2. Add route in `src/App.tsx`
3. Use `PrivateRoute` for protected pages
4. Implement role-based access if needed

### Creating Components
1. Place in `src/components/{category}/{ComponentName}.tsx`
2. Export from index file if reusable
3. Use TypeScript for type safety
4. Follow shadcn/ui component patterns for UI elements

### State Management
1. Create Redux slice in `src/redux/slices/{domain}Slice.ts`
2. Define interfaces in `src/types/index.ts`
3. Use hooks from `redux/hooks.ts` for dispatch and selectors
4. Implement async thunks for API calls

## Performance Optimization

- Lazy loading of route components
- Code splitting by dashboard role
- Optimized bundle with Vite
- React Fast Refresh for development
- Tailwind CSS purging for production

## Security Considerations

- Session tokens cleared on logout
- Role-based access control enforced at route level
- Token stored in localStorage (consider httpOnly cookies for enhanced security)
- Public certificate verification endpoints require no authentication
- Authorization checks on all CRUD operations

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

Proprietary - DigiAyudh Inc.

## Support

For issues and feature requests, please create an issue in the repository or contact the development team.

---

**Last Updated**: July 2026
**Version**: 1.0.0
