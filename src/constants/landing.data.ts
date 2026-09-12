import type {
  Client,
  FAQItem,
  PortfolioProject,
  PricingPlan,
  ProcessStep,
  Service,
  Stat,
  Testimonial,
  ClientReviewsSection as ClientReviewsSectionType,
} from '@/types/domain.types';

export const services: Service[] = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    description: 'Automate your business with AI-powered agents, smart workflows, customer support, lead management, and seamless integrations.',
    icon: 'Bot',
    features: ['AI Agents', 'WhatsApp, Email, CRM & Workflow Automation', '24/7 AI Support',
    ],
    badge: 'Trending ',
    accent: 'amber',
  },
  {
    id: 'websites',
    title: 'Business Websites',
    description:
      'Fast, modern and conversion-focused websites that turn visitors into customers.',
    icon: 'Globe',
    features: ['Business websites', 'Landing pages', 'SEO optimization'],
    badge: 'Most popular',
    accent: 'purple',
  },
  {
    id: 'web-apps',
    title: 'Web Applications',
    description:
      'Scalable web platforms built for performance, security and real business workflows.',
    icon: 'LayoutDashboard',
    features: ['Custom web apps', 'Admin dashboards', 'API integrations'],
    accent: 'blue',
  },
  {
    id: 'mobile',
    title: 'Mobile Applications',
    description:
      'Native-quality Android and iOS experiences your customers will love to use.',
    icon: 'Smartphone',
    features: ['Android & iOS apps', 'Cross-platform apps', 'App modernization'],
    accent: 'green',
  },
  {
    id: 'erp',
    title: 'ERP Systems',
    description:
      'Unified enterprise resource planning to streamline operations across departments.',
    icon: 'Building2',
    features: ['Finance modules', 'Supply chain', 'Reporting & analytics'],
    accent: 'cyan',
  },
  {
    id: 'crm',
    title: 'CRM Systems',
    description:
      'Customer relationship platforms that help teams sell smarter and retain better.',
    icon: 'Users',
    features: ['Lead management', 'Sales pipeline', 'Customer insights'],
    accent: 'amber',
  },
  {
    id: 'hrms',
    title: 'HRMS',
    description:
      'Complete human resource management from hiring to payroll and performance.',
    icon: 'UserCheck',
    features: ['Employee records', 'Payroll & attendance', 'Performance reviews'],
    accent: 'red',
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description:
      'Real-time stock tracking, warehouse management and automated reordering.',
    icon: 'Package',
    features: ['Stock tracking', 'Warehouse ops', 'Purchase orders'],
    accent: 'green',
  },
  {
    id: 'business-mgmt',
    title: 'Business Management',
    description:
      'All-in-one business operating systems that connect teams, data and decisions.',
    icon: 'Briefcase',
    features: ['Workflow automation', 'Internal portals', 'Role-based access'],
    accent: 'blue',
  },
  {
    id: 'ai',
    title: 'AI Solutions',
    description:
      'Intelligent automation, predictive analytics and AI-powered business tools.',
    icon: 'Sparkles',
    features: ['AI chatbots', 'Predictive analytics', 'Process automation'],
    badge: 'New',
    accent: 'purple',
  },
  {
    id: 'saas',
    title: 'SaaS Products',
    description:
      'From idea to scalable software product—with a clean, reliable foundation.',
    icon: 'Cloud',
    features: ['MVP development', 'Subscription billing', 'Multi-tenant architecture'],
    accent: 'cyan',
  },
  {
    id: 'transformation',
    title: 'Digital Transformation',
    description:
      'End-to-end modernization strategies that future-proof your organization.',
    icon: 'Rocket',
    features: ['Legacy migration', 'Cloud adoption', 'Change management'],
    accent: 'red',
  },
];

