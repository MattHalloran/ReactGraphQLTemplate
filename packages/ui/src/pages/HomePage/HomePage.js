import React from 'react';
import { 
    FeaturedPlants,
    Hero 
} from 'components';

function HomePage() {
    return (
        <div>
            <Hero text="Need a fast, large, or cheap spaceship?" subtext="We've got you covered" />
            <FeaturedPlants />
        </div >
    );
}

HomePage.propTypes = {
    
}

export { HomePage };