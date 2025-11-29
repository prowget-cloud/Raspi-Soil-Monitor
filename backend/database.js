const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        runInitialSchema();
    }
});

function runInitialSchema() {
    db.serialize(() => {
        // Devices Table
        db.run(`CREATE TABLE IF NOT EXISTS devices (
            device_id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_name TEXT NOT NULL,
            location TEXT,
            latitude REAL,
            longitude REAL,
            status TEXT,
            threshold_moisture_low REAL,
            threshold_moisture_high REAL,
            threshold_temp_low REAL,
            threshold_temp_high REAL,
            threshold_ph_low REAL,
            threshold_ph_high REAL,
            threshold_ec_low REAL,
            threshold_ec_high REAL,
            threshold_salinity_low REAL,
            threshold_salinity_high REAL,
            threshold_nitrogen_low REAL,
            threshold_nitrogen_high REAL,
            threshold_phospor_low REAL,
            threshold_phospor_high REAL,
            threshold_potassium_low REAL,
            threshold_potassium_high REAL
        )`, (err) => {
            if (err) console.error("Error creating devices table", err);
            else {
                // Seed data for devices
                const stmt = db.prepare("INSERT OR IGNORE INTO devices (device_id, device_name, location, latitude, longitude, status, threshold_moisture_low, threshold_moisture_high, threshold_temp_low, threshold_temp_high, threshold_ph_low, threshold_ph_high) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                stmt.run(1, 'Farm_A_01', 'Bogor, West Java', -6.5950, 106.8167, 'Online', 30, 70, 20, 35, 5.5, 7.5);
                stmt.run(2, 'Field_B_02', 'Lembang, West Java', -6.8184, 107.6130, 'Online', 35, 75, 18, 30, 6.0, 7.0);
                stmt.run(3, 'Greenhouse_C_03', 'Malang, East Java', -7.9666, 112.6326, 'Offline', null, null, null, null, null, null);
                stmt.finalize();
            }
        });

        // Sensor Data Table
        db.run(`CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            device_id INTEGER NOT NULL,
            moisture_percent REAL,
            temperature_celsius REAL,
            ec_us_cm REAL,
            salinity_mg_l REAL,
            ph REAL,
            nitrogen_mg_kg REAL,
            phospor_mg_kg REAL,
            potassium_mg_kg REAL,
            FOREIGN KEY (device_id) REFERENCES devices (device_id) ON DELETE CASCADE
        )`);

        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT,
            role TEXT
        )`, (err) => {
            if (err) console.error("Error creating users table", err);
            else {
                // Seed data for users
                const stmt = db.prepare("INSERT OR IGNORE INTO users (user_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)");
                stmt.run(1, 'Agriculture Admin', 'admin@smartagri.com', 'hashed_password_1', 'Admin');
                stmt.run(2, 'Field Viewer', 'viewer@smartagri.com', 'hashed_password_2', 'Viewer');
                stmt.finalize();
            }
        });

        // Alerts Table
        db.run(`CREATE TABLE IF NOT EXISTS alerts (
            alert_id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER NOT NULL,
            alert_type TEXT,
            sensor_value REAL,
            threshold REAL,
            timestamp TEXT,
            status TEXT,
            FOREIGN KEY (device_id) REFERENCES devices (device_id) ON DELETE CASCADE
        )`, (err) => {
             if (err) console.error("Error creating alerts table", err);
             else {
                // Seed data for alerts
                const stmt = db.prepare("INSERT OR IGNORE INTO alerts (alert_id, device_id, alert_type, sensor_value, threshold, timestamp, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
                stmt.run(1, 2, 'pH Too Acidic', 5.4, 5.5, new Date(Date.now() - 3600 * 1000).toISOString(), 'Active');
                stmt.finalize();
             }
        });

        console.log("Database schema initialized.");
    });
}

module.exports = db;
