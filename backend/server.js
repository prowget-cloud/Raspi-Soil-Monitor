const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3001;

// --- MIDDLEWARE ---
app.use(cors()); // Enable CORS for development
app.use(express.json()); // To parse JSON bodies
app.use(express.static(path.join(__dirname, '../dist'))); // Serve static files from the React app build

// --- API ROUTES ---

// Helper function for DB queries
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) { err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes }); });
});
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

// GET all devices
app.get('/api/devices', async (req, res) => {
    try {
        const devices = await dbAll("SELECT * FROM devices");
        res.json(devices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADD a new device
app.post('/api/devices', async (req, res) => {
    const d = req.body;
    
    // --- VALIDATION ---
    if (!d || !d.device_name) {
        return res.status(400).json({ error: 'device_name is a required field.' });
    }

    const sql = `INSERT INTO devices (device_name, location, latitude, longitude, status, threshold_moisture_low, threshold_moisture_high, threshold_temp_low, threshold_temp_high, threshold_ph_low, threshold_ph_high, threshold_ec_low, threshold_ec_high, threshold_salinity_low, threshold_salinity_high, threshold_nitrogen_low, threshold_nitrogen_high, threshold_phospor_low, threshold_phospor_high, threshold_potassium_low, threshold_potassium_high) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    try {
        const result = await dbRun(sql, [d.device_name, d.location, d.latitude, d.longitude, d.status, d.threshold_moisture_low, d.threshold_moisture_high, d.threshold_temp_low, d.threshold_temp_high, d.threshold_ph_low, d.threshold_ph_high, d.threshold_ec_low, d.threshold_ec_high, d.threshold_salinity_low, d.threshold_salinity_high, d.threshold_nitrogen_low, d.threshold_nitrogen_high, d.threshold_phospor_low, d.threshold_phospor_high, d.threshold_potassium_low, d.threshold_potassium_high]);
        res.status(201).json({ device_id: result.lastID, ...d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE a device
app.put('/api/devices/:id', async (req, res) => {
    const d = req.body;
    const sql = `UPDATE devices SET device_name=?, location=?, latitude=?, longitude=?, status=?, threshold_moisture_low=?, threshold_moisture_high=?, threshold_temp_low=?, threshold_temp_high=?, threshold_ph_low=?, threshold_ph_high=?, threshold_ec_low=?, threshold_ec_high=?, threshold_salinity_low=?, threshold_salinity_high=?, threshold_nitrogen_low=?, threshold_nitrogen_high=?, threshold_phospor_low=?, threshold_phospor_high=?, threshold_potassium_low=?, threshold_potassium_high=? WHERE device_id=?`;
    try {
        await dbRun(sql, [d.device_name, d.location, d.latitude, d.longitude, d.status, d.threshold_moisture_low, d.threshold_moisture_high, d.threshold_temp_low, d.threshold_temp_high, d.threshold_ph_low, d.threshold_ph_high, d.threshold_ec_low, d.threshold_ec_high, d.threshold_salinity_low, d.threshold_salinity_high, d.threshold_nitrogen_low, d.threshold_nitrogen_high, d.threshold_phospor_low, d.threshold_phospor_high, d.threshold_potassium_low, d.threshold_potassium_high, req.params.id]);
        res.json({ message: "Success", device: d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a device
app.delete('/api/devices/:id', async (req, res) => {
    try {
        await dbRun('DELETE FROM devices WHERE device_id = ?', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SENSOR DATA (with filtering)
app.get('/api/sensor-data', async (req, res) => {
    let sql = "SELECT * FROM sensor_data";
    const params = [];
    if (req.query.deviceId) {
        sql += " WHERE device_id = ?";
        params.push(req.query.deviceId);
    }
    sql += " ORDER BY timestamp DESC";
    if (req.query.limit) {
      sql += " LIMIT ?";
      params.push(req.query.limit)
    }

    try {
        const data = await dbAll(sql, params);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST SENSOR DATA (from IoT device)
app.post('/api/sensor-data', async (req, res) => {
    const data = req.body;
    const sql = `INSERT INTO sensor_data (timestamp, device_id, moisture_percent, temperature_celsius, ec_us_cm, salinity_mg_l, ph, nitrogen_mg_kg, phospor_mg_kg, potassium_mg_kg) VALUES (?,?,?,?,?,?,?,?,?,?)`;
    
    try {
        const result = await dbRun(sql, [data.timestamp, data.device_id, data.moisture_percent, data.temperature_celsius, data.ec_us_cm, data.salinity_mg_l, data.ph, data.nitrogen_mg_kg, data.phospor_mg_kg, data.potassium_mg_kg]);
        
        // After inserting, check for alerts
        await checkForAlerts(data);

        res.status(201).json({ id: result.lastID, ...data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all users
app.get('/api/users', async (req, res) => {
    try {
        res.json(await dbAll("SELECT user_id, name, email, role FROM users"));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADD a new user
app.post('/api/users', async (req, res) => {
    const { name, email, password_hash, role } = req.body;
    // NOTE: In a real app, you'd hash the password here, e.g., using bcrypt
    const sql = `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`;
    try {
        const result = await dbRun(sql, [name, email, `hashed_${password_hash}`, role]);
        res.status(201).json({ user_id: result.lastID, name, email, role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE a user
app.put('/api/users/:id', async (req, res) => {
    const { name, email, role, password_hash } = req.body;
    let sql = `UPDATE users SET name = ?, email = ?, role = ?`;
    const params = [name, email, role];
    // Only update password if a new one is provided
    if (password_hash) {
        sql += `, password_hash = ?`;
        params.push(`hashed_${password_hash}`);
    }
    sql += ` WHERE user_id = ?`;
    params.push(req.params.id);

    try {
        await dbRun(sql, params);
        res.json({ message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a user
app.delete('/api/users/:id', async (req, res) => {
    const sql = `DELETE FROM users WHERE user_id = ?`;
    try {
        await dbRun(sql, [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET all alerts
app.get('/api/alerts', async (req, res) => {
    try {
        res.json(await dbAll("SELECT * FROM alerts ORDER BY timestamp DESC"));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE an alert
app.put('/api/alerts/:id', async (req, res) => {
    try {
        await dbRun('UPDATE alerts SET status = ? WHERE alert_id = ?', [req.body.status, req.params.id]);
        res.json({ message: "Success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ALERT CHECKING LOGIC ---
async function checkForAlerts(latestData) {
    const device = await dbGet('SELECT * FROM devices WHERE device_id = ?', [latestData.device_id]);
    if (!device) return;

    const createAlert = async (type, value, threshold) => {
        const existing = await dbGet('SELECT * FROM alerts WHERE device_id = ? AND alert_type = ? AND status = ?', [device.device_id, type, 'Active']);
        if (!existing) {
            await dbRun('INSERT INTO alerts (device_id, alert_type, sensor_value, threshold, timestamp, status) VALUES (?,?,?,?,?,?)', [device.device_id, type, value, threshold, new Date().toISOString(), 'Active']);
        }
    };
    
    const checks = [
        { key: 'moisture_percent', low: device.threshold_moisture_low, high: device.threshold_moisture_high, name: 'Moisture' },
        { key: 'temperature_celsius', low: device.threshold_temp_low, high: device.threshold_temp_high, name: 'Temperature' },
        { key: 'ph', low: device.threshold_ph_low, high: device.threshold_ph_high, name: 'pH' },
        { key: 'ec_us_cm', low: device.threshold_ec_low, high: device.threshold_ec_high, name: 'EC' },
        { key: 'salinity_mg_l', low: device.threshold_salinity_low, high: device.threshold_salinity_high, name: 'Salinity' },
        { key: 'nitrogen_mg_kg', low: device.threshold_nitrogen_low, high: device.threshold_nitrogen_high, name: 'Nitrogen' },
        { key: 'phospor_mg_kg', low: device.threshold_phospor_low, high: device.threshold_phospor_high, name: 'Phosphorus' },
        { key: 'potassium_mg_kg', low: device.threshold_potassium_low, high: device.threshold_potassium_high, name: 'Potassium' },
    ];

    for (const check of checks) {
        const value = latestData[check.key];
        if (check.low != null && value < check.low) createAlert(`Low ${check.name}`, value, check.low);
        if (check.high != null && value > check.high) createAlert(`High ${check.name}`, value, check.high);
    }
}


// --- THE "CATCH ALL" HANDLER ---
// This makes sure that any request that doesn't match an API route is sent to the React app.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});