import * as SQLite from 'expo-sqlite';

export type User = {
  id: number;
  name: string;
  age: number;
  weight: number;
  height: number;
  health_notes?: string;
};

export type Activity = {
  id: number;
  user_id: number;
  type: string;
  duration_minutes: number;
  intensity: 'leve' | 'moderada' | 'intensa';
  activity_date: string; // ISO date string (YYYY-MM-DD)
};

let db: SQLite.SQLiteDatabase | null = null;

export function getDb() {
  if (!db) {
    db = SQLite.openDatabaseSync('bem_viver.db');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(database: SQLite.SQLiteDatabase) {
  database.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      weight REAL NOT NULL,
      height REAL NOT NULL,
      health_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      intensity TEXT NOT NULL,
      activity_date TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export async function upsertSingleUser(user: Omit<User, 'id'> & { id?: number }) {
  const database = getDb();

  if (user.id) {
    database.runSync(
      `UPDATE users SET name = ?, age = ?, weight = ?, height = ?, health_notes = ? WHERE id = ?`,
      [user.name, user.age, user.weight, user.height, user.health_notes ?? '', user.id],
    );
    return user.id;
  }

  const result = database.runSync(
    `INSERT INTO users (name, age, weight, height, health_notes) VALUES (?, ?, ?, ?, ?)`,
    [user.name, user.age, user.weight, user.height, user.health_notes ?? ''],
  );

  return Number(result.lastInsertRowId);
}

export function getSingleUser(): User | null {
  const database = getDb();
  const result = database.getFirstSync<User>('SELECT * FROM users LIMIT 1');
  return result ?? null;
}

export function addActivity(activity: Omit<Activity, 'id'>) {
  const database = getDb();
  const result = database.runSync(
    `INSERT INTO activities (user_id, type, duration_minutes, intensity, activity_date)
     VALUES (?, ?, ?, ?, ?)`,
    [
      activity.user_id,
      activity.type,
      activity.duration_minutes,
      activity.intensity,
      activity.activity_date,
    ],
  );
  return Number(result.lastInsertRowId);
}

export function listActivitiesBetween(startDate: string, endDate: string): Activity[] {
  const database = getDb();
  const result = database.getAllSync<Activity>(
    `SELECT * FROM activities
     WHERE activity_date BETWEEN ? AND ?
     ORDER BY activity_date DESC`,
    [startDate, endDate],
  );
  return result ?? [];
}

export function getWeeklySummary(referenceDateISO: string) {
  const database = getDb();

  const referenceDate = new Date(referenceDateISO);
  const dayOfWeek = referenceDate.getDay(); // 0 (Sun) - 6 (Sat)
  const mondayOffset = (dayOfWeek + 6) % 7;
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const start = monday.toISOString().slice(0, 10);
  const end = sunday.toISOString().slice(0, 10);

  const summary = database.getFirstSync<{
    totalMinutes: number;
    daysCount: number;
  }>(
    `
    SELECT
      COALESCE(SUM(duration_minutes), 0) as totalMinutes,
      COUNT(DISTINCT activity_date) as daysCount
    FROM activities
    WHERE activity_date BETWEEN ? AND ?
  `,
    [start, end],
  );

  return {
    totalMinutes: summary?.totalMinutes ?? 0,
    daysCount: summary?.daysCount ?? 0,
    start,
    end,
  };
}


