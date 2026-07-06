export const testDetailData = [
  {
    id: 1,
    name: "test-1",
    des: "simple test",
    durationInMinutes: 20,
    totalQuestions: 20,
    totalMarks: 20,
    questions: [
      {
        id: 1,
        q: "capital city of India ?",
        andId: 3,
        options: [
          { id: 1, statement: "Kolkata" },
          { id: 2, statement: "Bangalore" },
          { id: 3, statement: "Delhi" },
          { id: 4, statement: "Mumbai" },
        ],
      },
    ],
  },
];

export const course_data = {
  course1: {
    id: 1,
    title: "Data Science & Analytics Masterclass",
    des: "Master Python, data visualization, statistical analysis, and machine learning models to extract actionable insights from complex datasets.",
    thumbnail: "https://i.pinimg.com/736x/a7/3d/bc/a73dbc92e59677b6315ca5d9e49e280b.jpg",
    duration: "4 months",
    instructor: "Rohit Lal",
    totalEnrolled: 1240,
    language: "English",
    validityInMonths: 6,
    course_content: {
      module1: {
        id: "c1_m1",
        title: "Introduction to Data Science & Environments",
        chapter: {
          chapter1: { id: 1, title: "What is Data Science?", des: "Understanding the data science lifecycle and industry use cases.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter2: { id: 2, title: "Setting Up Anaconda and Jupyter", des: "Installing python distributions and navigating development notebooks.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter3: { id: 3, title: "The Data Ecosystem Overview", des: "Differentiating between Data Scientists, Engineers, and Analysts.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter4: { id: 4, title: "Command Line Basics for Data Science", des: "Navigating files and executing basic scripts using terminal frameworks.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter5: { id: 5, title: "Introduction to Git and Version Control", des: "How to save, snapshot, and share your data science repositories.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" }
        }
      },
      module2: {
        id: "c1_m2",
        title: "Python Programming Foundations",
        chapter: {
          chapter1: { id: 1, title: "Variables and Primitive Data Types", des: "Working with integers, floats, strings, and booleans in Python.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter2: { id: 2, title: "Control Flow and Logical Operators", des: "Mastering conditional if-else branching structures.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter3: { id: 3, title: "Loops and Iterations", des: "Implementing complex automation loops via 'for' and 'while' paradigms.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter4: { id: 4, title: "Core Data Structures", des: "Deep dive into native lists, tuples, sets, and dictionaries.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter5: { id: 5, title: "Functions and Exception Handling", des: "Writing reusable, modular code blocks with defensive try-except blocks.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" }
        }
      },
      module3: {
        id: "c1_m3",
        title: "Scientific Computing with NumPy",
        chapter: {
          chapter1: { id: 1, title: "Introduction to ND-Arrays", des: "Why NumPy memory optimization beats standard python lists.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter2: { id: 2, title: "Array Indexing and Slicing", des: "Extracting exact structural subsets from multi-dimensional arrays.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter3: { id: 3, title: "Vectorized Operations", des: "Executing element-wise algebraic functions instantly without loops.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter4: { id: 4, title: "Broadcasting Configurations", des: "How NumPy computes math between arrays of entirely different scales.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter5: { id: 5, title: "Statistical Array Aggregations", des: "Calculating mean, median, standard deviations, and variances.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" }
        }
      },
      module4: {
        id: "c1_m4",
        title: "Data Manipulation with Pandas",
        chapter: {
          chapter1: { id: 1, title: "Pandas Series and DataFrames", des: "Mastering the foundational 1D and 2D components of structural data.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter2: { id: 2, title: "Data Ingestion and Parsers", des: "Importing files seamlessly from CSV, JSON, Excel, and SQL.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter3: { id: 3, title: "Filtering and Row Selection", des: "Querying internal rows with custom bracket constraints and loc/iloc tags.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter4: { id: 4, title: "Handling Missing Records", des: "Strategic data cleanup options including dropna and fillna methods.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter5: { id: 5, title: "Groupby and Custom Aggregations", des: "Splitting transactional tables by key categories to calculate metrics.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" }
        }
      },
      module5: {
        id: "c1_m5",
        title: "Advanced Data Wrangling & Transformations",
        chapter: {
          chapter1: { id: 1, title: "Merging and Database Joins", des: "Aligning distinct structural matrix systems with primary identifiers.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter2: { id: 2, title: "Concatenations and Table Stacking", des: "Combining sequential vertical data feeds across matching headers.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter3: { id: 3, title: "Pivoting and Melting Layouts", des: "Reshaping wide datasets into tidy long configurations.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter4: { id: 4, title: "Datetime Data Engineering", des: "Parsing localized strings into active timeseries metrics.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter5: { id: 5, title: "Vectorized Text String Cleaning", des: "Applying Regex patterns to sanitize messy textual categories.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" }
        }
      },
      module6: {
        id: "c1_m6",
        title: "Data Visualization with Matplotlib & Seaborn",
        chapter: {
          chapter1: { id: 1, title: "Functional Plotting Essentials", des: "Rendering line charts, scatter graphs, and basic bar trends.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter2: { id: 2, title: "Aesthetics and Chart Optimization", des: "Manipulating axes, legends, annotations, and custom dimensions.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter3: { id: 3, title: "Statistical Plotting with Seaborn", des: "Building distribution curves, box plots, and clean pair plots.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter4: { id: 4, title: "Multi-axis Subplot Grids", des: "Rendering complex composite visualization boards together.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter5: { id: 5, title: "Heatmaps and Matrix Layouts", des: "Visualizing feature interaction intensities via colorful metrics.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" }
        }
      },
      module7: {
        id: "c1_m7",
        title: "Exploratory Data Analysis (EDA)",
        chapter: {
          chapter1: { id: 1, title: "The EDA Philosophy", des: "Formulating hidden structural patterns within anonymous sets.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter2: { id: 2, title: "Outlier Detection Frameworks", des: "Locating extreme values via Z-scores and IQR rules.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter3: { id: 3, title: "Feature Correlation Matrix Analysis", des: "Evaluating dependencies using Pearson coefficients.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter4: { id: 4, title: "Basic Binning and Transformation", des: "Converting raw metrics into logical categories or uniform values.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter5: { id: 5, title: "End-to-End Practical EDA Case Study", des: "Slicing through a live corporate real estate dataset.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" }
        }
      },
      module8: {
        id: "c1_m8",
        title: "Statistical Foundations for Analytics",
        chapter: {
          chapter1: { id: 1, title: "Descriptive vs Inferential Statistics", des: "Differentiating parameter calculation from sample estimates.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter2: { id: 2, title: "Probability Distributions", des: "Exploring Gaussian normal, binomial, and poisson variants.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter3: { id: 3, title: "Central Limit Theorem", des: "The core foundational mathematical rule behind parametric testing.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter4: { id: 4, title: "Hypothesis Testing and P-Values", des: "Setting up Null assertions to evaluate numerical significance.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter5: { id: 5, title: "Practical Business A/B Testing", des: "Evaluating marketing asset interaction metrics safely.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" }
        }
      },
      module9: {
        id: "c1_m9",
        title: "Supervised Machine Learning: Regression",
        chapter: {
          chapter1: { id: 1, title: "Scikit-Learn API Architecture", des: "Understanding the shared fit-transform-predict structural workflow.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter2: { id: 2, title: "Simple and Multiple Linear Regression", des: "Fitting a linear model through continuous targeted criteria.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter3: { id: 3, title: "Loss Functions & Optimization", des: "Minimizing Residual Sum of Squares via Gradient Descent math.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter4: { id: 4, title: "Evaluating Continuous Models", des: "Calculating MAE, MSE, RMSE, and Adjusted R-squared scores.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter5: { id: 5, title: "Regularization: Ridge and Lasso", des: "Preventing model overfitting using custom structural weight penalties.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" }
        }
      },
      module10: {
        id: "c1_m10",
        title: "Supervised Machine Learning: Classification",
        chapter: {
          chapter1: { id: 1, title: "Logistic Regression Mechanics", des: "Mapping real binary conditions using standard sigmoid curve metrics.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter2: { id: 2, title: "The Confusion Matrix Deep Dive", des: "Evaluating precision, recall, accuracy, and total combined F1-scores.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter3: { id: 3, title: "K-Nearest Neighbors (KNN)", des: "Classifying historical samples via geographical cluster attributes.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter4: { id: 4, title: "Decision Tree Classifiers", des: "Building information-gain models using entropy calculation math.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
          chapter5: { id: 5, title: "ROC Curves and AUC Scores", des: "Optimizing target classification separation rate boundaries.", videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" }
        }
      }
    }
  },
  course2: {
    id: 2,
    title: "Full-Stack Web Development",
    des: "Build production-ready, interactive web platforms starting from raw HTML layout architecture up through distributed server hosting environments.",
    thumbnail: "https://i.pinimg.com/736x/1f/86/7e/1f867e12fdda0a42d9acd24e1f9861d1.jpg",
    duration: "6 months",
    instructor: "Ananya Sharma",
    totalEnrolled: 3450,
    language: "English",
    validityInMonths: 12,
    course_content: {
      module1: {
        id: "c2_m1",
        title: "Semantic HTML5 and Structural Layouts",
        chapter: {
          chapter1: { id: 1, title: "Web Core Mechanics & HTTP", des: "How servers return raw string assets across network layers.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter2: { id: 2, title: "Semantic Tags vs Generic Divs", des: "Structuring clean documents for modern search engine crawlers.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter3: { id: 3, title: "Forms and Native Validation Input", des: "Collecting user details safely via foundational input arrays.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter4: { id: 4, title: "SEO Baselines and Metadata Tags", des: "Configuring header records to control how social platforms preview links.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter5: { id: 5, title: "Accessibility (a11y) Foundations", des: "Implementing ARIA labels to assist screen reading hardware.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" }
        }
      },
      module2: {
        id: "c2_m2",
        title: "Modern CSS Styles and Responsive Design",
        chapter: {
          chapter1: { id: 1, title: "The CSS Box Model Blueprint", des: "Managing precise content borders, padding depths, and margin flows.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter2: { id: 2, title: "Flexbox Layout Mechanics", des: "Aligning interface assets along one-dimensional layout lines.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter3: { id: 3, title: "CSS Grid Power System", des: "Architecting multi-dimensional page templates directly in style files.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter4: { id: 4, title: "Media Queries & Mobile-First Approach", des: "Ensuring applications look beautiful across desktops, tablets, and phones.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter5: { id: 5, title: "CSS Custom Variables and Themes", des: "Centralizing design tokens to swap light/dark visual skins easily.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" }
        }
      },
      module3: {
        id: "c2_m3",
        title: "JavaScript Core Logic & Syntax",
        chapter: {
          chapter1: { id: 1, title: "Variables: let, const, and var", des: "Understanding execution scope configurations and engine hoisting rules.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter2: { id: 2, title: "Data Manipulation Operations", des: "Interacting natively with strings, math elements, and truthy properties.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter3: { id: 3, title: "Arrays and Iteration Iterators", des: "Transforming dataset metrics using map, filter, and reduce rules.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter4: { id: 4, title: "Object Literals & Reference Logic", des: "Storing nested key-value collections without memory address cross-contamination.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter5: { id: 5, title: "Arrow Functions and Scope Chains", des: "Writing clean modern functional statements while conserving execution context.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" }
        }
      },
      module4: {
        id: "c2_m4",
        title: "DOM Manipulation and Web Events",
        chapter: {
          chapter1: { id: 1, title: "Traversing the DOM Node Tree", des: "Selecting target HTML nodes via querySelector parameters.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter2: { id: 2, title: "Dynamic Node Generation", des: "Creating and appending live interface structures onto running pages.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter3: { id: 3, title: "Event Listeners and Actions", des: "Responding to click loops, keystroke paths, and scrolling heights.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter4: { id: 4, title: "Event Bubbling & Capture Phases", des: "How modern client engines propagate triggers through nested layouts.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter5: { id: 5, title: "Forms and Default Event Prevention", des: "Intercepting processing sequences to handle validations locally.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" }
        }
      },
      module5: {
        id: "c2_m5",
        title: "Asynchronous Web Application Paradigms",
        chapter: {
          chapter1: { id: 1, title: "The JS Runtime Event Loop", des: "How single-threaded code non-blockingly tracks asynchronous events.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter2: { id: 2, title: "Promises State Management", des: "Tracking multi-stage operations using Pending, Fulfilled, and Rejected hooks.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter3: { id: 3, title: "Async / Await Syntax Flow", des: "Writing asynchronous logic that reads cleanly like synchronous commands.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter4: { id: 4, title: "The Fetch API Mechanics", des: "Requesting external JSON data payloads from public restful points.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter5: { id: 5, title: "Asynchronous Error Containment", des: "Wrapping transactional data requests inside clean try-catch blocks.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" }
        }
      },
      module6: {
        id: "c2_m6",
        title: "React.js Component Architecture",
        chapter: {
          chapter1: { id: 1, title: "Understanding Declarative UI & JSX", des: "How React maps structural logic markers straight to virtual targets.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter2: { id: 2, title: "Functional Components and Props", des: "Passing configuration records downward into independent UI layers.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter3: { id: 3, title: "State Control with useState Hook", des: "Triggering smart view adjustments automatically whenever values change.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter4: { id: 4, title: "Side Effects using useEffect", des: "Synchronizing internal application views with data from outside sources.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter5: { id: 5, title: "Lists and the Key Property", des: "Optimizing engine rendering loops by providing unique row markers.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" }
        }
      },
      module7: {
        id: "c2_m7",
        title: "Node.js Server Foundations",
        chapter: {
          chapter1: { id: 1, title: "The V8 Runtime Environment", des: "Executing clean JavaScript code blocks outside client desktop engines.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter2: { id: 2, title: "The Core File System Module", des: "Reading, editing, and deleting real local system text storage streams.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter3: { id: 3, title: "NPM: Package Management Architecture", des: "Importing open-source community asset systems securely into scripts.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter4: { id: 4, title: "Building a Native HTTP Server", des: "Listening for requests on ports to send back basic headers.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter5: { id: 5, title: "Environment Configuration Files", des: "Isolating database secrets safely inside secure local environment configs.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" }
        }
      },
      module8: {
        id: "c2_m8",
        title: "RESTful API Design with Express.js",
        chapter: {
          chapter1: { id: 1, title: "Express Router Architecture", des: "Mapping complex client paths directly to backend processing functions.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter2: { id: 2, title: "Handling HTTP Request Types", des: "Processing structured transactions across GET, POST, PUT, and DELETE.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter3: { id: 3, title: "Middleware Pipeline Execution", des: "Intercepting inbound payload traffic for logging or request checking.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter4: { id: 4, title: "Parsing JSON Input Payloads", des: "Extracting raw structured string data out of incoming request bodies.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter5: { id: 5, title: "Centralized Error Handling Middlewares", des: "Catching runtime application failures safely without stopping the server.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" }
        }
      },
      module9: {
        id: "c2_m9",
        title: "Relational and Document Databases",
        chapter: {
          chapter1: { id: 1, title: "SQL vs NoSQL Paradigms", des: "Choosing between tabular relationships and flexible document trees.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter2: { id: 2, title: "MongoDB Cloud Setups", des: "Deploying high-performance database cluster environments in the cloud.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter3: { id: 3, title: "Data Modeling with Mongoose", des: "Enforcing strict schema properties across flexible document models.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter4: { id: 4, title: "CRUD Operations in Application Logic", des: "Writing code to find, update, and manage records based on API paths.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter5: { id: 5, title: "Database Indexing for Speed", des: "Structuring lookup paths to avoid slow, full-collection database scans.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" }
        }
      },
      module10: {
        id: "c2_m10",
        title: "Authentication and Production Deployments",
        chapter: {
          chapter1: { id: 1, title: "Password Hashing via Bcrypt", des: "Encrypting credentials safely using strong salting and hashing math.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter2: { id: 2, title: "JSON Web Tokens (JWT) Flow", des: "Issuing stateless, cryptographically signed credentials to clients.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter3: { id: 3, title: "CORS and Security Headers", des: "Configuring security parameters to allow only verified origins to connect.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter4: { id: 4, title: "Building a Production Build Layer", des: "Bundling, compiling, and optimizing client interface source directories.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" },
          chapter5: { id: 5, title: "Cloud Hosting Implementation", des: "Deploying live frontend layouts and server APIs to production platforms.", videoUrl: "https://www.youtube.com/embed/Dp6lbcOskMk" }
        }
      }
    }
  },
  course3: {
    id: 3,
    title: "UI/UX Design Masterclass",
    des: "Learn the absolute pillars of modern human-centered interface design, advanced wireframing, and interactive high-fidelity user prototyping with Figma.",
    thumbnail: "https://i.pinimg.com/1200x/01/51/01/015101cfe267c0121d3090cb7c50c3e2.jpg",
    duration: "2 months",
    instructor: "Vikram Malhotra",
    totalEnrolled: 890,
    language: "Hindi",
    validityInMonths: 6,
    course_content: {
      module1: {
        id: "c3_m1",
        title: "Introduction to Design Thinking Frameworks",
        chapter: {
          chapter1: { id: 1, title: "The 5 Pillars of Design Thinking", des: "Empathize, Define, Ideate, Prototype, and Test frameworks analyzed.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter2: { id: 2, title: "User-Centered vs Feature-Driven Design", des: "Prioritizing actual human problems over arbitrary system functions.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter3: { id: 3, title: "Mapping out User Personas", des: "Synthesizing research data into targeted behavioral reference layouts.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter4: { id: 4, title: "Journey Mapping & Problem Scopes", des: "Tracing every operational touchpoint to spot friction blocks.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter5: { id: 5, title: "Competitive Auditing Strategies", des: "Dissecting rival market alternative layouts to locate product opportunities.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" }
        }
      },
      module2: {
        id: "c3_m2",
        title: "Information Architecture & User Flow Logic",
        chapter: {
          chapter1: { id: 1, title: "Cognitive Load and Layout Limits", des: "Structuring screens carefully so visitors don't feel overwhelmed.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter2: { id: 2, title: "Card Sorting and Structure Tests", des: "Using real user research methods to organize multi-level navigation trees.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter3: { id: 3, title: "Drawing clean User Flow Paths", des: "Mapping every link, screen shift, and choice point logically.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter4: { id: 4, title: "Navigation System Paradigms", des: "Comparing tab bars, side menus, and nested hamburger structures.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter5: { id: 5, title: "Labeling and UX Writing Baselines", des: "Using direct, actionable text choices to guide people through tasks.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" }
        }
      },
      module3: {
        id: "c3_m3",
        title: "Low-Fidelity Sketching & Wireframing",
        chapter: {
          chapter1: { id: 1, title: "Crazy Eights Ideation Sprints", des: "Generating 8 distinct concept sketches in 8 minutes for fast testing.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter2: { id: 2, title: "From Paper Sketches to Digital Work", des: "Translating rough pencil concepts into basic desktop frame layouts.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter3: { id: 3, title: "The Rules of Layout Grids", des: "Using 8pt and 12-column layouts to balance layout distributions.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter4: { id: 4, title: "Figma Environment Vector Controls", des: "Mastering shapes, path networks, and direct layout creation tools.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter5: { id: 5, title: "Building a Reusable Wireframe Library", des: "Creating clean placeholders for text and images to map screens fast.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" }
        }
      },
      module4: {
        id: "c3_m4",
        title: "Visual Design: Typography & Hierarchy",
        chapter: {
          chapter1: { id: 1, title: "Type Categories: Serif vs Sans-Serif", des: "Choosing readable type families for crisp digital interfaces.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter2: { id: 2, title: "Setting Up Proportional Type Scales", des: "Using mathematical scales to establish clear typographic hierarchy.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter3: { id: 3, title: "Line Heights and Scan Paths", des: "Optimizing text line lengths and character spacing for effortless reading.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter4: { id: 4, title: "Establishing Strong Contrast Ratios", des: "Using light and weight differences to pull eyes toward vital actions.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter5: { id: 5, title: "Localizing Interface Type Scalings", des: "Adapting layouts smoothly across multiple language script changes.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" }
        }
      },
      module5: {
        id: "c3_m5",
        title: "Color Theory & WCAG Accessibility",
        chapter: {
          chapter1: { id: 1, title: "Color Harmonies & Branding Roles", des: "Balancing dominant base colors with crisp accents.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter2: { id: 2, title: "The 60-30-10 Composition Formula", des: "Distributing surface colors cleanly across complex layouts.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter3: { id: 3, title: "WCAG 2.1 Contrast Requirements", des: "Using automated calculation tools to verify text meets AA guidelines.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter4: { id: 4, title: "Designing for Color Blindness Variations", des: "Ensuring interface alerts work through shapes, not just color cues.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter5: { id: 5, title: "Dark Mode Styling Transformations", des: "Mapping light interfaces over to comfortable, low-light configurations.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" }
        }
      },
      module6: {
        id: "c3_m6",
        title: "Advanced Figma Component Architecture",
        chapter: {
          chapter1: { id: 1, title: "Mastering Auto-Layout Engines", des: "Building components that resize dynamically based on text length.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter2: { id: 2, title: "Component Variants & Options", des: "Grouping button variations across focus, hover, and disabled states.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter3: { id: 3, title: "Nested Component Structuring", des: "Combining small UI components into large, unified element cards.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter4: { id: 4, title: "Figma Boolean and Text Properties", des: "Exposing interface settings cleanly to keep libraries minimal.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter5: { id: 5, title: "Responsive Constraints Setups", des: "Locking element positions to maintain correct framing on resize.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" }
        }
      },
      module7: {
        id: "c3_m7",
        title: "Interactive Prototyping Mechanics",
        chapter: {
          chapter1: { id: 1, title: "Figma Connection Flows", des: "Linking active hot-spots across multiple artboards.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter2: { id: 2, title: "Smart Animate Interpolations", des: "Letting Figma morph matching layer shapes over time.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter3: { id: 3, title: "Advanced Component Micro-interactions", des: "Building fully interactive dropdowns and switches directly inside isolated components.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter4: { id: 4, title: "Configuring Overlays and Modals", des: "Launching contextual dialog sheets over existing blur layers.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter5: { id: 5, title: "Scrolling Behaviors and Fixed Headers", des: "Locking navigation elements in place while data lists scroll underneath.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" }
        }
      },
      module8: {
        id: "c3_m8",
        title: "UX Research & Usability Testing",
        chapter: {
          chapter1: { id: 1, title: "Writing Objective Testing Plans", des: "Formulating clear, unbiased test tasks for users to try.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter2: { id: 2, title: "Moderated vs Unmoderated Studies", des: "Choosing between live interviews and automated tool recordings.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter3: { id: 3, title: "The Think-Aloud Interview Method", des: "Encouraging participants to speak their raw thoughts during tests.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter4: { id: 4, title: "Affinity Diagramming Synthesis", des: "Grouping raw user feedback post-test into priority issue categories.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter5: { id: 5, title: "System Usability Scale (SUS) Metrics", des: "Turning qualitative experiences into clear numerical product health grades.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" }
        }
      },
      module9: {
        id: "c3_m9",
        title: "Design System Implementation Frameworks",
        chapter: {
          chapter1: { id: 1, title: "Atomic Design Methodology", des: "Structuring UI code across Atoms, Molecules, Organisms, and Templates.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter2: { id: 2, title: "Centralizing Variable Style Tokens", des: "Creating unified value sets for colors, radii, and global spacing gaps.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter3: { id: 3, title: "Documenting Usage Policies", des: "Writing clear component handbooks so developers implement designs correctly.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter4: { id: 4, title: "Managing Multi-platform Systems", des: "Scaling system elements to balance across iOS, Android, and Web.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter5: { id: 5, title: "Design Library Asset Lifecycle", des: "Rolling out library updates safely without breaking active team layouts.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" }
        }
      },
      module10: {
        id: "c3_m10",
        title: "Developer Handoff & Portfolio Creation",
        chapter: {
          chapter1: { id: 1, title: "Figma DevMode & Spec Reading", des: "Preparing layouts so engineers can extract measurements easily.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter2: { id: 2, title: "Exporting Asset Bundles Correctly", des: "Optimizing vector SVGs and images for fast web load times.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter3: { id: 3, title: "Structuring UX Case Studies", des: "Telling a clear problem-to-solution story backed by real user research data.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter4: { id: 4, title: "Presenting Work to Product Stakeholders", des: "Defending design choices using concrete data rather than personal taste.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" },
          chapter5: { id: 5, title: "Design Career Interview Strategies", des: "Navigating portfolio reviews and live whiteboard app design challenges.", videoUrl: "https://www.youtube.com/embed/c9Wg6g_HfyM" }
        }
      }
    }
  },
  course4: {
    id: 4,
    title: "Cloud Engineering with AWS",
    des: "Architect resilient, secure, and infinitely scalable computing architectures on Amazon Web Services while preparing directly for the AWS Solutions Architect exam.",
    thumbnail: "https://i.pinimg.com/736x/dc/b8/a5/dcb8a54080c31cef427038d1f5743d36.jpg",
    duration: "3 months",
    instructor: "Siddharth Mehta",
    totalEnrolled: 2110,
    language: "English",
    validityInMonths: 8,
    course_content: {
      module1: {
        id: "c4_m1",
        title: "Cloud Fundamentals & AWS Global Infrastructure",
        chapter: {
          chapter1: { id: 1, title: "The Shift to Cloud Computing", des: "Comparing capital expenditure hardware with operational expenditure cloud resources.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter2: { id: 2, title: "Regions and Availability Zones", des: "Architecting systems across physically isolated geographic hardware sites.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter3: { id: 3, title: "The AWS Shared Responsibility Model", des: "Differentiating security 'of' the cloud from security 'in' the cloud.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter4: { id: 4, title: "The AWS Console and CLI Setups", des: "Configuring security keys to manage cloud services from your computer.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter5: { id: 5, title: "Estimating Infrastructure Costs", des: "Using the AWS Pricing Calculator to forecast annual compute budgets.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" }
        }
      },
      module2: {
        id: "c4_m2",
        title: "Identity and Access Management (IAM)",
        chapter: {
          chapter1: { id: 1, title: "IAM Users, Groups, and Root Credentials", des: "Locking down primary account entries and enforcing multi-factor authentication.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter2: { id: 2, title: "Crafting Granular JSON IAM Policies", des: "Writing access definitions that enforce the Principle of Least Privilege.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter3: { id: 3, title: "IAM Roles and Service Delegation", des: "Granting temporary permissions to internal cloud servers securely without key sharing.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter4: { id: 4, title: "Credential Evaluation Mechanics", des: "How AWS evaluates policy priorities from explicit denies to implicit allows.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter5: { id: 5, title: "Auditing Permissions via IAM Access Advisor", des: "Tracking down unused permissions to keep cloud setups clean and safe.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" }
        }
      },
      module3: {
        id: "c4_m3",
        title: "Virtual Compute Infrastructure via Amazon EC2",
        chapter: {
          chapter1: { id: 1, title: "EC2 Instance Types and Families", des: "Matching compute workloads to compute, memory, or storage optimized servers.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter2: { id: 2, title: "SSH Key Pairs & Secure Terminal Entry", des: "Generating encryption keys to log into Linux server terminals safely.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter3: { id: 3, title: "Security Groups as Stateful Firewalls", des: "Configuring inbound rule barriers to control port access on cloud instances.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter4: { id: 4, title: "EC2 Storage: EBS vs Instance Store", des: "Choosing between persistent cloud block drives and temporary local host storage.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter5: { id: 5, title: "Purchasing Models: On-Demand vs Spot vs Reserved", des: "Optimizing server costs by running secondary tasks on spare cloud hardware.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" }
        }
      },
      module4: {
        id: "c4_m4",
        title: "Virtual Private Cloud (VPC) Networking Architecture",
        chapter: {
          chapter1: { id: 1, title: "VPC Core IP Allocation & CIDR Notation", des: "Slicing private cloud network ranges into clean, structured subnets.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter2: { id: 2, title: "Public vs Private Subnet Routes", des: "Using internet gateways and custom route tables to isolate databases.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter3: { id: 3, title: "NAT Gateways & Private Communications", des: "Allowing backend databases to fetch internet updates without exposing their ports.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter4: { id: 4, title: "Network Access Control Lists (NACLs)", des: "Configuring stateless layer filters to protect entire subnet ranges.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter5: { id: 5, title: "VPC Peering & Cloud Interconnects", des: "Linking entirely separate internal cloud environments securely.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" }
        }
      },
      module5: {
        id: "c4_m5",
        title: "Cloud Storage Solutions via Amazon S3",
        chapter: {
          chapter1: { id: 1, title: "Object Storage Paradigms & Bucket Rules", des: "Storing files as distinct cloud objects instead of running traditional folder systems.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter2: { id: 2, title: "S3 Storage Classes & Lifecycle Controls", des: "Moving older files down to low-cost Glacier storage automatically.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter3: { id: 3, title: "Bucket Policies and Public Block Locks", des: "Locking down data storage buckets to prevent data exposures.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter4: { id: 4, title: "S3 Object Versioning & Replication", des: "Keeping multiple document histories safe from accidental overwrites.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter5: { id: 5, title: "Encrypting Cloud Objects at Rest", des: "Using server-side keys to scramble data files automatically.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" }
        }
      },
      module6: {
        id: "c4_m6",
        title: "High Availability & Elastic Load Balancing",
        chapter: {
          chapter1: { id: 1, title: "Application Load Balancer Routing Hooks", des: "Routing incoming user traffic across web server farms using path rules.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter2: { id: 2, title: "Target Groups and Target Health Probes", des: "Monitoring server health to automatically bypass crashed compute nodes.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter3: { id: 3, title: "Configuring Auto-Scaling Groups", des: "Setting rules to spin up extra cloud servers whenever traffic spikes.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter4: { id: 4, title: "Dynamic Scaling vs Scheduled Capacity Policies", des: "Balancing compute power around predicted traffic cycles.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter5: { id: 5, title: "Architecting Multi-AZ Resilient Workloads", des: "Designing systems that survive total data center outages without dropping requests.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" }
        }
      },
      module7: {
        id: "c4_m7",
        title: "Managed Cloud Databases: RDS & DynamoDB",
        chapter: {
          chapter1: { id: 1, title: "Amazon RDS Engines & Multi-AZ Setups", des: "Deploying automated relational database replicas for failover backup support.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter2: { id: 2, title: "RDS Read Replicas & Read Scaling", des: "Offloading database lookup tasks to duplicate read-only instances.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter3: { id: 3, title: "Amazon DynamoDB Key Architecture", des: "Designing highly distributed, single-digit millisecond NoSQL cloud storage.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter4: { id: 4, title: "DynamoDB Partitioning & Provisioning", des: "Managing read and write capacities to prevent data throttling.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter5: { id: 5, title: "ElastiCache: Redis Cluster Caching", des: "Speeding up database apps by holding hot lookups in high-speed memory.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" }
        }
      },
      module8: {
        id: "c4_m8",
        title: "Serverless Compute via AWS Lambda",
        chapter: {
          chapter1: { id: 1, title: "The Serverless Paradigm Shift", des: "Running backend code modules instantly without configuring server hardware.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter2: { id: 2, title: "Lambda Event Sources & Bindings", des: "Triggering background code tasks whenever files hit cloud buckets.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter3: { id: 3, title: "Configuring Memory & Timeout Allocations", des: "Tuning serverless operational boundaries to minimize monthly spend.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter4: { id: 4, title: "Amazon API Gateway Integrations", des: "Exposing serverless cloud routines as clean, documented public endpoints.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter5: { id: 5, title: "Handling Cold Starts & Lambda Execution Contexts", des: "Optimizing serverless app speeds by maintaining active runtimes.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" }
        }
      },
      module9: {
        id: "c4_m9",
        title: "Cloud Security, Monitoring & Logging",
        chapter: {
          chapter1: { id: 1, title: "Amazon CloudWatch Metrics & Dashboards", des: "Tracking CPU usage, memory rates, and infrastructure system health logs.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter2: { id: 2, title: "Setting Up Metric Alarms & Notifications", des: "Alerting team engineers instantly whenever cloud servers hit critical limits.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter3: { id: 3, title: "AWS CloudTrail Governance Auditing", des: "Recording every single API call and infrastructure change for security checks.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter4: { id: 4, title: "VPC Flow Logs Network Inspection", des: "Capturing IP traffic data hitting cloud subnets to locate attacks.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter5: { id: 5, title: "AWS Secrets Manager Credential Storage", des: "Rotating database access keys securely without baking them into applications.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" }
        }
      },
      module10: {
        id: "c4_m10",
        title: "Global Content Delivery & DNS Rules",
        chapter: {
          chapter1: { id: 1, title: "Amazon Route 53 Domain Architecture", des: "Managing public DNS records and setting up health-check routing.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter2: { id: 2, title: "Route 53 Routing Policies Demystified", des: "Balancing traffic across geographic, latency-based, or failover paths.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter3: { id: 3, title: "Amazon CloudFront Edge Content Delivery", des: "Caching videos and interface assets at edge nodes closer to global users.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter4: { id: 4, title: "Cache Invalidation Strategies", des: "Clearing out old cached assets across global networks instantly during updates.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" },
          chapter5: { id: 5, title: "AWS WAF: Web Application Firewall Blocks", des: "Stopping malicious SQL injections and cross-site scripting attacks at edge entry gates.", videoUrl: "https://www.youtube.com/embed/JIbIYCM48to" }
        }
      }
    }
  },
  course5: {
    id: 5,
    title: "DevOps & CI/CD Engineering",
    des: "Bridge the absolute gap between agile software development and reliable automated operations using modern infrastructure-as-code, containers, and deployment automation pipelines.",
    thumbnail: "https://i.pinimg.com/736x/d9/a4/c1/d9a4c16ef26d110c334a6c0f66c3dfa6.jpg",
    duration: "4 months",
    instructor: "Neha Kapoor",
    totalEnrolled: 1340,
    language: "Hindi",
    validityInMonths: 12,
    course_content: {
      module1: {
        id: "c5_m1",
        title: "The DevOps Culture & Linux Foundations",
        chapter: {
          chapter1: { id: 1, title: "Breaking Down Silos: The DevOps Ethos", des: "Unifying continuous coding goals with absolute backend platform reliability.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter2: { id: 2, title: "Advanced Linux File System Navigation", des: "Managing system paths, viewing storage volumes, and tracking file edits via terminal scripts.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter3: { id: 3, title: "Permissions, Ownership, and Chmod Execution", des: "Configuring user, group, and world file access properties precisely.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter4: { id: 4, title: "Linux Process Monitoring & Resource Tracking", des: "Locating and killing hung application routines using ps, top, and kill commands.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter5: { id: 5, title: "Writing Automation Shell Scripts", des: "Chaining terminal operations into automated bash scripts.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" }
        }
      },
      module2: {
        id: "c5_m2",
        title: "Source Control & Collaborative Git Workflows",
        chapter: {
          chapter1: { id: 1, title: "Git Architecture: Inside the .git Repository", des: "Understanding how Git structures blob nodes, trees, and commit histories.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter2: { id: 2, title: "Advanced Branching & Merging Conflict Resolution", des: "Fixing overlapping text errors safely when merging team feature updates.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter3: { id: 3, title: "Git Rebasing vs Standard Merging Paths", des: "Rewriting clean local commit histories before shipping updates to servers.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter4: { id: 4, title: "Enforcing Git Hooks for Pre-Commit Validation", des: "Blocking broken code check-ins by running linters automatically at save time.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter5: { id: 5, title: "Gitflow Branch Model Configurations", des: "Structuring branches into strict Dev, QA, and Production environments.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" }
        }
      },
      module3: {
        id: "c5_m3",
        title: "Containerization Mechanics via Docker",
        chapter: {
          chapter1: { id: 1, title: "Virtual Machines vs Lightweight Containers", des: "How containers cut memory usage by sharing the core host OS kernel.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter2: { id: 2, title: "Writing Highly Optimized Dockerfiles", des: "Layering configurations efficiently to minimize image size.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter3: { id: 3, title: "Docker Volumes & Data Persistence", des: "Mounting local system drives so database containers don't lose data on reboot.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter4: { id: 4, title: "Container Networking Map Rules", des: "Exposing internal container application ports to public internet entry paths.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter5: { id: 5, title: "Multi-Container Coordination with Docker Compose", des: "Spinning up a multi-service web app stack with a single command.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" }
        }
      },
      module4: {
        id: "c5_m4",
        title: "Continuous Integration Orchestration via Jenkins",
        chapter: {
          chapter1: { id: 1, title: "Setting Up a Distributed Jenkins Controller", des: "Deploying automation master nodes alongside decoupled runner servers.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter2: { id: 2, title: "Writing Declarative Jenkins Pipelines", des: "Baking deployment steps cleanly into code using a centralized Jenkinsfile script.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter3: { id: 3, title: "Automated Build Trigger Hooks", des: "Configuring systems to start testing pipelines the second code changes are saved.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter4: { id: 4, title: "Artifact Management and Archiving", des: "Compiling and packaging clean software outputs into secure archive folders.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter5: { id: 5, title: "Plugin Ecosystem Integration", des: "Linking pipeline runners to slack alerts, security tools, and cloud providers.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" }
        }
      },
      module5: {
        id: "c5_m5",
        title: "Alternative CI Tooling: GitHub Actions",
        chapter: {
          chapter1: { id: 1, title: "GitHub Actions Workflow YAML Layouts", des: "Defining step-by-step code testing parameters inside native yaml configurations.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter2: { id: 2, title: "Managing Secret Keys and Tokens", des: "Injecting operational passwords safely into pipelines without showing them in code.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter3: { id: 3, title: "Matrix Build Strategies Configuration", des: "Testing application builds across multiple language versions simultaneously.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter4: { id: 4, title: "Caching Build Dependency Layers", des: "Speeding up deployment times by saving package managers between runs.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter5: { id: 5, title: "Building Reusable Custom Action Workflows", des: "Standardizing build patterns across your entire company codebase.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" }
        }
      },
      module6: {
        id: "c5_m6",
        title: "Infrastructure as Code (IaC) with Terraform",
        chapter: {
          chapter1: { id: 1, title: "The Declarative Infrastructure Concept", des: "Defining cloud server configurations entirely within text code files.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter2: { id: 2, title: "Terraform Providers & HCL Syntax Baselines", des: "Mapping internal structures cleanly to cloud systems via HashiCorp syntax.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter3: { id: 3, title: "Managing State Logs and Concurrency Locks", des: "Keeping track of live cloud resources accurately to avoid double deployments.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter4: { id: 4, title: "Writing Modular Infrastructure Packages", des: "Bundling network templates into clean, reusable structural components.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter5: { id: 5, title: "Executing Plans and Handling Resource Destructions", des: "Previewing infrastructure modifications safely before applying changes live.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" }
        }
      },
      module7: {
        id: "c5_m7",
        title: "Configuration Management via Ansible",
        chapter: {
          chapter1: { id: 1, title: "Agentless Architecture vs Pull Models", des: "Configuring remote target nodes quickly using standard SSH setups without agent code.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter2: { id: 2, title: "Writing Declarative Ansible Playbooks", des: "Defining exact packages and files that must exist on target systems.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter3: { id: 3, title: "Inventory File Targets & Groupings", des: "Mapping server landscape environments into clean, addressable network lists.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter4: { id: 4, title: "Ansible Handlers & Task Conditionals", des: "Restarting internal services only when configuration profiles actually change.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter5: { id: 5, title: "Securing Secrets using Ansible Vault", des: "Encrypting production server administrative credentials completely at rest.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" }
        }
      },
      module8: {
        id: "c5_m8",
        title: "Container Orchestration via Kubernetes Essentials",
        chapter: {
          chapter1: { id: 1, title: "Kubernetes Control Plane Architecture", des: "How master elements manage container worker nodes across environments.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter2: { id: 2, title: "Pods and Deployment YAML Manifests", des: "Defining scaling properties and deployment strategies for container sets.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter3: { id: 3, title: "Networking: Services and Ingress Routers", des: "Exposing changing internal container clusters to single public endpoints.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter4: { id: 4, title: "ConfigMaps and Secrets Injectors", des: "Decoupling application variables away from raw container images.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter5: { id: 5, title: "Liveness and Readiness Probe Setups", des: "Letting cluster engines automatically restart frozen container runtimes.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" }
        }
      },
      module9: {
        id: "c5_m9",
        title: "Zero-Downtime Deployment Tactics",
        chapter: {
          chapter1: { id: 1, title: "Blue/Green Deployment Isolation Steps", des: "Routing global traffic over to a fresh environment only when tests pass perfectly.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter2: { id: 2, title: "Canary Testing Rollouts", des: "Shifting a tiny fraction of user traffic to new code versions to spot errors early.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter3: { id: 3, title: "Rolling Update Strategy Steps", des: "Replacing old app instances one-by-one to maintain zero uptime drops.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter4: { id: 4, title: "Automated Pipeline Rollbacks", des: "Instantly restoring older stable software versions if error rates spike.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter5: { id: 5, title: "Feature Flags Deployment Patterns", des: "Decoupling deployment from activation by turning features on/off via configuration.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" }
        }
      },
      module10: {
        id: "c5_m10",
        title: "Observability, Log Aggregation & Metrics",
        chapter: {
          chapter1: { id: 1, title: "The Three Pillars of Observability", des: "Mastering the unique roles of system metrics, distributed traces, and application logs.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter2: { id: 2, title: "Prometheus Time-Series Infrastructure", des: "Scraping performance metrics from thousands of microservices continuously.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter3: { id: 3, title: "Building Analytical Visualizations in Grafana", des: "Assembling operations dashboards to watch real-time server trends.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter4: { id: 4, title: "Log Aggregation via the ELK Stack", des: "Centralizing output data from separate server nodes into an indexed search hub.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          chapter5: { id: 5, title: "Distributed Request Tracing using Jaeger", des: "Tracking individual user requests as they hop across complex backend networks.", videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI" }
        }
      }
    }
  }
};
