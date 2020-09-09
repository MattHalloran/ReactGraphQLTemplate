import React from 'react';
import '../Modal.css';
import './RegisterForm.css';

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.toSignUp = this.toSignUp.bind(this);
    this.toLogIn = this.toLogIn.bind(this);
    this.state = {
      signUp: this.props.signUp,
      onSubmit: this.props.onSubmit,
    }
  }

  toSignUp() {
    this.setState({signUp: true});
  }

  toLogIn() {
    this.setState({signUp: false});
  }

  render() {
    let fields;
    if (this.state.signUp) {
      fields = <SignUpFields/>
    } else {
      fields = <LoginFields />
    }

    return (
      <form onSubmit={this.props.onSubmit}>
        <div className="form-switch">
          <ToggleForm text='Sign Up' active={this.state.signUp} onClick={this.toSignUp}/>
          <ToggleForm text='Log In' active={!this.state.signUp} onClick={this.toLogIn}/>
        </div>
        {fields}
        <div className="form-group">
        <button className="form-control btn btn-primary" type="submit">
          Submit
        </button>
      </div>
      </form>
    );
  }
}

function SignUpFields(props) {
  return (
    <React.Fragment>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input className="form-control" id="name" />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email address</label>
        <input
          type="email"
          className="form-control"
          id="email"
          placeholder="name@example.com"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Confirm Password</label>
        <input
          type="password"
          className="form-control"
          id="password2"
        />
      </div>
    </React.Fragment>
  );
}

function LoginFields(props) {
  return (
    <React.Fragment>
      <div className="form-group">
        <label htmlFor="email">Email address</label>
        <input
          type="email"
          className="form-control"
          id="email"
          placeholder="name@example.com"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
        />
      </div>
    </React.Fragment>
  );
}

function ToggleForm(props) {
  return (
    <u className={props.active? 'toggle-active' : 'toggle-inactive'} onClick={props.onClick}>{props.text}</u>
  );
}

export default RegisterForm;
