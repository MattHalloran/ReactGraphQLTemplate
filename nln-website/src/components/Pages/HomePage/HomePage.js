import React from 'react'
import { StyledHero } from './HomePage.styled';
import { Link } from 'react-router-dom';

class HomePage extends React.Component {
    componentDidMount() {
        document.title = "Home | New Life Nursery"
    }
    render() {
        return (
            <div>
                <StyledHero>
                    <div className="hero-image" alt="Sapling hero image"/>
                    {/* <div className="hero-gradient"></div> */}
                    <div className="hero-text">
                        <h1>Beautiful, healthy plants</h1>
                        <h3>At competitive prices</h3>
                        <Link to="/info">
                            <button className="primary">Order now</button>
                        </Link>
                    </div>
                </StyledHero>
            </div >
        );
    }
}

export default HomePage;