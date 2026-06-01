export type Tier = "junior" | "middle" | "senior";
export type Level = "Beginner" | "Junior" | "Middle" | "Senior";

export interface Question {
  q: string;
  options: string[];
  correct: number; // index of correct answer
}

export type TieredQuestions = Record<Tier, Question[]>;
export type RoleQuestions = Record<string, TieredQuestions>;

// ── PYTHON BACKEND ──────────────────────────────────────────────────────────
export const pythonQuestions: TieredQuestions = {
  junior: [
    { q: "What Python framework is most used for REST APIs?", options: ["FastAPI / Django REST Framework", "React", "Angular", "Laravel"], correct: 0 },
    { q: "What does `pip install` do?", options: ["Installs Python packages", "Runs a Python file", "Creates a virtual environment", "Compiles Python code"], correct: 0 },
    { q: "What is a Python virtual environment?", options: ["Isolated Python environment with separate packages", "A cloud server", "A Docker container", "A testing environment"], correct: 0 },
    { q: "What does a Django `model` represent?", options: ["A database table as a Python class", "An HTML template", "An API endpoint", "A CSS file"], correct: 0 },
    { q: "What is `requirements.txt` for?", options: ["Lists project dependencies", "Stores database credentials", "Defines URL routes", "Configures the web server"], correct: 0 },
    { q: "What HTTP method creates a new resource?", options: ["POST", "GET", "DELETE", "PATCH"], correct: 0 },
    { q: "What does `print(type([]))` output?", options: ["<class 'list'>", "<class 'tuple'>", "<class 'dict'>", "<class 'array'>"], correct: 0 },
    { q: "What is a Python decorator?", options: ["A function that wraps another function", "A CSS class", "A database index", "A type hint"], correct: 0 },
    { q: "What does `__init__` do in a class?", options: ["Initializes an instance when created", "Deletes the object", "Defines class methods only", "Imports a module"], correct: 0 },
    { q: "What is JSON used for in APIs?", options: ["Data exchange between client and server", "Styling web pages", "Storing binary files", "Managing sessions"], correct: 0 },
  ],
  middle: [
    { q: "What is Django ORM's `select_related()`?", options: ["Fetches related objects in one SQL JOIN query", "Filters queryset by date", "Returns only distinct values", "Caches the queryset"], correct: 0 },
    { q: "What does `prefetch_related()` do vs `select_related()`?", options: ["Uses a separate query to prefetch many-to-many relations", "Identical to select_related", "Only works for ForeignKey", "Disables lazy loading"], correct: 0 },
    { q: "What is a Django Signal?", options: ["A hook to execute code when a model event happens", "A WebSocket connection", "An API rate limiter", "A background job scheduler"], correct: 0 },
    { q: "What is `serializer.is_valid()` used for in DRF?", options: ["Validates incoming request data against the serializer", "Saves data to the database", "Fetches data from the database", "Generates API documentation"], correct: 0 },
    { q: "What is Celery used for in Python?", options: ["Asynchronous task queue / background jobs", "Frontend templating", "Database migrations", "Running tests"], correct: 0 },
    { q: "What is `async def` in Python?", options: ["Defines a coroutine for async execution", "A faster version of regular functions", "A class method decorator", "A type annotation"], correct: 0 },
    { q: "What does `@property` decorator do?", options: ["Makes a method accessible like an attribute", "Makes a method static", "Caches method return value", "Adds type hints automatically"], correct: 0 },
    { q: "What is Redis commonly used for in Django?", options: ["Caching and session storage", "Database primary storage", "File uploads", "Email sending"], correct: 0 },
    { q: "What is JWT authentication?", options: ["Stateless token-based auth using signed JSON tokens", "Session-based cookie auth", "OAuth 2.0 only", "Basic HTTP auth"], correct: 0 },
    { q: "What does `migrations` in Django do?", options: ["Tracks and applies schema changes to the database", "Runs background tasks", "Handles static files", "Manages API routes"], correct: 0 },
    { q: "What is `__str__` method in a Django model used for?", options: ["Defines human-readable string representation of the object", "Converts model to JSON", "Sets the primary key", "Validates field data"], correct: 0 },
    { q: "What is the purpose of `settings.py` in Django?", options: ["Central configuration for database, apps, middleware, etc.", "Defines URL patterns", "Stores static files", "Runs the server"], correct: 0 },
  ],
  senior: [
    { q: "What is the N+1 query problem and how do you fix it in Django?", options: ["Each related object triggers a separate query; fix with select_related/prefetch_related", "Too many rows returned; fix with pagination", "Slow migrations; fix with fake migrations", "Too many views; fix with class-based views"], correct: 0 },
    { q: "How does Django's ORM generate SQL for `filter(name__icontains='foo')`?", options: ["WHERE LOWER(name) LIKE '%foo%' (case-insensitive)", "WHERE name = 'foo'", "WHERE name LIKE 'foo%'", "WHERE name IN ('foo')"], correct: 0 },
    { q: "What is database connection pooling and why does it matter?", options: ["Reuses open DB connections for performance; avoids overhead of reconnecting", "Stores query results in memory", "Distributes queries across multiple databases", "Encrypts database connections"], correct: 0 },
    { q: "What is the difference between `@staticmethod` and `@classmethod`?", options: ["staticmethod gets no implicit arg; classmethod gets `cls` as first arg", "They are identical", "staticmethod gets `self`, classmethod gets nothing", "classmethod can only be called on instances"], correct: 0 },
    { q: "What is Python's GIL and when does it matter?", options: ["Global Interpreter Lock limits true multi-threading; matters for CPU-bound tasks", "A memory garbage collector", "A type checker for Python", "A profiling tool"], correct: 0 },
    { q: "What is WSGI vs ASGI in Python web servers?", options: ["WSGI is synchronous; ASGI supports async and WebSockets", "ASGI is older and slower", "They are both synchronous", "WSGI handles WebSockets, ASGI does not"], correct: 0 },
    { q: "How would you implement rate limiting in a Django REST API?", options: ["Using DRF throttling classes or a middleware with Redis counters", "Adding a sleep() in the view", "Using database locks", "Checking request count in each view manually"], correct: 0 },
    { q: "What is event-driven architecture and how does Celery + Redis enable it?", options: ["Tasks are published to a queue and consumed asynchronously by workers", "Celery runs tasks synchronously by default", "Redis stores the entire Django database", "It replaces the database entirely"], correct: 0 },
    { q: "What is a database index and when should you avoid it?", options: ["Speeds up reads but slows writes; avoid on frequently updated columns with low cardinality", "Always improves performance, no downsides", "Only useful for primary keys", "Replaces foreign keys"], correct: 0 },
    { q: "How do you prevent SQL injection in raw Django queries?", options: ["Use parameterized queries with %s placeholders, never string formatting", "Sanitize input with replace()", "Only use GET requests", "Disable user input fields"], correct: 0 },
    { q: "What is horizontal scaling and how does it affect Django's session management?", options: ["Multiple servers need shared session storage (e.g. Redis) instead of local memory", "Add more RAM to one server", "Use a faster CPU", "Django sessions scale automatically"], correct: 0 },
    { q: "What is the difference between `__new__` and `__init__` in Python?", options: ["`__new__` creates the object; `__init__` initializes it after creation", "They are identical", "`__init__` creates the object; `__new__` destroys it", "`__new__` is only for metaclasses"], correct: 0 },
  ],
};

