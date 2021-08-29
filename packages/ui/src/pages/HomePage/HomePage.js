import React from 'react';
import { 
    FeaturedPlants,
    Hero 
} from 'components';

function HomePage() {
    return (
        <div>
            <Hero text="Beautiful, healthy plants" subtext="At competitive prices" />
            <FeaturedPlants />
        </div >
    );
}

HomePage.propTypes = {
    
}

export { HomePage };