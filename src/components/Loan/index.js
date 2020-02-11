// Dependencies.
import React from 'react';
import PropTypes from 'prop-types';
// Relative imports.
import './styles.css';

const Loan = ({ downpayment, loan }) => {
  // Derive loan properties.
  const { id, label, limit, minDown } = loan;

  // Derive how much they can afford.
  const afford = limit + downpayment;

  // Derive percentages.
  const downpaymentPercent = (downpayment / afford) * 100;
  const minDownPercent = minDown * 100;

  // Derive if they are eligible for the loan.
  const isDownpaymentValid = downpaymentPercent > minDownPercent;

  // Derive closing costs.
  const closingCostMin = afford * 0.02;
  const closingCostMax = afford * 0.05;

  return (
    <div className={`loan${isDownpaymentValid ? '' : ' invalid'}`}>
      <h2>{label}</h2>

      {id !== 'conforming' && (
        <a
          href="https://www.fhfa.gov/DataTools/Downloads/Documents/Conforming-Loan-Limits/FullCountyLoanLimitList2020_HERA-BASED_FINAL_FLAT.xlsx"
          rel="noopener noreferrer"
        >
          (Available only in some counties)
        </a>
      )}

      <div className="data-point limit">
        <label>Loan Limit</label>
        <p>{limit.toLocaleString('en-US', { currency: 'USD', style: 'currency' })}</p>
      </div>

      <div className="data-point minDownPercent">
        <label>Minimum Downpayment</label>
        <p>{minDownPercent}%</p>
      </div>

      <div className="data-point downpayment">
        <label>Your Downpayment</label>
        <p>{downpayment.toLocaleString('en-US', { currency: 'USD', style: 'currency' })}</p>
        <p className="small">({downpaymentPercent.toFixed(2)}% with Loan Limit)</p>
      </div>

      <div className="data-point afford">
        <label>You could afford</label>
        <p>{afford.toLocaleString('en-US', { currency: 'USD', style: 'currency' })}</p>

        <label>Closing Costs</label>
        <p>
          {closingCostMin.toLocaleString('en-US', { currency: 'USD', style: 'currency' })} -{' '}
          {closingCostMax.toLocaleString('en-US', { currency: 'USD', style: 'currency' })}
        </p>
      </div>
    </div>
  );
};

Loan.propTypes = {
  downpayment: PropTypes.number.isRequired,
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    limit: PropTypes.number.isRequired,
    minDown: PropTypes.number.isRequired,
  }).isRequired,
};

export default Loan;