// ── NODE.JS BACKEND ──────────────────────────────────────────────────────────
export const nodejsQuestions: TieredQuestions = {
  junior: [
    { q: "What is Node.js?", options: ["JavaScript runtime built on V8 engine for server-side code", "A browser framework", "A database", "A frontend library"], correct: 0 },
    { q: "What does `npm init` do?", options: ["Creates a new package.json for a project", "Installs Node.js", "Starts the development server", "Runs tests"], correct: 0 },
    { q: "What is Express.js?", options: ["Minimal web framework for Node.js", "A database ORM", "A frontend framework", "A testing library"], correct: 0 },
    { q: "What does `require('fs')` do?", options: ["Imports Node.js built-in file system module", "Creates a new file", "Connects to a database", "Fetches from an API"], correct: 0 },
    { q: "What is middleware in Express?", options: ["Function that runs between request and response", "Database schema", "HTML template", "A test runner"], correct: 0 },
    { q: "What does `res.json()` do in Express?", options: ["Sends a JSON response to the client", "Parses incoming JSON", "Reads a JSON file", "Validates JSON data"], correct: 0 },
    { q: "What is `package.json`?", options: ["Project metadata and dependency definitions", "The main app file", "A database config file", "A CSS config file"], correct: 0 },
    { q: "What does `async/await` do?", options: ["Makes async code look synchronous, handles Promises cleanly", "Runs code in parallel threads", "Speeds up synchronous code", "Creates new processes"], correct: 0 },
    { q: "What is `process.env` used for?", options: ["Access environment variables at runtime", "Process incoming requests", "Manage Node.js processes", "Store session data"], correct: 0 },
    { q: "What is REST API?", options: ["Stateless HTTP interface using standard methods (GET/POST/PUT/DELETE)", "A real-time WebSocket protocol", "A database query language", "A frontend router"], correct: 0 },
  ],
  middle: [
    { q: "What is the Node.js event loop?", options: ["Single-threaded loop that handles I/O callbacks asynchronously", "A multi-threading system", "A garbage collector", "A module bundler"], correct: 0 },
    { q: "What is the difference between `require()` and ES6 `import`?", options: ["require is CommonJS (sync); import is ESM (static, async-friendly)", "They are identical", "import is faster but less compatible", "require is deprecated in all Node.js versions"], correct: 0 },
    { q: "What is connection pooling in Node.js with PostgreSQL?", options: ["Reusing a pool of DB connections to avoid reconnect overhead", "Storing query results in memory", "Distributing load across databases", "Caching SQL queries"], correct: 0 },
    { q: "What is JWT and how is it verified?", options: ["Signed token verified with a secret key to authenticate requests", "A cookie-based session", "An encrypted database field", "An OAuth token"], correct: 0 },
    { q: "What does `Promise.all()` do?", options: ["Runs multiple promises in parallel, resolves when all complete", "Runs promises one by one", "Returns the first resolved promise", "Cancels all pending promises"], correct: 0 },
    { q: "What is the purpose of `helmet` middleware?", options: ["Sets secure HTTP headers to protect against common vulnerabilities", "Compresses responses", "Parses request bodies", "Manages CORS"], correct: 0 },
    { q: "What is Mongoose?", options: ["ODM (Object Document Mapper) for MongoDB in Node.js", "A Node.js HTTP server", "A SQL query builder", "A testing framework"], correct: 0 },
    { q: "What is Redis used for in a Node.js app?", options: ["Caching, session storage, and pub/sub messaging", "Primary database storage", "File uploads", "WebSocket connections"], correct: 0 },
    { q: "What does `cors` middleware do?", options: ["Allows cross-origin requests from specified domains", "Compresses HTTP responses", "Handles authentication", "Validates request bodies"], correct: 0 },
    { q: "What is the difference between `PUT` and `PATCH`?", options: ["PUT replaces the entire resource; PATCH updates part of it", "They are identical", "PATCH replaces the entire resource", "PUT only creates new resources"], correct: 0 },
  ],
  senior: [
    { q: "How does Node.js handle CPU-intensive tasks without blocking?", options: ["Worker threads, child processes, or offloading to external services", "Node.js handles CPU tasks natively with the event loop", "Using `cluster` always solves CPU blocking", "Using `setImmediate` delays CPU work"], correct: 0 },
    { q: "What is backpressure in Node.js streams?", options: ["When a writable stream's buffer is full and signals the readable to pause", "A security mechanism against DDoS", "When the event loop is overloaded", "A memory leak in streams"], correct: 0 },
    { q: "What is the difference between `process.nextTick()` and `setImmediate()`?", options: ["nextTick runs before I/O callbacks; setImmediate runs after I/O in check phase", "They are identical", "setImmediate is faster", "nextTick runs after the event loop completes"], correct: 0 },
    { q: "How do you handle distributed sessions in a Node.js cluster?", options: ["Use a shared store like Redis with connect-redis or similar", "Local memory works across workers", "Use sticky sessions only", "Disable sessions in cluster mode"], correct: 0 },
    { q: "What is the Strangler Fig pattern?", options: ["Incrementally replace legacy system by building new features alongside it", "A microservice deployment strategy", "A database migration pattern", "A load balancing algorithm"], correct: 0 },
    { q: "What is event sourcing?", options: ["Store all changes as a sequence of events rather than current state", "Subscribing to DOM events", "Using EventEmitter for all communication", "A logging pattern"], correct: 0 },
    { q: "How would you implement circuit breaker pattern in Node.js?", options: ["Track failure rate; open circuit and return fallback when threshold exceeded", "Simply catch all errors with try/catch", "Use a database transaction", "Add a retry loop"], correct: 0 },
    { q: "What is the difference between horizontal and vertical scaling for a Node.js API?", options: ["Horizontal = more instances; vertical = more resources on one server", "They are the same thing", "Horizontal means more RAM; vertical means more servers", "Node.js only supports vertical scaling"], correct: 0 },
    { q: "What is GraphQL and when would you choose it over REST?", options: ["Query language where clients specify exact data needed; better for complex/variable queries", "A faster version of REST", "A database query language", "A replacement for WebSockets"], correct: 0 },
    { q: "How does `Promise.allSettled()` differ from `Promise.all()`?", options: ["allSettled waits for all and reports both fulfilled/rejected; all rejects immediately on any failure", "They are identical", "allSettled is faster", "all reports both outcomes; allSettled stops on first error"], correct: 0 },
  ],
};

