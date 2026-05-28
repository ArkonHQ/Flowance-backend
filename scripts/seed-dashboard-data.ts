import { db } from '../src/config/db';
import { clients, projects, tasks, invoices, users } from '../src/db/schema';
import { timeEntries } from '../src/db/schema/tables/time-entries';
import { eq, sql } from 'drizzle-orm';

const ownerId = 'ejPMqF3Zq6i7gs3807SZNtZqSkO9GqW5';

async function seedData() {
  console.log('Seeding mock dashboard data for owner:', ownerId);

  // 1. Ensure user 'Curse' exists (we verified it does)

  // 2. Insert developer users in the 'users' table (for task assignments)
  console.log('Inserting task assignment users...');
  // Let's delete existing developers if any
  await db.execute(sql`DELETE FROM users WHERE email LIKE 'developer%@example.com'`);
  
  const devInsert = await db.insert(users).values([
    { name: 'Sarah Connor', email: 'developer1@example.com', password: 'hashedpassword' },
    { name: 'John Doe', email: 'developer2@example.com', password: 'hashedpassword' },
    { name: 'James Smith', email: 'developer3@example.com', password: 'hashedpassword' },
  ]).returning({ id: users.id });
  const devIds = devInsert.map(d => d.id);

  // 3. Clear existing clients, projects, tasks, invoices, time entries for this owner to start fresh
  console.log('Clearing old owner data...');
  await db.execute(sql`DELETE FROM invoices WHERE owner_id = ${ownerId}`);
  await db.execute(sql`DELETE FROM tasks WHERE owner_id = ${ownerId}`);
  await db.execute(sql`DELETE FROM projects WHERE owner_id = ${ownerId}`);
  await db.execute(sql`DELETE FROM clients WHERE owner_id = ${ownerId}`);

  // 4. Create Clients
  console.log('Creating clients...');
  const clientInsert = await db.insert(clients).values([
    { name: 'Stark Industries', company: 'Stark Ind.', email: 'pepper@stark.com', ownerId, status: 'vip', totalProjects: 3, totalRevenue: '145000.00' },
    { name: 'Wayne Enterprises', company: 'Wayne Ent.', email: 'alfred@wayne.com', ownerId, status: 'active', totalProjects: 2, totalRevenue: '85000.00' },
    { name: 'Oscorp Industries', company: 'Oscorp', email: 'norman@oscorp.com', ownerId, status: 'at_risk', totalProjects: 1, totalRevenue: '32000.00' },
    { name: 'Umbrella Corporation', company: 'Umbrella Corp', email: 'albert@umbrella.com', ownerId, status: 'inactive', totalProjects: 1, totalRevenue: '15000.00' },
  ]).returning({ id: clients.id, name: clients.name });

  const stark = clientInsert.find(c => c.name === 'Stark Industries')!.id;
  const wayne = clientInsert.find(c => c.name === 'Wayne Enterprises')!.id;
  const oscorp = clientInsert.find(c => c.name === 'Oscorp Industries')!.id;
  const umbrella = clientInsert.find(c => c.name === 'Umbrella Corporation')!.id;

  // 5. Create Projects
  console.log('Creating projects...');
  const projectInsert = await db.insert(projects).values([
    // Active / VIP Projects
    { title: 'Arc Reactor Website Redesign', description: 'Rebuilding Stark Industries frontend with Next.js & Tailwind CSS', status: 'active', ownerId, clientId: stark, budget: '50000.00', deadline: new Date(Date.now() + 5 * 24 * 3600 * 1000) },
    { title: 'Wayne Bat-Computer UI', description: 'Dark theme visualization dashboards using Highcharts & WebSockets', status: 'active', ownerId, clientId: wayne, budget: '75000.00', deadline: new Date(Date.now() + 15 * 24 * 3600 * 1000) },
    { title: 'Stark HUD Mobile Application', description: 'React Native companion app for iron suit telemetry', status: 'active', ownerId, clientId: stark, budget: '90000.00', deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000) }, // Near deadline, progress < 50% makes it at risk!
    
    // Planning / At risk / Completed
    { title: 'Oscorp Serum Delivery System', description: 'Planning tracking database schema & REST API development', status: 'planning', ownerId, clientId: oscorp, budget: '32000.00', deadline: new Date(Date.now() - 2 * 24 * 3600 * 1000) }, // Overdue, progress < 50% makes it at risk!
    { title: 'T-Virus Antidote E-Commerce', description: 'Shopify integration for vaccines', status: 'completed', ownerId, clientId: umbrella, budget: '15000.00', deadline: new Date(Date.now() - 10 * 24 * 3600 * 1000) },
  ]).returning({ id: projects.id, title: projects.title });

  const arcReactorProj = projectInsert.find(p => p.title === 'Arc Reactor Website Redesign')!.id;
  const batComputerProj = projectInsert.find(p => p.title === 'Wayne Bat-Computer UI')!.id;
  const starkHudProj = projectInsert.find(p => p.title === 'Stark HUD Mobile Application')!.id;
  const serumProj = projectInsert.find(p => p.title === 'Oscorp Serum Delivery System')!.id;
  const ecomProj = projectInsert.find(p => p.title === 'T-Virus Antidote E-Commerce')!.id;

  // 6. Create Tasks (completed, upcoming, workloads)
  console.log('Creating tasks...');
  const taskInsert = await db.insert(tasks).values([
    // Tasks Completed This Week (completedAt >= start of week)
    { title: 'Design landing page mockup', status: 'done', priority: 'high', ownerId, projectId: arcReactorProj, completedAt: new Date(), assignedTo: devIds[0], deadline: new Date() },
    { title: 'Integrate Better Auth', status: 'done', priority: 'urgent', ownerId, projectId: arcReactorProj, completedAt: new Date(), assignedTo: devIds[0], deadline: new Date() },
    { title: 'Configure Database & Drizzle schemas', status: 'done', priority: 'medium', ownerId, projectId: batComputerProj, completedAt: new Date(Date.now() - 24 * 3600 * 1000), assignedTo: devIds[1], deadline: new Date() },
    
    // Upcoming tasks (deadline in next 7 days, NOT DONE)
    { title: 'Implement dark/light theme switchers', status: 'in_progress', priority: 'medium', ownerId, projectId: arcReactorProj, deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000), assignedTo: devIds[0] },
    { title: 'Telemetry WebSocket connection optimization', status: 'in_progress', priority: 'high', ownerId, projectId: starkHudProj, deadline: new Date(Date.now() + 3 * 24 * 3600 * 1000), assignedTo: devIds[1] },
    { title: 'Refactor chart performance & re-renders', status: 'todo', priority: 'urgent', ownerId, projectId: batComputerProj, deadline: new Date(Date.now() + 5 * 24 * 3600 * 1000), assignedTo: devIds[2] },
    { title: 'Write unit tests for authentication logic', status: 'todo', priority: 'low', ownerId, projectId: arcReactorProj, deadline: new Date(Date.now() + 6 * 24 * 3600 * 1000), assignedTo: devIds[0] },

    // Incomplete/overdue projects tasks
    { title: 'Create DB tables for Oscorp Project', status: 'todo', priority: 'high', ownerId, projectId: serumProj, deadline: new Date(Date.now() - 5 * 24 * 3600 * 1000), assignedTo: devIds[2] }
  ]).returning({ id: tasks.id, title: tasks.title });

  const designLandingTaskId = taskInsert.find(t => t.title === 'Design landing page mockup')!.id;
  const databaseSchemaTaskId = taskInsert.find(t => t.title === 'Configure Database & Drizzle schemas')!.id;

  // 7. Create Time Entries (total hours, charts)
  console.log('Creating time entries...');
  await db.insert(timeEntries).values([
    { taskId: designLandingTaskId, userId: devIds[0], hours: '12.50', description: 'Wrote layout and landing UI components', date: new Date() },
    { taskId: databaseSchemaTaskId, userId: devIds[1], hours: '28.00', description: 'Wrote database connections and entity schemas', date: new Date() },
  ]);

  // 8. Create Invoices (Revenue vs Unpaid, trends)
  console.log('Creating invoices...');
  await db.insert(invoices).values([
    // Paid invoices (count towards Total Revenue)
    { amount: '45000.00', status: 'paid', ownerId, clientId: stark, projectId: arcReactorProj, paidAt: new Date(Date.now() - 15 * 24 * 3600 * 1000), dueDate: new Date(Date.now() - 25 * 24 * 3600 * 1000) },
    { amount: '15000.00', status: 'paid', ownerId, clientId: umbrella, projectId: ecomProj, paidAt: new Date(Date.now() - 30 * 24 * 3600 * 1000), dueDate: new Date(Date.now() - 40 * 24 * 3600 * 1000) },
    { amount: '35000.00', status: 'paid', ownerId, clientId: wayne, projectId: batComputerProj, paidAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), dueDate: new Date(Date.now() - 15 * 24 * 3600 * 1000) },

    // Unpaid/Sent/Overdue invoices (count towards Unpaid Amount / Unpaid Invoices)
    { amount: '50000.00', status: 'sent', ownerId, clientId: stark, projectId: starkHudProj, dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000) },
    { amount: '32000.00', status: 'overdue', ownerId, clientId: oscorp, projectId: serumProj, dueDate: new Date(Date.now() - 5 * 24 * 3600 * 1000) },

    // ── PAST MONTH invoices (for trend comparisons) ──
    // Paid invoices from last month (these define last month's totalRevenue)
    { amount: '25000.00', status: 'paid', ownerId, clientId: stark, projectId: arcReactorProj, paidAt: new Date(Date.now() - 45 * 24 * 3600 * 1000), dueDate: new Date(Date.now() - 55 * 24 * 3600 * 1000), createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000) },
    { amount: '10000.00', status: 'paid', ownerId, clientId: wayne, projectId: batComputerProj, paidAt: new Date(Date.now() - 40 * 24 * 3600 * 1000), dueDate: new Date(Date.now() - 50 * 24 * 3600 * 1000), createdAt: new Date(Date.now() - 55 * 24 * 3600 * 1000) },

    // Past month sent/overdue invoices (for last month unpaid amount comparison)
    { amount: '18000.00', status: 'sent', ownerId, clientId: oscorp, projectId: serumProj, dueDate: new Date(Date.now() - 20 * 24 * 3600 * 1000), createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000) },
  ]);

  // 9. Create PAST MONTH tasks (completed last month, for trend comparison)
  console.log('Creating past-month tasks for trend data...');
  const pastMonthTasks = await db.insert(tasks).values([
    { title: 'Setup CI/CD pipeline (last month)', status: 'done', priority: 'high', ownerId, projectId: arcReactorProj, completedAt: new Date(Date.now() - 40 * 24 * 3600 * 1000), assignedTo: devIds[0], deadline: new Date(Date.now() - 45 * 24 * 3600 * 1000) },
    { title: 'Create wireframes (last month)', status: 'done', priority: 'medium', ownerId, projectId: batComputerProj, completedAt: new Date(Date.now() - 38 * 24 * 3600 * 1000), assignedTo: devIds[1], deadline: new Date(Date.now() - 42 * 24 * 3600 * 1000) },
  ]).returning({ id: tasks.id, title: tasks.title });

  // 10. Create PAST MONTH time entries (for trend comparison)
  console.log('Creating past-month time entries for trend data...');
  await db.insert(timeEntries).values([
    { taskId: pastMonthTasks[0].id, userId: devIds[0], hours: '8.00', description: 'Pipeline setup work (last month)', date: new Date(Date.now() - 40 * 24 * 3600 * 1000) },
    { taskId: pastMonthTasks[1].id, userId: devIds[1], hours: '15.00', description: 'Wireframe creation (last month)', date: new Date(Date.now() - 38 * 24 * 3600 * 1000) },
  ]);

  console.log('Database seeded successfully with dashboard test datasets!');
}

seedData().catch((e) => {
  console.error('Seeding error:', e);
  process.exit(1);
}).then(() => process.exit(0));
