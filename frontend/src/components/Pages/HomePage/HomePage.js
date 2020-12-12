import React from 'react'
import { StyledHero } from './HomePage.styled';
import { Link } from 'react-router-dom';
import Collapsible from '../../Collapsible';
import Hero from '../../Hero/Hero';
import { SocialIcon } from 'react-social-icons';

class HomePage extends React.Component {
    componentDidMount() {
        document.title = "Home | New Life Nursery"
    }
    render() {
        return (
            <div>
                <Hero text="Beautiful, healthy plants" subtext="At competitive prices" />
                <Collapsible title="Social Media">
                    <SocialIcon fgColor="#ffffff" url="https://www.facebook.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer"/>
                    <SocialIcon fgColor="#ffffff" url="https://www.instagram.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer"/>
                </Collapsible>
            </div >
        );
    }
}

HomePage.propTypes = {

}

export default HomePage;