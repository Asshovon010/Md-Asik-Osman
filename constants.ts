
import { ResumeData, SiteConfig } from './types';

export const RESUME_DATA: ResumeData = {
  name: "Md Asik Osman",
  title: "Certified QuickBooks Bookkeeper | Virtual Accounting Partner for Growing Businesses",
  summary: "I am a dedicated professional with a passion for numbers and business growth. With years of experience in bookkeeping and accounting, I help businesses streamline their financial processes and make informed decisions. My expertise lies in cleaning up chaotic financial records and setting up efficient systems that save time and ensure compliance.",
  profileImage: "./profile.jpg", // Please ensure you save your photo as 'profile.jpg' in the public folder
  contact: {
    phone: "01715463057",
    email: "asikosman010@gmail.com",
    linkedin: "www.linkedin.com/in/md-asik-osman-93a358282",
    location: "Dhaka, Bangladesh"
  },
  skills: [
    "Leadership",
    "Debate",
    "Account Management",
    "Bookkeeping",
    "Virtual Accounting"
  ],
  services: [
    {
      id: "1",
      title: "Cloud Bookkeeping",
      description: "Comprehensive management of your daily financial transactions using QuickBooks Online, ensuring your books are always up-to-date and accurate.",
      price: "$200/mo"
    },
    {
      id: "2",
      title: "Financial Reporting",
      description: "Preparation of detailed Profit & Loss statements, Balance Sheets, and Cash Flow reports to provide clear insights into your business health.",
      price: "$150/report"
    },
    {
      id: "3",
      title: "Data Clean-up & Catch-up",
      description: "Expert restructuring of disorganized historical data and catching up on backlog entries to ensure tax compliance and financial clarity.",
      price: "Custom Quote"
    },
    {
      id: "4",
      title: "Accounts Receivable/Payable",
      description: "Efficient management of invoicing, bill payments, and aging reports to optimize your cash flow and maintain good vendor relationships.",
      price: "$100/mo"
    },
    {
      id: "5",
      title: "Bank Reconciliation",
      description: "Monthly reconciliation of bank and credit card accounts to identify discrepancies and prevent fraud or accounting errors.",
      price: "$75/account"
    },
    {
      id: "6",
      title: "Software Migration",
      description: "Seamless setup and migration from manual spreadsheets or desktop systems to modern cloud accounting solutions like QuickBooks.",
      price: "Starts at $300"
    }
  ],
  testimonials: [
    {
      id: "1",
      name: "Sarah Jenkins",
      role: "CEO, TechStart Inc.",
      quote: "Asik transformed our chaotic financial records into a streamlined system. His attention to detail and knowledge of QuickBooks is unmatched."
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Founder, GreenLeaf Retail",
      quote: "Professional, timely, and incredibly knowledgeable. The monthly financial reports provided by Asik gave us the clarity we needed to make strategic growth decisions."
    },
    {
      id: "3",
      name: "David Miller",
      role: "Director, Miller Logistics",
      quote: "Finding a reliable virtual bookkeeper was tough until we met Asik. He handled our historical data cleanup efficiently and got us tax-ready in no time."
    }
  ],
  certifications: [
    {
      id: "1",
      title: "DIGITAL ACCOUNTING WITH QUICKBOOKS",
      issuer: "QuickBooks",
      year: "2023",
      link: "https://placehold.co/800x600/2563eb/white?text=QuickBooks+Certificate" // Demo Link added for preview
    },
    {
      id: "2",
      title: "Fundamentals of Digital Marketing",
      issuer: "Google Digital Garage",
      year: "2022",
      link: "#"
    },
    {
      id: "3",
      title: "QuickBooks Certified ProAdvisor",
      issuer: "Intuit",
      year: "2023",
      link: "#"
    },
    {
      id: "4",
      title: "Data Analytics Consulting Virtual Internship",
      issuer: "KPMG",
      year: "2023"
    },
    {
      id: "5",
      title: "United Nations International Children's Emergency Fund",
      issuer: "UNICEF",
      year: "2020"
    }
  ],
  education: [
    {
      id: "1",
      institution: "Govt. Shahid Suhrawardy College",
      degree: "Bachelor of Business Administration - BBA, Accounting",
      year: "Ongoing"
    },
    {
      id: "2",
      institution: "Siddheswari College",
      degree: "Higher Secondary",
      year: "2022 - 2023"
    },
    {
      id: "3",
      institution: "Motijheel Model High School & College",
      degree: "Secondary School Certificate, Business Studies",
      year: "January 2017 - December 2020"
    }
  ],
  projects: [
    {
      id: "1",
      title: "E-commerce Financial Management",
      description: "Managed full-cycle bookkeeping for an online retail business, reconciling high-volume transactions and generating monthly financial reports using QuickBooks Online."
    },
    {
      id: "2",
      title: "Historical Data Cleanup",
      description: "Restructured and categorized 2 years of disorganized financial data for a service-based client to ensure accurate tax filing and compliance."
    },
    {
      id: "3",
      title: "QuickBooks Setup & Migration",
      description: "Successfully migrated a client's manual accounting system to QuickBooks Online, setting up chart of accounts, invoicing automation, and bank feeds."
    }
  ]
};

export const INITIAL_SITE_CONFIG: SiteConfig = {
  portalWelcomeTitle: "Welcome back,",
  portalWelcomeSubtitle: "Account Status",
  uploadCardTitle: "Quick Upload",
  uploadCardHelper: "Drag & Drop file here\nPDF, Images, or Video",
  supportCardTitle: "Need Assistance?",
  supportCardText: "Have urgent accounting questions or issues with your uploads?",
  notificationUploadSuccess: "Successfully uploaded",
  notificationMaintenance: "System maintenance scheduled for Sunday"
};

export const generateSystemInstruction = (data: ResumeData) => `You are a helpful AI assistant for the portfolio website of Md Asik Osman. 
Your goal is to answer questions about Asik's professional background, skills, and education based STRICTLY on the following resume context.
If a user asks something not in the resume, politely say you don't have that information.
Keep answers professional, concise, and friendly.

Resume Context:
Name: ${data.name}
Title: ${data.title}
About: ${data.summary}
Location: ${data.contact.location}
Phone: ${data.contact.phone}
Email: ${data.contact.email}
LinkedIn: ${data.contact.linkedin}

Top Skills: ${data.skills.join(', ')}

Services Offered:
${data.services ? data.services.map(s => `- ${s.title}: ${s.description}`).join('\n') : ''}

Testimonials:
${data.testimonials ? data.testimonials.map(t => `- "${t.quote}" by ${t.name} (${t.role})`).join('\n') : ''}

Certifications:
${data.certifications.map(c => `- ${c.title} (${c.issuer})`).join('\n')}

Projects:
${data.projects.map(p => `- ${p.title}: ${p.description}`).join('\n')}

Education:
${data.education.map(e => `- ${e.degree} at ${e.institution} (${e.year})`).join('\n')}
`;

export const SYSTEM_INSTRUCTION = generateSystemInstruction(RESUME_DATA);