export const processSteps: ProcessStep[] = [
  {
    id: 'discover',
    step: 1,
    title: 'Discover',
    description:
      'We learn your business, users, goals and what success really means.',
    icon: 'Search',
  },
  {
    id: 'design',
    step: 2,
    title: 'Design',
    description:
      'We map the experience and craft an interface that feels unmistakably yours.',
    icon: 'PenTool',
  },
  {
    id: 'build',
    step: 3,
    title: 'Build',
    description:
      'We develop, integrate and test your product with weekly progress updates.',
    icon: 'Code2',
  },
  {
    id: 'launch',
    step: 4,
    title: 'Launch & grow',
    description:
      'We launch with confidence, measure results and keep improving what matters.',
    icon: 'Rocket',
  },
];

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'lumeira',
    title: 'Luméra Living',
    category: 'E-COMMERCE · BRAND',
    description: 'A calm, premium storefront that increased conversion by 64%.',
    tags: ['Web App', 'Brand'],
    featured: true,
    gradient: 'from-stone-100 to-stone-200',
  },
  {
    id: 'viora',
    title: 'Viora Health',
    category: 'MOBILE APP · WELLNESS',
    description: 'A personalized health companion built for daily habits.',
    tags: ['Mobile', 'Wellness'],
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'scaleos',
    title: 'ScaleOS',
    category: 'SAAS · ANALYTICS',
    description: 'One focused dashboard for marketing teams that move fast.',
    tags: ['SaaS', 'Analytics'],
    gradient: 'from-slate-800 to-slate-900',
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: 'launch',
    name: 'Launch',
    description: 'For small businesses ready to look serious online.',
    price: '₹24,999',
    priceNote: 'one time',
    features: [
      'Up to 5 responsive pages',
      'Premium custom design',
      'Lead capture & WhatsApp',
      'Basic SEO setup',
      '30-day support',
    ],
    cta: 'Choose Launch',
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For businesses that need a complete digital system.',
    price: '₹74,999',
    priceNote: 'one time',
    features: [
      'Website or cross-platform app',
      'Admin management dashboard',
      'Payments & smart integrations',
      'Analytics and automations',
      '90-day priority support',
    ],
    cta: 'Choose Growth',
    highlighted: true,
    badge: 'Best value',
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'For custom SaaS, platforms and complex operations.',
    price: 'Custom scope',
    priceNote: "Let's talk · flexible engagement",
    features: [
      'Full product strategy',
      'Advanced role-based platform',
      'Custom APIs & integrations',
      'Dedicated product team',
      'Ongoing growth partnership',
    ],
    cta: 'Book a strategy call',
  },
];

export const faqItems: FAQItem[] = [
  {
    id: 'timeline',
    question: 'How long does a typical project take?',
    answer:
      'Most business websites take 3–5 weeks. Apps and custom platforms usually take 6–14 weeks depending on scope. You\'ll get a clear timeline before we begin.',
  },
  {
    id: 'existing',
    question: 'Can you work with my existing brand or product?',
    answer:
      'Absolutely. We can improve your current product, modernize the experience or work within your existing brand system.',
  },
  {
    id: 'support',
    question: 'Do you provide support after launch?',
    answer:
      'Yes. Every project includes post-launch support, and ongoing care plans are available for updates, security and growth.',
  },
  {
    id: 'manage',
    question: 'Will I be able to manage the platform myself?',
    answer:
      'Yes. We build intuitive admin tools, provide training and avoid unnecessary complexity so your team stays in control.',
  },
  {
    id: 'payments',
    question: 'How do payments work?',
    answer:
      'Projects are split into simple milestones—typically 40% to begin, 30% after design approval and 30% before launch.',
  },
];

// export const testimonial: Testimonial = {
//   id: 'simran',
//   quote:
//     "DigiAyudh didn't just build our website. They understood the business, simplified the customer journey and gave us a digital system we can actually grow with.",
//   author: 'Ayush Narware',
//   role: 'Developer',
//   company: 'DigiAyudh',
//   avatar: 'AN',
//   metric: '+92%',
//   metricLabel: 'conversion rate after launch',
// };

export const testimonial: Testimonial = {
  id: 'ayush',
  quote:
    "At DigiAyudh, we believe technology should do more than solve problems—it should create new possibilities. We turn bold ideas into thoughtful, scalable digital products that help businesses move faster, work smarter, and build for what comes next.",
  author: 'Ayush Narware',
  role: 'Co-Founder',
  company: 'DigiAyudh',
  avatar: 'AN',
  metric: '63+',
  metricLabel: 'digital products & solutions',
};


