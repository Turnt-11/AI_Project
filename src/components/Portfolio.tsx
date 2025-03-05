import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Image as ImageIcon, Code, Kanban } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { throttleRAF } from './AnalyticsTracker';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  type: 'website' | 'language' | 'tool' | 'certification';
  link?: string;
  technologies?: string[];
  projectUrl?: string;
  imageUrls?: string[];
  iconUrl?: string;
  certificateUrl?: string;
}

const portfolioItems: PortfolioItem[] = [
  // Website projects
  {
    id: '1',
    title: 'CDL Stats App',
    description: 'A Call of Duty League statistics application that provides comprehensive match data, player performance analytics, and interactive charts. Users can track their favorite teams, view upcoming schedules, and analyze historical match data. Features include player statistics, team rankings, and tournament brackets.',
    type: 'website',
    imageUrls: ['/img/codstatss.png', '/img/stat1.png', '/img/stat2.png'],
    technologies: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'PHP', 'MySQL'],
    projectUrl: 'https://dev-kyle.tech/CodStats-App/',
  },
  {
    id: '2',
    title: 'CMS Tournament/League App',
    description: 'A comprehensive Content Management System designed for businesses and organizations to run and manage their own tournaments and leagues. Features an admin dashboard for owners to manage events, and a user-friendly frontend for participants to play and report matches. Includes detailed leaderboards and in-depth player statistics profiles for tracking performance and progress.',
    type: 'website',
    imageUrls: ['/img/cms.png', '/img/faq.png', '/img/cmss.png'],
    technologies: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'PHP', 'MySQL', 'WebHooks'],
    projectUrl: 'https://www.dev-kyle.tech/Events-CMS-App/',
  },
  {
    id: '3',
    title: 'BJ Card Counter',
    description: 'Keep track of the running & true count, Know what\'s exactly left in the deck! increase your edge with online Black Jack',
    type: 'website',
    imageUrls: ['/img/bj4.png', '/img/bj2.png'],
    technologies: ['HTML', 'CSS', 'JavaScript', 'Bootstrap','Docker'],
    projectUrl: 'https://www.dev-kyle.tech/Events-CMS-App/',
  },
  // Language items
  {
    id: 'lang1',
    title: 'HTML',
    description: 'The foundation of web development. I use HTML to create semantic, accessible, and SEO-friendly web structures that provide a solid base for modern web applications.',
    type: 'language',
    iconUrl: '/logos/html-1.svg',
    technologies: ['HTML5', 'Semantic Elements', 'Accessibility', 'SEO'],
  },
  {
    id: 'lang2',
    title: 'CSS',
    description: 'My tool for creating beautiful, responsive user interfaces. I leverage modern CSS features including Flexbox, Grid, and animations to build engaging user experiences.',
    type: 'language',
    iconUrl: '/logos/css-3.svg',
    technologies: ['CSS3', 'Flexbox', 'Grid', 'Animations', 'Bootstrap'],
  },
  {
    id: 'lang3',
    title: 'JavaScript/TypeScript',
    description: 'My primary language for full-stack development, enabling me to build dynamic and interactive web applications. I use JavaScript and TypeScript for both client-side and server-side development, leveraging frameworks like React and Node.js.',
    type: 'language',
    iconUrl: '/logos/javascript-1.svg',
    technologies: ['React', 'Node.js', 'Express', 'Next.js'],
  },
  {
    id: 'lang4',
    title: 'PHP',
    description: 'Used for server-side web development and CMS creation. PHP has been instrumental in my journey, allowing me to build dynamic websites and content management systems that are both powerful and maintainable.',
    type: 'language',
    iconUrl: '/logos/php-svgrepo-com.svg',
    technologies: ['Laravel', 'WordPress', 'MySQL'],
  },
  {
    id: 'lang5',
    title: 'SQL',
    description: 'Essential for database management and data manipulation. I use SQL to design efficient database schemas, write complex queries, and ensure data integrity in applications.',
    type: 'language',
    iconUrl: '/logos/mysql-logo-pure.svg',
    technologies: ['MySQL', 'PostgreSQL', 'Database Design', 'Query Optimization'],
  },
  {
    id: 'lang6',
    title: 'Python',
    description: 'A versatile programming language I use for backend development, data analysis, and automation. Python\'s clean syntax and extensive libraries make it perfect for building scalable web applications with Django and Flask, as well as creating efficient automation scripts.',
    type: 'language',
    iconUrl: '/logos/python-5.svg',
    technologies: ['Django', 'Flask', 'FastAPI', 'Pandas'],
  },
  {
    id: 'lang7',
    title: 'C#',
    description: 'A versatile language for building a wide range of applications, from web to mobile to gaming. I use C# for developing robust backend services and exploring game development with Unity.',
    type: 'language',
    iconUrl: '/logos/c-sharp-programming-language-icon.svg',
    technologies: ['.NET', 'ASP.NET', 'Unity'],
  },
  // Tools
  {
    id: 'tool1',
    title: 'Git',
    description: 'Version control system for tracking changes in source code during software development.',
    type: 'tool',
    iconUrl: '/logos/git.webp',
    technologies: ['Version Control', 'Collaboration'],
  },
  {
    id: 'tool2',
    title: 'Docker',
    description: 'Platform for developing, shipping, and running applications in containers.',
    type: 'tool',
    iconUrl: '/logos/docker.webp',
    technologies: ['Containerization', 'Microservices'],
  },
  {
    id: 'tool3',
    title: 'Kubernetes',
    description: 'System for automating deployment, scaling, and management of containerized applications.',
    type: 'tool',
    iconUrl: '/logos/k8s.webp',
    technologies: ['Orchestration', 'Scalability'],
  },
  {
    id: 'tool4',
    title: 'Visual Studio Code',
    description: 'Source-code editor made by Microsoft for Windows, Linux, and macOS.',
    type: 'tool',
    iconUrl: '/logos/vscode.webp',
    technologies: ['Code Editing', 'Extensions'],
  },
  // Additional Tools for Full Stack Development
  {
    id: 'tool5',
    title: 'IBM Cloud',
    description: 'Enterprise-grade cloud computing platform with a comprehensive set of services for building, deploying, and managing applications globally.',
    type: 'tool',
    iconUrl: '/logos/ibmcloud.webp',
    technologies: ['Cloud Foundry', 'Kubernetes', 'Watson', 'DevOps', 'Databases'],
  },
  {
    id: 'tool6',
    title: 'CI/CD',
    description: 'Continuous Integration and Continuous Deployment pipelines for automating testing and deployment processes.',
    type: 'tool',
    iconUrl: '/logos/cicd.webp',
    technologies: ['Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI'],
  },
  {
    id: 'tool7',
    title: 'Nginx',
    description: 'High-performance web server and reverse proxy server used for serving web applications and load balancing.',
    type: 'tool',
    iconUrl: '/logos/nginx.webp',
    technologies: ['Web Server', 'Reverse Proxy', 'Load Balancing'],
  },
  {
    id: 'tool8',
    title: 'Redis',
    description: 'In-memory data structure store used as a database, cache, and message broker for high-performance applications.',
    type: 'tool',
    iconUrl: '/logos/redis.webp',
    technologies: ['Caching', 'Session Storage', 'Pub/Sub'],
  },
  {
    id: 'tool9',
    title: 'MongoDB',
    description: 'NoSQL database program that uses JSON-like documents with optional schemas for modern application development.',
    type: 'tool',
    iconUrl: '/logos/mongodb.webp',
    technologies: ['NoSQL', 'Document Database', 'Atlas'],
  },
  {
    id: 'tool10',
    title: 'Webpack',
    description: 'Static module bundler for modern JavaScript applications, processing and optimizing code for production.',
    type: 'tool',
    iconUrl: '/logos/webpack.webp',
    technologies: ['Module Bundling', 'Asset Management', 'Code Splitting'],
  },
  {
    id: 'tool11',
    title: 'Postman',
    description: 'API platform for building and using APIs, simplifying the testing and documentation process.',
    type: 'tool',
    iconUrl: '/logos/postman.webp',
    technologies: ['API Testing', 'Documentation', 'Automation'],
  },
  {
    id: 'tool12',
    title: 'Terraform',
    description: 'Infrastructure as Code tool for building, changing, and versioning infrastructure safely and efficiently.',
    type: 'tool',
    iconUrl: '/logos/terraform.webp',
    technologies: ['IaC', 'Cloud Provisioning', 'Configuration Management'],
  },
  // Certifications
  {
    id: 'cert1',
    title: 'HTML, CSS, and Javascript for Web Developers',
    description: 'This course covered the fundamentals of web development using HTML, CSS, and JavaScript. It began with HTML and CSS, teaching how to structure and style modern web pages. I also learned about responsive design, ensuring web pages adapt to different screen sizes without requiring manual zooming. The course then introduced JavaScript, focusing on how to create interactive web applications. Finally, I explored Ajax, which allows web pages to fetch and display data dynamically from a server without needing a full reload. By the end, I gained the skills to build functional, responsive, and interactive web applications.',
    type: 'certification',
    iconUrl: '/logos/HTML-CSS-JS.webp',
    certificateUrl: 'https://coursera.org/share/e7c8fbf4d84c9758a0caaad524347984'
  },
  {
    id: 'cert2',
    title: 'IBM Front-End Developer',
    description: ' In this Professional Certificate, learners developed the core skils ' +
        'needed to design and develop web and front-end applications. The ' +
        'Certificate holder has demonstrated the ability to build web pages ' +
        'using HTML, CSS, and JavaScript; apply user interface and user ' +
        'experience (UI/UX) best practices and principles; manage code using ' +
        'GitHub repositories and branches; create applications using front-end ' +
        'frameworks, such as React JS; test and debug applications; deploy ' +
        'applications using automated build tools; and create a fu ly functional ' +
        'front-ends for dynamic apps that interact with external/backend ' +
        'services using RESTful APIs. The certificate holder should be ready to ' +
        'take on the chalenges of an entry-level front end developer role.',
    type: 'certification',
    iconUrl: '/logos/IBM-Front-End-Developer.webp',
    certificateUrl: 'https://coursera.org/share/1e0ba2ed74f189b62a32520e8372dee8'
  },
  {
    id: 'cert3',
    title: 'IBM DevOps and Software Engineering',
    description: ' In this Professional Certificate, learners developed essential knowledge ' +
        'and skils to perform the many tasks in an entry-level DevOps ' +
        'practitioner role. By completing over a dozen courses and projects in ' +
        'the program, the earner of this Professional Certificate has ' +
        'demonstrated a firm grasp and practical experience to: adopt a ' +
        'DevOps mindset in Software Engineering using Agile and Scrum ' +
        'methodologies and Cloud Native tools and technologies. The holder ' +
        'can develop applications in Python, automate tasks using Shel scripts, ' +
        'use colaborative coding platforms like GitHub, compose applications ' +
        'using Microservices, deploy them using Containers ' +
        '(Docker/Kubernetes/OpenShift) & Serverless technologies; and employ ' +
        'tools for Automation, Continuous Integration (CI) and Continuous ' +
        'Development (CD)',
    type: 'certification',
    iconUrl: '/logos/IBM-Devops-Engineering.webp',
    certificateUrl: 'https://coursera.org/share/9ac7a487ffd6fc58564d9669699c9f42'
  },
  {
    id: 'cert4',
    title: 'IBM Applied DevOps Engineering',
    description: 'In this Professional Certificate, learners mastered DevOps practices, ' +
      'Agile methodologies and Cloud Native Technologies. The holders of ' +
      'this certificate completed numerous hands-on labs and projects to ' +
      'gain practical DevOps experience. They utilized Scrum and wrote and ' +
      'executed agile user stories using a Kanban board; built & deployed ' +
      'Python microservices using Docker containers, Kubernetes, OpenShift, ' +
      '& Serverless; developed & executed unit tests with test driven ' +
      'development (TDD) methods; applied the process of Continuous ' +
      'Integration / Continuous Development (CI/CD) with GitHub Actions ' +
      'and Tekton, added monitoring, logging & observability and ensured ' +
      'security. The completers of the Professional Certificate are now ready ' +
      'to take on Software Engineering challenges using a DevOps mindset.',
    type: 'certification',
    iconUrl: '/logos/IBM-Applied-DevOps.webp',
    certificateUrl: 'https://coursera.org/share/7991b45a16a4639077b436a3205afd73'
  },
];

