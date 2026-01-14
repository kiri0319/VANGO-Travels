import React, { Component } from 'react'
import { Container } from 'react-bootstrap'

export default class ErrorPage extends Component {
    render() {
        return (
            <div className="MainDiv">
                <Container>
                    <img 
                        src="https://png.pngtree.com/png-vector/20200618/ourmid/pngtree-business-car-rental-flat-illustration-png-image_2257834.jpg" 
                        alt="User not logged in"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=Please+Login';
                        }}
                        style={{maxWidth: '100%', height: 'auto'}}
                    />
                    <h2>Oops! User is not Logged in ! 😑</h2>
                    <h2>Please Log in to Continue 🔴</h2>
                </Container>
            </div>

    )}
}
