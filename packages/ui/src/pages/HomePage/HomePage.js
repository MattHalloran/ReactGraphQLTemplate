import { 
    FeaturedPlants,
    Hero 
} from 'components';

function HomePage() {
    return (
        <div>
            <Hero text="Beautiful, healthy plants" subtext="At competitive prices" />
            <FeaturedPlants />
            {/* <Collapsible title="Follow Us on Social Media!" contentClassName="social-collapse">
                <SocialIcon style={{width:'75px',height:'75px',margin:'15px'}} fgColor="#ffffff" url="https://www.facebook.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
                <SocialIcon style={{width:'75px',height:'75px',margin:'15px'}} fgColor="#ffffff" url="https://www.instagram.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
            </Collapsible> */}
        </div >
    );
}

HomePage.propTypes = {
    
}

export { HomePage };