// Add interface for form data
interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// At the top of the file, add this interface
interface AnimationVariants {
  hidden: { opacity: number; y?: number };
  show: { opacity: number; y?: number };
}

// Custom hook for typing animation
function useTypingEffect(text: string, speed: number = 5, startTyping: boolean = false) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Only start typing if startTyping is true
    if (!startTyping) {
      return;
    }
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, speed, text, startTyping]);

  // Reset function to use when switching tabs
  const reset = () => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  };

  return { displayedText, isComplete, reset };
}

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('Bio');
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Bio text sections
  const bioTitle = "Full Stack Software Developer | Aspiring DevOps Engineer & Ethical Hacker";
  const bioParagraph1 = "I am a results-driven Full Stack Software Developer with over a decade of experience in web development. My journey began in 2012 with static HTML, CSS, and JavaScript, gradually evolving into dynamic web applications using jQuery, Bootstrap, and PHP/MySQL for CMS development.";
  const bioParagraph2 = "Today, I specialize in designing and building secure, high-performance, and scalable web applications. My expertise spans cloud-native technologies such as Python, Node.js, and React.js, as well as frameworks like Django and Flask. I also leverage Docker and Kubernetes to architect microservices that drive business growth and enhance user engagement.";
  const bioParagraph3 = "In addition to software development, I am actively expanding my knowledge in cybersecurity, with a focus on web application penetration testing and security best practices. My long-term goal is to transition into ethical hacking and red teaming, ensuring that the applications I develop are resilient against modern security threats. By integrating security-first principles into my work, I aim to bridge the gap between development and cybersecurity, creating robust, attack-resistant systems.";

  // Typing effect hooks with sequential start
  const titleTyping = useTypingEffect(bioTitle, 5, true);
  const paragraph1Typing = useTypingEffect(bioParagraph1, 5, titleTyping.isComplete);
  const paragraph2Typing = useTypingEffect(bioParagraph2, 5, paragraph1Typing.isComplete);
  const paragraph3Typing = useTypingEffect(bioParagraph3, 5, paragraph2Typing.isComplete);

  // Reset typing animations when switching tabs
  useEffect(() => {
    if (activeTab !== 'Bio') {
      // Reset all typing animations when not on Bio tab
      titleTyping.reset();
      paragraph1Typing.reset();
      paragraph2Typing.reset();
      paragraph3Typing.reset();
    }
  }, [activeTab]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'website':
        return <ExternalLink className="w-5 h-5" />;
      case 'language':
        return <Code className="w-5 h-5" />;
      case 'tool':
        return <ImageIcon className="w-5 h-5" />;
      case 'certification':
        return <ImageIcon className="w-5 h-5" />;
      default:
        return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Check if we have a session first
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session, handle as anonymous message
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message,
            user_id: session?.user?.id || null, // Make user_id optional
          }
        ]);

      if (error) {
        console.error('Submission error:', error);
        throw error;
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Bio':
        return (
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            className="p-8 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-500/20"
          >
            <h2 className="text-3xl font-bold text-cyan-300 mb-8">About Me</h2>
            <div className="text-purple-200/90 space-y-4">
  <p>
    I am a results-driven Full Stack Software Developer with expertise in React.js, Express.js, MongoDB, and cloud-native technologies. My journey in web development began in 2012 with static HTML, CSS, and JavaScript, gradually evolving into dynamic applications using jQuery, Bootstrap, and PHP/MySQL for CMS development. Over the years, I have built secure, high-performance, and scalable web applications, emphasizing DevOps practices, automation, and AI-driven development.
  </p>
  <p>
    I specialize in designing and developing full-stack applications that seamlessly integrate front-end frameworks like React.js with backend services powered by Node.js, Express.js, and MongoDB. Additionally, I have experience working with C# and ASP.NET, contributing to projects such as visitor and contractor check-in systems utilizing badge-scanning functionality. My background includes esports CMS development, sensor data integration, and leveraging APIs and microservices to enhance user interaction and system efficiency.
  </p>
  <p>
    Beyond software development, I am continuously expanding my expertise in DevOps and cybersecurity. I have earned multiple certifications, including:
  </p>
  <ul className="list-disc pl-6 space-y-2">
    <li>
      <strong>Front-End Development Certificate</strong> – Proficient in HTML, CSS, JavaScript, UI/UX best practices, GitHub version control, React.js, RESTful APIs, testing, debugging, and deploying applications.
    </li>
    <li>
      <strong>Web Development Fundamentals Course</strong> – Solid foundation in responsive design, JavaScript interactivity, and Ajax for dynamic data handling.
    </li>
    <li>
      <strong>DevOps Practitioner Certificate</strong> – Hands-on experience with Agile, Scrum, Python, shell scripting, microservices, Docker, Kubernetes, OpenShift, CI/CD, and cloud-native technologies.
    </li>
    <li>
      <strong>Advanced DevOps Certificate</strong> – In-depth knowledge of TDD, CI/CD pipelines (GitHub Actions, Tekton), monitoring, logging, observability, and security best practices.
    </li>
  </ul>
  <p>
    I am also strengthening my expertise in cybersecurity and web penetration testing to become a more well-rounded full-stack developer. This includes mastering security best practices, vulnerability assessment, ethical hacking techniques, and implementing robust security measures in web applications. By understanding potential threats and developing proactive defense strategies, I build more secure, resilient, and attack-resistant applications from the ground up.
  </p>
</div>

          </motion.div>
        );
      case 'Websites':
        return (
          <motion.div 
            initial={false}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {portfolioItems.filter(item => item.type === 'website').map((item) => (
              <PortfolioCard key={item.id} item={item} getIcon={getIcon} />
            ))}
          </motion.div>
        );
      case 'Languages':
        return (
          <motion.div 
            initial={false}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {portfolioItems.filter(item => item.type === 'language').map((item) => (
              <PortfolioCard key={item.id} item={item} getIcon={getIcon} />
            ))}
          </motion.div>
        );
      case 'Tools':
        return (
          <motion.div 
            initial={false}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {portfolioItems.filter(item => item.type === 'tool').map((item) => (
              <PortfolioCard key={item.id} item={item} getIcon={getIcon} />
            ))}
          </motion.div>
        );
      case 'Certifications':
        return (
          <motion.div 
            initial={false}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {portfolioItems.filter(item => item.type === 'certification').map((item) => (
              <PortfolioCard key={item.id} item={item} getIcon={getIcon} />
            ))}
          </motion.div>
        );
      case 'Contact':
        return (
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            className="p-8 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-500/20"
          >
            <h2 className="text-3xl font-bold text-cyan-300 mb-8">Get in Touch</h2>
            
            {/* Social Links - Only LinkedIn */}
            <div className="w-full mb-12">
              <a
                href="https://www.linkedin.com/in/kyle-michael-brown/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-6 rounded-lg bg-black/30 border border-purple-500/10 hover:border-cyan-500/30 transition-all group"
              >
                <div className="text-purple-300 group-hover:text-cyan-300">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-cyan-300 group-hover:text-cyan-200">LinkedIn</h3>
                  <p className="text-purple-200/70">Kyle Michael Brown</p>
                </div>
              </a>
            </div>

            {/* Transition Text */}
            <p className="text-center text-lg text-purple-200 mb-12">
              Contact me via email by filling out the form below.
            </p>

            {/* Contact Form */}
            <form 
              onSubmit={handleSubmit}
              className="w-full bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-purple-500/10"
            >
              <div>
                <label className="block text-cyan-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-black/30 border border-purple-500/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-purple-200/50"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-cyan-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-black/30 border border-purple-500/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-purple-200/50"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-cyan-300 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-black/30 border border-purple-500/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-purple-200/50 h-32"
                  placeholder="Your message"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg ${
                  isSubmitting 
                    ? 'bg-purple-500/50 cursor-not-allowed' 
                    : 'bg-cyan-600/90 hover:bg-cyan-500'
                } text-white font-semibold transition-colors`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <p className="text-green-400 text-center">Message sent successfully!</p>
              )}
              {submitStatus === 'error' && (
                <p className="text-red-400 text-center">Failed to send message. Please try again.</p>
              )}
            </form>
          </motion.div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    // Preload critical images
    const imagesToPreload = portfolioItems
      .filter(item => item.type === 'certification' || item.type === 'tool')
      .map(item => item.iconUrl)
      .filter(Boolean) as string[];
      
    let loadedCount = 0;
    const totalImages = imagesToPreload.length;
    
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.src = src;
    });
    
    // If no images to preload, set as loaded
    if (totalImages === 0) {
      setImagesLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Set a flag in localStorage to indicate this is not the first visit
    // This can help with optimizing animations on return visits
    localStorage.setItem('visited', 'true');
    
    // Force a repaint to help with initial rendering
    document.body.style.display = 'none';
    document.body.offsetHeight; // Force a repaint
    document.body.style.display = '';
    
  }, []);

  return (
    <div className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 z-10">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-cyan-300 mb-6">
            Kyle's Portfolio
          </h1>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-12 space-x-4 flex-wrap gap-y-4">
          {['Bio', 'Websites', 'Languages', 'Tools', 'Certifications', 'Contact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full transition-all backdrop-blur-sm ${
                activeTab === tab 
                  ? 'bg-cyan-600/90 text-white shadow-lg shadow-cyan-500/30' 
                  : 'bg-black/30 text-purple-300 hover:bg-black/50 hover:text-cyan-300 border border-purple-500/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="backdrop-blur-md">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Update PortfolioCard component to add a "Show More" button for certification descriptions
function PortfolioCard({ 
  item, 
  getIcon 
}: { 
  item: PortfolioItem; 
  getIcon: (type: string) => React.ReactNode;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Character limit for the truncated description
  const descriptionLimit = 150;
  
  // Check if description needs truncation
  const needsTruncation = item.description.length > descriptionLimit;
  
  // Get the truncated description
  const truncatedDescription = needsTruncation 
    ? `${item.description.substring(0, descriptionLimit)}...` 
    : item.description;

  const cardVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const handleNextImage = () => {
    if (item.imageUrls && item.imageUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % item.imageUrls.length);
    }
  };

  const handlePrevImage = () => {
    if (item.imageUrls && item.imageUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + item.imageUrls.length) % item.imageUrls.length);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="group relative overflow-hidden rounded-xl bg-black/30 backdrop-blur-md border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20 hover:border-emerald-400/70 hover:shadow-emerald-400/30 transition-all duration-300"
    >
      {/* Image Section for websites */}
      {item.type === 'website' && item.imageUrls && item.imageUrls.length > 0 && (
        <div className="relative w-full h-0 pb-[56.25%] overflow-hidden">
        <img
            src={item.imageUrls[currentImageIndex]}
          alt={item.title}
            className="absolute top-0 left-0 w-full h-full object-contain bg-black/50 rounded-t-xl"
            onError={(e) => {
              console.error(`Failed to load image: ${item.imageUrls?.[currentImageIndex]}`);
              e.currentTarget.src = '/img/placeholder.png'; // Fallback image
            }}
          />
          
          {/* Navigation buttons */}
          <button 
            onClick={handlePrevImage} 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full z-10 transition-all"
            aria-label="Previous image"
          >
            &#10094;
          </button>
          <button 
            onClick={handleNextImage} 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full z-10 transition-all"
            aria-label="Next image"
          >
            &#10095;
          </button>
          
          {/* Image indicators */}
          {item.imageUrls.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 p-2 z-10">
              {item.imageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentImageIndex 
                      ? 'bg-white scale-110' 
                      : 'bg-gray-500/70 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                ></button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Image Section for certifications */}
      {item.type === 'certification' && item.iconUrl && (
        <div className="relative w-full h-0 pb-[56.25%] overflow-hidden">
          <img
            src={item.iconUrl}
            alt={`${item.title} certificate`}
            className="absolute top-0 left-0 w-full h-full object-contain bg-black/50 rounded-t-xl"
            onError={(e) => {
              console.error(`Failed to load certificate image: ${item.iconUrl}`);
              e.currentTarget.src = '/img/placeholder.png'; // Fallback image
            }}
        />
      </div>
      )}
      
      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-cyan-300">{item.title}</h3>
          {item.type !== 'website' && item.type !== 'certification' && item.iconUrl && (
            <img 
              src={item.iconUrl} 
              alt={`${item.title} logo`} 
              className="w-12 h-12" 
              onError={(e) => {
                console.error(`Failed to load icon: ${item.iconUrl}`);
                e.currentTarget.src = '/img/placeholder.png';
              }}
            />
          )}
        </div>

        {/* Description with Show More/Less button for certifications */}
        <div>
        <p className="text-purple-200/90 text-sm">
            {item.type === 'certification' && needsTruncation 
              ? (showFullDescription ? item.description : truncatedDescription)
              : item.description
            }
          </p>
          
          {/* Show More/Less button only for certifications with long descriptions */}
          {item.type === 'certification' && needsTruncation && (
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              {showFullDescription ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>

        {/* Technologies */}
        {item.technologies && (
          <div className="pt-2">
            <h4 className="text-sm font-semibold text-cyan-300 mb-2">Technologies Used:</h4>
            <div className="flex flex-wrap gap-2">
              {item.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* View Certificate button - For certification items only */}
        {item.type === 'certification' && (
        <div className="flex items-center space-x-4 pt-4">
            <a
              href={item.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-600/80 text-white rounded-lg hover:bg-green-500 transition-colors group"
            >
              View Certificate
              <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
} 