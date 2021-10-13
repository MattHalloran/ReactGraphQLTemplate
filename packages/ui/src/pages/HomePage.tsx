import React from 'react';
import { 
    FeaturedProducts,
    Hero 
} from 'components';

const HomePage: React.FC = () => {
    return (
        <div>
            <Hero text="Need a fast, large, or cheap spaceship?" subtext="We've got you covered" />
            <FeaturedProducts />
        </div >
    );
}

HomePage.propTypes = {
    
}

export { HomePage };