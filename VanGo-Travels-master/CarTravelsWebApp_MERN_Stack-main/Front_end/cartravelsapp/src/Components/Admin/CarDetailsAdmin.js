import React, { Component } from 'react'
import Table from 'react-bootstrap/Table'
import authHeader from '../services/auth-header'
import { Button} from 'react-bootstrap'
import {Link} from "react-router-dom";

export default class CarDetailsAdmin extends Component {
        constructor(){
            super();
            this.searchinput = React.createRef();
            this.state = {
                Car_km_Details: [],
                filteredData: [],
                loading: true,
                error: null,
                searchTerm: '',
                sortBy: 'vechicle',
                sortOrder: 'asc',
                selectedCars: [],
                showBulkActions: false
            }
        }
    
        componentDidMount(){
            this.setState({ loading: true, error: null });
            
            fetch('http://localhost:8010/api/v1/CarkilometerDetails',{
                headers:authHeader()
            })
            .then(res=>res.json())
            .then(data=>{
                // Ensure data is always an array
                let carDetails = [];
                if (Array.isArray(data)) {
                    carDetails = data;
                } else if (data && Array.isArray(data.data)) {
                    carDetails = data.data;
                } else {
                    console.error('API response is not an array:', data);
                    this.setState({Car_km_Details : [], filteredData: [], loading: false, error: 'Invalid data format received'});
                    return;
                }
                
                this.setState({
                    Car_km_Details: carDetails,
                    filteredData: carDetails,
                    loading: false,
                    error: null
                });
            })
            .catch(error => {
                console.error('Error fetching car details:', error);
                this.setState({Car_km_Details : [], loading: false, error: 'Failed to load car details'})
            });
        }

        // Search functionality
        handleSearch = (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.setState({ searchTerm });
            
            const filteredData = this.state.Car_km_Details.filter(car => 
                car.vechicle.toLowerCase().includes(searchTerm) ||
                car.vechicleid.toLowerCase().includes(searchTerm) ||
                car.amount.toString().includes(searchTerm) ||
                car.minkm.toString().includes(searchTerm)
            );
            
            this.setState({ filteredData });
        }