export const ClientReviewsSection: ClientReviewsSectionType[] = [{
  id: 'client-1',
  quote:
    'DigiAyudh understood our business requirements and turned our ideas into a clean, reliable digital product. The entire process was smooth and professional.',
  author: 'Rahul Sharma',
  role: 'Founder & CEO',
  company: 'Ananthaa Global Ventures',
  avatar: 'RS',
  metric: '5.0',
  stats: '3',
  statsLabel: 'projects delivered',
  metricLabel: 'client rating',
},

{
  id: 'client-2',
  quote:
    'The team was highly responsive and transparent throughout the project. They understood what we needed, kept communication clear, and delivered a modern solution that genuinely improved our digital presence.',
  author: 'Amit Verma',
  role: 'Director',
  company: 'Vertex',
  avatar: 'AV',
  metric: '4.8',
  stats: '2',
  statsLabel: 'projects delivered',
  metricLabel: 'client rating',
},

{
  id: 'client-3',
  quote:
    'What stood out was their attention to detail. From the initial discussion to the final delivery, everything was handled professionally and the product turned out better than we expected.',
  author: 'Neha Gupta',
  role: 'Co-Founder',
  company: 'Northstar Solutions',
  avatar: 'NG',
  metric: '4.9',
  stats: '1',
  statsLabel: 'projects delivered',
  metricLabel: 'client rating',
},

{
  id: 'client-4',
  quote:
    'We needed a solution that was simple for our team to use but still looked professional. DigiAyudh delivered exactly that and was quick to respond whenever we had questions.',
  author: 'Vikram Mehta',
  role: 'Managing Director',
  company: 'UrbanEdge',
  avatar: 'VM',
  metric: '4.7',
  stats: '3',
  statsLabel: 'projects delivered',
  metricLabel: 'client rating',
},

{
  id: 'client-5',
  quote:
    'The development process was well organized and communication was consistent. They took our feedback seriously and made the necessary improvements without making the process complicated.',
  author: 'Priya Malhotra',
  role: 'Business Head',
  company: 'Apex Ventures',
  avatar: 'PM',
  metric: '4.8',
  stats: '2',
  statsLabel: 'projects delivered',
  metricLabel: 'client rating',
},

{
  id: 'client-6',
  quote:
    'DigiAyudh helped us move from an initial concept to a working digital product with a clear development process. The final result was fast, responsive, and easy to manage.',
  author: 'Karan Patel',
  role: 'Founder',
  company: 'BrightCore',
  avatar: 'KP',
  metric: '4.6',
  stats: '1',
  statsLabel: 'projects delivered',
  metricLabel: 'client rating',
},

{
  id: 'client-7',
  quote:
    'A reliable team with a good understanding of both design and technology. They were flexible with our requirements and delivered a solution that fit our business workflow really well.',
  author: 'Rohan Kapoor',
  role: 'Operations Director',
  company: 'Meridian Group',
  avatar: 'RK',
  metric: '4.9',
  stats: '1',
  statsLabel: 'projects delivered',
  metricLabel: 'client rating',
},
];

// export const trustedClients: Client[] = [
//   { id: '1', name: 'Northstar', logo: '◆' },
//   { id: '2', name: 'Vertex', logo: '◒' },
//   { id: '3', name: 'Pulse', logo: '✦' },
//   { id: '4', name: 'Mono', logo: '◉' },
//   { id: '5', name: 'Kinetic', logo: '▲' },
// ];


export const trustedClients: Client[] = [


  { id: '1', name: 'Ananthaa Global Ventures', logo: '/agv_logo.png' },
  { id: '2', name: 'Vertex', logo: '/vertex.png' },
  { id: '3', name: 'Pulse', logo: '/pulse.png' },
  { id: '4', name: 'Mono', logo: '/mono.png' },
  { id: '5', name: 'Kinetic', logo: '/kinetic.png' },
  { id: '6', name: 'Nexora', logo: '/nexora.png' },
  { id: '7', name: 'Fluxwave', logo: '/fluxwave.png' },
  { id: '8', name: 'Ironclad', logo: '/ironclad.png' },
  { id: '9', name: 'Orbitly', logo: '/orbitly.png' },
  { id: '10', name: 'Zenith', logo: '/zenith.png' },
  { id: '11', name: 'Cobalt', logo: '/cobalt.png' },
  { id: '12', name: 'Solace', logo: '/solace.png' },
  { id: '13', name: 'Ridgeline', logo: '/ridgeline.png' },
  { id: '14', name: 'Amberly', logo: '/amberly.png' },
  { id: '15', name: 'Quorum', logo: '/quorum.png' },
];

export const stats: Stat[] = [
  { label: 'client satisfaction', value: '78', suffix: '%' },
  { label: 'products launched', value: '63', suffix: '+' },
  { label: 'average ROI', value: '3.4', suffix: 'x' },
];

export const whyUsPoints = [
  {
    title: 'Business-first thinking',
    description: 'Every screen has a job and every feature supports growth.',
  },
  {
    title: 'One reliable team',
    description: 'Strategy, design, code and support—without vendor chaos.',
  },
  {
    title: 'Clear and transparent',
    description: 'Live updates, simple pricing and no mystery timelines.',
  },
];

export const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
];

export const footerLinks = {
  services: [
    'Business Websites',
    'Web Applications',
    'Mobile Apps',
    'ERP Systems',
    'CRM Systems',
    'AI Solutions',
  ],
  company: ['About', 'Work', 'Process', 'Careers', 'Contact'],
  resources: ['Blog', 'Documentation', 'Case Studies', 'Privacy Policy', 'Terms'],
};

export const contactServiceOptions = [
  'Website / Web app',
  'Mobile application',
  'ERP / CRM system',
  'SaaS product',
  'Business automation',
  'AI solution',
  'Digital transformation',
];
