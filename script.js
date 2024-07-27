function formatTime24To12(time24) {
    // Split time into hours and minutes
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert hour from 24-hour to 12-hour format
    return `${hour12}:${minutes} ${ampm}`;
}

function getPrayerTimes(latitude, longitude) {
    fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}`)
        .then(response => response.json())
        .then(data => {
            const prayerTimes = data.data.timings;
            // Format times to AM/PM
            document.getElementById('fajr-time').textContent = formatTime24To12(prayerTimes.Fajr);
            document.getElementById('dhuhr-time').textContent = formatTime24To12(prayerTimes.Dhuhr);
            document.getElementById('asr-time').textContent = formatTime24To12(prayerTimes.Asr);
            document.getElementById('maghrib-time').textContent = formatTime24To12(prayerTimes.Maghrib);
            document.getElementById('isha-time').textContent = formatTime24To12(prayerTimes.Isha);
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
            // Handle location error (e.g., user denied permission)
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

// Request location permission and get prayer times
getLocation();
