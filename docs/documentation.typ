#set page(
  paper: "a4",
  margin: (x: 2cm, y: 2cm),
)
#set text(
  font: "New Computer Modern",
  size: 11pt,
)
#set par(
  justify: true,
  leading: 0.65em,
)
#show heading: set block(above: 1.4em, below: 1em)

#align(center)[
  #text(17pt, weight: "bold")[Detailed Technical Documentation: Todoist Clone] \
  #v(0.5em)
  #text(14pt)[File-by-File Analysis & Architecture Guide]
]

#v(2em)

= 1. Backend Documentation (`backend/src`)

The backend is built with *NestJS*, creating a modular and testable architecture.

== 1.1. Root Module & Application Setup
- *`main.ts`*
  - *Function*: Application Entry Point.
  - *Details*: Bootstraps the NestJS application (`NestFactory.create`).
  - *Key Lines*:
    - `app.enableCors()`: Allows requests from the `localhost:5173` frontend.
    - `app.useGlobalPipes(new ValidationPipe())`: Auto-validates incoming requests based on DTOs.
    - `await app.listen(3000)`: Starts server on port 3000.

- *`app.module.ts`*
  - *Function*: Root Module.
  - *Details*: The "brain" of the app configuration.
  - *Includes*:
    - `TypeOrmModule.forRoot(...)`: Connects to PostgreSQL database (host, port, user, password, entities).
    - `ScheduleModule.forRoot()`: Enables cron jobs.
    - Imports feature modules: `TasksModule`, `AuthModule`, `UsersModule`, `FilesModule`, `EmailModule`.

- *`app.controller.ts` & `app.service.ts`*
  - *Function*: Basic health check.
  - *Details*: Returns "Hello World!" on `GET /`.

== 1.2. Auth Module (`src/auth`)
Handles User Authentication (Login/Register) using JWT.

- *`auth.module.ts`*
  - Configures `JwtModule` (secret key, expiration) and `PassportModule`.
- *`auth.controller.ts`*
  - `POST /auth/login`: Accepts credentials -> calls `authService.validateUser` -> returns Token & User.
  - `POST /auth/register`: Accepts `CreateUserDto` -> calls `authService.register`.
- *`auth.service.ts`*
  - `validateUser(email, pass)`: Finds user by email, compares password hash using `bcrypt`.
  - `login(user)`: Creates JWT payload (`sub`: userId, `email`) and signs it. Returns `{ access_token, user }`.
  - `register(dto)`: Hashes password (`bcrypt.hash`) and saves new user via `UsersService`.
- *`jwt.strategy.ts`*
  - Extends `PassportStrategy`.
  - Validates the JWT token on protected routes.
  - Returns the `payload` which is injected into `request.user`.

== 1.3. Users Module (`src/users`)
Manages User entities.

- *`users.module.ts`*: Registers `User` entity with TypeORM.
- *`users.controller.ts`*:
  - `GET /users`: Lists all users (for the "Browse Users" feature).
  - `POST /users`: Creates a user (internal use, mostly generic).
- *`users.service.ts`*:
  - `create(dto)`: Standard TypeORM save.
  - `findOneByEmail(email)`: Used by AuthService.
  - `findAll()`: Returns all users.
- *`entities/user.entity.ts`*: defines the `User` table columns (`id`, `name`, `email`, `password`, `tasks`).

== 1.4. Tasks Module (`src/tasks`)
The core domain logic for managing To-Do items.

- *`tasks.module.ts`*: Imports `TypeOrmModule.forFeature([Task])`, `EmailModule`.
- *`tasks.controller.ts`*:
  - `GET /tasks`: Returns tasks for the *currently logged-in user* (`req.user.userId`).
  - `GET /tasks/public/:userId`: Returns public tasks for a specific user ID.
  - `POST /tasks`: Creates a task for the logged-in user.
  - `PATCH /tasks/:id`: Updates a task (e.g., mark complete).
  - `DELETE /tasks/:id`: Deletes a task.
- *`tasks.service.ts`*:
  - `findAll(userId)`: `repo.find({ where: { user: { id: userId } } })`.
  - `findPublicTasks(userId)`: `repo.find({ where: { user: { id: userId }, isPublic: true } })`.
  - `findTasksDueSoon(start, end)`: Complex query. Finds active tasks with `dueDate` between `start` and `end`, where `isReminderSent` is false.
- *`tasks-scheduler.service.ts`*:
  - `@Cron(CronExpression...)`: Runs periodically.
  - `handleDailyReminders()`:
    1.  Calculates `now` and `24h from now`.
    2.  Calls `tasksService.findTasksDueSoon`.
    3.  Iterates and sends emails via `EmailService`.
    4.  Marks tasks as reminded.
- *`entities/task.entity.ts`*: Schema for Tasks (`id`, `title`, `priority`, `dueDate` (timestamp), `isComplete`, `category`, `isPublic`, `attachment`).
- *`dto/create-task.dto.ts`*: Validates input (e.g., `title` is string and not empty).

