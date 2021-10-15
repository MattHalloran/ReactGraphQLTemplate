import { 
    FeaturedProducts,
    Hero 
} from 'components';

export const HomePage = () => {
    return (
        <div>
            <Hero text="Need a fast, large, or cheap spaceship?" subtext="We've got you covered" />
            <FeaturedProducts />
        </div >
    );
}