// ── FRONTEND (REACT) ─────────────────────────────────────────────────────────
export const frontendQuestions: TieredQuestions = {
  junior: [
    { q: "What does CSS 'box-model' consist of?", options: ["Content, Padding, Border, Margin", "Header, Body, Footer, Nav", "Width, Height, Color, Font", "Display, Position, Float, Clear"], correct: 0 },
    { q: "Which React hook manages local state?", options: ["useState", "useEffect", "useRef", "useMemo"], correct: 0 },
    { q: "What does `semantic HTML` mean?", options: ["Using meaningful tags like <article>, <nav>, <section>", "Using inline styles only", "Minifying HTML", "Adding ARIA attributes only"], correct: 0 },
    { q: "What is CSS Flexbox?", options: ["One-dimensional layout system for rows or columns", "A CSS preprocessor", "A grid system with rows and columns", "A JavaScript animation library"], correct: 0 },
    { q: "What is the virtual DOM in React?", options: ["An in-memory representation of the real DOM for efficient updates", "A copy of the database stored in the browser", "A server-rendered version of the DOM", "A debugging tool"], correct: 0 },
    { q: "What does `props` mean in React?", options: ["Data passed from parent to child component", "Component's internal state", "DOM event handlers", "CSS class names"], correct: 0 },
    { q: "What is a React component?", options: ["A reusable UI building block (function or class)", "A database record", "A CSS animation", "A server route"], correct: 0 },
    { q: "What does `key` prop do in a React list?", options: ["Helps React efficiently re-render list items", "Adds an ID attribute to DOM elements", "Prevents re-renders", "Styles list items"], correct: 0 },
    { q: "What is TypeScript?", options: ["Statically typed superset of JavaScript", "A CSS-in-JS library", "A backend framework", "A package manager"], correct: 0 },
    { q: "What does `npm run build` do?", options: ["Compiles and bundles the app for production", "Starts the development server", "Runs tests", "Installs dependencies"], correct: 0 },
  ],
  middle: [
    { q: "What is `useEffect` used for?", options: ["Side effects like data fetching, subscriptions, DOM mutations", "Creating state variables", "Memoizing values", "Rendering child components"], correct: 0 },
    { q: "What is the difference between `useMemo` and `useCallback`?", options: ["useMemo memoizes a value; useCallback memoizes a function", "They are identical", "useCallback memoizes a value", "useMemo is for class components only"], correct: 0 },
    { q: "What is lifting state up in React?", options: ["Moving shared state to the closest common ancestor component", "Using global state management", "Hoisting variables", "Using React context"], correct: 0 },
    { q: "What is React Context API used for?", options: ["Sharing state across the component tree without prop drilling", "Making API calls", "Managing component styling", "Handling form validation"], correct: 0 },
    { q: "What is code splitting in React?", options: ["Splitting bundles into smaller chunks loaded on demand (lazy loading)", "Splitting components into multiple files", "Dividing CSS into modules", "Breaking one component into multiple files"], correct: 0 },
    { q: "What is CSS Grid used for?", options: ["Two-dimensional layouts with rows and columns", "One-dimensional row-only layouts", "Animating elements", "Media queries"], correct: 0 },
    { q: "What is a controlled component in React?", options: ["Form element whose value is controlled by React state", "A component with no side effects", "A server-rendered component", "A component using ref instead of state"], correct: 0 },
    { q: "What does `React.memo` do?", options: ["Prevents re-render if props haven't changed", "Memoizes a function call", "Creates a memoized state", "Caches API responses"], correct: 0 },
    { q: "What is the purpose of `useRef`?", options: ["Persists a mutable value without triggering re-renders, or accesses DOM", "Creates state that doesn't re-render", "Fetches data from APIs", "Manages global state"], correct: 0 },
    { q: "What is CSS specificity?", options: ["Rules that determine which CSS styles apply when there are conflicts", "The order in which CSS files load", "How fast CSS renders", "Whether CSS uses classes or IDs"], correct: 0 },
    { q: "What is a custom React hook?", options: ["A function starting with 'use' that reuses stateful logic", "A built-in React hook", "A hook for class components", "A lifecycle method"], correct: 0 },
  ],
  senior: [
    { q: "What causes unnecessary re-renders and how do you prevent them?", options: ["New object/array references in props/state; use useMemo, useCallback, React.memo", "Using too many state variables", "Not using class components", "Using Context API"], correct: 0 },
    { q: "What is React's reconciliation algorithm?", options: ["Diffing algorithm that compares virtual DOM trees to minimize real DOM updates", "A server-side rendering process", "The way React handles forms", "React's garbage collector"], correct: 0 },
    { q: "What is the difference between SSR and CSR?", options: ["SSR renders HTML on server (better SEO/FCP); CSR renders in browser (better interactivity)", "They produce identical results", "CSR is always faster", "SSR is only for mobile apps"], correct: 0 },
    { q: "What is React Suspense used for?", options: ["Declaratively handle loading states for lazy components and async data", "Catch JavaScript errors", "Improve CSS performance", "Manage form state"], correct: 0 },
    { q: "How do you optimize a large list in React?", options: ["Virtualization (only render visible items) using react-window or react-virtual", "Use map() without keys", "Split into pages with hidden divs", "Use display:none for invisible items"], correct: 0 },
    { q: "What is the Compound Component pattern?", options: ["Components that share implicit state through context for flexible API design", "Nesting more than 3 components", "Using multiple useState calls", "Combining CSS and JS in one file"], correct: 0 },
    { q: "What is tree shaking?", options: ["Removing unused code from bundles during build time", "Optimizing the component tree", "Cleaning up useEffect subscriptions", "Deleting unused CSS"], correct: 0 },
    { q: "What is hydration in React?", options: ["Attaching React event listeners to server-rendered HTML in the browser", "Loading data into components", "Filling in default prop values", "Updating the DOM with new state"], correct: 0 },
    { q: "What is the difference between optimistic and pessimistic UI updates?", options: ["Optimistic updates the UI immediately before server confirms; pessimistic waits for server", "They are the same", "Pessimistic is faster", "Optimistic only works with GraphQL"], correct: 0 },
    { q: "What is micro-frontend architecture?", options: ["Splitting a frontend into independently deployable modules owned by different teams", "Reducing component size below 50 lines", "Using inline styles for performance", "Server-rendering small components"], correct: 0 },
  ],
};

