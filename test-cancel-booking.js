// Test script for booking cancellation
const fetch = require('node-fetch');

async function testCancelBooking() {
    console.log('🧪 Testing booking cancellation endpoint...');
    
    // Test data - you'll need to replace with actual booking ID and auth token
    const bookingId = 'YOUR_BOOKING_ID_HERE';
    const authToken = 'YOUR_AUTH_TOKEN_HERE';
    
    try {
        const response = await fetch(`http://localhost:8010/api/v1/carbookedusers/${bookingId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('📥 Response data:', JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('✅ Booking cancellation test successful!');
        } else {
            console.log('❌ Booking cancellation test failed:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

// Run the test
testCancelBooking();