        // Sort functionality
        handleSort = (column) => {
            const { sortBy, sortOrder } = this.state;
            let newOrder = 'asc';
            
            if (sortBy === column) {
                newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            }
            
            const sortedData = [...this.state.filteredData].sort((a, b) => {
                let aVal = a[column];
                let bVal = b[column];
                
                // Handle numeric values
                if (column === 'amount' || column === 'minkm' || column === 'rateperkm' || column === 'driverallowance') {
                    aVal = Number(aVal) || 0;
                    bVal = Number(bVal) || 0;
                } else {
                    aVal = String(aVal).toLowerCase();
                    bVal = String(bVal).toLowerCase();
                }
                
                if (newOrder === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
            
            this.setState({
                filteredData: sortedData,
                sortBy: column,
                sortOrder: newOrder
            });
        }

        // Bulk selection
        handleSelectAll = (e) => {
            const { filteredData } = this.state;
            if (e.target.checked) {
                this.setState({ 
                    selectedCars: filteredData.map(car => car.vechicleid),
                    showBulkActions: true
                });
            } else {
                this.setState({ 
                    selectedCars: [],
                    showBulkActions: false
                });
            }
        }

        handleSelectCar = (vechicleid) => {
            const { selectedCars } = this.state;
            let newSelectedCars;
            
            if (selectedCars.includes(vechicleid)) {
                newSelectedCars = selectedCars.filter(id => id !== vechicleid);
            } else {
                newSelectedCars = [...selectedCars, vechicleid];
            }
            
            this.setState({
                selectedCars: newSelectedCars,
                showBulkActions: newSelectedCars.length > 0
            });
        }

        // Bulk delete
        handleBulkDelete = () => {
            const { selectedCars } = this.state;
            if (selectedCars.length === 0) return;
            
            if (!window.confirm(`Are you sure you want to delete ${selectedCars.length} car detail(s)? This action cannot be undone.`)) {
                return;
            }
            
            this.setState({ loading: true });
            
            const deletePromises = selectedCars.map(vechicleid => 
                fetch(`http://localhost:8010/api/v1/CarkilometerDetails/${vechicleid}`, {
                    headers: authHeader(),
                    method: 'DELETE'
                })
            );
            
            Promise.all(deletePromises)
                .then(() => {
                    // Refresh the data
                    return fetch('http://localhost:8010/api/v1/CarkilometerDetails', {
                        headers: authHeader()
                    });
                })
                .then(res => res.json())
                .then(data => {
                    let carDetails = [];
                    if (Array.isArray(data)) {
                        carDetails = data;
                    } else if (data && Array.isArray(data.data)) {
                        carDetails = data.data;
                    }
                    
                    this.setState({
                        Car_km_Details: carDetails,
                        filteredData: carDetails,
                        selectedCars: [],
                        showBulkActions: false,
                        loading: false
                    });
                    
                    alert(`${selectedCars.length} car detail(s) deleted successfully!`);
                })
                .catch(error => {
                    console.error('Error in bulk delete:', error);
                    this.setState({ loading: false });
                    alert('Failed to delete some car details. Please try again.');
                });
        }

        deleteCar_km_Detail(vechicleid){
            // Show confirmation dialog
            if (!window.confirm('Are you sure you want to delete this car detail? This action cannot be undone.')) {
                return;
            }

            // Show loading state
            this.setState({ loading: true, error: null });

            fetch('http://localhost:8010/api/v1/CarkilometerDetails/' + vechicleid, {
                headers: authHeader(),    
                method: 'DELETE' 
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('Delete response:', data);
                
                // Refresh the car details list
                return fetch('http://localhost:8010/api/v1/CarkilometerDetails/', {
                    headers: authHeader()
                });
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // Ensure data is always an array
                if (Array.isArray(data)) {
                    this.setState({Car_km_Details : data, loading: false, error: null});
                } else if (data && Array.isArray(data.data)) {
                    this.setState({Car_km_Details : data.data, loading: false, error: null});
                } else {
                    console.error('API response is not an array:', data);
                    this.setState({Car_km_Details : [], loading: false, error: 'Invalid data format received'});
                }
                
                // Show success message
                alert('Car detail deleted successfully!');
            })
            .catch(error => {
                console.error('Error deleting car detail:', error);
                this.setState({ 
                    loading: false, 
                    error: 'Failed to delete car detail. Please try again.' 
                });
                alert('Failed to delete car detail. Please try again.');
            });
        }
    
        render() {
        // Safety check to ensure filteredData is an array before mapping
        const carDetails = Array.isArray(this.state.filteredData) ? this.state.filteredData : [];
        
        const { selectedCars, sortBy, sortOrder } = this.state;
        var FetchedData = carDetails.map((Car_km_Detail, i)=>{
            return (
            <tr key={i} className={selectedCars.includes(Car_km_Detail.vechicleid) ? 'table-info' : ''}>
                <td>
                    <input 
                        type="checkbox" 
                        checked={selectedCars.includes(Car_km_Detail.vechicleid)}
                        onChange={() => this.handleSelectCar(Car_km_Detail.vechicleid)}
                        className="form-check-input"
                    />
                </td>
                <th scope="row">{i+1}</th>
                <td>
                    {Car_km_Detail.imageUrl ? (
                        <img 
                            src={Car_km_Detail.imageUrl.startsWith('http') ? Car_km_Detail.imageUrl : `http://localhost:8010${Car_km_Detail.imageUrl}`} 
                            alt={Car_km_Detail.vechicle} 
                            style={{width:'64px', height:'48px', objectFit:'cover', borderRadius: '6px'}} 
                            onError={(e)=>{ e.target.src = 'https://via.placeholder.com/64x48?text=No+Image'; }} 
                        />
                    ) : (
                        <div style={{width:'64px', height:'48px', backgroundColor:'#f8f9fa', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:'#6c757d'}}>
                            No Image
                        </div>
                    )}
                </td>
                <td>
                    <strong>{Car_km_Detail.vechicle}</strong>
                    <br/>
                    <small className="text-muted">ID: {Car_km_Detail.vechicleid}</small>
                </td>
                <td>{Car_km_Detail.minkm} KM</td>
                <td>LKR {Car_km_Detail.rateperkm}</td>
                <td>LKR {Car_km_Detail.driverallowance || '0'}</td>
                <td><strong>LKR {Car_km_Detail.amount}</strong></td>
                <td className="alignbutton">
                    <Link to={'/updatecarkmdetail/'+Car_km_Detail.vechicleid}>
                        <Button variant="outline-primary" size="sm" className="m-1"> 
                            <i className="fas fa-edit"></i> Edit 
                        </Button>
                    </Link>
                    <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="m-1" 
                        onClick={this.deleteCar_km_Detail.bind(this,Car_km_Detail.vechicleid)}
                    >
                        <i className="fas fa-trash"></i> Delete
                    </Button>
                </td>
            </tr>
            );
        })
    
        return (
        <div className="MainDiv main_carkmdetail ">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Car Details Management</h2>
            <Link to={'addnewcarkmdetails/'}>
                <Button variant="primary">
                    <i className="fas fa-plus mr-2"></i>
                    Add New Car Detail
                </Button>
            </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="row mb-4">
            <div className="col-md-6">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text">
                            <i className="fas fa-search"></i>
                        </span>
                    </div>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by vehicle name, ID, amount, or min KM..."
                        value={this.state.searchTerm}
                        onChange={this.handleSearch}
                    />
                </div>
            </div>
            <div className="col-md-6">
                <div className="d-flex justify-content-end">
                    <span className="badge badge-info mr-2">
                        Total: {this.state.Car_km_Details.length} cars
                    </span>
                    <span className="badge badge-secondary">
                        Showing: {this.state.filteredData.length} cars
                    </span>
                </div>
            </div>
        </div>

        {/* Bulk Actions */}
        {this.state.showBulkActions && (
            <div className="alert alert-info d-flex justify-content-between align-items-center">
                <span>
                    <i className="fas fa-info-circle mr-2"></i>
                    {this.state.selectedCars.length} car(s) selected
                </span>
                <div>
                    <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={this.handleBulkDelete}
                        className="mr-2"
                    >
                        <i className="fas fa-trash mr-1"></i>
                        Delete Selected
                    </Button>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => this.setState({selectedCars: [], showBulkActions: false})}
                    >
                        <i className="fas fa-times mr-1"></i>
                        Clear Selection
                    </Button>
                </div>
            </div>
        )}

        {/* Statistics Cards */}
        {!this.state.loading && !this.state.error && this.state.Car_km_Details.length > 0 && (
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h4 className="card-title">{this.state.Car_km_Details.length}</h4>
                                    <p className="card-text">Total Cars</p>
                                </div>
                                <div className="align-self-center">
                                    <i className="fas fa-car fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h4 className="card-title">
                                        LKR {this.state.Car_km_Details.reduce((sum, car) => sum + (car.amount || 0), 0).toLocaleString()}
                                    </h4>
                                    <p className="card-text">Total Daily Revenue</p>
                                </div>
                                <div className="align-self-center">
                                    <i className="fas fa-rupee-sign fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h4 className="card-title">
                                        LKR {Math.round(this.state.Car_km_Details.reduce((sum, car) => sum + (car.amount || 0), 0) / this.state.Car_km_Details.length).toLocaleString()}
                                    </h4>
                                    <p className="card-text">Average Daily Rate</p>
                                </div>
                                <div className="align-self-center">
                                    <i className="fas fa-chart-line fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h4 className="card-title">
                                        {this.state.Car_km_Details.filter(car => car.imageUrl).length}
                                    </h4>
                                    <p className="card-text">With Images</p>
                                </div>
                                <div className="align-self-center">
                                    <i className="fas fa-image fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <p className="carkm_ptag">Rate/KM is applied when Minimum KM limit exceeds !</p>

        {this.state.loading && (
            <div className="text-center p-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Loading car details...</p>
            </div>
        )}

        {this.state.error && (
            <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {this.state.error}
                <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => this.componentDidMount()}
                >
                    <i className="fas fa-redo mr-1"></i>
                    Retry
                </Button>
            </div>
        )}

        {!this.state.loading && !this.state.error && carDetails.length === 0 && (
            <div className="text-center p-4">
                <i className="fas fa-car fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No car details found</h5>
                <p className="text-muted">Add your first car detail to get started.</p>
                <Link to={'addnewcarkmdetails/'}>
                    <Button variant="primary">
                        <i className="fas fa-plus mr-2"></i>
                        Add Car Detail
                    </Button>
                </Link>
            </div>
        )}

            {!this.state.loading && !this.state.error && carDetails.length > 0 && (
              <div className="carkmdetail">
                <Table responsive className="table table-striped table-hover">
                    <thead className="thead-dark">
                        <tr>
                            <th>
                                <input 
                                    type="checkbox" 
                                    checked={selectedCars.length === carDetails.length && carDetails.length > 0}
                                    onChange={this.handleSelectAll}
                                    className="form-check-input"
                                />
                            </th>
                            <th scope="col">#</th>
                            <th scope="col">Photo</th>
                            <th 
                                scope="col" 
                                style={{cursor: 'pointer'}}
                                onClick={() => this.handleSort('vechicle')}
                            >
                                Vehicle {sortBy === 'vechicle' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                                scope="col" 
                                style={{cursor: 'pointer'}}
                                onClick={() => this.handleSort('minkm')}
                            >
                                Min KM {sortBy === 'minkm' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                                scope="col" 
                                style={{cursor: 'pointer'}}
                                onClick={() => this.handleSort('rateperkm')}
                            >
                                Rate/KM {sortBy === 'rateperkm' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th scope="col">Driver Allowance</th>
                            <th 
                                scope="col" 
                                style={{cursor: 'pointer'}}
                                onClick={() => this.handleSort('amount')}
                            >
                                Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>{FetchedData}</tbody>
                 </Table>
              </div>
            )}

        <p className="carkm_ptag">Tollgate, Parking and Other Expenses will be Extra !</p>
        </div>
        )
       }
    }
    
    