// ── DEVOPS ───────────────────────────────────────────────────────────────────
export const devopsQuestions: TieredQuestions = {
  junior: [
    { q: "What is Docker?", options: ["A containerization platform that packages apps with dependencies", "A version control system", "A cloud provider", "A CI/CD pipeline tool"], correct: 0 },
    { q: "What is Git?", options: ["A distributed version control system", "A deployment platform", "A container runtime", "A database"], correct: 0 },
    { q: "What does `git pull` do?", options: ["Fetches and merges changes from remote repository", "Pushes local changes to remote", "Creates a new branch", "Reverts the last commit"], correct: 0 },
    { q: "What is CI/CD?", options: ["Continuous Integration / Continuous Deployment — automating build, test, deploy", "Code Inspection / Code Delivery", "Container Init / Container Deploy", "Cloud Infrastructure / Cloud Deployment"], correct: 0 },
    { q: "What is a Dockerfile?", options: ["Text file with instructions to build a Docker image", "A Docker configuration for networking", "A Docker database file", "A Docker compose configuration"], correct: 0 },
    { q: "What is Linux?", options: ["Open-source operating system used widely for servers", "A cloud provider", "A programming language", "A containerization tool"], correct: 0 },
    { q: "What is SSH?", options: ["Secure Shell — encrypted protocol for remote server access", "Super Server Host — a cloud service", "Simple Service Handler", "A type of firewall"], correct: 0 },
    { q: "What is a load balancer?", options: ["Distributes incoming traffic across multiple servers", "Compresses files for storage", "Monitors server CPU usage", "Caches database queries"], correct: 0 },
    { q: "What does `docker ps` do?", options: ["Lists running containers", "Lists Docker images", "Stops all containers", "Builds a Docker image"], correct: 0 },
    { q: "What is a server's IP address?", options: ["Unique numerical identifier for a network device", "The server's hostname", "A database connection string", "An SSL certificate"], correct: 0 },
  ],
  middle: [
    { q: "What is Kubernetes?", options: ["Container orchestration platform for automating deployment and scaling", "A Docker alternative", "A CI/CD pipeline", "A cloud monitoring tool"], correct: 0 },
    { q: "What is Infrastructure as Code (IaC)?", options: ["Managing infrastructure via version-controlled code files (e.g. Terraform)", "Writing backend apps that manage servers", "Documenting server configs manually", "Testing in production"], correct: 0 },
    { q: "What is a Kubernetes Pod?", options: ["Smallest deployable unit, containing one or more containers", "A virtual machine", "A Kubernetes cluster", "A deployment configuration"], correct: 0 },
    { q: "What is the difference between `docker run` and `docker-compose up`?", options: ["docker run starts one container; compose starts multi-container apps defined in YAML", "They are identical", "compose is for production only", "docker run uses YAML configuration"], correct: 0 },
    { q: "What is Nginx used for?", options: ["Web server, reverse proxy, and load balancer", "Container orchestration", "Database management", "Code compilation"], correct: 0 },
    { q: "What is a Kubernetes Service?", options: ["Stable network endpoint that routes traffic to a set of Pods", "A Kubernetes worker node", "A Docker image registry", "An ingress rule"], correct: 0 },
    { q: "What is the purpose of environment variables in Docker?", options: ["Pass configuration to containers without hardcoding in images", "Speed up container startup", "Manage container networking", "Store persistent data"], correct: 0 },
    { q: "What is GitHub Actions?", options: ["CI/CD platform built into GitHub for automating workflows", "A GitHub code review tool", "A GitHub deployment service", "A GitHub container registry"], correct: 0 },
    { q: "What is a reverse proxy?", options: ["Server that forwards client requests to backend servers and returns responses", "A proxy that hides client identity", "A database connection layer", "A firewall configuration"], correct: 0 },
    { q: "What is `docker build -t myapp .` doing?", options: ["Builds a Docker image tagged 'myapp' using the current directory's Dockerfile", "Runs a container named myapp", "Pushes an image to registry", "Creates a Docker network"], correct: 0 },
  ],
  senior: [
    { q: "What is a Kubernetes Horizontal Pod Autoscaler?", options: ["Automatically scales Pod replicas based on CPU/memory metrics", "Scales pod memory vertically", "A manual scaling command", "A load balancer plugin"], correct: 0 },
    { q: "What is the GitOps pattern?", options: ["Using Git as the single source of truth for declarative infrastructure and app deployment", "Running CI/CD from local Git repos", "Storing Docker images in Git", "Using git hooks for deployment"], correct: 0 },
    { q: "What is blue-green deployment?", options: ["Running two identical environments; switch traffic instantly to new version, roll back easily", "Deploying gradually to 50% of users", "A Kubernetes rolling update", "Deploying to different cloud regions"], correct: 0 },
    { q: "What is a service mesh (e.g. Istio)?", options: ["Infrastructure layer handling service-to-service communication, security, observability", "A network of microservices", "A Docker networking plugin", "A Kubernetes ingress controller"], correct: 0 },
    { q: "What is observability and its three pillars?", options: ["Understanding system state via Logs, Metrics, and Traces", "Monitoring CPU, RAM, and disk", "Alerting, dashboards, and uptime", "Logging, alerting, and backups"], correct: 0 },
    { q: "What is chaos engineering?", options: ["Intentionally injecting failures to test system resilience", "Unstructured deployment processes", "Random A/B testing", "Stress testing databases only"], correct: 0 },
    { q: "What is the difference between stateful and stateless applications in Kubernetes?", options: ["Stateless: any pod is identical; Stateful: pods need persistent identity/storage (StatefulSet)", "They are identical in Kubernetes", "Stateful apps don't use databases", "Stateless apps require more storage"], correct: 0 },
    { q: "What is eBPF used for in modern cloud infrastructure?", options: ["Running sandboxed programs in the Linux kernel for networking, security, observability", "A load balancing algorithm", "A container runtime", "A Kubernetes scheduler"], correct: 0 },
    { q: "What is the principle of least privilege in infrastructure security?", options: ["Grant only the minimum permissions required for a task to reduce attack surface", "Use strong passwords only", "Rotate API keys every 30 days", "Use HTTPS everywhere"], correct: 0 },
    { q: "What is a distributed tracing system (e.g. Jaeger, Zipkin) used for?", options: ["Tracking a request's journey across multiple microservices with timing", "Monitoring server CPU usage", "Logging application errors", "Tracing network packets"], correct: 0 },
  ],
};

