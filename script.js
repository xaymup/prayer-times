function formatTime24To12(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function getPrayerTimes(latitude, longitude) {
    fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}`)
        .then(response => response.json())
        .then(data => {
            const prayerTimes = data.data.timings;
            document.getElementById('fajr-time').textContent = formatTime24To12(prayerTimes.Fajr);
            document.getElementById('dhuhr-time').textContent = formatTime24To12(prayerTimes.Dhuhr);
            document.getElementById('asr-time').textContent = formatTime24To12(prayerTimes.Asr);
            document.getElementById('maghrib-time').textContent = formatTime24To12(prayerTimes.Maghrib);
            document.getElementById('isha-time').textContent = formatTime24To12(prayerTimes.Isha);
            
            // If reminders are enabled, set up notifications
            if (localStorage.getItem('notificationsEnabled') === 'true') {
                const reminderMinutes = parseInt(localStorage.getItem('reminderMinutes'), 10) || 5;
                scheduleNotifications(prayerTimes, reminderMinutes);
            }

            updateNextPrayerTime(prayerTimes);
            setInterval(() => updateNextPrayerTime(prayerTimes), 60000); // Update every minute

            displayHijriDate(data.data.date.hijri);
        })
        .catch(error => {
            console.error('Error fetching prayer times:', error);
        });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            getPrayerTimes(latitude, longitude);
        }, error => {
            console.error('Error getting location:', error);
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

function requestNotificationPermission() {
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            } else {
                console.error('Notification permission denied.');
            }
        });
    }
}

function showNotification(title, options) {
    if (Notification.permission === 'granted') {
        new Notification(title, options);
    }
}

function scheduleNotification(prayerTime, reminderMinutes) {
    const now = new Date();
    const [hours, minutes] = prayerTime.split(':');
    const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    const reminderTime = new Date(prayerDate.getTime() - reminderMinutes * 60000);

    if (reminderTime > now) {
        setTimeout(() => {
            showNotification('Prayer Reminder', {
                body: `${reminderMinutes} minutes until the upcoming prayer. ${formatTime24To12(prayerTime)}`,
            });
        }, reminderTime.getTime() - now.getTime());
    }

    if (prayerDate > now) {
        setTimeout(() => {
            showNotification('Prayer Time', {
                body: `It's time for prayer. ${formatTime24To12(prayerTime)}`,
            });
        }, prayerDate.getTime() - now.getTime());
    }
}

function scheduleNotifications(prayerTimes, reminderMinutes) {
    scheduleNotification(prayerTimes.Fajr, reminderMinutes);
    scheduleNotification(prayerTimes.Dhuhr, reminderMinutes);
    scheduleNotification(prayerTimes.Asr, reminderMinutes);
    scheduleNotification(prayerTimes.Maghrib, reminderMinutes);
    scheduleNotification(prayerTimes.Isha, reminderMinutes);
}

document.getElementById('notification-toggle').addEventListener('change', function() {
    const notificationOptions = document.getElementById('notification-options');
    const currentReminder = document.getElementById('current-reminder');
    if (this.checked) {
        requestNotificationPermission();
        notificationOptions.style.display = 'block';
        currentReminder.style.display = 'none';
    } else {
        notificationOptions.style.display = 'none';
        currentReminder.style.display = 'none';
        localStorage.setItem('notificationsEnabled', 'false');
    }
});

document.getElementById('reminder-time').addEventListener('input', function() {
    document.getElementById('reminder-value').textContent = this.value;
});

document.getElementById('save-settings').addEventListener('click', function() {
    const reminderMinutes = parseInt(document.getElementById('reminder-time').value, 10);
    document.getElementById('notification-options').style.display = 'none';
    document.getElementById('current-reminder').style.display = 'inline';
    document.getElementById('reminder-display').textContent = reminderMinutes;

    localStorage.setItem('notificationsEnabled', 'true');
    localStorage.setItem('reminderMinutes', reminderMinutes);

    // Fetch new prayer times and set up notifications
    getLocation();
});

// On page load, check if notifications are enabled and get prayer times
if (localStorage.getItem('notificationsEnabled') === 'true') {
    document.getElementById('notification-toggle').checked = true;
    document.getElementById('current-reminder').style.display = 'inline';
    document.getElementById('reminder-display').textContent = localStorage.getItem('reminderMinutes') || 5;
}

function updateNextPrayerTime(prayerTimes) {
    const now = new Date();
    const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let nextPrayerTime, nextPrayerName;

    for (const prayer of prayerNames) {
        const [hours, minutes] = prayerTimes[prayer].split(':');
        const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        if (prayerDate > now) {
            nextPrayerTime = prayerDate;
            nextPrayerName = prayer;
            break;
        }
    }

    if (!nextPrayerTime) {
        // If no prayer time is found for today, the next prayer is Fajr of the next day
        const [hours, minutes] = prayerTimes['Fajr'].split(':');
        nextPrayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes);
        nextPrayerName = 'Fajr';
    }

    const timeUntilNextPrayer = nextPrayerTime - now;
    const minutesUntilNextPrayer = Math.floor((timeUntilNextPrayer % (1000 * 60 * 60)) / (1000 * 60));
    const hoursUntilNextPrayer = Math.floor(timeUntilNextPrayer / (1000 * 60 * 60));

    let timeUntilString;
    if (hoursUntilNextPrayer > 0) {
        timeUntilString = `${hoursUntilNextPrayer} hours and ${minutesUntilNextPrayer} minutes until ${nextPrayerName}`;
    } else {
        timeUntilString = `${minutesUntilNextPrayer} minutes until ${nextPrayerName}`;
    }

    document.getElementById('time-until-next-prayer').textContent = timeUntilString;
}

function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th'; // Handles 4-20
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function displayHijriDate(hijriDate) {
    const hijriDay = hijriDate.day;
    const hijriMonth = hijriDate.month.en;
    const hijriYear = hijriDate.year;
    const ordinalSuffix = getOrdinalSuffix(hijriDay);
    const formattedHijriDate = `${hijriDay}${ordinalSuffix} of ${hijriMonth} ${hijriYear}`;
    document.getElementById('hijri-date').textContent = formattedHijriDate;
}

getLocation();
