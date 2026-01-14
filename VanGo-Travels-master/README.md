# Car Travels Web App - MERN Stack

A comprehensive car travel booking system built with the MERN stack (MongoDB, Express.js, React.js, Node.js), featuring multi-role management with admin, user, and driver dashboards.

## 🚀 Features

### 🔐 Multi-Role Authentication System
- **Admin Dashboard**: Complete system management, driver assignment, booking oversight
- **User Portal**: Tour booking, local travel booking, feedback submission
- **Driver Dashboard**: Assigned trip management, status updates, feedback system

### 📋 Core Functionality
- **Tour Package Management**: Admin can create and manage tour packages
- **Local Travel Booking**: Users can book local car services
- **Driver Assignment**: Admins can assign drivers to bookings
- **Real-time Status Updates**: Drivers can update trip status (assigned, in-progress, completed, cancelled)
- **Feedback System**: Users can submit feedback, drivers can view their feedback
- **Car Details Management**: Admin can manage car specifications and pricing

### 🎨 User Interface
- **Responsive Design**: Bootstrap-based responsive UI
- **Role-based Navigation**: Different headers and menus for each user type
- **Modern Components**: React components with proper state management
- **Image Gallery**: Car images and tour destination photos

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication and authorization
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React.js** with functional and class components
- **React Router** for navigation
- **Redux** for state management
- **Bootstrap** for styling
- **Axios** for API calls

### Database Models
- **Users**: Admin, regular users, and drivers
- **Tour Bookings**: Tour package reservations
- **Local Bookings**: Local travel reservations
- **Car Details**: Vehicle specifications and pricing
- **Feedback**: User feedback system
- **Attendance**: User activity tracking

## 📁 Project Structure

```
CarTravelsWebApp_MERN_Stack-main/
├── Backend/
│   └── Cars/
│       ├── controllers/     # API route handlers
│       ├── middleware/     # Authentication, error handling
│       ├── model/          # MongoDB schemas
│       ├── routes/         # API routes
│       └── server.js       # Main server file
└── Front_end/
    └── cartravelsapp/
        ├── public/         # Static files
        └── src/
            ├── Components/
            │   ├── Admin/          # Admin dashboard components
            │   ├── HeaderComponent/ # Role-based headers
            │   ├── UserPages/     # User and driver pages
            │   ├── services/       # API services
            │   └── store/         # Redux store
            └── App.js             # Main React component
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sinthujaninfo/CarTravelsWebApp-MERN.git
   cd CarTravelsWebApp-MERN
   ```

2. **Install Backend Dependencies**
   ```bash
   cd CarTravelsWebApp_MERN_Stack-main/Backend/Cars
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../../Front_end/cartravelsapp
   npm install
   ```

4. **Environment Setup**
   - Create a `.env` file in the Backend/Cars directory
   - Add your MongoDB connection string and JWT secret

5. **Start the Application**
   
   **Backend Server:**
   ```bash
   cd CarTravelsWebApp_MERN_Stack-main/Backend/Cars
   node server.js
   ```
   
   **Frontend Development Server:**
   ```bash
   cd CarTravelsWebApp_MERN_Stack-main/Front_end/cartravelsapp
   npm start
   ```

### Default Credentials

**Admin Account:**
- Email: `admin@cartravels.com`
- Password: `admin1234`

**Sample Driver Account:**
- Email: `driver1@cartravels.com`
- Password: `driver1234`

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/signedupuserdetails/loginuser` - User login
- `POST /api/v1/signedupuserdetails` - User registration

### Tour Bookings
- `GET /api/v1/cartourbookedusers` - Get all tour bookings
- `POST /api/v1/cartourbookedusers` - Create tour booking
- `PATCH /api/v1/cartourbookedusers/:id/assign-driver` - Assign driver
- `PATCH /api/v1/cartourbookedusers/:id` - Update booking status

### Local Bookings
- `GET /api/v1/carbookedusers` - Get all local bookings
- `POST /api/v1/carbookedusers` - Create local booking
- `PATCH /api/v1/carbookedusers/:id/assign-driver` - Assign driver
- `PATCH /api/v1/carbookedusers/:id` - Update booking status

### Car Management
- `GET /api/v1/CarkilometerDetails` - Get car details
- `POST /api/v1/CarkilometerDetails` - Add car details
- `PATCH /api/v1/CarkilometerDetails/:id` - Update car details

## 🎯 Key Features Implemented

### Driver Management System
- ✅ Driver registration and authentication
- ✅ Admin can assign drivers to bookings
- ✅ Driver dashboard showing only assigned trips
- ✅ Trip status update functionality
- ✅ Driver-specific navigation and UI

### Booking System
- ✅ Tour package booking with driver assignment
- ✅ Local travel booking with driver assignment
- ✅ Real-time status updates
- ✅ Booking confirmation and management

### Admin Features
- ✅ Complete booking oversight
- ✅ Driver assignment interface
- ✅ Car details management
- ✅ User management
- ✅ Feedback management

### User Experience
- ✅ Role-based authentication
- ✅ Responsive design
- ✅ Error handling and validation
- ✅ Feedback system

## 🐛 Recent Fixes

- Fixed React DOM warnings (`for` → `htmlFor`, `class` → `className`)
- Corrected validation error messages in car details form
- Enhanced driver dashboard with proper trip filtering
- Fixed authentication and authorization issues
- Improved error handling throughout the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## 🙏 Acknowledgments

- Bootstrap for UI components
- React community for excellent documentation
- MongoDB for database management
- Express.js for backend framework