// ── AI/ML ────────────────────────────────────────────────────────────────────
export const aimlQuestions: TieredQuestions = {
  junior: [
    { q: "What is machine learning?", options: ["Teaching computers to learn patterns from data without explicit programming", "Programming every rule manually", "A type of database", "A web framework"], correct: 0 },
    { q: "What is the difference between supervised and unsupervised learning?", options: ["Supervised uses labeled data; unsupervised finds patterns in unlabeled data", "Supervised is faster", "Unsupervised uses labeled data", "They are identical"], correct: 0 },
    { q: "What is a dataset?", options: ["A collection of data used to train or evaluate a model", "A database table", "A Python library", "A type of neural network"], correct: 0 },
    { q: "What does pandas library do?", options: ["Data manipulation and analysis with DataFrames", "Deep learning model training", "Web scraping", "API calls"], correct: 0 },
    { q: "What is overfitting?", options: ["Model memorizes training data but performs poorly on new data", "Model is too simple to learn", "Training data is too large", "Model trains too slowly"], correct: 0 },
    { q: "What is a feature in ML?", options: ["An input variable used to make predictions", "A model evaluation metric", "A type of neural network layer", "A Python function"], correct: 0 },
    { q: "What is a label in supervised learning?", options: ["The target output the model is trying to predict", "An input variable", "A model parameter", "A training algorithm"], correct: 0 },
    { q: "What is NumPy used for?", options: ["Numerical computing with multi-dimensional arrays", "Data visualization", "Web scraping", "Database connections"], correct: 0 },
    { q: "What is train/test split?", options: ["Dividing data into training set (learn) and test set (evaluate)", "Splitting a neural network", "Dividing the dataset by features", "A cross-validation technique"], correct: 0 },
    { q: "What is a confusion matrix?", options: ["Table showing true/false positives and negatives for classification", "A type of neural network", "A data preprocessing step", "A loss function"], correct: 0 },
  ],
  middle: [
    { q: "What is gradient descent?", options: ["Optimization algorithm that minimizes loss by updating weights iteratively", "A neural network architecture", "A feature engineering technique", "A data splitting method"], correct: 0 },
    { q: "What is regularization in ML?", options: ["Technique to reduce overfitting by penalizing model complexity (L1/L2)", "Scaling features to same range", "Removing outliers from data", "Increasing model complexity"], correct: 0 },
    { q: "What is a convolutional neural network (CNN) best used for?", options: ["Image recognition and computer vision tasks", "Time series prediction", "Text classification", "Tabular data only"], correct: 0 },
    { q: "What is the difference between precision and recall?", options: ["Precision = correct positive predictions / total predicted positive; Recall = correct positives / all actual positives", "They are identical", "Precision measures speed; recall measures accuracy", "Recall is always higher than precision"], correct: 0 },
    { q: "What is a learning rate in neural network training?", options: ["Controls how much weights are updated per gradient step", "The speed of data loading", "The number of training epochs", "The size of the neural network"], correct: 0 },
    { q: "What is dropout in neural networks?", options: ["Randomly disabling neurons during training to prevent overfitting", "Removing features from the dataset", "Early stopping of training", "Reducing the learning rate"], correct: 0 },
    { q: "What is cross-validation?", options: ["Evaluating model by splitting data into multiple train/validation folds", "Training on cross-domain data", "Comparing two different models", "A form of regularization"], correct: 0 },
    { q: "What is a random forest?", options: ["Ensemble of decision trees using bagging for better accuracy", "A single decision tree algorithm", "A neural network architecture", "A clustering algorithm"], correct: 0 },
    { q: "What is the purpose of batch normalization?", options: ["Normalizes layer inputs to speed up training and reduce internal covariate shift", "Splits training into batches", "Normalizes input features", "Reduces the learning rate automatically"], correct: 0 },
    { q: "What is the vanishing gradient problem?", options: ["Gradients become extremely small in deep networks, preventing weight updates in early layers", "Model trains too fast", "Loss becomes zero too early", "Gradients explode to infinity"], correct: 0 },
  ],
  senior: [
    { q: "What is the transformer architecture?", options: ["Self-attention based architecture that processes sequences in parallel (basis of GPT, BERT)", "A type of CNN", "A recurrent network variant", "A reinforcement learning algorithm"], correct: 0 },
    { q: "What is the difference between BERT and GPT?", options: ["BERT is bidirectional encoder (understanding); GPT is autoregressive decoder (generation)", "They are the same architecture", "GPT uses bidirectional attention", "BERT is better for text generation"], correct: 0 },
    { q: "What is fine-tuning a pre-trained model?", options: ["Updating a pre-trained model's weights on a smaller domain-specific dataset", "Training a model from scratch", "Adding more layers to a model", "Reducing model size"], correct: 0 },
    { q: "What is RLHF (Reinforcement Learning from Human Feedback)?", options: ["Training LLMs using human preference signals to align with desired behavior", "A standard RL algorithm", "A supervised fine-tuning method", "A data augmentation technique"], correct: 0 },
    { q: "What is the curse of dimensionality?", options: ["As dimensions increase, data becomes sparse and distance metrics lose meaning", "Having too many training samples", "Using too many model parameters", "Overfitting on high-dimensional data"], correct: 0 },
    { q: "What is knowledge distillation?", options: ["Training a smaller model to mimic a larger teacher model's outputs", "Extracting features from data", "Compressing model weights", "Transfer learning from BERT"], correct: 0 },
    { q: "What is a vector database and why is it used in AI apps?", options: ["Stores high-dimensional embeddings for efficient similarity search (RAG, recommendations)", "A faster SQL database", "A database optimized for ML training", "A database that stores model weights"], correct: 0 },
    { q: "What is RAG (Retrieval Augmented Generation)?", options: ["Enhancing LLM responses by retrieving relevant context from a knowledge base", "A reinforcement learning algorithm", "A data augmentation strategy", "A model compression technique"], correct: 0 },
    { q: "What is model quantization?", options: ["Reducing model weight precision (e.g. 32-bit to 8-bit) to decrease size and improve inference speed", "Measuring model accuracy", "Adding more training data", "Increasing model depth"], correct: 0 },
    { q: "What is the attention mechanism in transformers?", options: ["Allows each token to attend to all other tokens, computing relevance weights", "A memory management system", "A type of activation function", "A regularization technique"], correct: 0 },
  ],
};

// ── CYBERSECURITY ────────────────────────────────────────────────────────────
export const cybersecurityQuestions: TieredQuestions = {
  junior: [
    { q: "What is a SQL injection attack?", options: ["Injecting malicious SQL via user input to manipulate databases", "A virus spread via email", "A DDoS attack", "Cross-site scripting"], correct: 0 },
    { q: "What does HTTPS provide?", options: ["Encrypted communication between client and server via TLS", "Faster page loads", "Better SEO ranking", "Cookie management"], correct: 0 },
    { q: "What is a firewall?", options: ["Network security system that monitors and filters traffic", "A hardware cooling system", "An encryption algorithm", "A backup solution"], correct: 0 },
    { q: "What is phishing?", options: ["Fraudulent attempt to steal credentials by impersonating trusted entities", "A network scanning technique", "A password cracking method", "A DDoS attack type"], correct: 0 },
    { q: "What is two-factor authentication (2FA)?", options: ["Requiring two verification methods to log in", "Using two passwords", "Logging in from two devices", "Using two email addresses"], correct: 0 },
    { q: "What is encryption?", options: ["Transforming data into unreadable format that requires a key to decrypt", "Compressing data for storage", "Hashing a password", "Backing up data"], correct: 0 },
    { q: "What is a VPN?", options: ["Virtual Private Network that creates an encrypted tunnel over the internet", "Virtual Protected Node", "Variable Port Number", "A type of firewall"], correct: 0 },
    { q: "What is malware?", options: ["Malicious software designed to harm systems (viruses, ransomware, etc.)", "A network monitoring tool", "An intrusion detection system", "A security protocol"], correct: 0 },
    { q: "What does `OWASP Top 10` refer to?", options: ["List of the 10 most critical web application security risks", "Top 10 security certifications", "10 most common network attacks", "The 10 best security tools"], correct: 0 },
    { q: "What is a brute force attack?", options: ["Systematically trying all possible passwords until the correct one is found", "Injecting malicious code", "Intercepting network traffic", "Exploiting software vulnerabilities"], correct: 0 },
  ],
  middle: [
    { q: "What is XSS (Cross-Site Scripting)?", options: ["Injecting malicious scripts into web pages viewed by other users", "A SQL database attack", "A network sniffing attack", "A server misconfiguration exploit"], correct: 0 },
    { q: "What is CSRF and how is it prevented?", options: ["Cross-Site Request Forgery; prevented with CSRF tokens and SameSite cookies", "A type of XSS attack; prevented with input validation", "A SQL injection; prevented with parameterized queries", "A brute force; prevented with rate limiting"], correct: 0 },
    { q: "What is the difference between symmetric and asymmetric encryption?", options: ["Symmetric uses one shared key; asymmetric uses a public/private key pair", "They use the same algorithm", "Asymmetric is faster but less secure", "Symmetric is always slower"], correct: 0 },
    { q: "What is a penetration test?", options: ["Authorized simulated attack to identify security vulnerabilities", "Automated security scanning", "A firewall configuration test", "A DDoS simulation"], correct: 0 },
    { q: "What is a man-in-the-middle (MITM) attack?", options: ["Attacker intercepts communication between two parties without their knowledge", "An SQL injection variant", "A DDoS attack", "Stealing stored credentials"], correct: 0 },
    { q: "What does `hashing` mean and how is it different from encryption?", options: ["Hashing is one-way (can't reverse); encryption is two-way (reversible with key)", "They are the same process", "Hashing is reversible; encryption is not", "Hashing requires a key"], correct: 0 },
    { q: "What is a zero-day vulnerability?", options: ["A flaw unknown to the vendor with no available patch", "A vulnerability rated zero in CVE", "A bug found on day zero of development", "A non-critical vulnerability"], correct: 0 },
    { q: "What is network segmentation?", options: ["Dividing network into segments to contain breaches and limit lateral movement", "Splitting bandwidth between users", "Configuring VLAN tagging", "Setting firewall rules"], correct: 0 },
    { q: "What is the principle of least privilege?", options: ["Grant only minimum permissions needed for a task", "Users should have full admin rights", "All users have equal permissions", "Only admins can access systems"], correct: 0 },
    { q: "What is a WAF (Web Application Firewall)?", options: ["Filters HTTP traffic to protect web apps from OWASP Top 10 attacks", "A VPN for web applications", "A DDoS mitigation service", "An SSL terminator"], correct: 0 },
  ],
  senior: [
    { q: "What is threat modeling?", options: ["Systematically identifying threats, vulnerabilities, and mitigations in system design", "Monitoring production logs for threats", "Running automated security scans", "Conducting penetration tests"], correct: 0 },
    { q: "What is the kill chain framework?", options: ["Stages of a cyberattack: Recon → Weaponize → Deliver → Exploit → Install → C2 → Execute", "A network security protocol", "A firewall rule set", "A vulnerability scoring system"], correct: 0 },
    { q: "What is SIEM?", options: ["Security Information and Event Management — aggregates and analyzes security logs", "Simple Intrusion Event Manager", "A type of firewall", "A network monitoring protocol"], correct: 0 },
    { q: "What is a supply chain attack?", options: ["Compromising a trusted vendor/dependency to attack downstream targets (e.g. SolarWinds)", "Attacking a company's physical supply chain", "Exploiting package vulnerabilities directly", "A DDoS via CDN"], correct: 0 },
    { q: "What is certificate pinning?", options: ["Hardcoding expected SSL certificate to prevent MITM with rogue certificates", "Using wildcard SSL certificates", "Automating certificate renewal", "Pinning a specific CA in the browser"], correct: 0 },
    { q: "What is the difference between IDS and IPS?", options: ["IDS detects and alerts; IPS detects and actively blocks threats", "They are identical", "IPS only detects; IDS blocks", "IDS is for networks; IPS is for apps"], correct: 0 },
    { q: "What is a memory corruption vulnerability?", options: ["Bugs like buffer overflow that allow attackers to overwrite memory and execute code", "A RAM hardware failure", "A kernel panic", "A race condition bug"], correct: 0 },
    { q: "What is federated identity management?", options: ["Single identity across multiple systems using standards like SAML or OIDC", "Using the same password everywhere", "Centralized user database", "Multi-factor authentication"], correct: 0 },
    { q: "What is a timing attack?", options: ["Side-channel attack using execution time differences to infer secret data", "A brute force attack with delays", "A DDoS timed to peak hours", "SQL injection timed to avoid detection"], correct: 0 },
    { q: "What is secure SDLC (Software Development Life Cycle)?", options: ["Integrating security practices at every phase of development, not just at the end", "Running security tests after deployment", "Hiring a security team", "Code review for vulnerabilities only"], correct: 0 },
  ],
};

