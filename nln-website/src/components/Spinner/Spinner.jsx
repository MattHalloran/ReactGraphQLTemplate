import React from 'react';
import './Spinner.css';
import OakSpinner from '../../assets/img/oak-spinner.svg';

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spinning: this.props.spinning,
        }
    }
    componentWillReceiveProps(newProps) {
        this.setState({ spinning: newProps.spinning });
    }
    render() {
        return (
            <div>
                {this.state.spinning ? <section class="spinner">
                    <img src={OakSpinner} class="spinner_component" alt="Designed by Creazilla" />
                </section> : null}
            </div>
        );
    }
}

export default HomePage;