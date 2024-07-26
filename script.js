function getPrayerTimes(latitude, longitude) {
    fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}`)
        .then(response => response.json())
        .then(data => {
            const prayerTimes = data.data.timings;
            document.getElementById('fajr-time').textContent = prayerTimes.Fajr;
            document.getElementById('dhuhr-time').textContent = prayerTimes.Dhuhr;
            document.getElementById('asr-time').textContent = prayerTimes.Asr;
            document.getElementById('maghrib-time').textContent = prayerTimes.Maghrib;
            document.getElementById('isha-time').textContent = prayerTimes.Isha;
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