// ── QA ───────────────────────────────────────────────────────────────────────
export const qaQuestions: TieredQuestions = {
  junior: [
    { q: "What is software testing?", options: ["Verifying that software meets requirements and is free of defects", "Writing code features", "Deploying software to production", "Code review process"], correct: 0 },
    { q: "What is a test case?", options: ["A set of conditions and steps to verify a specific feature", "A piece of production code", "A deployment script", "A database query"], correct: 0 },
    { q: "What is the difference between a bug and a feature?", options: ["A bug is unintended behavior; a feature is intended functionality", "Bugs are critical; features are optional", "They are the same thing", "Features are bugs that users like"], correct: 0 },
    { q: "What is regression testing?", options: ["Testing to ensure new changes didn't break existing functionality", "Testing performance under load", "Testing only new features", "Testing database connections"], correct: 0 },
    { q: "What is Postman used for?", options: ["Testing and documenting REST APIs manually", "Automated browser testing", "Load testing", "Database testing"], correct: 0 },
    { q: "What is a smoke test?", options: ["Basic test to verify core functionality works before deeper testing", "Testing under heavy load", "Testing all edge cases", "Security testing"], correct: 0 },
    { q: "What is black-box testing?", options: ["Testing without knowledge of internal code/implementation", "Testing with full code access", "Testing the database", "Performance testing"], correct: 0 },
    { q: "What is a test environment?", options: ["A separate environment mimicking production used for testing", "The developer's local machine", "A production server", "A database backup"], correct: 0 },
    { q: "What does a QA engineer do?", options: ["Ensure software quality through testing, bug reporting, and process improvement", "Write production code", "Design the user interface", "Manage the database"], correct: 0 },
    { q: "What is a bug report?", options: ["Document describing a defect with steps to reproduce, expected/actual results", "A performance benchmark", "A deployment log", "A test case result"], correct: 0 },
  ],
  middle: [
    { q: "What is Selenium used for?", options: ["Automating browser actions for web application testing", "API testing", "Load testing", "Mobile app testing"], correct: 0 },
    { q: "What is the test pyramid?", options: ["More unit tests, fewer integration tests, even fewer E2E tests for balanced coverage", "Equal amounts of all test types", "Only E2E tests are needed", "Manual testing at the base, automated at the top"], correct: 0 },
    { q: "What is code coverage?", options: ["Percentage of code executed by tests", "Number of tests written", "Test execution speed", "Bug detection rate"], correct: 0 },
    { q: "What is the difference between unit and integration tests?", options: ["Unit tests one component in isolation; integration tests multiple components together", "They are identical", "Integration tests are faster", "Unit tests require a database"], correct: 0 },
    { q: "What is a mock object in testing?", options: ["A simulated dependency that replaces real objects to isolate the unit under test", "A test data generator", "A performance testing tool", "A real object used in tests"], correct: 0 },
    { q: "What is BDD (Behavior-Driven Development)?", options: ["Writing tests as human-readable scenarios (Given/When/Then) before implementation", "Bug-Driven Development", "Build-Deploy-Debug cycle", "Testing only user behavior"], correct: 0 },
    { q: "What is Cypress used for?", options: ["End-to-end testing of web applications in a real browser", "Unit testing JavaScript", "API performance testing", "Mobile testing"], correct: 0 },
    { q: "What is load testing?", options: ["Testing system behavior under expected and peak load conditions", "Testing a feature with one user", "Checking browser compatibility", "Testing database queries"], correct: 0 },
    { q: "What is a flaky test?", options: ["Test that passes/fails intermittently without code changes", "A test that always fails", "A test with wrong assertions", "A test that's too slow"], correct: 0 },
    { q: "What is exploratory testing?", options: ["Simultaneously learning, designing, and executing tests without a script", "Automated test execution", "Testing all possible inputs", "Security testing"], correct: 0 },
  ],
  senior: [
    { q: "What is mutation testing?", options: ["Introducing small code changes (mutations) to verify tests catch them", "Testing with invalid data", "Testing after a code refactor", "Randomly modifying test data"], correct: 0 },
    { q: "What is contract testing (e.g. Pact)?", options: ["Verifying that API consumers and providers honor their agreed interface without integration", "Testing API endpoints manually", "Validating API documentation", "End-to-end API testing"], correct: 0 },
    { q: "What is chaos engineering in QA context?", options: ["Deliberately injecting failures to verify system resilience and recovery", "Unstructured testing without a plan", "Random test execution order", "Testing with production data"], correct: 0 },
    { q: "What is the difference between performance, load, and stress testing?", options: ["Performance: baseline; Load: expected volume; Stress: beyond limits to find breaking point", "They are all the same", "Stress is lighter than load testing", "Performance testing only checks speed"], correct: 0 },
    { q: "What is shift-left testing?", options: ["Moving testing earlier in the development cycle to catch bugs sooner", "Testing only the left side of UI", "Reducing test coverage deliberately", "Moving QA team to a different department"], correct: 0 },
    { q: "What is test data management?", options: ["Creating, maintaining, and controlling test data that's realistic, secure, and isolated", "Backing up production data", "Generating random test inputs", "Managing test result storage"], correct: 0 },
    { q: "What is observability in testing?", options: ["Ability to understand system state from logs, metrics, and traces during test execution", "Watching users interact with the app", "Monitoring test execution time", "Visual regression testing"], correct: 0 },
    { q: "What is a quality gate in CI/CD?", options: ["Automated threshold (coverage, test pass rate) that blocks deployment if not met", "A manual QA approval step", "A firewall for the test environment", "A code review requirement"], correct: 0 },
    { q: "How do you test microservices effectively?", options: ["Unit per service + contract tests between services + minimal E2E for critical paths", "Only E2E tests across all services", "Unit tests only, no integration needed", "Manual testing for all interactions"], correct: 0 },
    { q: "What is risk-based testing?", options: ["Prioritizing tests based on likelihood and impact of failures in critical areas", "Testing only high-risk security features", "Skipping low-priority features", "Testing in order of feature importance"], correct: 0 },
  ],
};

