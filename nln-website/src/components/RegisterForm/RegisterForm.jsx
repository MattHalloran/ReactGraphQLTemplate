import React from 'react';
import './RegisterForm.css';
import PropTypes from 'prop-types';

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.toSignUp = this.toSignUp.bind(this);
    this.toLogIn = this.toLogIn.bind(this);
    this.submit = this.submit.bind(this);
    this.registerUser = this.registerUser.bind(this);
    this.login = this.login.bind(this);
    this.state = {
      isSignUp: this.props.isSignUp,
      submitting: false,
    }
  }

  toSignUp() {
    this.setState({ isSignUp: true });
  }

  toLogIn() {
    this.setState({ isSignUp: false });
  }

  submit(event) {
    event.preventDefault();
    this.setState({ submitting: true });
  }

  registerUser(formData) {
    console.log('register user');
    if (formData.password != formData.confirmPassword) {
      alert('Passwords do not match');
      console.log(formData);
      this.setState({ submitting: false });
      return;
    }
    fetch('api/register', {
      method: "POST",
      credentials: "include",
      headers: { 'Content-Type': 'multipart/form-data' },
      body: {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }
    }).then(res => res.json()
      .then(res => {
        console.log(res);
        this.setState({ submitting: false });
      }))
      .catch(err => {
        console.log(err);
      });
  }

  login(formData) {
    console.log('login');
    this.setState({ submitting: false });
    console.log(formData.password);
  }

  render() {
    let fields;
    if (this.state.isSignUp) {
      fields = <SignUpFields onSubmit={this.registerUser} submitting={this.state.submitting} />
    } else {
      fields = <LoginFields onSubmit={this.login} submitting={this.state.submitting} />
    }
    return (
      <form onSubmit={this.props.onSubmit}>
        <div className="form-switch">
          <ToggleForm text='Sign Up' active={this.state.isSignUp} onClick={this.toSignUp} />
          <ToggleForm text='Log In' active={!this.state.isSignUp} onClick={this.toLogIn} />
        </div>
        {fields}
        <div className="form-group">
          <button className="form-control btn btn-primary" type="submit" onClick={this.submit}>
            Submit
     </button>
        </div>
      </form>
    );
  }
}

RegisterForm.propTypes = {
  isSignUp: PropTypes.bool.isRequired,
}

function ToggleForm(props) {
  return (
    <u className={props.active ? 'toggle-active' : 'toggle-inactive'} onClick={props.onClick}>{props.text}</u>
  );
}

class SignUpFields extends React.Component {
  constructor(props) {
    super(props);
    this.updateName = this.updateName.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.updateConfirmPassword = this.updateConfirmPassword.bind(this);
    this.state = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  }
  componentWillReceiveProps(newProps) {
    if (newProps.submitting !== this.props.submitting && newProps.submitting) {
      this.props.onSubmit(this.state);
    }
  }
  updateName(e) {
    this.setState({ name: e.target.value });
  }
  updateEmail(e) {
    this.setState({ email: e.target.value });
  }
  updatePassword(e) {
    this.setState({ password: e.target.value });
  }
  updateConfirmPassword(e) {
    this.setState({ confirmPassword: e.target.value });
  }
  render() {
    return (
      <React.Fragment>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input className="form-control" id="name" onChange={this.updateName} />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="name@example.com"
            onChange={this.updateEmail}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            onChange={this.updatePassword}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="password2"
            onChange={this.updateConfirmPassword}
          />
        </div>
      </React.Fragment>
    );
  }
}

class LoginFields extends React.Component {
  constructor(props) {
    super(props);
    this.updateEmail = this.updateEmail.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.state = {
      email: "",
      password: "",
    }
  }
  componentWillReceiveProps(newProps) {
    if (newProps.submitting !== this.props.submitting && newProps.submitting) {
      this.props.onSubmit(this.state);
    }
  }
  updateEmail(e) {
    this.setState({ email: e.target.value });
  }
  updatePassword(e) {
    this.setState({ password: e.target.value });
  }
  render() {
    return (
      <React.Fragment>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="name@example.com"
            onChange={this.updateEmail}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            onChange={this.updatePassword}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default RegisterForm