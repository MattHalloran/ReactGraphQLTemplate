import React from 'react';
import './Spinner.css';
import OakSpinner from '../../assets/img/oak-spinner.svg';
import PubSub from '../../pubsub';

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spinning: this.props.spinning,
        }
    }
    componentDidMount() {
        this.loadingSub = PubSub.subscribe('Loading', (_,data) => this.setState({spinning:data}))
    }
    componentWillUnmount() {
        PubSub.unsubscribe(this.loadingSub)
    }
    render() {
        return (
            <div>
                {this.state.spinning ? <section className="spinner">
                    <img src={OakSpinner} className="spinner_component" alt="Designed by Creazilla" />
                </section> : null}
            </div>
        );
    }
}

export default HomePage;