// ── DATA ANALYST ─────────────────────────────────────────────────────────────
export const dataAnalystQuestions: TieredQuestions = {
  junior: [
    { q: "What is SQL?", options: ["Structured Query Language for managing and querying relational databases", "A programming language for ML", "A data visualization tool", "A spreadsheet format"], correct: 0 },
    { q: "What does `SELECT * FROM users` do?", options: ["Returns all columns and rows from the users table", "Creates a new table called users", "Deletes all rows from users", "Updates the users table"], correct: 0 },
    { q: "What is a pivot table?", options: ["Summarizes data by reorganizing it into a cross-tabulation format", "A type of SQL JOIN", "A chart type", "A database index"], correct: 0 },
    { q: "What is data cleaning?", options: ["Identifying and fixing errors, missing values, and inconsistencies in data", "Deleting old data", "Encrypting data", "Compressing data files"], correct: 0 },
    { q: "What is a KPI?", options: ["Key Performance Indicator — measurable value showing progress toward goals", "Key Python Integration", "Knowledge Process Interface", "A database metric"], correct: 0 },
    { q: "What does `GROUP BY` do in SQL?", options: ["Groups rows with same values for use with aggregate functions", "Filters rows", "Joins two tables", "Sorts the result"], correct: 0 },
    { q: "What is the difference between `COUNT(*)` and `COUNT(column)`?", options: ["COUNT(*) counts all rows; COUNT(column) skips NULLs", "They are identical", "COUNT(column) counts all rows", "COUNT(*) skips NULLs"], correct: 0 },
    { q: "What is Excel VLOOKUP used for?", options: ["Looking up a value in one column and returning data from another column", "Summing values in a range", "Creating a pivot table", "Filtering data"], correct: 0 },
    { q: "What is data visualization?", options: ["Representing data visually using charts, graphs, and dashboards", "Storing data in a visual database", "Encrypting data", "Printing data reports"], correct: 0 },
    { q: "What is mean, median, mode?", options: ["Mean: average; Median: middle value; Mode: most frequent value", "All three are the same measure", "Mode is the average; Mean is the most frequent", "Median and Mean are always equal"], correct: 0 },
  ],
  middle: [
    { q: "What is a SQL window function?", options: ["Performs calculation across related rows without collapsing them (e.g. ROW_NUMBER, SUM OVER)", "A GROUP BY alternative", "A subquery type", "A type of JOIN"], correct: 0 },
    { q: "What is the difference between INNER JOIN and LEFT JOIN?", options: ["INNER: only matching rows; LEFT: all left rows + matching right (NULLs for no match)", "They are identical", "LEFT JOIN returns only matching rows", "INNER JOIN returns all rows"], correct: 0 },
    { q: "What is a CTE (Common Table Expression)?", options: ["Named temporary result set defined with `WITH` for cleaner complex queries", "A stored procedure", "A permanent database view", "An indexed table"], correct: 0 },
    { q: "What is data normalization in databases?", options: ["Organizing tables to reduce redundancy and improve data integrity", "Scaling numerical values to 0-1 range", "Removing NULL values", "Indexing all columns"], correct: 0 },
    { q: "What does `HAVING` do vs `WHERE`?", options: ["HAVING filters aggregated groups; WHERE filters individual rows before grouping", "They are identical", "WHERE filters after aggregation", "HAVING works without GROUP BY"], correct: 0 },
    { q: "What is a cohort analysis?", options: ["Analyzing behavior of groups sharing a common characteristic over time", "Comparing two different products", "A type of A/B test", "Segmenting users by age"], correct: 0 },
    { q: "What is Tableau / Power BI used for?", options: ["Business intelligence and data visualization tools for interactive dashboards", "SQL database management", "Python data analysis", "Statistical modeling"], correct: 0 },
    { q: "What is the difference between correlation and causation?", options: ["Correlation: variables move together; Causation: one variable causes the other", "They are the same", "Correlation always implies causation", "Causation is a type of correlation"], correct: 0 },
    { q: "What is an outlier in data?", options: ["A data point significantly different from other observations", "A missing value", "A duplicate record", "The maximum value"], correct: 0 },
    { q: "What is a subquery in SQL?", options: ["A query nested inside another query", "A stored procedure", "A table alias", "A database view"], correct: 0 },
  ],
  senior: [
    { q: "What is A/B testing and how do you determine statistical significance?", options: ["Comparing two variants; use p-value < 0.05 and sufficient sample size via power analysis", "Showing variant A to 50% of users", "A/B testing doesn't require statistics", "Using chi-square test only"], correct: 0 },
    { q: "What is a slowly changing dimension (SCD) in data warehousing?", options: ["Dimension attribute that changes over time; handled with Type 1/2/3 strategies", "A dimension with many NULL values", "A fact table with slow queries", "A date dimension"], correct: 0 },
    { q: "What is the difference between a star schema and snowflake schema?", options: ["Star: denormalized dimensions; Snowflake: normalized dimensions split into sub-tables", "They are identical", "Snowflake has fewer joins", "Star schema is always slower"], correct: 0 },
    { q: "What is Simpson's Paradox?", options: ["A trend appears in different groups of data but reverses when groups are combined", "A statistical error in regression", "When correlation equals causation", "A type of sampling bias"], correct: 0 },
    { q: "What is survival analysis?", options: ["Analyzing time until an event occurs (churn, failure, conversion)", "Analyzing customer survival rates", "A type of regression", "Medical data analysis only"], correct: 0 },
    { q: "How do you handle multicollinearity in regression models?", options: ["Remove correlated features, use PCA, or apply ridge/lasso regularization", "Add more features", "Ignore it if R² is high", "Use decision trees instead"], correct: 0 },
    { q: "What is dbt (data build tool)?", options: ["SQL-first transformation tool for building analytics data models in warehouses", "A database backup tool", "A data visualization library", "An ETL pipeline for Python"], correct: 0 },
    { q: "What is the difference between OLTP and OLAP?", options: ["OLTP: transactional, many small operations; OLAP: analytical, few complex aggregations", "They are identical", "OLAP handles transactions; OLTP handles analytics", "OLTP is always faster for analytics"], correct: 0 },
    { q: "What is data governance?", options: ["Framework ensuring data quality, security, compliance, and lifecycle management", "Database access control", "Data documentation only", "GDPR compliance only"], correct: 0 },
    { q: "What is Bayesian inference?", options: ["Updating probability beliefs about a hypothesis as new evidence arrives", "A frequentist statistics method", "A machine learning algorithm", "A SQL aggregation method"], correct: 0 },
  ],
};

