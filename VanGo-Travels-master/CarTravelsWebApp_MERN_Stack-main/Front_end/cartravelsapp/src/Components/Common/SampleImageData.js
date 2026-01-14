// Sample data with proper image URLs for testing
export const SampleImageData = {
    tourPackages: [
        {
            packagenameid: 'tour-001',
            packagename: 'Sigiriya Rock Fortress',
            packagedetails: 'Visit the ancient rock fortress with stunning views',
            packageprice: 15000,
            packageimage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            carType: 'AC',
            noofdays: 1
        },
        {
            packagenameid: 'tour-002',
            packagename: 'Colombo City Tour',
            packagedetails: 'Explore the vibrant capital city of Sri Lanka',
            packageprice: 12000,
            packageimage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop',
            carType: 'AC',
            noofdays: 1
        },
        {
            packagenameid: 'tour-003',
            packagename: 'Jaffna Cultural Tour',
            packagedetails: 'Discover the rich cultural heritage of Jaffna',
            packageprice: 18000,
            packageimage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            carType: 'AC',
            noofdays: 2
        },
        {
            packagenameid: 'tour-004',
            packagename: 'Kandy Temple Tour',
            packagedetails: 'Visit the sacred Temple of the Tooth Relic',
            packageprice: 14000,
            packageimage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            carType: 'Non-AC',
            noofdays: 1
        },
        {
            packagenameid: 'tour-005',
            packagename: 'Galle Fort Heritage',
            packagedetails: 'Explore the UNESCO World Heritage site',
            packageprice: 16000,
            packageimage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            carType: 'AC',
            noofdays: 1
        },
        {
            packagenameid: 'tour-006',
            packagename: 'Ella Scenic Train',
            packagedetails: 'Experience the famous train journey through tea plantations',
            packageprice: 20000,
            packageimage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            carType: 'AC',
            noofdays: 2
        }
    ],
    
    carImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1549317331-15d4c5d0c8b0?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1583121274602-3b28297a3a3a?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    ],
    
    galleryImages: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200&h=150&fit=crop'
    ],
    
    carouselImages: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop',
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop'
    ]
};

// Function to populate database with sample data
export const populateSampleData = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No admin token found');
            return;
        }

        const response = await fetch('http://localhost:8010/api/v1/adminHomePage/bulk', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(SampleImageData.tourPackages)
        });

        if (response.ok) {
            console.log('Sample data populated successfully');
        } else {
            console.error('Failed to populate sample data');
        }
    } catch (error) {
        console.error('Error populating sample data:', error);
    }
};

export default SampleImageData;