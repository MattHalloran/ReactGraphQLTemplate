import React from 'react'

class AboutPage extends React.Component {
    componentDidMount() {
        document.title = "About Page | New Life Nursery"
    }
    render() {
        return (
            <div>
                <h1>About Page!</h1>
            </div >
        );
    }
}

export default AboutPage;