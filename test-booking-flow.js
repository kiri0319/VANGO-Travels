// Test script to verify the complete booking flow
// Run this in browser console after logging in as a user

console.log('=== TESTING LOCAL BOOKING FLOW ===');

// Step 1: Check authentication
const token = localStorage.getItem('token');
const userid = localStorage.getItem('userid');
const username = localStorage.getItem('username');

console.log('Authentication check:', {
    token: token ? 'Present' : 'Missing',
    userid: userid || 'Missing',
    username: username || 'Missing'
});

if (!token || !userid || !username) {
    console.error('❌ Authentication failed. Please login first.');
} else {
    console.log('✅ Authentication OK');
}

// Step 2: Test booking creation
const testBooking = {
    user_name: "Test User",
    phoneNumber: "9876543210",
    FromLocation: "Coimbatore Railway Station",
    ToLocation: "RS Puram",
    user: userid,
    usernameid: username,
    DateTime: new Date().toLocaleString()
};

console.log('Test booking data:', testBooking);

// Step 3: Submit booking
fetch('http://localhost:8010/api/v1/carbookedusers', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(testBooking)
})
.then(res => {
    console.log('Response status:', res.status);
    return res.json();
})
.then(data => {
    console.log('Booking response:', data);
    if (data.success) {
        console.log('✅ Booking created successfully!');
        
        // Step 4: Test fetching booking list
        return fetch('http://localhost:8010/api/v1/carbookedusers/' + userid, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
    } else {
        throw new Error('Booking failed: ' + data.message);
    }
})
.then(res => {
    console.log('Booking list response status:', res.status);
    return res.json();
})
.then(bookings => {
    console.log('User bookings:', bookings);
    console.log('✅ Booking list fetched successfully!');
    console.log('Total bookings:', bookings.length);
})
.catch(err => {
    console.error('❌ Error:', err);
});

console.log('=== TEST COMPLETE ===');