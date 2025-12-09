import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const libsql = createClient({
  url: 'file:./prisma/dev.db',
});

const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.projectFeature.deleteMany();
  await prisma.projectDeveloper.deleteMany();
  await prisma.screenshot.deleteMany();
  await prisma.video.deleteMany();
  await prisma.project.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.developer.deleteMany();
  await prisma.projectSource.deleteMany();
  await prisma.category.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.status.deleteMany();

  console.log('Cleared existing data');

  // Seed Project Sources
  const sources = ['Fiverr', 'Upwork', 'WhatsApp', 'Wix Marketplace', 'Email', 'Outsourced', 'Copied'];
  for (const name of sources) {
    await prisma.projectSource.create({ data: { name } });
  }
  console.log('Seeded project sources');

  // Seed Categories
  const categories = ['Healthcare', 'E-commerce', 'Real Estate', 'Corporate', 'Education', 'Restaurant', 'Portfolio', 'Non-Profit'];
  for (const name of categories) {
    await prisma.category.create({ data: { name } });
  }
  console.log('Seeded categories');

  // Seed Platforms
  const platforms = ['Wix Classic', 'Wix Studio', 'MERN', 'WordPress', 'Shopify', 'Custom'];
  for (const name of platforms) {
    await prisma.platform.create({ data: { name } });
  }
  console.log('Seeded platforms');

  // Seed Statuses
  const statuses = ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
  for (const name of statuses) {
    await prisma.status.create({ data: { name } });
  }
  console.log('Seeded statuses');

  // Seed Features
  const features = [
    'Custom Product Page',
    'Wix Bookings',
    'Dashboards',
    'Listings',
    'Rental Systems',
    'Plugins',
    'API Integrations',
    'Payment Gateways',
    'AI Automations',
    'CRM',
    'Calculators',
    'Multistates',
  ];
  for (const name of features) {
    await prisma.feature.create({ data: { name } });
  }
  console.log('Seeded features');

  // Seed Developers
  const developers = ['Usama', 'Ahmed', 'Sara', 'John'];
  for (const name of developers) {
    await prisma.developer.create({ data: { name } });
  }
  console.log('Seeded developers');

  // Get created features and developers for projects
  const allFeatures = await prisma.feature.findMany();
  const allDevelopers = await prisma.developer.findMany();

  // Seed Sample Projects
  const sampleProjects = [
    {
      projectTitle: 'HealthCare Plus Portal',
      clientName: 'Dr. Smith Medical Center',
      projectSource: 'Fiverr',
      projectUrl: 'https://example-healthcare.com',
      category: 'Healthcare',
      shortDescription: 'A comprehensive healthcare portal with patient management and appointment booking system.',
      platform: 'Wix Studio',
      status: 'Completed',
      proposedBudget: 3000,
      finalizedBudget: 3500,
      estimatedDuration: '4 weeks',
      deliveredDuration: '5 weeks',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-19'),
      tagline: 'Your Health, Our Priority',
      proposal: 'Complete healthcare management system with patient portal, appointment scheduling, and medical records management.',
      featureNames: ['Wix Bookings', 'Dashboards', 'CRM'],
      developerNames: ['Usama', 'Ahmed'],
    },
    {
      projectTitle: 'Fashion E-Store',
      clientName: 'StyleHub Inc',
      projectSource: 'Upwork',
      projectUrl: 'https://example-fashion.com',
      category: 'E-commerce',
      shortDescription: 'Modern e-commerce platform for fashion products with advanced filtering and wishlist features.',
      platform: 'Wix Classic',
      status: 'Completed',
      proposedBudget: 5000,
      finalizedBudget: 4800,
      estimatedDuration: '6 weeks',
      deliveredDuration: '5 weeks',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-03-07'),
      tagline: 'Style Meets Technology',
      proposal: 'Full-featured e-commerce solution with custom product pages, payment integration, and inventory management.',
      featureNames: ['Custom Product Page', 'Payment Gateways', 'Listings'],
      developerNames: ['Usama'],
    },
    {
      projectTitle: 'Real Estate Marketplace',
      clientName: 'PropertyHub',
      projectSource: 'WhatsApp',
      projectUrl: null,
      category: 'Real Estate',
      shortDescription: 'Property listing platform with advanced search filters and agent management.',
      platform: 'Wix Studio',
      status: 'In Progress',
      proposedBudget: 8000,
      finalizedBudget: null,
      estimatedDuration: '8 weeks',
      deliveredDuration: null,
      startDate: new Date('2024-03-15'),
      endDate: null,
      tagline: 'Find Your Dream Property',
      proposal: 'Comprehensive real estate platform with property listings, advanced search, and agent dashboards.',
      featureNames: ['Listings', 'Dashboards', 'API Integrations', 'Multistates'],
      developerNames: ['Sara', 'John'],
    },
    {
      projectTitle: 'Corporate Website Redesign',
      clientName: 'TechCorp Solutions',
      projectSource: 'Email',
      projectUrl: 'https://example-techcorp.com',
      category: 'Corporate',
      shortDescription: 'Modern corporate website with team member profiles and service showcase.',
      platform: 'WordPress',
      status: 'Completed',
      proposedBudget: 2500,
      finalizedBudget: 2500,
      estimatedDuration: '3 weeks',
      deliveredDuration: '3 weeks',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-31'),
      tagline: 'Innovation Through Technology',
      proposal: 'Professional corporate website with modern design, team showcase, and service portfolio.',
      featureNames: ['Dashboards'],
      developerNames: ['Ahmed'],
    },
    {
      projectTitle: 'Online Learning Platform',
      clientName: 'EduTech Academy',
      projectSource: 'Wix Marketplace',
      projectUrl: 'https://example-edutech.com',
      category: 'Education',
      shortDescription: 'Interactive online learning platform with course management and student portal.',
      platform: 'Wix Classic',
      status: 'Completed',
      proposedBudget: 6000,
      finalizedBudget: 6500,
      estimatedDuration: '7 weeks',
      deliveredDuration: '8 weeks',
      startDate: new Date('2024-02-20'),
      endDate: new Date('2024-04-17'),
      tagline: 'Learn. Grow. Succeed.',
      proposal: 'Complete e-learning solution with course management, student dashboards, and progress tracking.',
      featureNames: ['Dashboards', 'CRM', 'API Integrations', 'Wix Bookings'],
      developerNames: ['Usama', 'Sara'],
    },
  ];

  for (const projectData of sampleProjects) {
    const { featureNames, developerNames, ...data } = projectData;

    const project = await prisma.project.create({
      data: {
        ...data,
      },
    });

    // Add features
    for (const featureName of featureNames) {
      const feature = allFeatures.find((f) => f.name === featureName);
      if (feature) {
        await prisma.projectFeature.create({
          data: {
            projectId: project.id,
            featureId: feature.id,
          },
        });
      }
    }

    // Add developers
    for (const developerName of developerNames) {
      const developer = allDevelopers.find((d) => d.name === developerName);
      if (developer) {
        await prisma.projectDeveloper.create({
          data: {
            projectId: project.id,
            developerId: developer.id,
          },
        });
      }
    }
  }

  console.log('Seeded sample projects');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
