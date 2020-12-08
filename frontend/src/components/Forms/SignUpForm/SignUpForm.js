import React from 'react';
import './SignUpForm.css';
import PubSub from '../../../utils/pubsub';
import * as actionCreators from '../../../actions/auth'
import TextField from '@material-ui/core/TextField';
import { Redirect, Link } from "react-router-dom";

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.state = {
      redirect: null,
      name: "",
      nameError: "",
      email: "",
      emailError: "",
      password: "",
      passwordError: "",
      confirmPassword: "",
    }
  }
  register() {
    PubSub.publish('Loading', true);
    actionCreators.registerUser(this.state.name, this.state.email, this.state.password).then(response => {
      console.log('woohoo registered!!!');
      console.log(response);
      PubSub.publish('Loading', false);
      this.setState({ redirect: '/profile' });
    }).catch(error => {
      console.log('received error here hereh here')
      console.error(error);
      PubSub.publish('Loading', false)
      alert(error.error);
    })
  }
  submit(event) {
    event.preventDefault();
    if (this.validate()) {
      this.register();
    }
  }
  change = e => {
    this.setState({ [e.target.name]: e.target.value });
  }
  validate() {
    let isError = false;
    const errors = {
      nameError: "",
      emailError: "",
      passwordError: ""
    }

    if (this.state.name === "") {
      isError = true;
      errors.nameError = "Name cannot be blank";
    }

    if (this.state.email.indexOf("@") === -1) {
      isError = true;
      errors.emailError = "Requires valid email"
    }

    if (this.state.password !== this.state.confirmPassword) {
      isError = true;
      errors.passwordError = "Passwords do not match"
    }

    if (this.state.password.length < 8) {
      isError = true;
      errors.passwordError = "Password must be at least 8 characters long"
    }

    this.setState({
      ...this.state,
      ...errors
    });

    return !isError
  }
  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    }
    return (
      <form onSubmit={this.props.onSubmit}>
        <h2>Sign Up</h2>
        <Link to={{pathname:"/login"}}>Log In</Link>
        <TextField
          name="name"
          className="form-input"
          variant="outlined"
          label="Name"
          value={this.state.name}
          onChange={e => this.change(e)}
          error={this.state.nameError.length > 0}
          helperText={this.state.nameError}
          required
        />
        <TextField
          name="email"
          className="form-input"
          type="email"
          variant="outlined"
          label="Email"
          value={this.state.email}
          onChange={e => this.change(e)}
          error={this.state.emailError.length > 0}
          helperText={this.state.emailError}
          required
        />
        <TextField
          name="password"
          className="form-input"
          type="password"
          variant="outlined"
          label="Password"
          value={this.state.password}
          onChange={e => this.change(e)}
          error={this.state.passwordError.length > 0}
          helperText={this.state.passwordError}
          required
        />
        <TextField
          name="confirmPassword"
          className="form-input"
          type="password"
          variant="outlined"
          label="Confirm Password"
          value={this.state.confirmPassword}
          onChange={e => this.change(e)}
          required
        />
        <div className="form-group">
          <button className="form-control btn btn-primary" type="submit" onClick={this.submit}>
            Submit
     </button>
        </div>
      </form>
    );
  }
}

export default SignUpForm;