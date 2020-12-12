import React from 'react'
import { StyledHero } from './HomePage.styled';
import { Link } from 'react-router-dom';
import Collapsible from '../../Collapsible';
import Hero from '../../Hero/Hero';

class HomePage extends React.Component {
    componentDidMount() {
        document.title = "Home | New Life Nursery"
    }
    render() {
        return (
            <div>
                <Hero text="Beautiful, healthy plants" subtext="At competitive prices" />
                <Collapsible title="About">
                    <ul>
                        <li>Hello</li>
                        <li>Mr. Bond</li>
                    </ul>
                </Collapsible>
            </div >
        );
    }
}

HomePage.propTypes = {
    
}

export default HomePage;