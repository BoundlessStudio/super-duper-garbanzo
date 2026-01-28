import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import { tasks, comments } from "./schema";

const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);

const plusDays = (days: number) => {
	const today = new Date();
	today.setDate(today.getDate() + days);
	return today.toISOString().slice(0, 10);
};

const demoTasks = [
	{
		id: nanoid(),
		name: "Design onboarding flow",
		description: "Sketch welcome screens and checklist.",
		assignment: "Alex Kim",
		dueDate: plusDays(2),
		status: "In Progress" as const,
		createdAt: new Date().toISOString(),
	},
	{
		id: nanoid(),
		name: "Ship metrics dashboard",
		description: "Finalize KPI tiles and alerts.",
		assignment: "Sam Lee",
		dueDate: plusDays(7),
		status: "Not Started" as const,
		createdAt: new Date().toISOString(),
	},
	{
		id: nanoid(),
		name: "Resolve billing webhook",
		description: "Investigate 500s on retry path.",
		assignment: "Jordan Patel",
		dueDate: plusDays(1),
		status: "Blocked" as const,
		createdAt: new Date().toISOString(),
	},
];

const demoComments = [
	"UX reviewed first pass.",
	"Awaiting stakeholder inputs.",
	"Webhook retries failing after 3rd attempt.",
];

async function seed() {
	console.log("Seeding database...");

	// Wipe existing data (comments first due to foreign key)
	console.log("Clearing existing data...");
	db.delete(comments).run();
	db.delete(tasks).run();
	console.log("Existing data cleared.");

	// Insert tasks
	for (let i = 0; i < demoTasks.length; i++) {
		const task = demoTasks[i];
		db.insert(tasks).values(task).run();
		console.log(`Created task: ${task.name}`);

		// Insert comment for this task
		db.insert(comments).values({
			id: nanoid(),
			taskId: task.id,
			activity: "Note",
			note: demoComments[i],
			date: new Date().toISOString(),
			author: "System",
		}).run();
		console.log(`  Added comment: ${demoComments[i]}`);
	}

	console.log("Seeding complete!");
}

seed();
