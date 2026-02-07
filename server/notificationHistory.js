const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.join(__dirname, 'notification-history.json');

// Initialize history file if it doesn't exist
function initializeHistory() {
    if (!fs.existsSync(HISTORY_FILE)) {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify({ notifications: [] }, null, 2));
    }
}

// Read notification history
function getHistory() {
    initializeHistory();
    try {
        const data = fs.readFileSync(HISTORY_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading notification history:', error);
        return { notifications: [] };
    }
}

// Add a notification record
function addNotification(record) {
    const history = getHistory();

    const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...record
    };

    history.notifications.unshift(notification); // Add to beginning

    // Keep only last 100 notifications
    if (history.notifications.length > 100) {
        history.notifications = history.notifications.slice(0, 100);
    }

    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
        console.log('[Notification History] Record saved:', notification.id);
    } catch (error) {
        console.error('[Notification History] Error saving:', error);
    }

    return notification;
}

// Get recent notifications
function getRecentNotifications(limit = 10) {
    const history = getHistory();
    return history.notifications.slice(0, limit);
}

// Get notifications by status
function getNotificationsByStatus(status) {
    const history = getHistory();
    return history.notifications.filter(n => n.status === status);
}

// Get statistics
function getStats() {
    const history = getHistory();
    const total = history.notifications.length;
    const successful = history.notifications.filter(n => n.status === 'success').length;
    const failed = history.notifications.filter(n => n.status === 'failed').length;

    const riskLevelCounts = history.notifications.reduce((acc, n) => {
        acc[n.riskLevel] = (acc[n.riskLevel] || 0) + 1;
        return acc;
    }, {});

    return {
        total,
        successful,
        failed,
        successRate: total > 0 ? ((successful / total) * 100).toFixed(2) + '%' : '0%',
        riskLevelCounts
    };
}

module.exports = {
    addNotification,
    getHistory,
    getRecentNotifications,
    getNotificationsByStatus,
    getStats
};
