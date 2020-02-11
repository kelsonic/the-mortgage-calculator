// Dependencies.
import React, { Component } from 'react';
import toNumber from 'lodash/toNumber';
// Relative imports.
import Loan from 'components/Loan';
import { conforming, highBalanceConforming /* , jumbo */ } from 'loans';
import './index.css';

const FIELD_STATES = {
  all: 'all',
  creditScore: 'creditScore',
  monthlyIncome: 'monthlyIncome',
  reserves: 'reserves',
  monthsUntilPurchase: 'monthsUntilPurchase',
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      creditScore: 800,
      monthlyIncome: 0,
      monthsUntilPurchase: 0,
      reserves: 0,
      showField: FIELD_STATES.monthlyIncome,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (event) => {
    const { showField } = this.state;

    // Escape early if it's not the enter key.
    if (event.keyCode !== 13) {
      return;
    }

    if (showField === FIELD_STATES.creditScore) {
      this.setState({ showField: FIELD_STATES.monthlyIncome });
    }

    if (showField === FIELD_STATES.monthlyIncome) {
      this.setState({ showField: FIELD_STATES.reserves });
    }

    if (showField === FIELD_STATES.reserves) {
      this.setState({ showField: FIELD_STATES.monthsUntilPurchase });
    }

    if (showField === FIELD_STATES.monthsUntilPurchase) {
      this.setState({ showField: FIELD_STATES.all });
      document.removeEventListener('keydown', this.onKeyDown);
    }
  };

  onStateChange = (key) => (event) => {
    this.setState({ [key]: event.target.value });
  };

  onShowAllClick = () => this.setState({ showField: FIELD_STATES.all });

  render() {
    const { onStateChange, onShowAllClick } = this;
    const { creditScore, monthlyIncome, monthsUntilPurchase, reserves, showField } = this.state;

    // Derive if we should show a particular field.
    const showAll = showField === FIELD_STATES.all;
    const showCreditScore = showField === FIELD_STATES.creditScore || showAll;
    const showReserves = showField === FIELD_STATES.reserves || showAll;
    const showMonthlyIncome = showField === FIELD_STATES.monthlyIncome || showAll;
    const showMonthsUntilPurchase = showField === FIELD_STATES.monthsUntilPurchase || showAll;

    // Derive their downpayment.
    const downpayment = toNumber(reserves) + toNumber(monthlyIncome) * toNumber(monthsUntilPurchase);

    return (
      <div className={`app${showAll ? ' show-all' : ''}`}>
        {showCreditScore && (
          <div className="field-group">
            <label htmlFor="creditScore">What is your credit score?</label>
            <input
              autoFocus
              name="creditScore"
              onChange={onStateChange('creditScore')}
              type="number"
              value={creditScore}
            />
          </div>
        )}

        {showReserves && (
          <div className="field-group">
            <label htmlFor="reserves">How much money do you have in reserves?</label>
            <input autoFocus name="reserves" onChange={onStateChange('reserves')} type="number" value={reserves} />
          </div>
        )}

        {showMonthlyIncome && (
          <div className="field-group">
            <label htmlFor="monthlyIncome">How much are you saving per month?</label>
            <input
              autoFocus
              name="monthlyIncome"
              onChange={onStateChange('monthlyIncome')}
              type="number"
              value={monthlyIncome}
            />
          </div>
        )}

        {showMonthsUntilPurchase && (
          <div className="field-group">
            <label htmlFor="monthsUntilPurchase">How many months until you will buy a house?</label>
            <input
              autoFocus
              name="monthsUntilPurchase"
              onChange={onStateChange('monthsUntilPurchase')}
              type="number"
              value={monthsUntilPurchase}
            />
          </div>
        )}

        {!showAll && (
          <button onClick={onShowAllClick} type="button">
            Show me all fields...
          </button>
        )}

        {showAll && (
          <div className="loans">
            <Loan downpayment={downpayment} loan={conforming} />
            <Loan downpayment={downpayment} loan={highBalanceConforming} />
            {/* <Loan downpayment={downpayment} loan={jumbo} /> */}
          </div>
        )}

        <p className="made-with">
          Made with love by <a href="https://github.com/kelsonic">Kelson Adams</a> — fork or suggest edits on{' '}
          <a href="https://github.com/kelsonic/the-mortgage-calculator">GitHub</a>!
        </p>
      </div>
    );
  }
}

export default App;