// ── GENERIC (fallback) ────────────────────────────────────────────────────────
export const genericQuestions: TieredQuestions = {
  junior: [
    { q: "What is version control?", options: ["Tracking code changes over time (e.g. Git)", "A database backup system", "A CSS versioning tool", "An API versioning standard"], correct: 0 },
    { q: "What is an API?", options: ["Application Programming Interface — a contract for how software communicates", "A database type", "A frontend framework", "A server operating system"], correct: 0 },
    { q: "What is a database?", options: ["Organized collection of structured data", "A server operating system", "A programming language", "A network protocol"], correct: 0 },
    { q: "What is agile methodology?", options: ["Iterative, flexible software development with short cycles", "A waterfall approach", "A database design pattern", "A deployment pipeline"], correct: 0 },
    { q: "What is a bug?", options: ["An error or unintended behavior in software", "A missing feature", "A slow query", "A design flaw"], correct: 0 },
    { q: "What is HTML?", options: ["HyperText Markup Language — structure of web pages", "A programming language", "A database query language", "A server technology"], correct: 0 },
    { q: "What is a code review?", options: ["Peer review of code for quality and correctness", "Automated code testing", "A performance benchmark", "A deployment process"], correct: 0 },
    { q: "What is documentation?", options: ["Written explanations of code, APIs, and systems", "Test coverage reports", "Performance monitoring data", "API endpoints"], correct: 0 },
    { q: "What does debugging mean?", options: ["Finding and fixing errors in code", "Writing new features", "Deploying to production", "Code refactoring"], correct: 0 },
    { q: "What is open source software?", options: ["Software with publicly available source code anyone can use/modify", "Free commercial software", "Software without a license", "Government-developed software"], correct: 0 },
  ],
  middle: [
    { q: "What is clean code?", options: ["Code that is readable, simple, well-named, and easy to maintain", "Code without comments", "Compressed/minified code", "Code with no dependencies"], correct: 0 },
    { q: "What is SOLID principles?", options: ["5 OOP design principles for maintainable, flexible code", "A security framework", "A testing methodology", "A database design pattern"], correct: 0 },
    { q: "What is a design pattern?", options: ["Reusable solution to a commonly occurring software design problem", "A UI/UX template", "A database schema", "A CSS framework"], correct: 0 },
    { q: "What is the difference between synchronous and asynchronous code?", options: ["Sync waits for each operation; async continues without waiting", "They produce different results", "Async is always faster", "Sync is only for I/O operations"], correct: 0 },
    { q: "What is refactoring?", options: ["Improving code structure without changing its external behavior", "Rewriting code from scratch", "Adding new features", "Fixing bugs"], correct: 0 },
    { q: "What is technical debt?", options: ["Cost of shortcuts taken that will need proper implementation later", "Outstanding software licenses", "Deprecated library usage", "Missing test coverage"], correct: 0 },
    { q: "What is microservices architecture?", options: ["Breaking an app into small, independently deployable services", "A monolithic application design", "A database architecture", "A frontend pattern"], correct: 0 },
    { q: "What is OAuth 2.0?", options: ["Authorization framework for delegating access without sharing passwords", "An authentication protocol", "A password hashing algorithm", "A session management system"], correct: 0 },
    { q: "What is caching?", options: ["Storing frequently accessed data for fast retrieval", "Compressing data for storage", "Encrypting sensitive data", "Backing up data regularly"], correct: 0 },
    { q: "What is a message queue?", options: ["Asynchronous communication channel between services (e.g. RabbitMQ, Kafka)", "A database queue", "An email sending service", "A network protocol"], correct: 0 },
  ],
  senior: [
    { q: "What is the CAP theorem?", options: ["Distributed systems can only guarantee 2 of 3: Consistency, Availability, Partition tolerance", "A security theorem", "A database indexing principle", "A network reliability law"], correct: 0 },
    { q: "What is eventual consistency?", options: ["Distributed system guarantee that data will become consistent given enough time", "Data is always immediately consistent", "A database transaction level", "An API consistency guarantee"], correct: 0 },
    { q: "What is Domain-Driven Design (DDD)?", options: ["Software design approach modeling complex domains using ubiquitous language", "A database design methodology", "A frontend design system", "A CI/CD approach"], correct: 0 },
    { q: "What is a distributed transaction and why is it hard?", options: ["Transaction spanning multiple services; hard due to network failures and lack of global lock", "A SQL transaction across tables", "A batch database operation", "A long-running database query"], correct: 0 },
    { q: "What is the CQRS pattern?", options: ["Command Query Responsibility Segregation — separate models for reads and writes", "A caching strategy", "A database indexing pattern", "A type of microservice"], correct: 0 },
    { q: "What is zero-downtime deployment?", options: ["Deploying new versions without interrupting service availability", "Deploying at midnight", "A rollback strategy", "Blue-green deployment only"], correct: 0 },
    { q: "What is idempotency in API design?", options: ["Same request can be made multiple times with same result, no side effects", "API that never returns errors", "Stateless API design", "RESTful API design"], correct: 0 },
    { q: "What is a distributed cache and when does it introduce consistency issues?", options: ["Shared cache across nodes; stale data when multiple writers update without coordination", "A local in-memory cache", "A database query cache", "A CDN edge cache"], correct: 0 },
    { q: "What is observability-driven development?", options: ["Designing systems with built-in instrumentation for logs, metrics, traces from the start", "Adding logging after production incidents", "Test-driven development with monitoring", "Using monitoring as a replacement for testing"], correct: 0 },
    { q: "What is the 12-factor app methodology?", options: ["12 best practices for building scalable, maintainable, cloud-native applications", "12 security guidelines", "12 coding style rules", "12 CI/CD pipeline stages"], correct: 0 },
  ],
};

// Mapping from career ID to question set
export const roleQuestionsMap: Record<string, TieredQuestions> = {
  backend: pythonQuestions, // default for backend without language selection
  frontend: frontendQuestions,
  fullstack: frontendQuestions,
  devops: devopsQuestions,
  aiml: aimlQuestions,
  cybersecurity: cybersecurityQuestions,
  qa: qaQuestions,
  "data-analyst": dataAnalystQuestions,
  "data-engineer": dataAnalystQuestions, // reuse
  mobile: genericQuestions,
  network: genericQuestions,
  uiux: genericQuestions,
  graphic: genericQuestions,
  webdesign: frontendQuestions,
  pm: genericQuestions,
  game: genericQuestions,
};

// Backend language-specific overrides
export const backendLanguageQuestionsMap: Record<string, TieredQuestions> = {
  python: pythonQuestions,
  nodejs: nodejsQuestions,
  php: genericQuestions,
  java: genericQuestions,
  go: genericQuestions,
  csharp: genericQuestions,
  ruby: genericQuestions,
  rust: genericQuestions,
};