== 1.5. Files Module (`src/files`)
Handles File Attachments.

- *`files.controller.ts`*:
  - `POST /files/upload`: Uses `FileInterceptor` to grab the file from form-data.
  - `GET /files/:filename`: Serves the static file.
- *`files.service.ts`*: Logic to write file to disk (simple implementation).

== 1.6. Email Module (`src/email`)
- *`email.service.ts`*: Wrapper around `nodemailer`. Configured with SMTP details from `.env`. Sends HTML emails.

= 2. Frontend Documentation (`frontend/src`)

Built with React, Vite, and Context API.

== 2.1. Global Config
- *`main.tsx`*: Renders `<App />` into `root`. Wraps App in `AuthProvider` and `BrowserRouter`.
- *`App.tsx`*: Defines Routes. Checks if user is authenticated for `/app`.
- *`index.css`*:
  - Variables: `--primary-color`, fonts (`Inter`).
  - Classes: `.btn-primary`, `.modal-overlay`, `.running-text` (animations).
- *`api/axios.ts`*: Creates an Axios instance (`baseURL: localhost:3000`). Adds an *Interceptor* to automatically attach the `Authorization: Bearer <token>` header to every request.

== 2.2. Context (`src/context`)
- *`AuthContext.tsx`*:
  - Manages global `user` state.
  - `login(token, user)`: Saves to localStorage, sets state.
  - `logout()`: Clears localStorage, resets state.
  - `useEffect`: Restores session from localStorage on refresh.

== 2.3. Pages (`src/pages`)
- *`LandingPage.tsx`*:
  - Public facing page.
  - Features: Hero section, Features grid ("Organize", "Collaborate").
  - Redirects to Login/Register.
- *`LoginPage.tsx`*:
  - State: `email`, `password`.
  - Action: Calls `api.post('/auth/login')`. On success, calls `login()` from context and navigates to `/app`.
- *`RegisterPage.tsx`*: Similar to login but calls `/auth/register`.
- *`DashboardPage.tsx`* (The Main App):
  - *State*: `tasks` (list), `currentView` (filter), `grouping`, `sorting`.
  - *Fetch*: `useEffect` calls `fetchTasks()` on mount.
  - *Filtering Logic*:
    - `getFilteredTasks()`: Filters by view (Completed, Upcoming, Overdue, or Project Name).
    - `getProcessedTasks()`: Applies Sort (Date, Priority) and Priority Filter.
  - *Grouping Logic*: Groups tasks into a Dictionary `{ [key: string]: Task[] }`.
  - *Render*: Sidebar (Left), Header (Top), Task List (Center), DisplayMenu (Top Right).
- *`UsersListPage.tsx`*:
  - Fetches list of users.
  - Renders valid users as cards.
  - Clicking a user navigates to public view.
- *`UserPublicTasksPage.tsx`*:
  - Fetches *only* public tasks for a specific user ID.
  - Read-only view (no edit/delete buttons).
  - Highlights "Overdue" tasks in red.

== 2.4. Components (`src/components`)
- *`Sidebar.tsx`*:
  - Props: `views`, `projects`, `userName`.
  - Renders Navigation Links.
  - "Add Task" button triggers the callback.
- *`TaskItem.tsx`*:
  - Displays single task.
  - *Logic*: Checkbox toggles `isComplete`. Date turns red if `new Date() > dueDate` and not complete.
  - *Styles*: Priority badge colors (Red/Yellow/Green).
- *`TaskModal.tsx`*:
  - Popup form (fixed css position).
  - Handles `Create` vs `Edit` based on `task` prop.
  - *File Upload*: Helper function sends `POST /files/upload` first, gets filename, then submits task data.
- *`DisplayMenu.tsx`*:
  - Dropdown component.
  - Accepts callbacks: `onGroupChange`, `onSortChange`, `onReset`.
  - Pure UI component (stateless regarding data).

= 3. Data Flow Example: Complete Lifecycle

1.  **Login**: User Enters creds -> `LoginPage` -> API `POST` -> Backend `AuthService` validates -> Returns Token.
2.  **View Dashboard**: `DashboardPage` loads -> `useEffect` -> API `GET /tasks` (with Token) -> Backend `TasksController` extracts ID from Token -> `TasksService` queries DB -> Returns JSON Array.
3.  **Add Task**:
    - Click Sidebar -> `DashboardPage` updates `isModalOpen`.
    - `TaskModal` renders.
    - User attaches file -> `TaskModal` async uploads to `/files/upload`.
    - User clicks Save -> `TaskModal` POSTs to `/tasks`.
    - `DashboardPage` refetches tasks via `onTaskCreated` callback.
4.  **Notification**:
    - User goes offline.
    - 9:00 AM next day -> Backend Scheduler wakes up.
    - Finds the task created above is due tomorrow.
    - Sends an email.

